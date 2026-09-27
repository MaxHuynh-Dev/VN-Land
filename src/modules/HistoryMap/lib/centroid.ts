import type { CellMeta } from './cells';

export interface Anchor {
  cellIndex: number;
  lon: number;
  lat: number;
  area: number;
  cellCount: number;
  /** Khung bao (độ) của cụm ô liền kề lớn nhất — dùng để phủ cờ lên lãnh thổ (flagCover.ts). */
  bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number };
}

export function polityAnchors(
  cells: CellMeta[],
  neighbors: number[][],
  owners: (string | null)[]
): Map<string, Anchor> {
  const seen = new Uint8Array(cells.length);
  const best = new Map<string, { comp: number[]; area: number }>();
  const total = new Map<string, { area: number; count: number }>();

  for (let start = 0; start < cells.length; start++) {
    const id = owners[start];
    if (id === null || seen[start]) continue;
    const comp: number[] = [];
    let area = 0;
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop() as number;
      comp.push(i);
      area += cells[i].area;
      for (const j of neighbors[i] ?? []) {
        if (!seen[j] && owners[j] === id) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    const t = total.get(id) ?? { area: 0, count: 0 };
    t.area += area;
    t.count += comp.length;
    total.set(id, t);
    const b = best.get(id);
    if (!b || area > b.area) best.set(id, { comp, area });
  }

  const out = new Map<string, Anchor>();
  for (const [id, { comp, area }] of best) {
    let cx = 0;
    let cy = 0;
    for (const i of comp) {
      cx += cells[i].lon * cells[i].area;
      cy += cells[i].lat * cells[i].area;
    }
    cx /= area || 1;
    cy /= area || 1;
    const bbox = {
      minLon: Number.POSITIVE_INFINITY,
      maxLon: Number.NEGATIVE_INFINITY,
      minLat: Number.POSITIVE_INFINITY,
      maxLat: Number.NEGATIVE_INFINITY
    };
    for (const i of comp) {
      const { lon, lat } = cells[i];
      if (lon < bbox.minLon) bbox.minLon = lon;
      if (lon > bbox.maxLon) bbox.maxLon = lon;
      if (lat < bbox.minLat) bbox.minLat = lat;
      if (lat > bbox.maxLat) bbox.maxLat = lat;
    }
    let pick = comp[0];
    let pd = Number.POSITIVE_INFINITY;
    for (const i of comp) {
      const d = (cells[i].lon - cx) ** 2 + (cells[i].lat - cy) ** 2;
      if (d < pd) {
        pd = d;
        pick = i;
      }
    }
    const t = total.get(id) as { area: number; count: number };
    out.set(id, {
      cellIndex: pick,
      lon: cells[pick].lon,
      lat: cells[pick].lat,
      area: t.area,
      cellCount: t.count,
      bbox
    });
  }
  return out;
}
