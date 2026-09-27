import type { Era, Snapshot } from '@/data/history/types';

export function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

export function snapshotIndexFromParam(param: string | null, snapshots: Snapshot[]): number {
  if (!param) return 0;
  const exact = snapshots.findIndex((s) => s.id === param);
  if (exact >= 0) return exact;
  if (!/^-?\d+(\.\d+)?$/.test(param)) return 0;
  const year = Number(param);
  let found = 0;
  snapshots.forEach((s, i) => {
    if (s.year <= year) found = i;
  });
  return found;
}

export function eraSegments(
  snapshots: Snapshot[],
  eras: Era[]
): { era: Era; start: number; count: number }[] {
  const out: { era: Era; start: number; count: number }[] = [];
  snapshots.forEach((s, i) => {
    const last = out[out.length - 1];
    if (last && last.era.id === s.era) last.count++;
    else {
      const era = eras.find((e) => e.id === s.era);
      if (era) out.push({ era, start: i, count: 1 });
    }
  });
  return out;
}
