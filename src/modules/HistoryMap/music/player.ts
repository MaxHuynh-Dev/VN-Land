import { nextTrackIndex } from './pref';
import type { Track } from './tracks';

const VOLUME = 0.35;
const FADE_IN_MS = 1500;
const FADE_OUT_MS = 600;

/** Một thẻ <audio> dùng chung, phát lần lượt các bài và lặp lại, có fade khi bật/tắt. Chỉ dùng ở client. */
export class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private index = 0;
  private fadeRaf = 0;

  constructor(private readonly tracks: Track[]) {}

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const a = new Audio();
    a.preload = 'none';
    a.volume = 0;
    a.addEventListener('ended', () => {
      this.index = nextTrackIndex(this.index, this.tracks.length);
      a.src = this.tracks[this.index].src;
      void a.play().catch(() => {});
    });
    a.src = this.tracks[this.index].src;
    this.audio = a;
    return a;
  }

  private fadeTo(target: number, ms: number, done?: () => void): void {
    const a = this.audio;
    if (!a) return;
    cancelAnimationFrame(this.fadeRaf);
    const from = a.volume;
    const t0 = performance.now();
    const step = (t: number): void => {
      // Timestamp của rAF có thể sớm hơn `t0` (performance.now()) một chút → kẹp k và volume
      // vào [0, 1], nếu không trình duyệt ném IndexSizeError.
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      a.volume = Math.min(1, Math.max(0, from + (target - from) * k));
      if (k < 1) this.fadeRaf = requestAnimationFrame(step);
      else done?.();
    };
    this.fadeRaf = requestAnimationFrame(step);
  }

  /** Trả về false nếu trình duyệt từ chối phát (chưa có thao tác người dùng). */
  async play(): Promise<boolean> {
    const a = this.ensureAudio();
    try {
      await a.play();
    } catch {
      return false;
    }
    this.fadeTo(VOLUME, FADE_IN_MS);
    return true;
  }

  pause(): void {
    const a = this.audio;
    if (!a || a.paused) return;
    this.fadeTo(0, FADE_OUT_MS, () => a.pause());
  }

  dispose(): void {
    cancelAnimationFrame(this.fadeRaf);
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }
}
