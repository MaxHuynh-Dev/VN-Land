import { describe, expect, it } from 'vitest';
import {
  effectivePolity,
  expandSelector,
  lowConfidenceCells,
  resolveAllSnapshots,
  selectorSpecificity
} from './resolve';
import { CELLS, GROUPS, POLITIES, SNAPSHOTS } from './testFixtures';

describe('selectorSpecificity', () => {
  it('* < country < adm1 < group < cell', () => {
    expect(['*', 'VNM', 'VNM.bac', 'group:x', 'VNM.bac.a'].map(selectorSpecificity)).toEqual([
      0, 1, 2, 3, 4
    ]);
  });
});

describe('expandSelector', () => {
  it('bung đúng từng loại selector', () => {
    expect(expandSelector('*', CELLS, GROUPS)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(expandSelector('VNM', CELLS, GROUPS)).toEqual([0, 1, 2, 3]);
    expect(expandSelector('VNM.nam', CELLS, GROUPS)).toEqual([2, 3]);
    expect(expandSelector('VNM.nam.d', CELLS, GROUPS)).toEqual([3]);
    expect(expandSelector('group:song-cuu-long', CELLS, GROUPS)).toEqual([3, 4]);
  });
  it('ném lỗi khi selector không khớp ô nào', () => {
    expect(() => expandSelector('VNM.khong-co', CELLS, GROUPS)).toThrow(/VNM.khong-co/);
    expect(() => expandSelector('group:khong-co', CELLS, GROUPS)).toThrow(/group:khong-co/);
  });
});

describe('resolveAllSnapshots', () => {
  const owners = resolveAllSnapshots(SNAPSHOTS, CELLS, GROUPS);
  it('mốc đầu áp đầy đủ, null cho ô không gán', () => {
    expect(owners[0]).toEqual(['dai-viet', 'dai-viet', null, 'khmer', 'khmer', null]);
  });
  it('mốc sau chỉ áp delta, giữ nguyên phần còn lại', () => {
    expect(owners[1]).toEqual(['dai-viet', 'dai-viet', 'champa', 'khmer', 'khmer', null]);
  });
  it('selector cụ thể hơn thắng, bất kể thứ tự khóa', () => {
    // s3: 'VNM.nam.c' đứng trước 'VNM' trong object nhưng vẫn phải được áp sau
    expect(owners[2]).toEqual(['dai-viet', 'dai-viet', 'dai-viet', 'dai-viet', 'khmer', null]);
  });
  it('không sửa mảng của mốc trước', () => {
    expect(owners[0][2]).toBeNull();
  });
});

describe('effectivePolity', () => {
  const map = new Map(POLITIES.map((p) => [p.id, p]));
  it('cộng dồn override theo thời gian', () => {
    expect(effectivePolity(map, SNAPSHOTS, 0, 'dai-viet').name).toBe('dai-viet');
    expect(effectivePolity(map, SNAPSHOTS, 1, 'dai-viet').name).toBe('Đại Việt (Lý)');
    const p3 = effectivePolity(map, SNAPSHOTS, 2, 'dai-viet');
    expect(p3.name).toBe('Đại Việt (Lý)');
    expect(p3.flag).toBe('/flags/tran.svg');
  });
});

describe('lowConfidenceCells', () => {
  it('bung selector thành tập chỉ số', () => {
    const snap = { ...SNAPSHOTS[0], lowConfidence: ['VNM.nam'] };
    expect([...lowConfidenceCells(snap, CELLS, GROUPS)]).toEqual([2, 3]);
  });
});
