import { describe, expect, it } from 'vitest';
import { cameraTarget, distanceForArea, focusPose } from './cameraPose';
import type { Anchor } from './centroid';
import { px, pz } from './projection';

function anchor(over: Partial<Anchor>): Anchor {
  return {
    cellIndex: 0,
    lon: 108,
    lat: 14,
    area: 40_000,
    cellCount: 10,
    bbox: { minLon: 107, maxLon: 109, minLat: 13, maxLat: 15 },
    ...over
  };
}

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

describe('cameraTarget', () => {
  it('đã chọn + có neo → bay tới neo', () => {
    const a = anchor({ cellIndex: 5, lon: 108, lat: 14, area: 40_000 });
    const anchors = new Map([['dai-viet', a]]);
    const r = cameraTarget({ selected: 'dai-viet', anchors, snapshot: undefined, playing: false });
    expect(r).not.toBeNull();
    expect(r?.pose).toEqual(focusPose(108, 14, distanceForArea(40_000)));
  });

  it('đã chọn + đổi mốc mà neo dời chỗ → bay tới vị trí mới', () => {
    const a1 = anchor({ cellIndex: 5, lon: 108, lat: 14 });
    const a2 = anchor({ cellIndex: 9, lon: 110, lat: 15 });
    const r1 = cameraTarget({
      selected: 'dai-viet',
      anchors: new Map([['dai-viet', a1]]),
      snapshot: undefined,
      playing: false
    });
    const r2 = cameraTarget({
      selected: 'dai-viet',
      anchors: new Map([['dai-viet', a2]]),
      snapshot: undefined,
      playing: false
    });
    expect(r1?.key).not.toBe(r2?.key);
    expect(r2?.pose).toEqual(focusPose(110, 15, distanceForArea(a2.area)));
  });

  it('không chọn + đang tự chạy + mốc có focus → bay tới focus', () => {
    const snapshot = { focus: { lon: 108.9, lat: 14.0 } } as Parameters<
      typeof cameraTarget
    >[0]['snapshot'];
    const r = cameraTarget({ selected: null, anchors: undefined, snapshot, playing: true });
    expect(r?.pose).toEqual(focusPose(108.9, 14.0, 110));
  });

  it('không chọn + không tự chạy → không bay (null)', () => {
    const snapshot = { focus: { lon: 108.9, lat: 14.0 } } as Parameters<
      typeof cameraTarget
    >[0]['snapshot'];
    const r = cameraTarget({ selected: null, anchors: undefined, snapshot, playing: false });
    expect(r).toBeNull();
  });

  it('đã chọn thắng focus: đang tự chạy + có focus nhưng vẫn ưu tiên chính thể đang chọn', () => {
    const a = anchor({ cellIndex: 5, lon: 108, lat: 14, area: 40_000 });
    const snapshot = { focus: { lon: 108.9, lat: 14.0 } } as Parameters<
      typeof cameraTarget
    >[0]['snapshot'];
    const r = cameraTarget({
      selected: 'dai-viet',
      anchors: new Map([['dai-viet', a]]),
      snapshot,
      playing: true
    });
    expect(r?.pose).toEqual(focusPose(108, 14, distanceForArea(40_000)));
  });
});
