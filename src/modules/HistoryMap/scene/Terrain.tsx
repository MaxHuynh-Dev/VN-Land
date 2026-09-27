'use client';

import { useSignalEffect } from '@preact/signals-react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { type CellStateStore, LIFT_MAX, ownerColors, spreadDelays } from '../lib/cellState';
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

function makeMaterial(tex: THREE.DataTexture, store: CellStateStore): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 });
  // Vách nội bộ (aWallRole 1/2, xem terrainGeometry.ts) suy biến (cao 0) lúc nghỉ nên không có
  // normal "đúng" cố định — normal được gán thủ công theo MỘT hướng ngang bất kỳ khi dựng hình,
  // và bên nào thấp hơn chỉ biết được lúc chạy (so độ nổi hai ô). Render hai mặt để không phụ
  // thuộc vào việc đoán đúng hướng: three.js tự lật normal hiển thị theo mặt camera đang thấy.
  mat.side = THREE.DoubleSide;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCellState = { value: tex };
    shader.uniforms.uCellTexSize = { value: new THREE.Vector2(store.width, store.height) };
    shader.uniforms.uLiftMax = { value: LIFT_MAX };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float aCell;
attribute float aCellB;
attribute float aWallRole;
uniform sampler2D uCellState;
uniform vec2 uCellTexSize;
uniform float uLiftMax;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;

vec4 sampleCellState(float cellIndex) {
  vec2 cuv = (vec2(mod(cellIndex, uCellTexSize.x), floor(cellIndex / uCellTexSize.x)) + 0.5) / uCellTexSize;
  return texture2D(uCellState, cuv);
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
}`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vCellColor;
varying float vSide;
varying float vLift;`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'vec4 diffuseColor = vec4( vCellColor * mix(1.0, 0.55, vSide) * (1.0 + vLift * 0.3), opacity );'
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
  const tex = useMemo(() => {
    const t = new THREE.DataTexture(
      store.data,
      store.width,
      store.height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [store]);
  const material = useMemo(() => makeMaterial(tex, store), [tex, store]);
  const prevIndex = useRef<number | null>(null);

  // tex (DataTexture) được gắn vào material qua uniform tùy biến (uCellState) trong
  // onBeforeCompile — three.js/R3F không biết để tự dọn texture nằm trong uniform tùy biến
  // khi material bị thay/dispose, nên phải giải phóng thủ công mỗi khi tex đổi hoặc unmount.
  useEffect(() => () => tex.dispose(), [tex]);
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
    store.setColors(colors, {
      animate,
      delays:
        animate && prev !== null ? spreadDelays(data.cells, data.owners[prev], owners) : undefined
    });
    prevIndex.current = i;
  });

  useFrame((_, dt) => {
    if (store.tick(Math.min(dt, 0.1))) tex.needsUpdate = true;
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
