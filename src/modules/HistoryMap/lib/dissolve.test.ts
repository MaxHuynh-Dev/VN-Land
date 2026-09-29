import { describe, expect, it } from 'vitest';
import {
  DISSOLVE_GLSL,
  DISSOLVE_WIDTH,
  dissolveEdge,
  dissolveMask,
  fbmNoise,
  GLOW_CHAR,
  GLOW_COLOR,
  GLOW_CORE_GAIN,
  GLOW_CORE_MAX,
  GLOW_CORE_PX,
  GLOW_CORE_W,
  GLOW_ENV,
  GLOW_HALO_GAIN,
  GLOW_HALO_MAX,
  GLOW_HALO_PX,
  GLOW_HALO_W,
  GLOW_TRAIL,
  glowAmount,
  glowEnvelope,
  glowMinWidth,
  haloAmount,
  NOISE_FREQ,
  NOISE_GRAD_MEAN,
  NOISE_OCTAVES
} from './dissolve';

const NS = [0, 0.05, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1];

describe('dissolveEdge', () => {
  it('ngưỡng đi từ -w (progress 0) tới 1 + w (progress 1), tuyến tính', () => {
    expect(dissolveEdge(0)).toBeCloseTo(-DISSOLVE_WIDTH);
    expect(dissolveEdge(1)).toBeCloseTo(1 + DISSOLVE_WIDTH);
    expect(dissolveEdge(0.5)).toBeCloseTo(0.5);
  });
});

describe('dissolveMask', () => {
  it('progress 0: mọi pixel (n trong [0,1]) còn màu chủ cũ (m = 1)', () => {
    for (const n of NS) expect(dissolveMask(0, n)).toBe(1);
  });
  it('progress 1: mọi pixel đã sang màu chủ mới (m = 0)', () => {
    // 1 + w − w lệch 1 ulp khỏi 1 trong số thực — chỉ cần ≈ 0.
    for (const n of NS) expect(dissolveMask(1, n)).toBeLessThan(1e-9);
  });
  it('pixel noise thấp đổi trước pixel noise cao', () => {
    expect(dissolveMask(0.5, 0.1)).toBe(0);
    expect(dissolveMask(0.5, 0.9)).toBe(1);
    expect(dissolveMask(0.5, 0.2)).toBeLessThan(dissolveMask(0.5, 0.8));
  });
  it('không tăng theo progress (không có pixel nào quay về màu chủ cũ)', () => {
    for (const n of NS) {
      let prev = 1;
      for (let p = 0; p <= 1.0001; p += 0.02) {
        const m = dissolveMask(Math.min(1, p), n);
        expect(m).toBeLessThanOrEqual(prev + 1e-9);
        expect(m).toBeGreaterThanOrEqual(0);
        expect(m).toBeLessThanOrEqual(1);
        prev = m;
      }
    }
  });
  it('dải chuyển tiếp mềm rộng 2w quanh ngưỡng', () => {
    const e = dissolveEdge(0.5);
    expect(dissolveMask(0.5, e)).toBeCloseTo(0.5);
    expect(dissolveMask(0.5, e - DISSOLVE_WIDTH)).toBe(0);
    expect(dissolveMask(0.5, e + DISSOLVE_WIDTH)).toBe(1);
  });
});

describe('glowEnvelope', () => {
  it('0 khi progress ≤ 0 hoặc ≥ 1, 1 ở giữa, liên tục khi vào/ra', () => {
    expect(glowEnvelope(0)).toBe(0);
    expect(glowEnvelope(1)).toBe(0);
    expect(glowEnvelope(0.5)).toBe(1);
    expect(glowEnvelope(0.002)).toBeLessThan(0.01);
    expect(glowEnvelope(0.998)).toBeLessThan(0.01);
  });
});

describe('glowMinWidth (độ rộng tối thiểu theo pixel màn hình)', () => {
  it('tỉ lệ với kích thước một pixel trên mặt đất nhân độ dốc noise trung bình', () => {
    expect(glowMinWidth(0)).toBe(0);
    expect(glowMinWidth(0.25)).toBeCloseTo(0.25 * NOISE_GRAD_MEAN);
  });
});

describe('glowAmount (lõi sáng mảnh)', () => {
  it('tắt hẳn khi progress = 0 hoặc 1, bất kể n và độ rộng pixel', () => {
    for (const n of NS) {
      for (const px of [0, 0.05, 0.3]) {
        expect(glowAmount(0, n, px)).toBe(0);
        expect(glowAmount(1, n, px)).toBe(0);
      }
    }
  });
  it('đỉnh 1 ngay tại ngưỡng, 0 khi xa ngưỡng', () => {
    const e = dissolveEdge(0.5);
    expect(glowAmount(0.5, e)).toBe(1);
    expect(glowAmount(0.5, e + GLOW_CORE_W * 1.01)).toBe(0);
    expect(glowAmount(0.5, e - GLOW_CORE_W * 1.01)).toBe(0);
  });
  it('xa camera (pixel lớn): lõi không mảnh hơn GLOW_CORE_PX pixel mỗi phía', () => {
    const e = dissolveEdge(0.5);
    const px = 0.05; // noise/pixel — cỡ góc nhìn toàn cảnh
    const half = px * GLOW_CORE_PX;
    expect(half).toBeGreaterThan(GLOW_CORE_W);
    expect(glowAmount(0.5, e + half * 0.9, px)).toBeGreaterThan(0);
    expect(glowAmount(0.5, e - half * 0.9, px)).toBeGreaterThan(0);
    expect(glowAmount(0.5, e + half * 1.01, px)).toBe(0);
  });
  it('độ rộng bị chặn trên (không nuốt cả ô khi nhìn rất xa)', () => {
    const e = dissolveEdge(0.5);
    expect(glowAmount(0.5, e + GLOW_CORE_MAX * 1.01, 10)).toBe(0);
  });
});

