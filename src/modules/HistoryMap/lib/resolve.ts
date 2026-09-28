import type { CellGroup, Polity, PolityId, Selector, Snapshot } from '@/data/history/types';
import type { CellMeta } from './cells';

export function selectorSpecificity(sel: Selector): number {
  if (sel === '*') return 0;
  if (sel.startsWith('group:')) return 3;
  const parts = sel.split('.').length;
  return parts === 1 ? 1 : parts === 2 ? 2 : 4;
}

export function expandSelector(sel: Selector, cells: CellMeta[], groups: CellGroup[]): number[] {
  let out: number[];
  if (sel === '*') {
    out = cells.map((_, i) => i);
  } else if (sel.startsWith('group:')) {
    const g = groups.find((x) => `group:${x.id}` === sel);
    if (!g) throw new Error(`Không có nhóm: ${sel}`);
    const set = new Set<number>();
    for (const s of g.selectors) {
      if (s.startsWith('group:')) throw new Error(`Nhóm lồng nhóm không được phép: ${sel} → ${s}`);
      for (const i of expandSelector(s, cells, groups)) set.add(i);
    }
    out = [...set].sort((a, b) => a - b);
  } else {
    const level = selectorSpecificity(sel);
    const key: keyof CellMeta = level === 1 ? 'country' : level === 2 ? 'adm1' : 'id';
    out = [];
    cells.forEach((c, i) => {
      if (c[key] === sel) out.push(i);
    });
  }
  if (out.length === 0) throw new Error(`Selector không khớp ô nào: ${sel}`);
  return out;
}

export function resolveAllSnapshots(
  snapshots: Snapshot[],
  cells: CellMeta[],
  groups: CellGroup[]
): (PolityId | null)[][] {
  const result: (PolityId | null)[][] = [];
  let cur: (PolityId | null)[] = new Array(cells.length).fill(null);
  for (const snap of snapshots) {
    const next = cur.slice();
    const entries = Object.entries(snap.assign).sort(
      ([a], [b]) => selectorSpecificity(a) - selectorSpecificity(b)
    );
    for (const [sel, polity] of entries) {
      for (const i of expandSelector(sel, cells, groups)) next[i] = polity;
    }
    result.push(next);
    cur = next;
  }
  return result;
}

export function effectivePolity(
  polities: Map<PolityId, Polity>,
  snapshots: Snapshot[],
  index: number,
  id: PolityId
): Polity {
  const base = polities.get(id);
  if (!base) throw new Error(`Không có chính thể: ${id}`);
  let p: Polity = base;
  for (let i = 0; i <= index && i < snapshots.length; i++) {
    const o = snapshots[i].polityOverrides?.[id];
    if (o) p = { ...p, ...o };
  }
  return p;
}

export function lowConfidenceCells(
  snapshot: Snapshot,
  cells: CellMeta[],
  groups: CellGroup[]
): Set<number> {
  const set = new Set<number>();
  for (const sel of snapshot.lowConfidence ?? []) {
    for (const i of expandSelector(sel, cells, groups)) set.add(i);
  }
  return set;
}
