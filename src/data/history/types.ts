export type PolityId = string;

/** '*' | 'VNM' | 'VNM.quang-nam' | 'VNM.quang-nam.dien-ban' | 'group:chau-o' */
export type Selector = string;

export type EraId =
  | 'tien-su'
  | 'hong-bang'
  | 'bac-thuoc-1'
  | 'hai-ba-trung'
  | 'bac-thuoc-2'
  | 'van-xuan'
  | 'bac-thuoc-3'
  | 'tu-chu'
  | 'ngo-dinh-le'
  | 'nha-ly'
  | 'nha-tran'
  | 'ho-minh'
  | 'le-so'
  | 'mac'
  | 'trinh-nguyen'
  | 'tay-son'
  | 'nha-nguyen'
  | 'phap-thuoc'
  | 'khang-chien'
  | 'chia-cat'
  | 'thong-nhat';

export type FlagKind = 'national' | 'banner' | 'reconstructed' | 'symbol';

export interface Source {
  title: string;
  author?: string;
  url?: string;
  note?: string;
}

export interface FlagCredit {
  author?: string;
  license: string;
  url: string;
}

export interface Polity {
  id: PolityId;
  name: string;
  altNames?: string[];
  color: string;
  flag: string;
  flagKind: FlagKind;
  flagNote: string;
  flagCredit: FlagCredit | null;
  capital?: string;
  period: string;
  sources: Source[];
}

export interface CellGroup {
  id: string;
  name: string;
  selectors: Selector[];
}

export interface Snapshot {
  id: string;
  year: number;
  yearLabel: string;
  era: EraId;
  title: string;
  summary: string;
  assign: Record<Selector, PolityId | null>;
  polityOverrides?: Record<PolityId, Partial<Omit<Polity, 'id' | 'sources'>>>;
  lowConfidence?: Selector[];
  focus?: { lon: number; lat: number; distance?: number };
  sources: Source[];
}

export interface Era {
  id: EraId;
  label: string;
  color: string;
}
