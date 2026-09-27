import { describe, expect, it } from 'vitest';
import { resolveLabelOverlaps } from './labelOverlap';

const rect = (id: string, x: number, y: number, w: number, h: number, priority: number) => ({
  id,
  x,
  y,
  w,
  h,
  priority
});

describe('resolveLabelOverlaps', () => {
  it('không chồng lấn → không ẩn nhãn nào', () => {
    const rects = [rect('a', 0, 0, 10, 10, 100), rect('b', 100, 0, 10, 10, 50)];
    expect(resolveLabelOverlaps(rects)).toEqual(new Set());
  });

  it('chồng lấn → ẩn nhãn có priority (diện tích lãnh thổ) nhỏ hơn', () => {
    const rects = [rect('a', 0, 0, 10, 10, 100), rect('b', 5, 5, 10, 10, 50)];
    expect(resolveLabelOverlaps(rects)).toEqual(new Set(['b']));
  });

  it('chuỗi ba nhãn: a-b chồng, b-c chồng, a-c không chồng → chỉ ẩn b (c không bị nhãn đã ẩn che)', () => {
    // a: [0,10)  b: [8,18)  c: [16,26) — a∩b, b∩c, nhưng a∩c rỗng (16 ≥ 10).
    const rects = [
      rect('a', 0, 0, 10, 10, 300),
      rect('b', 8, 0, 10, 10, 200),
      rect('c', 16, 0, 10, 10, 100)
    ];
    expect(resolveLabelOverlaps(rects)).toEqual(new Set(['b']));
  });

  it('tham lam theo priority giảm dần, không phụ thuộc thứ tự đầu vào', () => {
    // c (ưu tiên cao nhất) che b; b đã ẩn nên không còn che a → a hiện.
    const rects = [
      rect('a', 0, 0, 10, 10, 100),
      rect('b', 8, 0, 10, 10, 200),
      rect('c', 16, 0, 10, 10, 300)
    ];
    expect(resolveLabelOverlaps(rects)).toEqual(new Set(['b']));
    expect(resolveLabelOverlaps([...rects].reverse())).toEqual(new Set(['b']));
  });

  it('priority bằng nhau → id theo thứ tự bảng chữ cái thắng (tie-break ổn định)', () => {
    const rects = [rect('z', 0, 0, 10, 10, 100), rect('a', 5, 5, 10, 10, 100)];
    expect(resolveLabelOverlaps(rects)).toEqual(new Set(['z']));
  });

  it('mảng rỗng hoặc một phần tử → không ẩn gì', () => {
    expect(resolveLabelOverlaps([])).toEqual(new Set());
    expect(resolveLabelOverlaps([rect('a', 0, 0, 10, 10, 1)])).toEqual(new Set());
  });
});
