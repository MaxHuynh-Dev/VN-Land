import { describe, expect, it } from 'vitest';
import { polityAnchors } from './centroid';
import { coverRect } from './flagCover';
import { dropFlag, reconcileFlags } from './flagsReconcile';
import { px, pz } from './projection';
import { CELLS } from './testFixtures';

// 0–1 liền nhau, 2–3 liền nhau, 4 và 5 đứng riêng
const NEI = [[1], [0], [3], [2], [], []];

describe('polityAnchors', () => {
  it('neo vào cụm liền kề có diện tích lớn nhất, ô neo luôn thuộc chính thể', () => {
    const cells = CELLS.map((c, i) => ({ ...c, area: i === 2 ? 500 : 100 }));
    const owners = ['x', 'x', 'x', null, 'y', 'y'];
    const a = polityAnchors(cells, NEI, owners);
    const x = a.get('x');
    expect(x?.cellIndex).toBe(2); // cụm {2} rộng 500 > cụm {0,1} rộng 200
    expect(owners[x?.cellIndex ?? -1]).toBe('x');
    expect(x?.area).toBe(700);
    expect(x?.cellCount).toBe(3);
    // khung bao chỉ của cụm lớn nhất ({2}), không gồm cụm {0,1}; mỗi ô nới ra nửa cạnh
    // (sqrt(diện tích km²)/2) quy ra độ.
    const half = Math.sqrt(500) / 2;
    const dLat = half / 111;
    const dLon = half / (111 * Math.cos((CELLS[2].lat * Math.PI) / 180));
    expect(x?.bbox.minLon).toBeCloseTo(CELLS[2].lon - dLon, 6);
    expect(x?.bbox.maxLon).toBeCloseTo(CELLS[2].lon + dLon, 6);
    expect(x?.bbox.minLat).toBeCloseTo(CELLS[2].lat - dLat, 6);
    expect(x?.bbox.maxLat).toBeCloseTo(CELLS[2].lat + dLat, 6);
  });
  it('trong cụm, chọn ô gần tâm diện tích nhất', () => {
    const owners = ['x', 'x', null, null, null, null];
    const a = polityAnchors(CELLS, NEI, owners).get('x');
    expect([0, 1]).toContain(a?.cellIndex);
    expect(a?.lon).toBe(CELLS[a?.cellIndex ?? 0].lon);
  });
  it('lãnh thổ một ô: bbox không suy biến, khung phủ cờ có kích thước dương và ≥ bbox đã nới', () => {
    const owners = [null, null, null, null, 'k', null];
    const a = polityAnchors(CELLS, NEI, owners).get('k');
    expect(a).toBeDefined();
    const b = a?.bbox ?? { minLon: 0, maxLon: 0, minLat: 0, maxLat: 0 };
    expect(b.maxLon - b.minLon).toBeGreaterThan(0.05);
    expect(b.maxLat - b.minLat).toBeGreaterThan(0.05);
    const r = coverRect(b, 1.5, { lon: a?.lon ?? 0, lat: a?.lat ?? 0 });
    expect(r.w).toBeGreaterThan(0);
    expect(r.h).toBeGreaterThan(0);
    expect(r.w).toBeGreaterThanOrEqual(px(b.maxLon) - px(b.minLon) - 1e-9);
    expect(r.h).toBeGreaterThanOrEqual(pz(b.minLat) - pz(b.maxLat) - 1e-9);
  });
  it('bỏ qua ô null', () => {
    expect(polityAnchors(CELLS, NEI, [null, null, null, null, null, null]).size).toBe(0);
  });
});

describe('reconcileFlags', () => {
  const A = {
    cellIndex: 0,
    lon: 1,
    lat: 1,
    area: 1,
    cellCount: 1,
    bbox: { minLon: 1, maxLon: 1, minLat: 1, maxLat: 1 }
  };
  const B = { ...A, lon: 2 };
  it('mới → enter; còn → stay kèm neo mới; mất → exit', () => {
    const r1 = reconcileFlags([], new Map([['a', A]]));
    expect(r1).toEqual([{ id: 'a', state: 'enter', anchor: A }]);
    const r2 = reconcileFlags(
      r1,
      new Map([
        ['a', B],
        ['b', A]
      ])
    );
    expect(r2).toEqual([
      { id: 'a', state: 'stay', anchor: B },
      { id: 'b', state: 'enter', anchor: A }
    ]);
    const r3 = reconcileFlags(r2, new Map([['b', A]]));
    expect(r3.find((e) => e.id === 'a')?.state).toBe('exit');
  });
  it('cờ đang exit xuất hiện lại → stay', () => {
    const r = reconcileFlags([{ id: 'a', state: 'exit', anchor: A }], new Map([['a', B]]));
    expect(r).toEqual([{ id: 'a', state: 'stay', anchor: B }]);
  });
  it('dropFlag xóa hẳn', () => {
    expect(dropFlag([{ id: 'a', state: 'exit', anchor: A }], 'a')).toEqual([]);
  });
});
