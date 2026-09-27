'use client';

import { useSignalEffect } from '@preact/signals-react';
import { useEffect } from 'react';
import { SNAPSHOTS } from '@/data/history';
import { clampIndex, snapshotIndexFromParam } from '../lib/timeline';
import { playing, snapshotIndex } from './store';

const STEP_MS = 4000;

export function useTimelineControls(): void {
  // URL → state (một lần khi mount)
  useEffect(() => {
    snapshotIndex.value = snapshotIndexFromParam(
      new URLSearchParams(window.location.search).get('y'),
      SNAPSHOTS
    );
  }, []);

  // state → URL
  useSignalEffect(() => {
    const id = SNAPSHOTS[snapshotIndex.value]?.id;
    if (!id) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('y') === id) return;
    url.searchParams.set('y', id);
    window.history.replaceState(null, '', url);
  });

  // bàn phím
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        playing.value = false;
        snapshotIndex.value = clampIndex(
          snapshotIndex.value + (e.key === 'ArrowRight' ? 1 : -1),
          SNAPSHOTS.length
        );
      } else if (e.key === ' ' && t?.tagName !== 'BUTTON') {
        e.preventDefault();
        playing.value = !playing.value;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // tự chạy
  useSignalEffect(() => {
    if (!playing.value) return;
    if (snapshotIndex.peek() >= SNAPSHOTS.length - 1) snapshotIndex.value = 0;
    const id = window.setInterval(() => {
      const next = snapshotIndex.peek() + 1;
      if (next >= SNAPSHOTS.length) {
        playing.value = false;
        return;
      }
      snapshotIndex.value = next;
    }, STEP_MS);
    return () => window.clearInterval(id);
  });
}
