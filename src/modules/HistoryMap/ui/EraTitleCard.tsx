'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ERAS, SNAPSHOTS } from '@/data/history';
import type { EraId } from '@/data/history/types';
import { COPY } from '../copy';
import {
  BAND_ALPHA,
  BAND_COLOR,
  HEADLINE_LIGHTEN_AMOUNT,
  lightenTowardWhite,
  RANGE_TEXT_COLOR
} from '../lib/contrast';
import { eraRangeLabel, shouldShowEraCard } from '../lib/timeline';
import { reducedMotion, snapshotIndex } from '../state/store';
import styles from './EraTitleCard.module.css';

/** Chống nhấp nháy: chỉ hiện màn nếu người xem dừng ở thời kỳ mới ít nhất chừng này. */
const SETTLE_MS = 300;
/** Mờ vào 0,4 s – giữ 1,2 s – tan 0,6 s (khớp `EraTitleCard.module.css`). */
const FADE_IN_S = 0.4;
const HOLD_S = 1.2;
const FADE_OUT_S = 0.6;
const TOTAL_MS = (FADE_IN_S + HOLD_S + FADE_OUT_S) * 1000;

interface CardData {
  eraId: EraId;
  label: string;
  range: string;
  color: string;
  token: number;
}

/** `BAND_COLOR`/`BAND_ALPHA` (`lib/contrast.ts`) làm chuỗi `rgba()` cho CSS — tính một lần ở
 * module scope (hằng số, không đổi theo render). Độ mờ đỉnh thật của dải bằng đúng `BAND_ALPHA`
 * vì CSS chỉ hoạt hình độ mờ của PHẦN TỬ (0 → 1 → 1 → 0), không đổi giá trị alpha đã có sẵn
 * trong màu nền — `lib/contrast.test.ts` kiểm tương phản dựa trên đúng giả định này. */
function hexToRgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
const BAND_RGBA = hexToRgba(BAND_COLOR, BAND_ALPHA);

/**
 * Màn mở đầu thời kỳ (Task E2): hiện tên thời kỳ + khoảng năm kiểu trailer phim khi mốc hiện
 * tại đổi sang một thời kỳ khác thời kỳ trước đó — không hiện ở lần tải trang đầu, không hiện
 * khi đổi mốc trong cùng thời kỳ, và chống nhấp nháy bằng cách chỉ hiện sau khi người xem đã
 * dừng ở thời kỳ mới ≥ `SETTLE_MS`. `prefers-reduced-motion`: không hiện màn, chỉ thông báo qua
 * `aria-live`.
 */
export default function EraTitleCard(): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const era = SNAPSHOTS[i].era;
  // Giống quy ước ở Labels.tsx: đọc một lần, không theo dõi thay đổi media query giữa phiên.
  const still = useMemo(() => reducedMotion(), []);

  // Chốt ngay thời kỳ lúc mount làm mốc so sánh (KHÔNG đợi qua bộ đếm giờ chống nhấp nháy bên
  // dưới) — nếu chờ 300 ms rồi mới chốt, một thao tác đổi mốc xảy ra trong khoảng 300 ms đó sẽ
  // hủy hẹn giờ ban đầu và "cướp" luôn vai trò xác lập mốc ban đầu, khiến lần đổi thời kỳ thật
  // sự đầu tiên của người dùng bị bỏ lỡ (không hiện màn dù đáng lẽ phải hiện). Chốt đồng bộ tại
  // đây loại bỏ hẳn cuộc đua đó: `useRef` chỉ dùng giá trị khởi tạo ở lần render đầu tiên.
  const lastConfirmedEra = useRef<EraId>(era);
  const tokenRef = useRef(0);
  const settleTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const [card, setCard] = useState<CardData | null>(null);
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    if (settleTimer.current !== undefined) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const show = shouldShowEraCard(lastConfirmedEra.current, era);
      lastConfirmedEra.current = era;
      if (!show) return;
      const eraDef = ERAS.find((e) => e.id === era);
      if (!eraDef) return;
      const range = eraRangeLabel(SNAPSHOTS, era, COPY.eraRangeOngoing);
      setAnnounce(`${COPY.eraCardAnnouncementPrefix} ${eraDef.label}, ${range}`);
      if (still) return;
      const token = ++tokenRef.current;
      if (hideTimer.current !== undefined) window.clearTimeout(hideTimer.current);
      setCard({ eraId: era, label: eraDef.label, range, color: eraDef.color, token });
      hideTimer.current = window.setTimeout(() => {
        setCard((c) => (c?.token === token ? null : c));
      }, TOTAL_MS);
    }, SETTLE_MS);
    return () => {
      if (settleTimer.current !== undefined) window.clearTimeout(settleTimer.current);
    };
  }, [era, still]);

  useEffect(
    () => () => {
      if (hideTimer.current !== undefined) window.clearTimeout(hideTimer.current);
    },
    []
  );

  const eraColor = useMemo(
    () => (card ? lightenTowardWhite(card.color, HEADLINE_LIGHTEN_AMOUNT) : undefined),
    [card]
  );

  return (
    <>
      {/* Luôn gắn trong DOM (không chỉ khi reducedMotion) để trình đọc màn hình luôn có vùng
          aria-live đã đăng ký sẵn — tạo mới phần tử ngay lúc cần thông báo có thể bị bỏ lỡ. */}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      {card && (
        <div
          key={card.token}
          data-testid="era-title-card"
          aria-hidden="true"
          className={styles.overlay}
        >
          <div className={styles.vignette} />
          {/* Dải tối letterbox mềm mép sau chữ (fix round 1) — vignette ở mép màn hình
              KHÔNG đủ vì tâm màn hình (nơi chữ nằm) trong suốt hoàn toàn ở đó; dải này phủ
              đúng vùng chữ, độ mờ đỉnh khớp `BAND_ALPHA` mà `lib/contrast.test.ts` đã kiểm
              tương phản ≥ 4,5:1 so với nền bản đồ xấu nhất (ô không chủ + lãnh thổ sáng nhất). */}
          <div className={styles.band} style={{ '--band-color': BAND_RGBA } as React.CSSProperties} />
          <div
            className={styles.content}
            style={{ '--era-color': eraColor, '--range-color': RANGE_TEXT_COLOR } as React.CSSProperties}
          >
            <p className={styles.eraName}>{card.label}</p>
            <p className={styles.eraRange}>{card.range}</p>
          </div>
        </div>
      )}
    </>
  );
}
