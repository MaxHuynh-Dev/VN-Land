import { describe, expect, it } from 'vitest';
import { atlasLayout, coverRect, polityParamsData } from './flagCover';
import { px, pz } from './projection';

describe('coverRect', () => {
  it('lãnh thổ cao hẹp: chiều cao cờ = chiều cao lãnh thổ, rộng theo tỉ lệ, tâm ở tâm bbox', () => {
    const r = coverRect({ minLon: 105, maxLon: 106, minLat: 10, maxLat: 20 }, 1.5);
    const bh = pz(10) - pz(20);
    expect(r.h).toBeCloseTo(bh);
    expect(r.w).toBeCloseTo(bh * 1.5);
    expect(r.cx).toBeCloseTo((px(105) + px(106)) / 2);
    expect(r.cz).toBeCloseTo((pz(10) + pz(20)) / 2);
  });
  it('lãnh thổ rộng dẹt: chiều rộng cờ phủ hết chiều rộng', () => {
    const r = coverRect({ minLon: 100, maxLon: 110, minLat: 15, maxLat: 16 }, 1.5);
    expect(r.w).toBeCloseTo(px(110) - px(100));
    expect(r.h).toBeCloseTo(r.w / 1.5);
  });
  it('có tâm lệch (điểm neo): tâm cờ ở điểm neo, vẫn phủ cả bốn góc bbox, giữ tỉ lệ', () => {
    const bbox = { minLon: 102, maxLon: 109, minLat: 8, maxLat: 23 };
    const center = { lon: 106.5, lat: 12 };
    const r = coverRect(bbox, 1.5, center);
    expect(r.cx).toBeCloseTo(px(center.lon));
    expect(r.cz).toBeCloseTo(pz(center.lat));
    expect(r.w / r.h).toBeCloseTo(1.5);
    for (const lon of [bbox.minLon, bbox.maxLon])
      for (const lat of [bbox.minLat, bbox.maxLat]) {
        expect(Math.abs(px(lon) - r.cx)).toBeLessThanOrEqual(r.w / 2 + 1e-9);
        expect(Math.abs(pz(lat) - r.cz)).toBeLessThanOrEqual(r.h / 2 + 1e-9);
      }
    // Chặt: cạnh đang bị ràng buộc chạm đúng góc xa nhất (lat 23, xa tâm hơn lat 8).
    expect(r.h / 2).toBeCloseTo(
      Math.max(
        pz(8) - pz(12),
        pz(12) - pz(23),
        (px(109) - px(106.5)) / 1.5,
        (px(106.5) - px(102)) / 1.5
      )
    );
  });
});

describe('atlasLayout', () => {
  it('đủ ô, uv trong [0,1], hàng 0 ở trên (v cao), có lề', () => {
    const a = atlasLayout(10, 8);
    expect(a.width).toBe(8 * 256);
    expect(a.height).toBe(2 * 171);
    const r0 = a.rect(0);
    const r8 = a.rect(8);
    expect(r0.v1).toBeGreaterThan(r8.v1);
    expect(r0.u0).toBeCloseTo(4 / a.width);
    expect(r0.u1).toBeCloseTo((256 - 4) / a.width);
    for (const r of [r0, r8])
      for (const v of [r.u0, r.u1, r.v0, r.v1]) expect(v).toBeGreaterThanOrEqual(0);
  });
});

describe('polityParamsData', () => {
  const anchor = {
    cellIndex: 0,
    // Điểm neo LỆCH tâm bbox (tâm bbox là 105.5, 15) để phân biệt hai cách đặt tâm.
    lon: 105.2,
    lat: 12,
    area: 1,
    cellCount: 1,
    bbox: { minLon: 105, maxLon: 106, minLat: 10, maxLat: 20 }
  };
  it('ghi rect atlas ở hàng 0 và cover ở hàng 1; chính thể vắng giữ giá trị cũ', () => {
    const d1 = polityParamsData(
      ['a', 'b'],
      new Map([
        ['a', anchor],
        ['b', anchor]
      ]),
      [1.5, 1.5]
    );
    expect(d1.length).toBe(2 * 2 * 4);
    const c = coverRect(anchor.bbox, 1.5, { lon: anchor.lon, lat: anchor.lat });
    const aRow1 = [...d1.slice(2 * 4, 2 * 4 + 4)];
    expect(aRow1[0]).toBeCloseTo(px(105.2));
    expect(aRow1[1]).toBeCloseTo(pz(12));
    expect(aRow1[2]).toBeCloseTo(c.w);
    expect(aRow1[3]).toBeCloseTo(c.h);
    const bRow1 = d1.slice((2 + 1) * 4, (2 + 1) * 4 + 4);
    const d2 = polityParamsData(['a', 'b'], new Map([['a', anchor]]), [1.5, 1.5], d1);
    expect([...d2.slice((2 + 1) * 4, (2 + 1) * 4 + 4)]).toEqual([...bRow1]);
  });
});
