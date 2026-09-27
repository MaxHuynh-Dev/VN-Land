import type React from 'react';
import { ERAS, SNAPSHOTS } from '@/data/history';
import { eraSegments } from '../lib/timeline';

const SEGMENTS = eraSegments(SNAPSHOTS, ERAS);

export default function EraBand({ current }: { current: number }): React.ReactElement {
  return (
    <div className="flex h-5 w-full overflow-hidden rounded-sm text-[10px] leading-5" aria-hidden>
      {SEGMENTS.map((s) => {
        const active = current >= s.start && current < s.start + s.count;
        return (
          <div
            key={`${s.era.id}-${s.start}`}
            style={{ flexGrow: s.count, background: s.era.color, opacity: active ? 1 : 0.45 }}
            className="truncate px-1 text-white/90"
            title={s.era.label}
          >
            {s.era.label}
          </div>
        );
      })}
    </div>
  );
}
