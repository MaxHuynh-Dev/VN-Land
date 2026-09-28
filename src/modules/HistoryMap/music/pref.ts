export type MusicPref = 'on' | 'off';

export const MUSIC_PREF_KEY = 'vn-land:music';

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;

/** Lựa chọn nhạc đã lưu; `null` khi chưa chọn hoặc storage không dùng được (chế độ riêng tư…). */
export function readMusicPref(storage: Storage | undefined): MusicPref | null {
  try {
    const v = storage?.getItem(MUSIC_PREF_KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}

export function writeMusicPref(storage: Storage | undefined, pref: MusicPref): void {
  try {
    storage?.setItem(MUSIC_PREF_KEY, pref);
  } catch {
    // storage bị chặn: chỉ mất phần ghi nhớ, nhạc vẫn chạy bình thường
  }
}

/** Nhạc tự bật ở lần tương tác đầu tiên, trừ khi người xem đã từng tắt. */
export function shouldArmAutoStart(pref: MusicPref | null): boolean {
  return pref !== 'off';
}

export function nextTrackIndex(i: number, count: number): number {
  return count === 0 ? 0 : (i + 1) % count;
}
