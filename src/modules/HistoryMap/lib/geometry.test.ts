import type { FeatureCollection, Polygon } from 'geojson';
import { topology } from 'topojson-server';
import { describe, expect, it } from 'vitest';
import { buildBorderPositions, buildCoastPositions } from './borders';
import type { CellMeta, CellsTopology } from './cells';
import { DEPTH, LAT0, LON0, px, pz, unprojectX, unprojectZ } from './projection';
import { buildTerrainGeometry, cellAtVertex } from './terrainGeometry';
import { makeFixtureTopology } from './topoFixture';

describe('projection', () => {
  it('gốc tọa độ tại (LON0, LAT0); đông → +x; bắc → -z', () => {
    expect(px(LON0)).toBeCloseTo(0);
    expect(pz(LAT0)).toBeCloseTo(0);
    expect(px(LON0 + 1)).toBeGreaterThan(0);
    expect(pz(LAT0 + 1)).toBeLessThan(0);
  });
  it('unproject là phép nghịch đảo', () => {
    expect(unprojectX(px(110.25))).toBeCloseTo(110.25);
    expect(unprojectZ(pz(9.5))).toBeCloseTo(9.5);
  });
});

describe('buildTerrainGeometry', () => {
  const topo = makeFixtureTopology();
  const geo = buildTerrainGeometry(topo);
  const aCell = geo.getAttribute('aCell');
  const pos = geo.getAttribute('position');

  it('mỗi đỉnh có aCell hợp lệ và đủ 3 ô', () => {
    const seen = new Set<number>();
    for (let i = 0; i < aCell.count; i++) seen.add(aCell.getX(i));
    expect([...seen].sort()).toEqual([0, 1, 2]);
    expect(aCell.count).toBe(pos.count);
  });
  it('mặt trên ở y = DEPTH, đáy ở y = 0', () => {
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < pos.count; i++) {
      minY = Math.min(minY, pos.getY(i));
      maxY = Math.max(maxY, pos.getY(i));
    }
    expect(minY).toBeCloseTo(0);
    expect(maxY).toBeCloseTo(DEPTH);
  });
  it('x nằm trong khoảng chiếu của lon 106..109', () => {
    geo.computeBoundingBox();
    expect(geo.boundingBox?.min.x).toBeCloseTo(px(106), 1);
    expect(geo.boundingBox?.max.x).toBeCloseTo(px(109), 1);
  });
  it('cellAtVertex đọc đúng chỉ số', () => {
    expect(cellAtVertex(geo, 0)).toBe(aCell.getX(0));
  });
  it('ô không có hình học hợp lệ phải ném lỗi', () => {
    const emptyTopo: CellsTopology = {
      type: 'Topology',
      arcs: [],
      objects: {
        cells: {
          type: 'GeometryCollection',
          geometries: [
            {
              type: 'Polygon',
              arcs: []
            }
          ]
        }
      }
    };
    expect(() => buildTerrainGeometry(emptyTopo)).toThrow(/Không có ô hợp lệ/);
  });
});

describe('borders', () => {
  const topo = makeFixtureTopology();
  it('không có biên khi cả ba ô cùng chủ', () => {
    expect(buildBorderPositions(topo, ['a', 'a', 'a']).length).toBe(0);
  });
  it('có biên giữa hai chủ khác nhau, nằm trên mặt đất', () => {
    const p = buildBorderPositions(topo, ['a', 'a', 'b']);
    expect(p.length).toBeGreaterThan(0);
    expect(p.length % 6).toBe(0);
    for (let i = 1; i < p.length; i += 3) expect(p[i]).toBeCloseTo(DEPTH + 0.03);
    // biên chỉ nằm ở kinh tuyến 108
    for (let i = 0; i < p.length; i += 3) expect(p[i]).toBeCloseTo(px(108), 3);
  });
  it('ô null cũng tạo biên với ô có chủ', () => {
    expect(buildBorderPositions(topo, ['a', null, null]).length).toBeGreaterThan(0);
  });
  it('đường bờ bao quanh cả khối', () => {
    expect(buildCoastPositions(topo).length).toBeGreaterThan(0);
  });
});
