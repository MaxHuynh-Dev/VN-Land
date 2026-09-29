import { describe, expect, it } from 'vitest';
import { ERAS } from '@/data/history/eras';
import { POLITIES } from '@/data/history/polities';
import { NULL_COLOR } from './cellState';
import {
  BAND_ALPHA,
  BAND_COLOR,
  compositeOverBand,
  contrastRatio,
  HEADLINE_LIGHTEN_AMOUNT,
  lightenTowardWhite,
  RANGE_TEXT_COLOR,
  relativeLuminanceOfHex
} from './contrast';

describe('contrastRatio', () => {
  it('trắng trên đen là tương phản tối đa (21:1)', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });
  it('một màu so với chính nó là 1:1', () => {
    expect(contrastRatio('#b08a3e', '#b08a3e')).toBeCloseTo(1, 5);
  });
  it('đối xứng — thứ tự tham số không đổi kết quả', () => {
    expect(contrastRatio('#6b6358', '#f4e3c1')).toBeCloseTo(
      contrastRatio('#f4e3c1', '#6b6358'),
      10
    );
  });
});

describe('lightenTowardWhite', () => {
  it('amount = 0 giữ nguyên màu; amount = 1 thành trắng tuyệt đối', () => {
    expect(lightenTowardWhite('#b08a3e', 0)).toBe('#b08a3e');
    expect(lightenTowardWhite('#123456', 1)).toBe('#ffffff');
  });
});

describe('compositeOverBand', () => {
  it('bandAlpha = 0 giữ nguyên màu nền (dải trong suốt hoàn toàn)', () => {
    expect(compositeOverBand('#050a12', 0, '#fbd116')).toBe('#fbd116');
  });
  it('bandAlpha = 1 cho đúng màu dải (che hoàn toàn nền)', () => {
    expect(compositeOverBand('#050a12', 1, '#fbd116')).toBe('#050a12');
  });
  it('bandAlpha giữa chừng nội suy tuyến tính từng kênh', () => {
    // Kênh R: dải 0x05 (5), nền 0xfb (251), alpha 0.5 → (5+251)/2 = 128 = 0x80.
    expect(compositeOverBand('#050000', 0.5, '#fb0000')).toBe('#800000');
  });
});

// Nền xấu nhất thật sự có thể xuất hiện phía sau màn mở đầu thời kỳ: ô không có chủ (màu đá cố
// định, xem global-constraints.md) và màu lãnh thổ SÁNG NHẤT trong dữ liệu chính thể thật — tính
// động từ POLITIES (không hardcode một mã màu) để không lệch nếu dữ liệu đổi sau này.
const LIGHTEST_POLITY_COLOR = POLITIES.reduce((lightest, p) =>
  relativeLuminanceOfHex(p.color) > relativeLuminanceOfHex(lightest.color) ? p : lightest
).color;
const WORST_CASE_BACKDROPS = [NULL_COLOR, LIGHTEST_POLITY_COLOR];

describe('Tương phản màn mở đầu thời kỳ trên nền bản đồ thật (fix round 1)', () => {
  it('nền xấu nhất được chọn quả thật sáng hơn ô không chủ (kiểm tra tiền đề của bộ test)', () => {
    expect(relativeLuminanceOfHex(LIGHTEST_POLITY_COLOR)).toBeGreaterThan(
      relativeLuminanceOfHex(NULL_COLOR)
    );
  });

  it.each(ERAS.map((e) => [e.id, e.color] as const))(
    'tên thời kỳ (%s) đạt ≥ 4.5:1 trên mọi nền xấu nhất sau khi phủ dải tối',
    (_id, color) => {
      const headline = lightenTowardWhite(color, HEADLINE_LIGHTEN_AMOUNT);
      for (const bg of WORST_CASE_BACKDROPS) {
        const realBackdrop = compositeOverBand(BAND_COLOR, BAND_ALPHA, bg);
        expect(contrastRatio(headline, realBackdrop)).toBeGreaterThanOrEqual(4.5);
      }
    }
  );

  it('dòng khoảng năm đạt ≥ 4.5:1 trên mọi nền xấu nhất sau khi phủ dải tối', () => {
    for (const bg of WORST_CASE_BACKDROPS) {
      const realBackdrop = compositeOverBand(BAND_COLOR, BAND_ALPHA, bg);
      expect(contrastRatio(RANGE_TEXT_COLOR, realBackdrop)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('không phủ dải (bandAlpha giả định 0) thì ít nhất một thời kỳ KHÔNG đạt 4.5:1 trên nền sáng nhất — xác nhận dải tối thật sự cần thiết, không phải test tự nó luôn đạt', () => {
    const worstEra = ERAS.reduce(
      (worst, e) => {
        const c = contrastRatio(
          lightenTowardWhite(e.color, HEADLINE_LIGHTEN_AMOUNT),
          LIGHTEST_POLITY_COLOR
        );
        return c < worst.c ? { e, c } : worst;
      },
      { e: ERAS[0], c: Number.POSITIVE_INFINITY }
    ).c;
    expect(worstEra).toBeLessThan(4.5);
  });
});
