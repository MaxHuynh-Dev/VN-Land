import type * as THREE from 'three';
import { neighbors } from 'topojson-client';
import { GROUPS, SNAPSHOTS } from '@/data/history';
import { buildCoastPositions } from './borders';
import { type CellMeta, type CellsTopology, cellsFromTopology } from './cells';
import { resolveAllSnapshots } from './resolve';
import { buildTerrainGeometry } from './terrainGeometry';

export interface MapData {
  topo: CellsTopology;
  cells: CellMeta[];
  geometry: THREE.BufferGeometry;
  owners: (string | null)[][];
  coast: Float32Array;
  neighbors: number[][];
}

export async function loadMapData(signal?: AbortSignal): Promise<MapData> {
  const res = await fetch('/data/cells.topo.json', { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const topo = (await res.json()) as CellsTopology;
  const cells = cellsFromTopology(topo);
  return {
    topo,
    cells,
    geometry: buildTerrainGeometry(topo),
    owners: resolveAllSnapshots(SNAPSHOTS, cells, GROUPS),
    coast: buildCoastPositions(topo),
    neighbors: neighbors(topo.objects.cells.geometries as never)
  };
}
