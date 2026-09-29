/**
 * Mặt trận loang phát sáng khi đổi mốc (Task E1).
 *
 * Mỗi ô có tiến độ tuyến tính `progress` 0..1 (ownerData kênh 4, xem cellState.ts). Fragment
 * shader mặt trên (Terrain.tsx) lấy noise `n = fbmNoise(worldXZ)` trong [0,1] và so với ngưỡng
 * `edge = progress·(1 + 2w) − w`: pixel có noise thấp đổi màu chủ trước, tạo đường ranh răng cưa tự
 * nhiên. Quanh ngưỡng có vệt sáng hai lớp: lõi trắng-vàng mảnh + quầng hổ phách rộng (ửng
 * trước, âm ỉ sau), đều có độ rộng tối thiểu theo pixel màn hình để vẫn rõ khi nhìn toàn cảnh.
 *
 * ĐỒNG BỘ: các hàm JS dưới đây là bản sao 1:1 của hàm GLSL trong `DISSOLVE_GLSL` (cùng hằng số,
 * cùng thứ tự phép tính) — GLSL không unit-test được nên test chạy trên bản JS. Sửa một bên thì
 * phải sửa bên kia. Hằng số được nội suy vào chuỗi GLSL từ chính các `export const` ở đây.
 */

/** Nửa độ rộng dải chuyển tiếp mềm (đơn vị noise). */
export const DISSOLVE_WIDTH = 0.08;
/** Tần số noise theo toạ độ thế giới (1° kinh/vĩ ≈ 6 đơn vị; một ô ≈ 1–3 đơn vị). */
export const NOISE_FREQ = 0.4;
/** Số octave fbm (giới hạn 3 vì chi phí fragment trên mobile). */
export const NOISE_OCTAVES = 3;
/** Kéo giãn tương phản quanh 0.5 để noise phủ gần đủ [0,1] (fbm tự nhiên dồn quanh 0.5). */
export const NOISE_CONTRAST = 1.9;
/**
 * Độ dốc trung bình |∇n| của `fbmNoise` (đơn vị noise / đơn vị thế giới), đo bằng bản JS trên
 * lưới −40..40 × −60..60 (p10 0.13, p50 0.35, p90 0.64). Dùng để đổi kích thước một pixel trên
 * mặt đất sang đơn vị noise — thay cho `fwidth(n)`, vì n được tính trong nhánh theo ô (đạo hàm
 * trong luồng điều khiển không đồng nhất là không xác định ở mép ô).
 */
export const NOISE_GRAD_MEAN = 0.37;

// Vệt sáng hai lớp. Mọi độ rộng là NỬA độ rộng, đo bằng |n − edge| (đơn vị noise).
/** Lõi: nửa độ rộng tối thiểu theo thế giới (khi nhìn gần). */
export const GLOW_CORE_W = 0.045;
/** Lõi: nửa độ rộng tối thiểu theo màn hình (pixel) — lõi luôn dày ≥ ~5 px khi nhìn xa. */
export const GLOW_CORE_PX = 2.5;
/** Lõi: chặn trên nửa độ rộng. */
export const GLOW_CORE_MAX = 0.16;
/** Quầng: nửa độ rộng tối thiểu theo thế giới, phía chưa đổi (phía trước mặt trận). */
export const GLOW_HALO_W = 0.16;
/** Quầng: nửa độ rộng tối thiểu theo màn hình (pixel), phía trước mặt trận. */
export const GLOW_HALO_PX = 7;
/** Quầng: chặn trên nửa độ rộng phía trước. */
export const GLOW_HALO_MAX = 0.4;
/** Quầng phía sau mặt trận (đã đổi) dài gấp bao nhiêu phía trước — vệt âm ỉ kéo đuôi. */
export const GLOW_TRAIL = 1.8;
/** Độ dài (theo progress) của đoạn vào/ra: vệt sáng hiện dần đầu và tắt dần cuối. */
export const GLOW_ENV = 0.1;
/** Màu lõi (sRGB, trắng-vàng); Terrain.tsx chuyển sang linear khi gán uniform. */
export const GLOW_CORE_COLOR = '#fff1c4';
/** Hệ số cộng (additive) của lõi vào bức xạ tự phát. */
export const GLOW_CORE_GAIN = 1.8;
/** Màu quầng (sRGB, hổ phách). */
export const GLOW_COLOR = '#ffb347';
/** Hệ số cộng của quầng — thấp hơn lõi. */
export const GLOW_HALO_GAIN = 0.75;
/**
 * Độ "cháy sém" (CHỈ dùng trong shader, không có hàm JS tương ứng): màu chủ dưới quầng nhân
 * `1 − GLOW_CHAR · halo`, để sắc hổ phách/lõi sáng nổi trên cả màu chủ sáng (vàng #f0b90b, trắng).
 */
