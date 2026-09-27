'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { buildBorderPositions } from '../lib/borders';
import type { MapData } from '../lib/loadMapData';
import { snapshotIndex } from '../state/store';

function Lines({
  positions,
  color,
  opacity
}: {
  positions: Float32Array;
  color: string;
  opacity: number;
}): React.ReactElement {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}

export default function Borders({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  // biome-ignore lint/correctness/useExhaustiveDependencies: i được dùng trong data.owners[i], cần liệt kê để tính lại khi đổi mốc.
  const borders = useMemo(() => buildBorderPositions(data.topo, data.owners[i]), [data, i]);
  return (
    <>
      <Lines positions={data.coast} color="#9fb8c8" opacity={0.35} />
      <Lines positions={borders} color="#f4e3c1" opacity={0.85} />
    </>
  );
}
