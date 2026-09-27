import type { CellMeta } from './cells';

export function politiesInSnapshot(
  owners: (string | null)[],
  cells: CellMeta[]
): { id: string; area: number; cellCount: number }[] {
  const acc = new Map<string, { id: string; area: number; cellCount: number }>();
  owners.forEach((o, i) => {
    if (o === null) return;
    const e = acc.get(o) ?? { id: o, area: 0, cellCount: 0 };
    e.area += cells[i].area;
    e.cellCount++;
    acc.set(o, e);
  });
  return [...acc.values()].sort((a, b) => b.area - a.area);
}

export function ownerMask(owners: (string | null)[], id: string | null): Uint8Array | null {
  if (id === null) return null;
  return Uint8Array.from(owners, (o) => (o === id ? 1 : 0));
}
