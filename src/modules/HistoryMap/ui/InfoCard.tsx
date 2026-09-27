'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useMemo } from 'react';
import { GROUPS, POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';
import type { MapData } from '../lib/loadMapData';
import { politiesInSnapshot } from '../lib/polities';
import { effectivePolity, lowConfidenceCells } from '../lib/resolve';
import { selectedPolity, snapshotIndex } from '../state/store';
import FlagThumb from './FlagThumb';
import SourceList from './SourceList';

export default function InfoCard({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const snap = SNAPSHOTS[i];
  // biome-ignore lint/correctness/useExhaustiveDependencies: bỏ `i` sẽ khiến danh sách không cập nhật khi đổi mốc mà `data` không đổi tham chiếu.
  const present = useMemo(() => politiesInSnapshot(data.owners[i], data.cells), [data, i]);
  const hasLow = useMemo(() => lowConfidenceCells(snap, data.cells, GROUPS).size > 0, [snap, data]);
  return (
    <div aria-live="polite">
      <p className="text-xs uppercase tracking-[0.25em] opacity-60">{snap.yearLabel}</p>
      <h2 data-testid="info-title" className="mt-1 font-bold text-xl leading-tight">
        {snap.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed opacity-85">{snap.summary}</p>
      {hasLow && <p className="mt-2 text-amber-200/80 text-xs italic">≈ {COPY.lowConfidence}</p>}
      <p className="mt-4 mb-2 font-semibold text-xs uppercase tracking-wider opacity-60">
        {COPY.polities}
      </p>
      <ul className="space-y-1">
        {present.map(({ id }) => {
          const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, id);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  selectedPolity.value = id;
                }}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-white/10"
              >
                <FlagThumb polity={p} />
                <span className="flex-1">
                  <span className="block text-sm">{p.name}</span>
                  <span className="block text-[11px] opacity-60">
                    {COPY.flagKind[p.flagKind]}
                    {p.capital ? ` · ${COPY.capital}: ${p.capital}` : ''}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <SourceList sources={snap.sources} />
    </div>
  );
}
