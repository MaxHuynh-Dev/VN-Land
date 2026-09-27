'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { polityAnchors } from '../lib/centroid';
import { dropFlag, type FlagEntry, reconcileFlags } from '../lib/flagsReconcile';
import type { MapData } from '../lib/loadMapData';
import { effectivePolity } from '../lib/resolve';
import { snapshotIndex } from '../state/store';
import FlagPole from './FlagPole';

export default function Flags({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  // biome-ignore lint/correctness/useExhaustiveDependencies: i được dùng trong data.owners[i], cần liệt kê để tính lại khi đổi mốc.
  const anchors = useMemo(
    () => polityAnchors(data.cells, data.neighbors, data.owners[i]),
    [data, i]
  );
  const [entries, setEntries] = useState<FlagEntry[]>([]);
  useEffect(() => setEntries((prev) => reconcileFlags(prev, anchors)), [anchors]);
  const onGone = useCallback((id: string) => setEntries((prev) => dropFlag(prev, id)), []);
  return (
    <>
      {entries.map((e) => (
        <FlagPole
          key={e.id}
          entry={e}
          polity={effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, e.id)}
          onGone={onGone}
        />
      ))}
    </>
  );
}
