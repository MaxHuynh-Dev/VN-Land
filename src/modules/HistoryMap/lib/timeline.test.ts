import { describe, expect, it } from 'vitest';
import { ERAS } from '@/data/history/eras';
import { SNAPSHOTS } from './testFixtures';
import { clampIndex, eraSegments, snapshotIndexFromParam } from './timeline';

describe('snapshotIndexFromParam', () => {
  it('khớp đúng id', () => {
    expect(snapshotIndexFromParam('s2', SNAPSHOTS)).toBe(1);
  });
  it('null, rỗng hoặc rác → mốc đầu', () => {
    expect(snapshotIndexFromParam(null, SNAPSHOTS)).toBe(0);
    expect(snapshotIndexFromParam('', SNAPSHOTS)).toBe(0);
    expect(snapshotIndexFromParam('abc', SNAPSHOTS)).toBe(0);
  });
  it('số năm → mốc gần nhất có year ≤ năm đó', () => {
    expect(snapshotIndexFromParam('1150', SNAPSHOTS)).toBe(1);
    expect(snapshotIndexFromParam('1200', SNAPSHOTS)).toBe(2);
    expect(snapshotIndexFromParam('9999', SNAPSHOTS)).toBe(2);
  });
  it('năm trước mọi mốc → mốc đầu', () => {
    expect(snapshotIndexFromParam('-99999', SNAPSHOTS)).toBe(0);
  });
});

describe('clampIndex', () => {
  it('kẹp trong [0, len-1]', () => {
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(1, 3)).toBe(1);
  });
});

describe('eraSegments', () => {
  it('gom các mốc liên tiếp cùng thời kỳ', () => {
    const snaps = [
      { ...SNAPSHOTS[0], era: 'tien-su' as const },
      { ...SNAPSHOTS[1], era: 'tien-su' as const },
      { ...SNAPSHOTS[2], era: 'doc-lap' as const }
    ];
    const seg = eraSegments(snaps, ERAS);
    expect(seg.map((s) => [s.era.id, s.start, s.count])).toEqual([
      ['tien-su', 0, 2],
      ['doc-lap', 2, 1]
    ]);
  });
});
