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
  it('vách nội bộ: đúng 1 vách mỗi cạnh dùng chung, đỉnh ở y=DEPTH lúc nghỉ, mang aCell/aCellB đúng và vai trò 1/2', () => {
    // 2 cạnh nội bộ (tại lon=107 giữa ô 0-1, và lon=108 giữa ô 1-2). Mỗi cạnh chỉ dựng
    // ĐÚNG MỘT vách (quad = 2 tam giác = 6 đỉnh), dù được hai ô cùng "nhìn thấy" cạnh đó.
    const aCellB = geo.getAttribute('aCellB');
    const aWallRole = geo.getAttribute('aWallRole');
    const internalIdx: number[] = [];
    for (let i = 0; i < aWallRole.count; i++) {
      if (aWallRole.getX(i) > 0.5) internalIdx.push(i);
    }
    expect(internalIdx.length).toBe(2 * 6);

    const pairs = new Set<string>();
    let role1Count = 0;
    let role2Count = 0;
    for (const i of internalIdx) {
      expect(pos.getY(i)).toBeCloseTo(DEPTH); // lúc nghỉ, mọi đỉnh vách nội bộ ở y = DEPTH
      const role = aWallRole.getX(i);
      expect([1, 2]).toContain(role);
      if (role === 1) role1Count++;
      else role2Count++;
      const cA = aCell.getX(i);
      const cB = aCellB.getX(i);
      pairs.add([cA, cB].sort((x, y) => x - y).join(','));
    }
    expect(role1Count).toBe(6);
    expect(role2Count).toBe(6);
    expect([...pairs].sort()).toEqual(['0,1', '1,2']);
  });
  it('đỉnh mặt trên/đáy và vách đường bờ có aCellB = aCell và vai trò 0 (không đổi)', () => {
    const aCellB = geo.getAttribute('aCellB');
    const aWallRole = geo.getAttribute('aWallRole');
    for (let i = 0; i < aWallRole.count; i++) {
      if (aWallRole.getX(i) > 0.5) continue; // bỏ qua đỉnh vách nội bộ
      expect(aWallRole.getX(i)).toBe(0);
      expect(aCellB.getX(i)).toBe(aCell.getX(i));
    }
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
