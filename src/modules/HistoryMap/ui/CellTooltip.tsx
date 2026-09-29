'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';
import { effectivePolity } from '../lib/resolve';
import { hoveredPolity, pointerPos, snapshotIndex } from '../state/store';
import FlagThumb from './FlagThumb';

export default function CellTooltip(): React.ReactElement | null {
  useSignals();
  const id = hoveredPolity.value;
  const pos = pointerPos.value;
  if (!id || !pos) return null;
  const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, snapshotIndex.value, id);
  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-20 flex items-center gap-2 rounded-md bg-[#0a1420]/90 px-3 py-2 text-sm shadow-lg backdrop-blur"
      style={{ left: pos.x + 14, top: pos.y + 14 }}
    >
      <span
        aria-hidden
        className="h-6 w-1.5 shrink-0 rounded-full"
        style={{ background: p.color }}
      />
      <FlagThumb polity={p} className="h-5 w-8" />
      <span>
        <span className="block font-semibold">{p.name}</span>
        <span className="block text-[11px] opacity-60">{COPY.flagKind[p.flagKind]}</span>
      </span>
    </div>
  );
}
