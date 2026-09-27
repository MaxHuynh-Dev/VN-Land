import type { Polity } from './types';

// Chú thích kiểu tường minh (thay vì `as const`): `as const` biến `sources`
// thành tuple readonly, không gán được vào `Source[]` (mutable) của `Polity`.
const SAMPLE: Pick<Polity, 'flag' | 'flagKind' | 'flagNote' | 'flagCredit' | 'period' | 'sources'> =
  {
    flag: '/flags/_sample.svg',
    flagKind: 'symbol',
    flagNote: 'Dữ liệu mẫu',
    flagCredit: null,
    period: '—',
    sources: [{ title: 'Dữ liệu mẫu' }]
  };

export const POLITIES: Polity[] = [
  { id: 'van-lang', name: 'Văn Lang', color: '#b08a3e', ...SAMPLE },
  { id: 'dai-viet', name: 'Đại Việt', color: '#c2402f', ...SAMPLE },
  { id: 'champa', name: 'Chăm Pa', color: '#3f8f7a', ...SAMPLE },
  { id: 'khmer', name: 'Chân Lạp', color: '#5a6fb0', ...SAMPLE },
  { id: 'lan-xang', name: 'Lan Xang', color: '#8a7bb8', ...SAMPLE },
  { id: 'minh', name: 'Nhà Minh', color: '#a8844f', ...SAMPLE },
  { id: 'viet-nam', name: 'Việt Nam', color: '#d6332a', ...SAMPLE },
  { id: 'lao', name: 'Lào', color: '#6f7fc4', ...SAMPLE },
  { id: 'campuchia', name: 'Campuchia', color: '#4d67a8', ...SAMPLE },
  { id: 'trung-quoc', name: 'Trung Quốc', color: '#9b6b4a', ...SAMPLE }
];
