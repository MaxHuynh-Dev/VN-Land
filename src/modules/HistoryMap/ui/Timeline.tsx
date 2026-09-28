'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ERAS, SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';
import { clampIndex, eraStartIndices, formatRunningYear } from '../lib/timeline';
import { playing, reducedMotion, snapshotIndex } from '../state/store';
import EraBand from './EraBand';

const go = (i: number): void => {
  playing.value = false;
  snapshotIndex.value = clampIndex(i, SNAPSHOTS.length);
};

const ERA_STARTS = eraStartIndices(SNAPSHOTS);

/** Thời lượng số năm chạy từ giá trị cũ tới giá trị mới khi đổi mốc. */
const RUN_MS = 900;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Số năm chạy dần từ giá trị cũ tới `year` của mốc hiện tại trong ~`RUN_MS` (easeOutCubic) rồi
 * chốt đúng `yearLabel`. Lần tải đầu và `prefers-reduced-motion` hiện `yearLabel` ngay, không
 * chạy số. Đổi mốc khi số đang chạy dở: chạy tiếp từ giá trị đang hiển thị (không giật về giá
 * trị mốc cũ), bám theo `currentValueRef`.
 *
 * Fix round 1: mỗi khung hình KHÔNG gọi `setState` nữa (từng khiến cả `Timeline` render lại
 * ~54 lần/900ms mỗi lần đổi mốc) — thay vào đó ghi thẳng vào `textContent` của phần tử qua
 * `ref` do hook trả về, và chỉ `setState` (`label`) đúng MỘT lần khi kết thúc (hoặc ngay lập
 * tức nếu lần tải đầu / reduced-motion) để chốt `yearLabel` cuối cùng vào state React như bình
 * thường. Hành vi a11y không đổi: `label` (giá trị React biết) luôn là chuỗi ổn định cuối cùng.
 */
function useRunningYear(
  year: number,
  yearLabel: string,
  still: boolean
): { ref: React.RefObject<HTMLParagraphElement | null>; label: string } {
  const [label, setLabel] = useState(yearLabel);
  const elRef = useRef<HTMLParagraphElement>(null);
  const currentValueRef = useRef(year);
  const mountedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Chốt nhãn cuối: ghi CẢ vào DOM qua ref LẪN gọi setState. Chỉ gọi setState không đủ — nếu
  // giá trị mới trùng hệt state hiện tại (`label` đã sẵn là `yearLabel`, ví dụ do effect này bị
  // gọi lại — React StrictMode dev cố ý gọi effect hai lần cho mỗi lần mount để dò tác dụng phụ
  // không thuần), React bỏ qua re-render (tối ưu "same value" của `useState`) nên KHÔNG ghi đè
  // lại `textContent` đã bị vòng lặp rAF ghi đè trước đó — chữ hiển thị kẹt sai vĩnh viễn dù
  // state đã "đúng". Ghi trực tiếp DOM ở đây đảm bảo đúng bất kể React có re-render hay không.
  const commitLabel = useCallback((finalLabel: string): void => {
    if (elRef.current) elRef.current.textContent = finalLabel;
    setLabel(finalLabel);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      currentValueRef.current = year;
      commitLabel(yearLabel);
      return;
    }
    if (still) {
      currentValueRef.current = year;
      commitLabel(yearLabel);
      return;
    }
    const from = currentValueRef.current;
    const target = year;
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / RUN_MS);
      const value = from + (target - from) * easeOutCubic(t);
      currentValueRef.current = value;
      if (t >= 1) {
        currentValueRef.current = target;
        commitLabel(yearLabel);
        rafRef.current = null;
        return;
      }
      // Ghi thẳng vào DOM — không setState mỗi khung hình (tránh render lại toàn bộ Timeline
      // ~54 lần/900ms mỗi lần đổi mốc).
      if (elRef.current) elRef.current.textContent = formatRunningYear(value);
      rafRef.current = requestAnimationFrame(step);
    };
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [year, yearLabel, still, commitLabel]);

  return { ref: elRef, label };
}

