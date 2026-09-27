'use client';

import { useSignalEffect } from '@preact/signals-react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import type React from 'react';
import { useMemo, useRef } from 'react';
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
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCellState = { value: tex };
    shader.uniforms.uCellTexSize = { value: new THREE.Vector2(store.width, store.height) };
    shader.uniforms.uLiftMax = { value: LIFT_MAX };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float aCell;
uniform sampler2D uCellState;
uniform vec2 uCellTexSize;
uniform float uLiftMax;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vec2 cuv = (vec2(mod(aCell, uCellTexSize.x), floor(aCell / uCellTexSize.x)) + 0.5) / uCellTexSize;
vec4 cs = texture2D(uCellState, cuv);
vCellColor = cs.rgb;
vLift = cs.a;
vSide = 1.0 - step(0.5, normal.y);
transformed.y += cs.a * uLiftMax * step(0.001, position.y);`
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
