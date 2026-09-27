'use client';

import { useSignalEffect } from '@preact/signals-react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { POLITIES, POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import {
  type CellStateStore,
  LIFT_MAX,
  NULL_COLOR,
  ownerColors,
  spreadDelays
} from '../lib/cellState';
import { polityAnchors } from '../lib/centroid';
import { loadFlagAtlas } from '../lib/flagAtlas';
import { polityParamsData } from '../lib/flagCover';
import type { MapData } from '../lib/loadMapData';
import { effectivePolity } from '../lib/resolve';
import { cellAtVertex } from '../lib/terrainGeometry';
import { reducedMotion, snapshotIndex } from '../state/store';

interface Props {
  data: MapData;
  store: CellStateStore;
  onHoverCell?: (cell: number | null, e: ThreeEvent<PointerEvent>) => void;
  onClickCell?: (cell: number) => void;
}

const POLITY_IDS = POLITIES.map((p) => p.id);
const SLOT_OF = new Map(POLITIES.map((p, i) => [p.id, i]));

/** Uniform dùng chung giữa React và shader (onBeforeCompile gán đúng các object này). */
interface TerrainUniforms {
  uCellState: { value: THREE.Texture };
  uCellOwner: { value: THREE.Texture };
  uCellTexSize: { value: THREE.Vector2 };
  uLiftMax: { value: number };
  uPolity: { value: THREE.Texture };
  uPolityCount: { value: number };
  uFlagAtlas: { value: THREE.Texture };
  uAtlasReady: { value: number };
  uNullColor: { value: THREE.Color };
}

function floatTexture(data: Float32Array, w: number, h: number): THREE.DataTexture {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}

function makeMaterial(uniforms: TerrainUniforms): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 });
  // Vách nội bộ (aWallRole 1/2, xem terrainGeometry.ts) suy biến (cao 0) lúc nghỉ nên không có
  // normal "đúng" cố định — normal được gán thủ công theo MỘT hướng ngang bất kỳ khi dựng hình,
  // và bên nào thấp hơn chỉ biết được lúc chạy (so độ nổi hai ô). Render hai mặt để không phụ
  // thuộc vào việc đoán đúng hướng: three.js tự lật normal hiển thị theo mặt camera đang thấy.
  mat.side = THREE.DoubleSide;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float aCell;
attribute float aCellB;
attribute float aWallRole;
uniform sampler2D uCellState;
uniform sampler2D uCellOwner;
uniform vec2 uCellTexSize;
uniform float uLiftMax;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;
varying vec4 vOwner;   // fromSlot, toSlot, blend
varying vec2 vWorldXZ;
varying float vTop;

