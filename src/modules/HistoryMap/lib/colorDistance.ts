/**
 * Độ lệch màu cảm nhận giữa các lãnh thổ tô màu trơn: mặt đất tô bằng `polity.color`, nên
 * hai chính thể giáp nhau ở cùng một mốc phải khác màu đủ rõ để mắt tách được ranh giới.
 * `colorDistance.test.ts` quét mọi mốc thật và mọi cặp giáp nhau (kể cả ô không có chủ).
 */

/** Ngưỡng ΔE2000 tối thiểu giữa hai vùng giáp nhau (≈ khác biệt thấy rõ ngay, chừa biên cho bóng đổ và sương mù làm màu nhạt đi). */
export const MIN_ADJACENT_DELTA_E = 15;

function parseHex(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** sRGB hex → CIE L*a*b* (D65). */
export function hexToLab(hex: string): [number, number, number] {
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = parseHex(hex).map(lin);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number): number => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** ΔE2000 giữa hai màu hex. */
export function deltaE2000(hexA: string, hexB: string): number {
  return deltaE2000Lab(hexToLab(hexA), hexToLab(hexB));
}

/** CIEDE2000 (Sharma, Wu & Dalal 2005) trên hai màu L*a*b*, kL = kC = kH = 1. */
export function deltaE2000Lab(
  [L1, a1, b1]: [number, number, number],
  [L2, a2, b2]: [number, number, number]
): number {
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const hue = (b: number, a: number): number => {
    if (a === 0 && b === 0) return 0;
    const h = Math.atan2(b, a) / rad;
    return h < 0 ? h + 360 : h;
  };
  const h1p = hue(b1, a1p);
  const h2p = hue(b2, a2p);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lpm = (L1 + L2) / 2;
  const Cpm = (C1p + C2p) / 2;
  let hpm = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hpm = (h1p + h2p) / 2;
    else hpm = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T =
    1 -
    0.17 * Math.cos((hpm - 30) * rad) +
    0.24 * Math.cos(2 * hpm * rad) +
    0.32 * Math.cos((3 * hpm + 6) * rad) -
    0.2 * Math.cos((4 * hpm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hpm - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lpm - 50) ** 2) / Math.sqrt(20 + (Lpm - 50) ** 2);
  const SC = 1 + 0.045 * Cpm;
  const SH = 1 + 0.015 * Cpm * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt(
    (dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH)
  );
}

/**
 * Các cặp chủ (id chính thể hoặc `null`) có ô giáp nhau trong một mốc. Mỗi cặp trả một lần,
 * sắp theo thứ tự chuỗi để ổn định (`null` ghi là `''`).
 */
export function adjacentOwnerPairs(
  owners: (string | null)[],
  neighbors: number[][]
): [string | null, string | null][] {
  const seen = new Map<string, [string | null, string | null]>();
  owners.forEach((a, i) => {
    for (const j of neighbors[i] ?? []) {
      const b = owners[j];
      if (a === b) continue;
      const [x, y] = (a ?? '') < (b ?? '') ? [a, b] : [b, a];
      seen.set(`${x ?? ''}|${y ?? ''}`, [x, y]);
    }
  });
  return [...seen.values()];
}
