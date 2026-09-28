'use client';

import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { ERAS, SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';
import { eraSegments, labelFits } from '../lib/timeline';
import { playing, snapshotIndex } from '../state/store';

const SEGMENTS = eraSegments(SNAPSHOTS, ERAS);

export default function EraBand({ current }: { current: number }): React.ReactElement {
  const bandRef = useRef<HTMLFieldSetElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [fits, setFits] = useState<boolean[]>(() => SEGMENTS.map(() => false));

  useLayoutEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const measure = (): void => {
      const next = SEGMENTS.map((_, idx) => {
        const btn = buttonRefs.current[idx];
        const label = measureRefs.current[idx];
        if (!btn || !label) return false;
        return labelFits(btn.getBoundingClientRect().width, label.scrollWidth);
      });
      setFits((prev) => (prev.every((v, idx) => v === next[idx]) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(band);
    return () => ro.disconnect();
  }, []);

  return (
    <fieldset
      ref={bandRef}
      aria-label={COPY.eraBandLabel}
      className="m-0 flex h-5 w-full min-w-0 overflow-hidden rounded-sm border-0 p-0 text-[10px] leading-5"
    >
      {SEGMENTS.map((s, idx) => {
        const active = current >= s.start && current < s.start + s.count;
        return (
          <button
            key={`${s.era.id}-${s.start}`}
            type="button"
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            style={{ flexGrow: s.count, background: s.era.color, opacity: active ? 1 : 0.45 }}
            className="relative min-w-0 px-1 text-left text-white/90 outline-offset-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]"
            title={s.era.label}
            aria-label={`${COPY.jumpToEra} ${s.era.label}`}
            onClick={() => {
              playing.value = false;
              snapshotIndex.value = s.start;
            }}
          >
            {fits[idx] ? s.era.label : ''}
            <span
              ref={(el) => {
                measureRefs.current[idx] = el;
              }}
              aria-hidden
              className="invisible absolute inset-y-0 left-0 whitespace-nowrap"
            >
              {s.era.label}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
