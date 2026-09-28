import type { CellGroup, Polity, Snapshot } from '@/data/history/types';
import type { CellMeta } from './cells';

const c = (id: string, lon: number, lat: number, area = 100): CellMeta => {
  const [country, adm1] = id.split('.');
  return {
    id,
    name: id,
    country: country as CellMeta['country'],
    adm1: `${country}.${adm1}`,
    adm1Name: adm1,
    lon,
    lat,
    area
  };
};

/** 6 ô: 4 VNM (2 tỉnh), 1 KHM, 1 LAO */
export const CELLS: CellMeta[] = [
  c('VNM.bac.a', 105.8, 21.0),
  c('VNM.bac.b', 106.0, 20.8),
  c('VNM.nam.c', 106.7, 10.8),
  c('VNM.nam.d', 105.5, 10.0),
  c('KHM.pp.e', 104.9, 11.5),
  c('LAO.vt.f', 102.6, 17.9)
];

export const GROUPS: CellGroup[] = [
  { id: 'song-cuu-long', name: 'Đồng bằng sông Cửu Long', selectors: ['VNM.nam.d', 'KHM'] }
];

const polity = (id: string, extra: Partial<Polity> = {}): Polity => ({
  id,
  name: id,
  color: '#aa0000',
  flag: `/flags/${id}.svg`,
  flagKind: 'banner',
  flagNote: 'n',
  flagCredit: { license: 'PD', url: 'https://commons.wikimedia.org/x' },
  period: 'p',
  sources: [{ title: 's' }],
  ...extra
});

export const POLITIES: Polity[] = [polity('dai-viet'), polity('khmer'), polity('champa')];

const src = [{ title: 'A' }, { title: 'B' }];
export const SNAPSHOTS: Snapshot[] = [
  {
    id: 's1',
    year: 1000,
    yearLabel: '1000',
    era: 'nha-ly',
    title: 't',
    summary: 's',
    sources: src,
    assign: { '*': null, 'VNM.bac': 'dai-viet', 'group:song-cuu-long': 'khmer' }
  },
  {
    id: 's2',
    year: 1100,
    yearLabel: '1100',
    era: 'nha-ly',
    title: 't',
    summary: 's',
    sources: src,
    assign: { 'VNM.nam.c': 'champa' },
    polityOverrides: { 'dai-viet': { name: 'Đại Việt (Lý)' } }
  },
  {
    id: 's3',
    year: 1200,
    yearLabel: '1200',
    era: 'nha-ly',
    title: 't',
    summary: 's',
    sources: src,
    // key order: cell-level 'VNM.nam.c' đứng trước, country-level 'VNM' đứng sau —
    // nhưng selector cụ thể hơn ('VNM.nam.c') phải thắng dù đứng trước trong object
    assign: { 'VNM.nam.c': 'champa', VNM: 'dai-viet' },
    polityOverrides: { 'dai-viet': { flag: '/flags/tran.svg' } }
  }
];
