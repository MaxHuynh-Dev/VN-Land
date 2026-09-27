import { describe, expect, it } from 'vitest';
import { CellStateStore, LIFT_MAX, ownerColors, spreadDelays, TRANSITION_S } from './cellState';
import { CELLS } from './testFixtures';

const rgb = (...v: number[]) => new Float32Array(v);

describe('CellStateStore', () => {
  it('texture đủ chỗ cho mọi ô, là lũy thừa của 2 theo chiều rộng', () => {
    const s = new CellStateStore(1300);
    expect(s.width * s.height).toBeGreaterThanOrEqual(1300);
    expect(Math.log2(s.width) % 1).toBe(0);
    expect(s.data.length).toBe(s.width * s.height * 4);
  });
  it('setColors không animate thì ghi ngay', () => {
    const s = new CellStateStore(2);
    s.setColors(rgb(1, 0, 0, 0, 1, 0));
    s.tick(0);
    expect([...s.data.slice(0, 8)]).toEqual([1, 0, 0, 0, 0, 1, 0, 0]);
  });
  it('animate chuyển dần và kết thúc đúng màu đích, có nhịp nổi rồi hạ', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(0, 0, 0));
    s.tick(0);
    s.setColors(rgb(1, 1, 1), { animate: true });
    s.tick(TRANSITION_S / 2);
    expect(s.data[0]).toBeGreaterThan(0);
    expect(s.data[0]).toBeLessThan(1);
    expect(s.data[3]).toBeGreaterThan(0);
    s.tick(TRANSITION_S);
    expect(s.data[0]).toBeCloseTo(1);
    expect(s.data[3]).toBeCloseTo(0);
    expect(s.isAnimating()).toBe(false);
  });
  it('ô không đổi màu thì không nhấp nhô', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(1, 0, 0));
    s.tick(0);
    s.setColors(rgb(1, 0, 0), { animate: true });
    s.tick(TRANSITION_S / 2);
    expect(s.data[3]).toBe(0);
  });
  it('delay giữ màu cũ cho tới khi hết trễ', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(0, 0, 0));
    s.tick(0);
    s.setColors(rgb(1, 1, 1), { animate: true, delays: new Float32Array([0.5]) });
    s.tick(0.4);
    expect(s.data[0]).toBe(0);
  });
  it('setLiftMask nâng dần ô được đánh dấu và hạ khi bỏ', () => {
    const s = new CellStateStore(2);
    s.setColors(rgb(0, 0, 0, 0, 0, 0));
    s.setLiftMask(new Uint8Array([1, 0]));
    for (let i = 0; i < 30; i++) s.tick(1 / 30);
    expect(s.data[3]).toBeGreaterThan(0.9 * (0.5 / LIFT_MAX) * LIFT_MAX);
    expect(s.data[7]).toBe(0);
    s.setLiftMask(null);
    for (let i = 0; i < 60; i++) s.tick(1 / 30);
    expect(s.data[3]).toBeCloseTo(0, 2);
  });
  it('tick trả về false khi không có gì thay đổi', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(0, 0, 0));
    s.tick(0);
    expect(s.tick(0.016)).toBe(false);
  });
});

describe('ownerColors', () => {
  it('null → màu đá, chủ → màu của chủ (linear)', () => {
    const c = ownerColors(['a', null], () => '#ffffff');
    expect([...c.slice(0, 3)]).toEqual([1, 1, 1]);
    expect(c[3]).toBeGreaterThan(0);
    expect(c[3]).toBeLessThan(0.2);
  });
});

describe('spreadDelays', () => {
  it('ô không đổi chủ có trễ 0; ô xa lãnh thổ cũ trễ nhiều hơn ô gần', () => {
    const prev = ['x', 'x', null, null, null, null];
    const next = ['x', 'x', 'x', 'x', null, null];
    const d = spreadDelays(CELLS, prev, next);
    expect(d[0]).toBe(0);
    expect(d[2]).toBeGreaterThan(0);
    expect(d[3]).toBeGreaterThanOrEqual(d[2]);
    // Float32Array lưu 1.2 thành số float32 gần nhất (~1.2000000476837158), lớn hơn 1.2 ở
    // độ chính xác double một lượng cỡ epsilon — nới ngưỡng để không kiểm tra sai do làm tròn.
    expect(Math.max(...d)).toBeLessThanOrEqual(1.2 + 1e-6);
  });
  it('chủ mới hoàn toàn (không có lãnh thổ cũ) thì trễ 0', () => {
    const d = spreadDelays(
      CELLS,
      [null, null, null, null, null, null],
      ['y', null, null, null, null, null]
    );
    expect(d[0]).toBe(0);
  });
});
