import { describe, expect, it } from 'vitest';
import { polityAnchors } from './centroid';
import { dropFlag, reconcileFlags } from './flagsReconcile';
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
  });
  it('trong cụm, chọn ô gần tâm diện tích nhất', () => {
    const owners = ['x', 'x', null, null, null, null];
    const a = polityAnchors(CELLS, NEI, owners).get('x');
    expect([0, 1]).toContain(a?.cellIndex);
    expect(a?.lon).toBe(CELLS[a?.cellIndex ?? 0].lon);
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
    cellCount: 1
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
