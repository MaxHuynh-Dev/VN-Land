'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type React from 'react';
import { SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';
import { clampIndex } from '../lib/timeline';
import { playing, snapshotIndex } from '../state/store';
import EraBand from './EraBand';

const go = (i: number): void => {
  playing.value = false;
  snapshotIndex.value = clampIndex(i, SNAPSHOTS.length);
};

export default function Timeline(): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const snap = SNAPSHOTS[i];
  const last = SNAPSHOTS.length - 1;
  return (
    <nav
      aria-label={COPY.timelineLabel}
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a1420] via-[#0a1420]/85 to-transparent px-4 pt-10 pb-4 md:px-10 md:pb-6"
    >
      <div className="mb-2 flex items-end gap-4">
        <p
          data-testid="timeline-current"
          className="font-extrabold text-3xl tabular-nums md:text-5xl"
        >
          {snap.yearLabel}
        </p>
        <p className="mb-1 truncate text-sm opacity-80 md:text-base">{snap.title}</p>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            aria-label={COPY.prev}
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={playing.value ? COPY.pause : COPY.play}
            onClick={() => {
              playing.value = !playing.value;
            }}
            className="rounded-full p-2 hover:bg-white/10"
          >
            {playing.value ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            type="button"
            aria-label={COPY.next}
            onClick={() => go(i + 1)}
            disabled={i === last}
            className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <EraBand current={i} />
      <div className="relative mt-2 h-8">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-[7px]">
          {SNAPSHOTS.map((s, k) => (
            <span
              key={s.id}
              className={`h-2 w-2 rounded-full ${k <= i ? 'bg-[#f4e3c1]' : 'bg-white/25'}`}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={i}
          aria-label={COPY.timelineLabel}
          aria-valuetext={`${snap.yearLabel} — ${snap.title}`}
          onChange={(e) => go(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
    </nav>
  );
}
