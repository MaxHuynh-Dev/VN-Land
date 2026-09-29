/**
 * Toán học tương phản WCAG (Task E2, fix round 1) — dùng để đảm bảo chữ trên màn mở đầu thời kỳ
 * (`ui/EraTitleCard.tsx`) luôn đọc được trên NỀN THẬT (bản đồ 3D phía sau), không phải một màu
 * nền phẳng giả định. `EraTitleCard` phủ một dải tối bán trong suốt (letterbox) sau chữ; các
 * hàm ở đây tính đúng màu nền sau khi phủ dải đó (`compositeOverBand`) rồi so tương phản
 * (`contrastRatio`) với chữ đã pha sáng (`lightenTowardWhite`). Test ở `contrast.test.ts` xác
 * nhận công thức này đạt ≥ 4.5:1 cho cả 21 màu thời kỳ, so với nền xấu nhất có thể (ô không có
 * chủ `#707a80` và màu lãnh thổ sáng nhất trong dữ liệu).
 */

import { parseHex, srgbToLinear } from './color';

function toHex([r, g, b]: [number, number, number]): string {
  const c = (v: number): string =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Độ chói tương đối theo WCAG 2.x (sRGB → linear, trộn theo hệ số Rec. 709). */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rl, gl, bl] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** Tỉ lệ tương phản WCAG 2.x giữa hai màu hex (đối xứng, không phụ thuộc thứ tự tham số). */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(parseHex(hexA));
  const lb = relativeLuminance(parseHex(hexB));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Độ chói tương đối (WCAG) của một màu hex — dùng để tìm màu sáng nhất trong một tập màu
 * (ví dụ: màu lãnh thổ sáng nhất trong dữ liệu thật) mà không cần lặp lại phép tính luminance. */
export function relativeLuminanceOfHex(hex: string): number {
  return relativeLuminance(parseHex(hex));
}

/** Màu dải tối (letterbox) phủ sau chữ trên màn mở đầu thời kỳ, và độ mờ đỉnh của nó khi màn
 * đang hiện hết cỡ (giữa nhịp mờ vào/ra) — `EraTitleCard.module.css` hoạt hình độ mờ của dải từ
 * 0 lên 1 rồi về 0 theo đúng nhịp của cả màn; ở đỉnh, độ mờ thật của dải đúng bằng hằng số này.
 * Cùng một nguồn hằng số cho cả nơi vẽ (`EraTitleCard.tsx`) và nơi kiểm tương phản (test), để
 * không bao giờ lệch nhau. */
export const BAND_COLOR = '#050a12';
export const BAND_ALPHA = 0.7;

/** Chữ tên thời kỳ: trộn `era.color` về phía trắng theo tỉ lệ này. */
export const HEADLINE_LIGHTEN_AMOUNT = 0.65;
/** Chữ dòng khoảng năm: màu kem cố định (không giảm độ mờ — độ mờ càng thấp càng hại tương
 * phản khi trộn với nền thật phía sau, xem review fix round 1). */
export const RANGE_TEXT_COLOR = '#f4e3c1';

/** Trộn `hex` về phía trắng theo `amount` (0..1) — pha sáng chữ để đọc được trên nền tối. */
export function lightenTowardWhite(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const mix = (c: number): number => c + (255 - c) * amount;
  return toHex([mix(r), mix(g), mix(b)]);
}

/**
 * Màu nền THẬT sau khi phủ dải tối bán trong suốt (`bandHex` ở độ mờ `bandAlpha`, 0..1) lên
 * trên nền bản đồ `bgHex` — phép trộn alpha tiêu chuẩn (nguồn trên đích), từng kênh RGB. Dùng
 * để tính tương phản chữ so với những gì người xem THẬT SỰ thấy phía sau dải, thay vì giả định
 * một nền phẳng cố định như bản trước (chỉ kiểm `#0a1420`, trong khi phần lớn bản đồ là
 * `#707a80` hoặc màu lãnh thổ sáng hơn — xem `global-constraints.md`).
 */
export function compositeOverBand(bandHex: string, bandAlpha: number, bgHex: string): string {
  const [br, bgG, bb] = parseHex(bandHex);
  const [r, g, b] = parseHex(bgHex);
  const mix = (band: number, base: number): number => band * bandAlpha + base * (1 - bandAlpha);
  return toHex([mix(br, r), mix(bgG, g), mix(bb, b)]);
}
