import type { FeatureCollection, Polygon } from 'geojson';
import { topology } from 'topojson-server';
import type { CellMeta, CellsTopology } from './cells';

const square = (
  id: string,
  lon: number,
  lat: number
): FeatureCollection<Polygon, CellMeta>['features'][number] => ({
  type: 'Feature',
  properties: {
    id,
    name: id,
    country: 'VNM',
    adm1: 'VNM.t',
    adm1Name: 't',
    lon: lon + 0.5,
    lat: lat + 0.5,
    area: 100
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [lon, lat],
        [lon + 1, lat],
        [lon + 1, lat + 1],
        [lon, lat + 1],
        [lon, lat]
      ]
    ]
  }
});

/** Ba ô vuông 1°x1° liền nhau theo hàng ngang, bắt đầu tại (106, 16). */
export function makeFixtureTopology(): CellsTopology {
  const fc: FeatureCollection<Polygon, CellMeta> = {
    type: 'FeatureCollection',
    features: [square('VNM.t.a', 106, 16), square('VNM.t.b', 107, 16), square('VNM.t.c', 108, 16)]
  };
  return topology({ cells: fc }) as unknown as CellsTopology;
}