describe('haloAmount (quầng hổ phách rộng)', () => {
  it('tắt hẳn khi progress = 0 hoặc 1', () => {
    for (const n of NS) {
      expect(haloAmount(0, n, 0.05)).toBe(0);
      expect(haloAmount(1, n, 0.05)).toBe(0);
    }
  });
  it('rộng hơn lõi: ngoài lõi vẫn còn quầng', () => {
    const e = dissolveEdge(0.5);
    const d = GLOW_CORE_W * 1.5;
    expect(glowAmount(0.5, e + d)).toBe(0);
    expect(haloAmount(0.5, e + d)).toBeGreaterThan(0);
    expect(haloAmount(0.5, e)).toBe(1);
  });
  it('sáng lên trước khi ngưỡng tới và kéo dài hơn sau khi ngưỡng đi qua (vệt đuôi)', () => {
    const e = dissolveEdge(0.5);
    const d = GLOW_HALO_W * 0.8;
    expect(haloAmount(0.5, e + d)).toBeGreaterThan(0); // chưa đổi, sắp cháy
    expect(haloAmount(0.5, e - d)).toBeGreaterThan(haloAmount(0.5, e + d)); // đã đổi, còn âm ỉ
    expect(haloAmount(0.5, e - GLOW_HALO_W * GLOW_TRAIL * 0.95)).toBeGreaterThan(0);
    expect(haloAmount(0.5, e + GLOW_HALO_W * 1.01)).toBe(0);
  });
  it('xa camera: quầng không hẹp hơn GLOW_HALO_PX pixel phía trước, có chặn trên', () => {
    const e = dissolveEdge(0.5);
    const px = 0.05;
    expect(haloAmount(0.5, e + px * GLOW_HALO_PX * 0.9, px)).toBeGreaterThan(0);
    expect(haloAmount(0.5, e + GLOW_HALO_MAX * 1.01, 10)).toBe(0);
  });
  it('liên tục qua ngưỡng (không có bậc giữa phía trước và phía sau)', () => {
    const e = dissolveEdge(0.5);
    expect(Math.abs(haloAmount(0.5, e + 1e-6) - haloAmount(0.5, e - 1e-6))).toBeLessThan(1e-4);
  });
});

describe('fbmNoise (bản JS của hàm GLSL)', () => {
  const samples: number[] = [];
  for (let x = -40; x <= 40; x += 0.37)
    for (let z = -60; z <= 60; z += 0.53) samples.push(fbmNoise(x, z));

  it('luôn nằm trong [0,1]', () => {
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1);
  });
  it('phủ phần lớn dải [0,1] để mặt trận lan đều suốt 1,4 s', () => {
    const lo = samples.filter((v) => v < 0.2).length / samples.length;
    const hi = samples.filter((v) => v > 0.8).length / samples.length;
    expect(lo).toBeGreaterThan(0.02);
    expect(hi).toBeGreaterThan(0.02);
  });
  it('liên tục theo toạ độ thế giới (không lộ đường nối giữa các ô)', () => {
    for (let x = -10; x < 10; x += 0.731) {
      for (let z = -10; z < 10; z += 0.913) {
        expect(Math.abs(fbmNoise(x + 1e-4, z) - fbmNoise(x, z))).toBeLessThan(0.01);
        expect(Math.abs(fbmNoise(x, z + 1e-4) - fbmNoise(x, z))).toBeLessThan(0.01);
      }
    }
  });
});

describe('DISSOLVE_GLSL', () => {
  it('dùng cùng hằng số với bản JS', () => {
    for (const v of [
      DISSOLVE_WIDTH,
      NOISE_FREQ,
      NOISE_GRAD_MEAN,
      GLOW_CORE_W,
      GLOW_CORE_PX,
      GLOW_CORE_MAX,
      GLOW_HALO_W,
      GLOW_HALO_PX,
      GLOW_HALO_MAX,
      GLOW_TRAIL,
      GLOW_ENV,
      GLOW_CORE_GAIN,
      GLOW_HALO_GAIN,
      GLOW_CHAR
    ])
      expect(DISSOLVE_GLSL).toContain(v.toFixed(4));
    for (const fn of [
      'float dissolveMask(',
      'float glowEnvelope(',
      'float glowAmount(',
      'float haloAmount(',
      'float fbmNoise('
    ])
      expect(DISSOLVE_GLSL).toContain(fn);
    expect(NOISE_OCTAVES).toBeLessThanOrEqual(3);
    expect(GLOW_COLOR).toBe('#ffb347');
    expect(GLOW_HALO_GAIN).toBeLessThan(GLOW_CORE_GAIN);
  });
});
