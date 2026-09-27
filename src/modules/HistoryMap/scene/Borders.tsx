'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useMemo } from 'react';
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
  // Khai báo geometry/attribute theo kiểu JSX khai báo của R3F thay vì tự `new
  // THREE.BufferGeometry()` trong useMemo: khi `positions` đổi (đổi mốc), R3F chỉ thay
  // bufferAttribute con trên CÙNG một bufferGeometry (BufferAttribute không có .dispose()),
  // không tạo & bỏ rơi một BufferGeometry mới mỗi lần — tránh rò VBO trên GPU. R3F tự
  // dispose bufferGeometry khi <Lines> unmount.
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
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