export const GLOW_CHAR = 0.45;

const fract = (x: number): number => x - Math.floor(x);
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const mix = (a: number, b: number, t: number): number => a * (1 - t) + b * t;

/** GLSL `smoothstep`. */
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/** Hash 2D → [0,1) không dùng sin (Dave Hoskins "hash12"), ổn định trên GPU mobile. */
function hash12(x: number, y: number): number {
  let a = fract(x * 0.1031);
  let b = fract(y * 0.1031);
  let c = fract(x * 0.1031);
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += d;
  b += d;
  c += d;
  return fract((a + b) * c);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash12(ix, iy);
  const b = hash12(ix + 1, iy);
  const c = hash12(ix, iy + 1);
  const d = hash12(ix + 1, iy + 1);
  return mix(mix(a, b, ux), mix(c, d, ux), uy);
}

/** fbm 3 octave của value noise theo toạ độ thế giới XZ, kéo giãn tương phản, kẹp về [0,1]. */
export function fbmNoise(x: number, z: number): number {
  const px = x * NOISE_FREQ;
  const pz = z * NOISE_FREQ;
  let n = 0.5 * valueNoise(px, pz);
  n += 0.25 * valueNoise(px * 2.03 + 17.1, pz * 2.03 + 17.1);
  n += 0.125 * valueNoise(px * 4.01 + 41.7, pz * 4.01 + 41.7);
  n /= 0.875;
  return clamp01((n - 0.5) * NOISE_CONTRAST + 0.5);
}

/** Ngưỡng noise tại tiến độ `progress`: −w (chưa pixel nào đổi) → 1 + w (mọi pixel đã đổi). */
export function dissolveEdge(progress: number, w = DISSOLVE_WIDTH): number {
  return progress * (1 + 2 * w) - w;
}

/** m = 1: pixel còn màu chủ cũ; m = 0: đã sang màu chủ mới. Màu = mix(from, to, 1 − m). */
export function dissolveMask(progress: number, n: number, w = DISSOLVE_WIDTH): number {
  const e = dissolveEdge(progress, w);
  return smoothstep(e - w, e + w, n);
}

/** Hệ số vào/ra 0..1 của vệt sáng: 0 khi progress ≤ 0 hoặc ≥ 1, lên/xuống mềm trong GLOW_ENV. */
export function glowEnvelope(progress: number): number {
  if (progress <= 0 || progress >= 1) return 0;
  return smoothstep(0, GLOW_ENV, progress) * (1 - smoothstep(1 - GLOW_ENV, 1, progress));
}

/**
 * Kích thước một pixel màn hình đổi sang đơn vị noise. `pixelWorld` = độ dài một pixel trên mặt
 * đất (GLSL: `max(length(dFdx(worldXZ)), length(dFdy(worldXZ)))`).
 */
export function glowMinWidth(pixelWorld: number): number {
  return pixelWorld * NOISE_GRAD_MEAN;
}

/**
 * Lõi sáng mảnh 0..1 tại pixel có noise `n`: đỉnh ở ngưỡng, nửa độ rộng
 * `clamp(px · GLOW_CORE_PX, GLOW_CORE_W, GLOW_CORE_MAX)` — `px` = `glowMinWidth(...)`.
 */
export function glowAmount(progress: number, n: number, px = 0): number {
  const env = glowEnvelope(progress);
  if (env <= 0) return 0;
  const d = Math.abs(n - dissolveEdge(progress));
  const wc = Math.min(GLOW_CORE_MAX, Math.max(GLOW_CORE_W, px * GLOW_CORE_PX));
  return (1 - smoothstep(0, wc, d)) * env;
}

/**
 * Quầng hổ phách rộng 0..1: phía chưa đổi (n > edge) rộng `clamp(px · GLOW_HALO_PX,
 * GLOW_HALO_W, GLOW_HALO_MAX)` — pixel ửng sáng trước khi mặt trận tới; phía đã đổi dài gấp
 * GLOW_TRAIL — còn âm ỉ sau khi mặt trận qua. Giảm theo bình phương cho đuôi mềm.
 */
