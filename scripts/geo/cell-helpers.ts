export type Country = 'VNM' | 'LAO' | 'KHM' | 'CHN';

export function slugify(s: string): string {
  return s
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ADM1_FIX: Record<string, string> = {
  'VNM:Ho Chi Minh': 'TP. Hồ Chí Minh',
  'CHN:Guangzhou Province': 'Quảng Đông',
  'CHN:Guangxi Zhuang Autonomous Region': 'Quảng Tây',
  'CHN:Hainan Province': 'Hải Nam',
  'CHN:Hong Kong Special Administrative Region': 'Hồng Kông',
  'CHN:Macau Special Administrative Region': 'Ma Cao',
  'KHM:Ratanakiri Province': 'Ratanakiri'
};

export function normalizeAdm1Name(country: Country, raw: string): string {
  const trimmed = raw.trim();
  return ADM1_FIX[`${country}:${trimmed}`] ?? trimmed;
}

export function makeCellId(country: Country, adm1Name: string, cellName: string): string {
  return `${country}.${slugify(adm1Name)}.${slugify(cellName)}`;
}

export function dedupeIds(ids: string[]): string[] {
  const seen = new Map<string, number>();
  return ids.map((id) => {
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    return n === 1 ? id : `${id}-${n}`;
  });
}

const CHINA_KEEP = new Set([
  'Guangxi Zhuang Autonomous Region',
  'Guangzhou Province',
  'Hainan Province',
  'Hong Kong Special Administrative Region',
  'Macau Special Administrative Region'
]);

/** Giữ ô Trung Quốc thuộc Hoa Nam, loại mọi thứ dưới 18°N (Hoàng Sa, Trường Sa thuộc VNM). */
export function keepChinaCell(adm1Raw: string, lat: number): boolean {
  return CHINA_KEEP.has(adm1Raw.trim()) && lat >= 18.0;
}
