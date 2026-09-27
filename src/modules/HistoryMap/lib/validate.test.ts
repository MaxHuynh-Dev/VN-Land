import { describe, expect, it } from 'vitest';
import { ERAS } from '@/data/history/eras';
import type { Snapshot } from '@/data/history/types';
import { CELLS, GROUPS, POLITIES, SNAPSHOTS } from './testFixtures';
import { validateHistory } from './validate';

const base = {
  polities: POLITIES,
  groups: GROUPS,
  eras: ERAS,
  cells: CELLS,
  flagExists: () => true
};
const withSnaps = (snapshots: Snapshot[]) => validateHistory({ ...base, snapshots });

describe('validateHistory', () => {
  it('dữ liệu hợp lệ không có lỗi', () => {
    expect(withSnaps(SNAPSHOTS)).toEqual([]);
  });
  it('mốc đầu phải có khóa *', () => {
    const s = [{ ...SNAPSHOTS[0], assign: { VNM: 'dai-viet' } }];
    expect(withSnaps(s).join()).toMatch(/s1.*\*/);
  });
  it('bắt selector sai, chính thể không tồn tại, thiếu nguồn, năm không tăng', () => {
    const s: Snapshot[] = [
      SNAPSHOTS[0],
      { ...SNAPSHOTS[1], assign: { 'VNM.sai': 'dai-viet', VNM: 'ma' }, sources: [{ title: 'x' }] },
      { ...SNAPSHOTS[2], year: 1100 }
    ];
    const errs = withSnaps(s).join('\n');
    expect(errs).toMatch(/VNM\.sai/);
    expect(errs).toMatch(/ma/);
    expect(errs).toMatch(/s2.*nguồn/);
    expect(errs).toMatch(/s3.*năm/);
  });
  it('bắt id mốc trùng hoặc sai định dạng', () => {
    const s = [SNAPSHOTS[0], { ...SNAPSHOTS[1], id: 's1' }, { ...SNAPSHOTS[2], id: 'Năm 1200' }];
    const errs = withSnaps(s).join('\n');
    expect(errs).toMatch(/trùng.*s1/);
    expect(errs).toMatch(/Năm 1200/);
  });
  it('bắt file cờ không tồn tại và thiếu ghi công', () => {
    const errs = validateHistory({
      ...base,
      polities: [...POLITIES.slice(0, 2), { ...POLITIES[2], flagCredit: null }],
      snapshots: SNAPSHOTS,
      flagExists: (p) => !p.includes('khmer')
    }).join('\n');
    expect(errs).toMatch(/khmer.*\/flags\/khmer\.svg/);
    expect(errs).toMatch(/champa.*ghi công/);
  });
  it('bắt màu sai định dạng và focus ngoài vùng bản đồ', () => {
    const errs = validateHistory({
      ...base,
      polities: [{ ...POLITIES[0], color: 'red' }, ...POLITIES.slice(1)],
      snapshots: [{ ...SNAPSHOTS[0], focus: { lon: 150, lat: 10 } }, ...SNAPSHOTS.slice(1)]
    }).join('\n');
    expect(errs).toMatch(/dai-viet.*màu/);
    expect(errs).toMatch(/s1.*focus/);
  });
});
