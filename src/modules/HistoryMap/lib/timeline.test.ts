import { describe, expect, it } from 'vitest';
import { ERAS } from '@/data/history/eras';
import type { Snapshot } from '@/data/history/types';
import { SNAPSHOTS } from './testFixtures';
import {
  clampIndex,
  eraRangeLabel,
  eraSegments,
  eraStartIndices,
  formatRunningYear,
  labelFits,
  shouldShowEraCard,
  snapshotIndexFromParam
} from './timeline';

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
      { ...SNAPSHOTS[2], era: 'thong-nhat' as const }
    ];
    const seg = eraSegments(snaps, ERAS);
    expect(seg.map((s) => [s.era.id, s.start, s.count])).toEqual([
      ['tien-su', 0, 2],
      ['thong-nhat', 2, 1]
    ]);
  });
});

describe('eraStartIndices', () => {
  it('trả chỉ số mốc đầu của mỗi đoạn thời kỳ liên tiếp', () => {
    const s = [{ era: 'a' }, { era: 'a' }, { era: 'b' }, { era: 'a' }] as unknown as Snapshot[];
    expect([...eraStartIndices(s)]).toEqual([0, 2, 3]);
  });
});

describe('labelFits', () => {
  it('vừa khi đoạn đủ rộng cho chữ cộng lề', () => {
    expect(labelFits(100, 80)).toBe(true);
    expect(labelFits(100, 93)).toBe(false);
    expect(labelFits(100, 93, 4)).toBe(true);
  });
});

describe('eraRangeLabel', () => {
  const snaps = [
    { yearLabel: '~2879 TCN', era: 'hong-bang' },
    { yearLabel: '~700 TCN', era: 'hong-bang' },
    { yearLabel: '1771', era: 'tay-son' },
    { yearLabel: '1802', era: 'nha-nguyen' },
    { yearLabel: '2025', era: 'thong-nhat' }
  ] as unknown as Snapshot[];

  it('mốc đầu của thời kỳ → mốc đầu của thời kỳ kế tiếp', () => {
    expect(eraRangeLabel(snaps, 'hong-bang', 'nay')).toBe('~2879 TCN – 1771');
    expect(eraRangeLabel(snaps, 'tay-son', 'nay')).toBe('1771 – 1802');
  });
  it('thời kỳ cuối (không có thời kỳ kế tiếp) dùng nhãn "đang tiếp diễn"', () => {
    expect(eraRangeLabel(snaps, 'thong-nhat', 'nay')).toBe('2025 – nay');
  });
  it('thời kỳ không có trong snapshots → chuỗi rỗng', () => {
    expect(eraRangeLabel(snaps, 'nha-ly', 'nay')).toBe('');
  });
});

describe('shouldShowEraCard', () => {
  // Tham số `isInitial` cũ đã bị bỏ (fix round 1, xem review): `EraTitleCard` chốt `prevEra`
  // đồng bộ lúc mount (`useRef(era)`) thay vì qua bộ đếm giờ, nên không bao giờ thật sự gọi hàm
  // này với "chưa có thời kỳ trước" — `prevEra === null` vẫn được hàm xử lý (trả `false`) để
  // đúng nghĩa với mọi lời gọi, nhưng component không dựa vào nhánh đó để chặn lần tải đầu.
  it('chưa có thời kỳ trước để so sánh (prevEra = null): không hiện', () => {
    expect(shouldShowEraCard(null, 'tay-son')).toBe(false);
  });
  it('đổi mốc trong cùng thời kỳ: không hiện', () => {
    expect(shouldShowEraCard('tay-son', 'tay-son')).toBe(false);
  });
  it('đổi sang thời kỳ khác, có thời kỳ trước để so sánh: hiện', () => {
    expect(shouldShowEraCard('tay-son', 'nha-nguyen')).toBe(true);
  });
});

describe('formatRunningYear', () => {
  it('năm dương: số nguyên trơn, không ngăn nghìn', () => {
    expect(formatRunningYear(1771)).toBe('1771');
    expect(formatRunningYear(1771.6)).toBe('1772');
  });
  it('năm 0: không có hậu tố TCN', () => {
    expect(formatRunningYear(0)).toBe('0');
    expect(formatRunningYear(-0.4)).toBe('0');
  });
  it('năm âm: hậu tố TCN, dấu chấm ngăn nghìn, làm tròn số nguyên', () => {
    expect(formatRunningYear(-700)).toBe('700 TCN');
    expect(formatRunningYear(-2879)).toBe('2.879 TCN');
    expect(formatRunningYear(-20000)).toBe('20.000 TCN');
    expect(formatRunningYear(-1500.6)).toBe('1.501 TCN');
  });
});
