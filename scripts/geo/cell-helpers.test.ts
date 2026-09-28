import { describe, expect, it } from 'vitest';
import { dedupeIds, keepChinaCell, makeCellId, normalizeAdm1Name, slugify } from './cell-helpers';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt, đ → d, khoảng trắng → gạch', () => {
    expect(slugify('Thừa Thiên Huế')).toBe('thua-thien-hue');
    expect(slugify('Đắk Lắk')).toBe('dak-lak');
    expect(slugify('Bà Rịa–Vũng Tàu')).toBe('ba-ria-vung-tau');
    expect(slugify('  Hà Nội\t')).toBe('ha-noi');
  });
});

describe('normalizeAdm1Name', () => {
  it('sửa tên thiếu dấu và ký tự thừa', () => {
    expect(normalizeAdm1Name('VNM', 'Ho Chi Minh')).toBe('TP. Hồ Chí Minh');
    expect(normalizeAdm1Name('VNM', 'Hà Nội\t')).toBe('Hà Nội');
    expect(normalizeAdm1Name('CHN', 'Guangzhou Province')).toBe('Quảng Đông');
    expect(normalizeAdm1Name('CHN', 'Guangxi Zhuang Autonomous Region')).toBe('Quảng Tây');
    expect(normalizeAdm1Name('CHN', 'Hainan Province')).toBe('Hải Nam');
    expect(normalizeAdm1Name('KHM', 'Ratanakiri Province')).toBe('Ratanakiri');
  });
});

describe('makeCellId', () => {
  it('ghép country.adm1.name', () => {
    expect(makeCellId('VNM', 'Quảng Nam', 'Dien Ban')).toBe('VNM.quang-nam.dien-ban');
  });
});

describe('dedupeIds', () => {
  it('thêm hậu tố -2, -3 cho id trùng', () => {
    expect(dedupeIds(['a', 'b', 'a', 'a'])).toEqual(['a', 'b', 'a-2', 'a-3']);
  });
});

describe('keepChinaCell', () => {
  it('chỉ giữ Quảng Tây, Quảng Đông, Hải Nam, Hồng Kông, Ma Cao và lat >= 18', () => {
    expect(keepChinaCell('Guangxi Zhuang Autonomous Region', 22.8)).toBe(true);
    expect(keepChinaCell('Hainan Province', 18.3)).toBe(true);
    expect(keepChinaCell('Hainan Province', 16.5)).toBe(false);
    expect(keepChinaCell('Yunnan Province', 23)).toBe(false);
  });
});
