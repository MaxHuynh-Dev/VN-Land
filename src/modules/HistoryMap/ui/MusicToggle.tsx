'use client';

import { Volume2, VolumeX } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { COPY } from '../copy';
import { MusicPlayer } from '../music/player';
import { readMusicPref, shouldArmAutoStart, writeMusicPref } from '../music/pref';
import { TRACKS } from '../music/tracks';

const storage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

export default function MusicToggle(): React.ReactElement {
  const player = useRef<MusicPlayer | null>(null);
  const [on, setOn] = useState(false);
  const onRef = useRef(false);
  onRef.current = on;

  useEffect(() => {
    const p = new MusicPlayer(TRACKS);
    player.current = p;

    // Trình duyệt chặn tự phát âm thanh: chờ lần chạm/phím đầu tiên trên trang rồi mới bật,
    // trừ khi người xem đã từng tắt. Bỏ qua thao tác trên chính nút loa (nút tự xử lý).
    let armed = shouldArmAutoStart(readMusicPref(storage()));
    const onFirstGesture = (e: Event): void => {
      if (!armed) return;
      if (e.target instanceof Element && e.target.closest('[data-music-toggle]')) return;
      armed = false;
      void p.play().then((ok) => setOn(ok));
    };
    window.addEventListener('pointerdown', onFirstGesture, true);
    window.addEventListener('keydown', onFirstGesture, true);

    // Ẩn tab thì tạm dừng, quay lại thì phát tiếp nếu đang bật.
    const onVisibility = (): void => {
      if (!onRef.current) return;
      if (document.hidden) p.pause();
      else void p.play();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pointerdown', onFirstGesture, true);
      window.removeEventListener('keydown', onFirstGesture, true);
      document.removeEventListener('visibilitychange', onVisibility);
      p.dispose();
      player.current = null;
    };
  }, []);

  const toggle = (): void => {
    const p = player.current;
    if (!p) return;
    if (on) {
      p.pause();
      setOn(false);
      writeMusicPref(storage(), 'off');
    } else {
      void p.play().then((ok) => setOn(ok));
      writeMusicPref(storage(), 'on');
    }
  };

  return (
    <button
      type="button"
      data-music-toggle
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? COPY.musicOff : COPY.musicOn}
      title={on ? COPY.musicOff : COPY.musicOn}
      className="absolute top-6 right-[4.5rem] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#0a1420]/70 opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1] md:top-auto md:right-auto md:bottom-[12.25rem] md:left-10 md:h-9 md:w-9"
    >
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
