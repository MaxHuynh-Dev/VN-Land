import type { Snapshot } from '../types';

const S = [{ title: 'Dữ liệu mẫu 1' }, { title: 'Dữ liệu mẫu 2' }];

export const SAMPLE_SNAPSHOTS: Snapshot[] = [
  {
    id: 'tcn700',
    year: -700,
    yearLabel: '~700 TCN',
    era: 'hong-bang',
    title: 'Văn Lang (mẫu)',
    summary: 'Dữ liệu mẫu để dựng giao diện.',
    sources: S,
    assign: { '*': null, 'group:dong-bang-bac-bo': 'van-lang' }
  },
  {
    id: '1471',
    year: 1471,
    yearLabel: '1471',
    era: 'nam-tien',
    title: 'Năm 1471 (mẫu)',
    summary: 'Dữ liệu mẫu để dựng giao diện.',
    sources: S,
    focus: { lon: 108.9, lat: 14.0 },
    assign: {
      VNM: 'dai-viet',
      'group:champa-sau-1471': 'champa',
      'group:nam-bo': 'khmer',
      KHM: 'khmer',
      LAO: 'lan-xang',
      CHN: 'minh',
      'VNM.hoang-sa': null,
      'VNM.truong-sa': null
    }
  },
  {
    id: '2025',
    year: 2025,
    yearLabel: '2025',
    era: 'thong-nhat',
    title: 'Ngày nay (mẫu)',
    summary: 'Dữ liệu mẫu để dựng giao diện.',
    sources: S,
    assign: { VNM: 'viet-nam', LAO: 'lao', KHM: 'campuchia', CHN: 'trung-quoc' }
  }
];