export default function Timeline(): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const snap = SNAPSHOTS[i];
  const era = ERAS.find((e) => e.id === snap.era);
  const last = SNAPSHOTS.length - 1;
  const currentPct = last > 0 ? (i / last) * 100 : 0;
  const navRef = useRef<HTMLElement>(null);
  // Giống quy ước ở Labels.tsx: đọc một lần, không theo dõi thay đổi media query giữa phiên.
  const stillMotion = useMemo(() => reducedMotion(), []);
  const { ref: yearRef, label: displayYear } = useRunningYear(
    snap.year,
    snap.yearLabel,
    stillMotion
  );

  // Chiều cao thanh thời gian đổi theo nội dung/màn hình (padding responsive…) — đo thật bằng
  // ResizeObserver và phơi ra biến CSS `--timeline-h` trên :root, thay vì một số cố định đoán
  // trước. SidePanel (bottom sheet trên mobile) đọc biến này để luôn nằm sát phía trên, không
  // chồng lấn và không để hở, kể cả khi chiều cao thanh này đổi.
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const set = (): void => {
      document.documentElement.style.setProperty(
        '--timeline-h',
        `${el.getBoundingClientRect().height}px`
      );
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label={COPY.timelineLabel}
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a1420] via-[#0a1420]/85 to-transparent px-4 pt-10 pb-4 md:px-10 md:pb-6"
    >
      <div className="mb-2 flex items-end gap-4">
        {/* shrink-0: giữ nguyên bề rộng theo nội dung — không bị các anh em flex (tiêu đề
            truncate, cụm nút) ép hẹp lại tới mức số năm phải xuống dòng ở màn hẹp (375px). */}
        <div className="flex shrink-0 flex-col">
          <p
            data-testid="timeline-era"
            style={{ color: era?.color }}
            className="whitespace-nowrap font-semibold text-[10px] uppercase leading-tight tracking-wide"
          >
            {era?.label}
          </p>
          <p
            ref={yearRef}
            data-testid="timeline-current"
            aria-hidden="true"
            className="whitespace-nowrap font-extrabold text-[1.6rem] tabular-nums md:text-5xl"
          >
            {displayYear}
          </p>
          {/* Số đang chạy (trên) chỉ để xem bằng mắt — trình đọc màn hình đọc giá trị cuối ổn
              định ở đây, không đọc từng số nhảy trong lúc chạy. */}
          <span className="sr-only">{snap.yearLabel}</span>
        </div>
        <p className="mb-1 truncate text-sm opacity-80 md:text-base">{snap.title}</p>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            aria-label={COPY.prev}
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={playing.value ? COPY.pause : COPY.play}
            onClick={() => {
              playing.value = !playing.value;
            }}
            className="rounded-full p-2 hover:bg-white/10"
          >
            {playing.value ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            type="button"
            aria-label={COPY.next}
            onClick={() => go(i + 1)}
            disabled={i === last}
            className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <EraBand current={i} />
      <div className="relative mt-2 h-8">
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={i}
          aria-label={COPY.timelineLabel}
          aria-valuetext={`${snap.yearLabel} — ${snap.title}`}
          onChange={(e) => go(Number(e.target.value))}
          className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0"
        />
        <div
          data-testid="timeline-track"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded px-[7px] outline-offset-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#f4e3c1]"
        >
          <div className="relative flex items-center justify-between">
            {SNAPSHOTS.map((s, k) => (
              <span
                key={s.id}
                className={`w-px shrink-0 ${ERA_STARTS.has(k) ? 'h-3.5' : 'h-2'} ${
                  k <= i ? 'bg-[#f4e3c1]' : 'bg-white/25'
                }`}
              />
            ))}
            <span
              aria-hidden
              style={{ left: `${currentPct}%` }}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4e3c1]"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
