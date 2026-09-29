import { describe, expect, it } from 'vitest';
import { POLITIES as REAL_POLITIES, SNAPSHOTS as REAL_SNAPSHOTS } from '@/data/history';
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
  it('bắt chính thể không được dùng ở mốc nào', () => {
    const errs = validateHistory({
      ...base,
      polities: [...POLITIES, { ...POLITIES[0], id: 'mo-coi' }],
      snapshots: SNAPSHOTS
    }).join('\n');
    expect(errs).toMatch(/mo-coi.*không được dùng ở mốc nào/);
    expect(errs).not.toMatch(/dai-viet.*không được dùng/);
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

/** Bảng id 152 mốc (bảng v2 trong kế hoạch), đúng thứ tự thời gian. */
const MILESTONE_IDS = [
  'tcn20000',
  'tcn10000',
  'tcn8000',
  'tcn5000',
  'tcn2000',
  'tcn700',
  'tcn257',
  'tcn214',
  'tcn204',
  'tcn179',
  'tcn111',
  '40',
  '43',
  '192',
  '203',
  '226',
  '248',
  '280',
  '420',
  '544',
  '550',
  '571',
  '602',
  '622',
  '679',
  '722',
  '791',
  '802',
  '863',
  '866',
  '905',
  '917',
  '930',
  '931',
  '939',
  '966',
  '968',
  '980',
  '982',
  '1009',
  '1010',
  '1054',
  '1069',
  '1077',
  '1084',
  '1225',
  '1279',
  '1288',
  '1306',
  '1353',
  '1368',
  '1371',
  '1400',
  '1402',
  '1407',
  '1409',
  '1418',
  '1425',
  '1428',
  '1471',
  '1479',
  '1527',
  '1533',
  '1540',
  '1558',
  '1570',
  '1592',
  '1600',
  '1611',
  '1623',
  '1627',
  '1653',
  '1655',
  '1658',
  '1672',
  '1674',
  '1677',
  '1679',
  '1692',
  '1697',
  '1698',
  '1708',
  '1732',
  '1739',
  '1756',
  '1757',
  '1771',
  '1773',
  '1775',
  '1777',
  '1778',
  '1783',
  '1785',
  '1786',
  '1788',
  '1789',
  '1793',
  '1799',
  '1801',
  '1802',
  '1804',
  '1813',
  '1816',
  '1828',
  '1832',
  '1834',
  '1838',
  '1841',
  '1847',
  '1858',
  '1859',
  '1862',
  '1863',
  '1867',
  '1874',
  '1884',
  '1885',
  '1887',
  '1893',
  '1895',
  '1899',
  '1907',
  '1933',
  '1941',
  '1945-03',
  '1945-09',
  '1946',
  '1948',
  '1949',
  '1950',
  '1953',
  '1954',
  '1955',
  '1956',
  '1960',
  '1963',
  '1965',
  '1967',
  '1968',
  '1969',
  '1970',
  '1972',
  '1973',
  '1974',
  '1975-03',
  '1975',
  '1976',
  '1979',
  '1988',
  '1993',
  '1999',
  '2025'
];

describe('dữ liệu thật', () => {
  it('đủ 152 mốc theo đúng bảng id và thứ tự, không còn dữ liệu mẫu', () => {
    expect(REAL_SNAPSHOTS).toHaveLength(152);
    expect(REAL_SNAPSHOTS.map((s) => s.id)).toEqual(MILESTONE_IDS);
    expect(REAL_SNAPSHOTS.some((s) => /mẫu/i.test(s.title))).toBe(false);
    expect(REAL_POLITIES.some((p) => p.flag.includes('_sample'))).toBe(false);
  });
});
