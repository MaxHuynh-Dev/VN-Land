import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { buildBorderPositions, buildCoastPositions } from './borders';
import type { CellsTopology } from './cells';
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
  it('không dựng vách ở cạnh nội bộ giữa các ô liền kề — chỉ vách đường bờ ngoài', () => {
    // 3 ô vuông 1°x1° liền hàng ngang (xem topoFixture.ts): chu vi ngoài là hình chữ nhật
    // 3x1 (106..109, 16..17); có 2 cạnh nội bộ dọc (tại lon=107 và 108) giữa các ô liền kề.
    // Trước khi sửa, ExtrudeGeometry dựng vách quanh TOÀN BỘ chu vi của mỗi ô độc lập, nên
    // mỗi cạnh nội bộ bị dựng vách hai lần (chồng khít, gây khe/vệt tối dày đặc khi render).
    // Đo diện tích các tam giác "vách" (normal gần nằm ngang) trong hình học đã gộp, và so
    // với diện tích vách kỳ vọng nếu CHỈ dựng ở đường bờ ngoài — nếu khớp thì không còn
    // vách trùng lặp ở cạnh nội bộ.
    let sideArea = 0;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    for (let t = 0; t < pos.count / 3; t++) {
      a.fromBufferAttribute(pos, t * 3);
      b.fromBufferAttribute(pos, t * 3 + 1);
      c.fromBufferAttribute(pos, t * 3 + 2);
      const cross = new THREE.Vector3()
        .subVectors(b, a)
        .cross(new THREE.Vector3().subVectors(c, a));
      const len = cross.length();
      if (len < 1e-9) continue;
      if (Math.abs(cross.y / len) <= 0.5) sideArea += len / 2;
    }
    const outerWidth = px(109) - px(106);
    const outerHeight = Math.abs(pz(17) - pz(16));
    const expectedCoastalOnly = 2 * (outerWidth + outerHeight) * DEPTH;
    expect(sideArea).toBeCloseTo(expectedCoastalOnly, 2);
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
