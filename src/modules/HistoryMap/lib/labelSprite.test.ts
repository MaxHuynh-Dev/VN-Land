import { describe, expect, it } from 'vitest';
import { labelSpriteScale } from './labelSprite';

// fov 40° (xem CameraRig/Scene) → nửa góc 20°, proj5 = 1/tan(nửa góc) — đúng
// công thức camera.projectionMatrix.elements[5] cho PerspectiveCamera đối xứng.
const PROJ5_FOV40 = 1 / Math.tan((20 * Math.PI) / 180);

describe('labelSpriteScale', () => {
  it('pin đúng công thức pixel-height: fov 40°, viewport cao 900px, target 22px → scaleY ≈ 0.0178', () => {
    const [, y] = labelSpriteScale(1, 22, PROJ5_FOV40, 900);
    expect(y).toBeCloseTo(0.0178, 3);
  });

  it('chiều rộng giữ theo tỉ lệ khung hình của texture', () => {
    const [x, y] = labelSpriteScale(2, 22, PROJ5_FOV40, 900);
    expect(x).toBeCloseTo(y * 2);
  });

  it('aspect = 1 → sprite vuông', () => {
    const [x, y] = labelSpriteScale(1, 22, PROJ5_FOV40, 900);
    expect(x).toBe(y);
  });

  it('viewport cao gấp đôi → scale nhỏ đi một nửa (giữ nguyên chiều cao px trên màn hình)', () => {
    const [, y900] = labelSpriteScale(1, 22, PROJ5_FOV40, 900);
    const [, y1800] = labelSpriteScale(1, 22, PROJ5_FOV40, 1800);
    expect(y1800).toBeCloseTo(y900 / 2);
  });

  it('targetPx lớn hơn → scale lớn hơn theo đúng tỉ lệ tuyến tính', () => {
    const [, y22] = labelSpriteScale(1, 22, PROJ5_FOV40, 900);
    const [, y44] = labelSpriteScale(1, 44, PROJ5_FOV40, 900);
    expect(y44).toBeCloseTo(y22 * 2);
  });
});
