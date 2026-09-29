'use client';

import { useSignalEffect } from '@preact/signals-react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { POLITIES, POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import {
  type CellStateStore,
  LIFT_MAX,
  NULL_COLOR,
  ownerColors,
  spreadDelays
} from '../lib/cellState';
import { DISSOLVE_GLSL, GLOW_COLOR, GLOW_CORE_COLOR } from '../lib/dissolve';
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

const SLOT_OF = new Map(POLITIES.map((p, i) => [p.id, i]));

/** Uniform dùng chung giữa React và shader (onBeforeCompile gán đúng các object này). */
interface TerrainUniforms {
  uCellState: { value: THREE.Texture };
  uCellOwner: { value: THREE.Texture };
  uCellTexSize: { value: THREE.Vector2 };
  uLiftMax: { value: number };
  /** Màu (linear) của từng chính thể theo slot — rộng P, cao 1. */
  uPolity: { value: THREE.Texture };
  uPolityCount: { value: number };
  uNullColor: { value: THREE.Color };
  /** Giây trôi qua — chỉ dùng cho độ lấp lánh của vệt sáng mặt trận. */
  uTime: { value: number };
  /** Màu quầng hổ phách của mặt trận (linear). */
  uGlowColor: { value: THREE.Color };
  /** Màu lõi trắng-vàng của mặt trận (linear). */
  uGlowCoreColor: { value: THREE.Color };
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
uniform sampler2D uPolity;
uniform float uPolityCount;
uniform vec3 uNullColor;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;
varying vec4 vOwner;   // fromSlot, toSlot, blend (ease), progress (tuyến tính, cho mặt trận)
varying vec2 vWorldXZ;
varying float vTop;
// Màu trơn của chủ cũ/mới (hằng trên cả tam giác mặt trên).
varying vec3 vFromCol;
varying vec3 vToCol;

// Màu của chính thể ở slot (-1 = không có chủ → màu đá trung tính).
vec3 polityColor(float slot) {
  if (slot < -0.5) return uNullColor;
  float u = (floor(slot + 0.5) + 0.5) / uPolityCount;
  return texture2D(uPolity, vec2(u, 0.5)).rgb;
}

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
// Mặt trên (vai trò 0, normal hướng lên) tô màu trơn của chủ; khi đổi chủ, mặt trận loang
// theo toạ độ world XZ (liên tục qua mọi ô) từ màu chủ cũ sang màu chủ mới.
vOwner = texture2D(uCellOwner, cellUv(aCell));
vFromCol = polityColor(vOwner.x);
vToCol = polityColor(vOwner.y);
vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;
vTop = (aWallRole < 0.5 && normal.y > 0.5) ? 1.0 : 0.0;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime;
uniform vec3 uGlowColor;
uniform vec3 uGlowCoreColor;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;
varying vec4 vOwner;
varying vec2 vWorldXZ;
varying float vTop;
varying vec3 vFromCol;
varying vec3 vToCol;

${DISSOLVE_GLSL}`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec2 dxz = dFdx(vWorldXZ);
vec2 dyz = dFdy(vWorldXZ);
vec3 wallCol = vCellColor * mix(1.0, 0.55, vSide);
vec3 base = wallCol;
vec3 frontGlow = vec3(0.0);
if (vTop > 0.5) {
  base = vToCol;
  // Mặt trận loang (lib/dissolve.ts — hàm GLSL và bản JS phải giữ đồng bộ). Chỉ ô đang đổi
  // chủ mới trả giá noise; ô xong/không đổi (progress = 1) đi thẳng nhánh rẻ. Noise theo toạ
  // độ thế giới nên liên tục qua mọi ô.
  if (vOwner.w < 0.999 && abs(vOwner.x - vOwner.y) > 0.5) {
    float n = fbmNoise(vWorldXZ);
    float m = dissolveMask(vOwner.w, n);
    // Độ rộng tối thiểu theo màn hình: kích thước pixel trên mặt đất (dxz/dyz tính ngoài nhánh
    // nên đạo hàm hợp lệ) × độ dốc noise trung bình — thay cho fwidth(n) trong nhánh.
    float px = glowMinWidth(max(length(dxz), length(dyz)));
    float core = glowAmount(vOwner.w, n, px);
    float halo = haloAmount(vOwner.w, n, px);
    base = mix(vFromCol, vToCol, 1.0 - m);
    base *= 1.0 - DS_GLOW_CHAR * halo;
    float shimmer = 0.85 + 0.15 * sin(uTime * 9.0 + n * 40.0);
    frontGlow = (uGlowCoreColor * (DS_CORE_GAIN * core) + uGlowColor * (DS_HALO_GAIN * halo))
      * shimmer;
  }
}
vec4 diffuseColor = vec4( base * (1.0 + vLift * 0.3), opacity );`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
// Vệt sáng cộng vào bức xạ tự phát: không bị bóng/ánh sáng làm tối, vẫn qua tone mapping.
totalEmissiveRadiance += frontGlow;`
      )
      .replace(
        '#include <fog_fragment>',
        `#include <fog_fragment>
// Lửa xuyên sương: camera toàn cảnh trên màn dọc (mobile) ở xa nên sương mù nuốt ~60% màu —
// trả lại cho vệt sáng đúng phần sương đã lấy đi (xấp xỉ, sau tone mapping), cảnh vẫn mờ sương.
#ifdef USE_FOG
gl_FragColor.rgb += fogFactor * min(frontGlow, vec3(1.0));
#endif`
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
  // uPolity: màu (linear) của từng chính thể theo slot, rộng P, cao 1 — màu cố định (override
  // chỉ đổi tên/kinh đô, không đổi màu) nên dựng một lần.
  const polityTex = useMemo(() => {
    const d = new Float32Array(POLITIES.length * 4);
    const c = new THREE.Color();
    POLITIES.forEach((p, i) => {
      c.set(p.color);
      d.set([c.r, c.g, c.b, 1], i * 4);
    });
    return floatTexture(d, POLITIES.length, 1);
  }, []);
  const uniforms = useMemo<TerrainUniforms>(
    () => ({
      uCellState: { value: cellTex },
      uCellOwner: { value: ownerTex },
      uCellTexSize: { value: new THREE.Vector2(store.width, store.height) },
      uLiftMax: { value: LIFT_MAX },
      uPolity: { value: polityTex },
      uPolityCount: { value: POLITIES.length },
      uNullColor: { value: new THREE.Color(NULL_COLOR) },
      uTime: { value: 0 },
      uGlowColor: { value: new THREE.Color(GLOW_COLOR) },
      uGlowCoreColor: { value: new THREE.Color(GLOW_CORE_COLOR) }
    }),
    [cellTex, ownerTex, polityTex, store]
  );
  const material = useMemo(() => makeMaterial(uniforms), [uniforms]);
  const prevIndex = useRef<number | null>(null);

  // Các DataTexture được gắn vào material qua uniform tùy biến trong onBeforeCompile —
  // three.js/R3F không biết để tự dọn texture nằm trong uniform tùy biến khi material bị
  // thay/dispose, nên phải giải phóng thủ công mỗi khi texture đổi hoặc unmount.
  useEffect(() => () => cellTex.dispose(), [cellTex]);
  useEffect(() => () => ownerTex.dispose(), [ownerTex]);
  useEffect(() => () => polityTex.dispose(), [polityTex]);
  // material cũng có thể bị thay identity (khi store đổi, ví dụ sau khi "Thử lại") trong khi
  // <mesh> vẫn còn mounted ở lần render đó — dispose tường minh thay vì trông chờ vào việc
  // R3F tự dọn material khi <mesh> unmount.
  useEffect(() => () => material.dispose(), [material]);

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
    prevIndex.current = i;
  });

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
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
