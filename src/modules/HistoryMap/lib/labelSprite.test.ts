import { describe, expect, it } from 'vitest';
import { LABEL_SCREEN_H, labelSpriteScale } from './labelSprite';

describe('labelSpriteScale', () => {
  it('giữ chiều cao cố định LABEL_SCREEN_H, chiều rộng theo tỉ lệ khung hình', () => {
    expect(labelSpriteScale(2)).toEqual([LABEL_SCREEN_H * 2, LABEL_SCREEN_H, 1]);
    expect(labelSpriteScale(0.5)).toEqual([LABEL_SCREEN_H * 0.5, LABEL_SCREEN_H, 1]);
  });

  it('nhận chiều cao tuỳ chỉnh qua tham số screenH', () => {
    const [x, y, z] = labelSpriteScale(3, 0.1);
    expect(x).toBeCloseTo(0.3);
    expect(y).toBe(0.1);
    expect(z).toBe(1);
  });

  it('aspect = 1 → sprite vuông', () => {
    const [x, y] = labelSpriteScale(1);
    expect(x).toBe(y);
  });
});
