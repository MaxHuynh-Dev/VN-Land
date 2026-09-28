import { describe, expect, it } from 'vitest';
import {
  MUSIC_PREF_KEY,
  nextTrackIndex,
  readMusicPref,
  shouldArmAutoStart,
  writeMusicPref
} from './pref';

const memory = (): Pick<Storage, 'getItem' | 'setItem'> & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v)
  };
};

const throwing: Pick<Storage, 'getItem' | 'setItem'> = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  }
};

describe('music pref', () => {
  it('đọc lại giá trị đã ghi', () => {
    const s = memory();
    writeMusicPref(s, 'off');
    expect(s.data.get(MUSIC_PREF_KEY)).toBe('off');
    expect(readMusicPref(s)).toBe('off');
  });

  it('giá trị lạ, thiếu storage hoặc storage bị chặn → null, không ném lỗi', () => {
    const s = memory();
    s.data.set(MUSIC_PREF_KEY, 'loud');
    expect(readMusicPref(s)).toBeNull();
    expect(readMusicPref(undefined)).toBeNull();
    expect(readMusicPref(throwing)).toBeNull();
    expect(() => writeMusicPref(throwing, 'on')).not.toThrow();
  });

  it('chỉ không tự bật khi người xem đã tắt', () => {
    expect(shouldArmAutoStart(null)).toBe(true);
    expect(shouldArmAutoStart('on')).toBe(true);
    expect(shouldArmAutoStart('off')).toBe(false);
  });

  it('bài kế tiếp quay vòng', () => {
    expect(nextTrackIndex(0, 2)).toBe(1);
    expect(nextTrackIndex(1, 2)).toBe(0);
    expect(nextTrackIndex(0, 0)).toBe(0);
  });
});
