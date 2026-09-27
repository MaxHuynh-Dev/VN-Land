import { describe, expect, it } from 'vitest';
import { distanceForArea, focusPose } from './cameraPose';
import { px, pz } from './projection';

describe('focusPose', () => {
  it('target nằm tại điểm chiếu, camera ở phía nam và phía trên, đúng khoảng cách', () => {
    const p = focusPose(108, 14, 100);
    expect(p.target).toEqual([px(108), 0, pz(14)]);
    expect(p.position[1]).toBeGreaterThan(0);
    expect(p.position[2]).toBeGreaterThan(p.target[2]);
    const d = Math.hypot(
      p.position[0] - p.target[0],
      p.position[1] - p.target[1],
      p.position[2] - p.target[2]
    );
    expect(d).toBeCloseTo(100);
  });
});

describe('distanceForArea', () => {
  it('kẹp trong [50, 180] và tăng theo diện tích', () => {
    expect(distanceForArea(10)).toBe(50);
    expect(distanceForArea(10_000_000)).toBe(180);
    expect(distanceForArea(300_000)).toBeGreaterThan(distanceForArea(50_000));
  });
});