vec2 cellUv(float cellIndex) {
  return (vec2(mod(cellIndex, uCellTexSize.x), floor(cellIndex / uCellTexSize.x)) + 0.5) / uCellTexSize;
}
vec4 sampleCellState(float cellIndex) {
  return texture2D(uCellState, cellUv(cellIndex));
}`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vec4 csA = sampleCellState(aCell);
if (aWallRole < 0.5) {
  // Vai trò 0: đỉnh mặt trên/đáy hoặc vách đường bờ — hành vi cũ, không đổi.
  vCellColor = csA.rgb;
  vLift = csA.a;
  vSide = 1.0 - step(0.5, normal.y);
  transformed.y += csA.a * uLiftMax * step(0.001, position.y);
} else {
  // Vai trò 1/2: đỉnh vách nội bộ — lấp khoảng hở khi độ nổi hai ô lệch nhau (xem
  // internalWallLift/internalWallColorIsA trong cellState.ts, phải khớp logic ở đây).
  vec4 csB = sampleCellState(aCellB);
  float liftHi = max(csA.a, csB.a);
  float liftLo = min(csA.a, csB.a);
  bool aIsHigher = csA.a >= csB.a;
  vCellColor = aIsHigher ? csA.rgb : csB.rgb;
  float lift = aWallRole < 1.5 ? liftHi : liftLo;
  vLift = lift;
  transformed.y += lift * uLiftMax;
  vSide = 1.0;
}
// Phủ cờ: chỉ mặt trên (vai trò 0, normal hướng lên). Toạ độ world XZ dùng để chiếu cờ
// theo khung phủ của chính thể (uPolity hàng 1) — liên tục qua mọi ô cùng chủ, nên không
// lộ ranh giới huyện.
vOwner = texture2D(uCellOwner, cellUv(aCell));
vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;
vTop = (aWallRole < 0.5 && normal.y > 0.5) ? 1.0 : 0.0;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform sampler2D uPolity;
uniform float uPolityCount;
uniform sampler2D uFlagAtlas;
uniform float uAtlasReady;
uniform vec3 uNullColor;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;
varying vec4 vOwner;
varying vec2 vWorldXZ;
varying float vTop;

// Màu cờ của chính thể ở slot tại điểm world XZ hiện tại. Gradient uv tính tường minh từ
// đạo hàm của vWorldXZ (liên tục) thay vì để GPU tự suy: uv atlas nhảy cóc ở biên giữa hai
// chính thể (khác ô atlas) và ở vùng bị kẹp (clamp) — mip tự động sẽ chọn mức thô nhất ở đó
// và để lại đường viền nhoè.
vec3 flagColor(float slot, vec2 dxz, vec2 dyz) {
  float s = floor(slot + 0.5);
  float u = (s + 0.5) / uPolityCount;
  vec4 rect = texture2D(uPolity, vec2(u, 0.25));
  vec4 cov = texture2D(uPolity, vec2(u, 0.75));
  vec2 size = max(cov.zw, vec2(1e-3));
  vec2 fuv = vec2((vWorldXZ.x - cov.x) / size.x + 0.5, 0.5 + (cov.y - vWorldXZ.y) / size.y);
  // Ô ngoài khung phủ (đảo xa như Hoàng Sa, Trường Sa) lấy màu mép cờ gần nhất.
  fuv = clamp(fuv, 0.0, 1.0);
  vec2 span = rect.zw - rect.xy;
  vec2 gx = vec2(dxz.x / size.x, -dxz.y / size.y) * span;
  vec2 gy = vec2(dyz.x / size.x, -dyz.y / size.y) * span;
  vec3 c = textureGrad(uFlagAtlas, mix(rect.xy, rect.zw, fuv), gx, gy).rgb;
  return s < -0.5 ? uNullColor : c;
}`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec2 dxz = dFdx(vWorldXZ);
vec2 dyz = dFdy(vWorldXZ);
vec3 wallCol = vCellColor * mix(1.0, 0.55, vSide);
vec3 base = wallCol;
if (vTop > 0.5 && uAtlasReady > 0.5) {
  vec3 toCol = flagColor(vOwner.y, dxz, dyz);
  base = vOwner.z < 0.999 ? mix(flagColor(vOwner.x, dxz, dyz), toCol, vOwner.z) : toCol;
}
vec4 diffuseColor = vec4( base * (1.0 + vLift * 0.3), opacity );`
      );
  };
  return mat;
}

export default function Terrain({
  data,
  store,
  onHoverCell,
  onClickCell
}: Props): React.ReactElement {
  const cellTex = useMemo(() => floatTexture(store.data, store.width, store.height), [store]);
  const ownerTex = useMemo(() => floatTexture(store.ownerData, store.width, store.height), [store]);
  // uPolity: rộng P (số chính thể), cao 2 — độc lập với store nên tạo một lần.
  const polityTex = useMemo(
    () => floatTexture(new Float32Array(POLITIES.length * 2 * 4), POLITIES.length, 2),
    []
  );
  // Texture giữ chỗ cho uFlagAtlas trước khi atlas tải xong (uAtlasReady = 0 thì không đọc).
  const blankTex = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  }, []);
  const uniforms = useMemo<TerrainUniforms>(
    () => ({
      uCellState: { value: cellTex },
      uCellOwner: { value: ownerTex },
      uCellTexSize: { value: new THREE.Vector2(store.width, store.height) },
      uLiftMax: { value: LIFT_MAX },
      uPolity: { value: polityTex },
      uPolityCount: { value: POLITIES.length },
      uFlagAtlas: { value: blankTex },
      uAtlasReady: { value: 0 },
      uNullColor: { value: new THREE.Color(NULL_COLOR) }
    }),
    [cellTex, ownerTex, polityTex, blankTex, store]
  );
  const material = useMemo(() => makeMaterial(uniforms), [uniforms]);
  const [atlas, setAtlas] = useState<{ texture: THREE.CanvasTexture; aspects: number[] } | null>(
    null
  );
  const prevIndex = useRef<number | null>(null);
  const prevParams = useRef<Float32Array | undefined>(undefined);
  const aspectsRef = useRef<number[]>(POLITIES.map(() => 1.5));

  // Các DataTexture được gắn vào material qua uniform tùy biến trong onBeforeCompile —
  // three.js/R3F không biết để tự dọn texture nằm trong uniform tùy biến khi material bị
  // thay/dispose, nên phải giải phóng thủ công mỗi khi texture đổi hoặc unmount.
  useEffect(() => () => cellTex.dispose(), [cellTex]);
  useEffect(() => () => ownerTex.dispose(), [ownerTex]);
  useEffect(
    () => () => {
      polityTex.dispose();
      blankTex.dispose();
    },
    [polityTex, blankTex]
  );
  // material cũng có thể bị thay identity (khi store đổi, ví dụ sau khi "Thử lại") trong khi
  // <mesh> vẫn còn mounted ở lần render đó — dispose tường minh thay vì trông chờ vào việc
  // R3F tự dọn material khi <mesh> unmount.
  useEffect(() => () => material.dispose(), [material]);

  const writeParams = (owners: (string | null)[]): void => {
    const d = polityParamsData(
      POLITY_IDS,
      polityAnchors(data.cells, data.neighbors, owners),
      aspectsRef.current,
      prevParams.current
    );
    prevParams.current = d;
    (polityTex.image.data as Float32Array).set(d);
    polityTex.needsUpdate = true;
  };

  // Tải atlas cờ một lần. Ảnh lỗi đã được loadFlagAtlas thay bằng màu trơn polity.color.
  useEffect(() => {
    let alive = true;
    let loaded: THREE.CanvasTexture | null = null;
    loadFlagAtlas(POLITIES)
      .then((a) => {
        if (!alive) {
          a.texture.dispose();
          return;
        }
        loaded = a.texture;
        setAtlas(a);
      })
      .catch(() => {
        // Không tạo được atlas (hiếm): giữ uAtlasReady = 0 — mặt trên dùng màu chủ đạo.
      });
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, []);

  // Gắn atlas vào uniform (kể cả khi material được dựng lại) và tính lại khung phủ theo tỉ lệ
  // cờ thật (chính thể vắng mặt giữ khung cũ trong prevParams — ô đang mờ dần vẫn đúng chỗ).
  // biome-ignore lint/correctness/useExhaustiveDependencies: writeParams đọc data/prevParams mới nhất; chỉ cần chạy lại khi atlas hoặc uniform đổi.
  useEffect(() => {
    if (!atlas) return;
    uniforms.uFlagAtlas.value = atlas.texture;
    uniforms.uAtlasReady.value = 1;
    aspectsRef.current = atlas.aspects;
    writeParams(data.owners[snapshotIndex.peek()]);
  }, [atlas, uniforms]);

  useSignalEffect(() => {
    const i = snapshotIndex.value;
    const owners = data.owners[i];
    const colors = ownerColors(
      owners,
      (id) => effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, id).color
    );
    const prev = prevIndex.current;
    const animate = prev !== null && !reducedMotion();
    const delays =
      animate && prev !== null ? spreadDelays(data.cells, data.owners[prev], owners) : undefined;
    store.setColors(colors, { animate, delays });
    store.setOwnerSlots(
      Float32Array.from(owners, (o) => (o === null ? -1 : (SLOT_OF.get(o) ?? -1))),
      { animate, delays }
    );
    writeParams(owners);
    prevIndex.current = i;
  });

  useFrame((_, dt) => {
    if (store.tick(Math.min(dt, 0.1))) {
      cellTex.needsUpdate = true;
      ownerTex.needsUpdate = true;
    }
  });

  const cellOf = (e: ThreeEvent<PointerEvent | MouseEvent>): number | null =>
    e.face ? cellAtVertex(data.geometry, e.face.a) : null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <mesh> là phần tử three.js/R3F trong canvas WebGL, không phải phần tử HTML.
    <mesh
      geometry={data.geometry}
      material={material}
      castShadow
      receiveShadow
      onPointerMove={(e) => {
        e.stopPropagation();
        onHoverCell?.(cellOf(e), e);
      }}
      onPointerOut={(e) => onHoverCell?.(null, e)}
      onClick={(e) => {
        e.stopPropagation();
        const c = cellOf(e);
        if (c !== null) onClickCell?.(c);
      }}
    />
  );
}
