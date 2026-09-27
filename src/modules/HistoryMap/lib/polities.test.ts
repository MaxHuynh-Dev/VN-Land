import { describe, expect, it } from 'vitest';
import { ownerMask, politiesInSnapshot } from './polities';
import { CELLS } from './testFixtures';

describe('politiesInSnapshot', () => {
  it('đếm ô, cộng diện tích, sắp giảm dần, bỏ null', () => {
    const cells = CELLS.map((c, i) => ({ ...c, area: (i + 1) * 10 }));
    const r = politiesInSnapshot(['a', 'a', 'b', null, 'b', 'b'], cells);
    expect(r).toEqual([
      { id: 'b', area: 30 + 50 + 60, cellCount: 3 },
      { id: 'a', area: 10 + 20, cellCount: 2 }
    ]);
  });
});

describe('ownerMask', () => {
  it('đánh dấu mọi ô của chính thể; null → null', () => {
    expect([...(ownerMask(['a', 'b', 'a'], 'a') ?? [])]).toEqual([1, 0, 1]);
    expect(ownerMask(['a'], null)).toBeNull();
  });
});
