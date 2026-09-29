/** Hàm màu dùng chung cho `contrast.ts` (WCAG) và `colorDistance.ts` (CIEDE2000). */

/** Kênh RGB 0..255 từ chuỗi hex `#rrggbb`. */
export function parseHex(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Kênh sRGB 0..255 → tuyến tính 0..1 (IEC 61966-2-1). WCAG 2.x ghi ngưỡng 0.03928 thay vì
 * 0.04045, nhưng với kênh 8 bit hai ngưỡng cho cùng kết quả (không giá trị nguyên nào nằm giữa).
 */
export function srgbToLinear(channel: number): number {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