export function haloAmount(progress: number, n: number, px = 0): number {
  const env = glowEnvelope(progress);
  if (env <= 0) return 0;
  const d = n - dissolveEdge(progress);
  const wh =
    Math.min(GLOW_HALO_MAX, Math.max(GLOW_HALO_W, px * GLOW_HALO_PX)) * (d < 0 ? GLOW_TRAIL : 1);
  const h = 1 - smoothstep(0, wh, Math.abs(d));
  return h * h * env;
}

const f = (v: number): string => v.toFixed(4);

/**
 * Hàm GLSL chèn vào fragment shader của Terrain (sau `#include <common>`). Bản sao 1:1 của các
 * hàm JS ở trên. `fbmNoise` tốn 12 lần hash + 3 lần nội suy — chỉ gọi cho ô đang chuyển chủ.
 */
export const DISSOLVE_GLSL = `
const float DS_WIDTH = ${f(DISSOLVE_WIDTH)};
const float DS_FREQ = ${f(NOISE_FREQ)};
const float DS_CONTRAST = ${f(NOISE_CONTRAST)};
const float DS_NOISE_GRAD = ${f(NOISE_GRAD_MEAN)};
const float DS_CORE_W = ${f(GLOW_CORE_W)};
const float DS_CORE_PX = ${f(GLOW_CORE_PX)};
const float DS_CORE_MAX = ${f(GLOW_CORE_MAX)};
const float DS_HALO_W = ${f(GLOW_HALO_W)};
const float DS_HALO_PX = ${f(GLOW_HALO_PX)};
const float DS_HALO_MAX = ${f(GLOW_HALO_MAX)};
const float DS_TRAIL = ${f(GLOW_TRAIL)};
const float DS_ENV = ${f(GLOW_ENV)};
const float DS_CORE_GAIN = ${f(GLOW_CORE_GAIN)};
const float DS_HALO_GAIN = ${f(GLOW_HALO_GAIN)};
const float DS_GLOW_CHAR = ${f(GLOW_CHAR)};
float dsHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float dsValueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dsHash(i);
  float b = dsHash(i + vec2(1.0, 0.0));
  float c = dsHash(i + vec2(0.0, 1.0));
  float d = dsHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbmNoise(vec2 xz) {
  vec2 p = xz * DS_FREQ;
  float n = 0.5 * dsValueNoise(p);
  n += 0.25 * dsValueNoise(p * 2.03 + 17.1);
  n += 0.125 * dsValueNoise(p * 4.01 + 41.7);
  n /= 0.875;
  return clamp((n - 0.5) * DS_CONTRAST + 0.5, 0.0, 1.0);
}
float dissolveEdge(float progress) {
  return progress * (1.0 + 2.0 * DS_WIDTH) - DS_WIDTH;
}
float dissolveMask(float progress, float n) {
  float e = dissolveEdge(progress);
  return smoothstep(e - DS_WIDTH, e + DS_WIDTH, n);
}
float glowEnvelope(float progress) {
  if (progress <= 0.0 || progress >= 1.0) return 0.0;
  return smoothstep(0.0, DS_ENV, progress) * (1.0 - smoothstep(1.0 - DS_ENV, 1.0, progress));
}
float glowMinWidth(float pixelWorld) {
  return pixelWorld * DS_NOISE_GRAD;
}
float glowAmount(float progress, float n, float px) {
  float env = glowEnvelope(progress);
  if (env <= 0.0) return 0.0;
  float d = abs(n - dissolveEdge(progress));
  float wc = min(DS_CORE_MAX, max(DS_CORE_W, px * DS_CORE_PX));
  return (1.0 - smoothstep(0.0, wc, d)) * env;
}
float haloAmount(float progress, float n, float px) {
  float env = glowEnvelope(progress);
  if (env <= 0.0) return 0.0;
  float d = n - dissolveEdge(progress);
  float wh = min(DS_HALO_MAX, max(DS_HALO_W, px * DS_HALO_PX)) * (d < 0.0 ? DS_TRAIL : 1.0);
  float h = 1.0 - smoothstep(0.0, wh, abs(d));
  return h * h * env;
}
`;
