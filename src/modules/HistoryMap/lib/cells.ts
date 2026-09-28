import type { GeometryCollection, Topology } from 'topojson-specification';

export type Country = 'VNM' | 'LAO' | 'KHM' | 'CHN';

export interface CellMeta {
  id: string;
  name: string;
  country: Country;
  adm1: string;
  adm1Name: string;
  lon: number;
  lat: number;
  area: number;
}

export type CellsTopology = Topology<{ cells: GeometryCollection<CellMeta> }>;

export function cellsFromTopology(topo: CellsTopology): CellMeta[] {
  return topo.objects.cells.geometries.map((g) => g.properties as CellMeta);
}
