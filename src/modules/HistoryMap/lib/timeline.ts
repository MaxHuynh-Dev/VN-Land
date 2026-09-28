import type { Era, EraId, Snapshot } from '@/data/history/types';

export function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

export function snapshotIndexFromParam(param: string | null, snapshots: Snapshot[]): number {
  if (!param) return 0;
  const exact = snapshots.findIndex((s) => s.id === param);
  if (exact >= 0) return exact;
  if (!/^-?\d+(\.\d+)?$/.test(param)) return 0;
  const year = Number(param);
  let found = 0;
  snapshots.forEach((s, i) => {
    if (s.year <= year) found = i;
  });
  return found;
}

export function eraStartIndices(snapshots: Snapshot[]): Set<number> {
  const out = new Set<number>();
  snapshots.forEach((s, i) => {
    if (i === 0 || snapshots[i - 1].era !== s.era) out.add(i);
  });
  return out;
}

export function labelFits(segmentPx: number, labelPx: number, paddingPx = 8): boolean {
  return labelPx + paddingPx <= segmentPx;
}

export function eraSegments(
  snapshots: Snapshot[],
  eras: Era[]
): { era: Era; start: number; count: number }[] {
  const out: { era: Era; start: number; count: number }[] = [];
  snapshots.forEach((s, i) => {
    const last = out[out.length - 1];
    if (last && last.era.id === s.era) last.count++;
    else {
      const era = eras.find((e) => e.id === s.era);
      if (era) out.push({ era, start: i, count: 1 });
    }
  });
  return out;
}

/**
 * Nhãn khoảng năm của một thời kỳ cho màn mở đầu (Task E2): `yearLabel` mốc đầu của thời kỳ →
 * `yearLabel` mốc đầu của thời kỳ kế tiếp; thời kỳ cuối (không có thời kỳ kế tiếp trong
 * `snapshots`) dùng `ongoingLabel` (chuỗi "nay" từ `copy.ts`, hàm này không import copy.ts để
 * giữ thuần). Trả `''` nếu không có mốc nào thuộc thời kỳ.
 */
export function eraRangeLabel(snapshots: Snapshot[], eraId: EraId, ongoingLabel: string): string {
  const start = snapshots.findIndex((s) => s.era === eraId);
  if (start < 0) return '';
  let end = start;
  while (end + 1 < snapshots.length && snapshots[end + 1].era === eraId) end++;
  const next = end + 1;
  const endLabel = next < snapshots.length ? snapshots[next].yearLabel : ongoingLabel;
  return `${snapshots[start].yearLabel} – ${endLabel}`;
}

/**
 * true nếu nên hiện màn mở đầu thời kỳ (Task E2): đã có thời kỳ trước để so sánh (`prevEra`
 * khác `null` — component `EraTitleCard` luôn chốt `prevEra` bằng thời kỳ lúc mount ngay khi
 * khởi tạo, nên "lần tải trang đầu tiên" không bao giờ thật sự truyền `null`; tham số này vẫn
 * nhận `null` để hàm đúng nghĩa với mọi lời gọi, kể cả khi chưa có mốc nào được xác lập) và
 * thời kỳ mới khác thời kỳ trước — đổi mốc trong cùng thời kỳ không hiện màn. Việc chống nhấp
 * nháy (chỉ hiện khi dừng ≥ 300 ms ở thời kỳ mới) là phần hẹn giờ ở component, không thuộc hàm
 * thuần này. (Bỏ tham số `isInitial` cũ — sau khi `EraTitleCard` chuyển sang chốt `prevEra`
 * đồng bộ lúc mount thay vì qua bộ đếm giờ, tham số đó không còn được component truyền `true`
 * bao giờ nữa nên bị loại bỏ khỏi API thay vì giữ lại như code chết.)
 */
export function shouldShowEraCard(prevEra: EraId | null, nextEra: EraId): boolean {
  return prevEra !== null && prevEra !== nextEra;
}

/**
 * Định dạng năm khi số đang chạy (Task E2, `ui/Timeline.tsx`): năm âm → "N TCN" với dấu chấm
 * ngăn nghìn (`20.000 TCN`); năm dương hoặc 0 → số nguyên trơn, không ngăn nghìn (khớp định
 * dạng `yearLabel` có sẵn trong dữ liệu, ví dụ "1771"). Làm tròn số nguyên trước khi định dạng.
 */
export function formatRunningYear(y: number): string {
  const rounded = Math.round(y);
  if (rounded < 0) {
    const grouped = Math.abs(rounded)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${grouped} TCN`;
  }
  return `${rounded}`;
}
