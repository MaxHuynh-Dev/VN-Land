import type { MultiLineString } from 'geojson';
import { mesh } from 'topojson-client';
import type { CellsTopology } from './cells';
import { DEPTH, px, pz } from './projection';

const Y = DEPTH + 0.03;

function toSegments(ml: MultiLineString): Float32Array {
  const out: number[] = [];
  for (const line of ml.coordinates) {
    for (let i = 1; i < line.length; i++) {
      const [lon0, lat0] = line[i - 1];
      const [lon1, lat1] = line[i];
      out.push(px(lon0), Y, pz(lat0), px(lon1), Y, pz(lat1));
    }
  }
  return new Float32Array(out);
}

export function buildBorderPositions(topo: CellsTopology, owners: (string | null)[]): Float32Array {
  const index = new Map(topo.objects.cells.geometries.map((g, i) => [g, i]));
  const ml = mesh(topo, topo.objects.cells, (a, b) => {
    if (a === b) return false;
    const oa = owners[index.get(a as never) ?? -1] ?? null;
    const ob = owners[index.get(b as never) ?? -1] ?? null;
    return oa !== ob;
  }) as MultiLineString;
  return toSegments(ml);
}

export function buildCoastPositions(topo: CellsTopology): Float32Array {
  return toSegments(mesh(topo, topo.objects.cells, (a, b) => a === b) as MultiLineString);
}
