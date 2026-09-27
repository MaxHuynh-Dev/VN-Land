import type { Snapshot } from '@/data/history/types';
import type { Anchor } from './centroid';
import { px, pz } from './projection';

export interface Pose {
  position: [number, number, number];
  target: [number, number, number];
}

const POLAR = 0.75; // rad tính từ phương thẳng đứng

export function focusPose(lon: number, lat: number, distance: number): Pose {
  const tx = px(lon);
  const tz = pz(lat);
  return {
    target: [tx, 0, tz],
    position: [tx, Math.cos(POLAR) * distance, tz + Math.sin(POLAR) * distance]
  };
}

export function distanceForArea(areaKm2: number): number {
  return Math.max(50, Math.min(180, Math.sqrt(areaKm2) / 4));
}

export interface CameraFlight {
  pose: Pose;
  /** Định danh nơi bay tới — dùng để so sánh, tránh bay lại khi vị trí không đổi. */
  key: string;
}

export interface CameraTargetInput {
  /** Chính thể đang được chọn (null nếu không có). */
  selected: string | null;
  /** Neo của các chính thể trong mốc hiện tại — chỉ cần khi `selected` khác null. */
  anchors: Map<string, Anchor> | undefined;
  /** Mốc đang hiển thị — chỉ cần khi không có `selected`, để đọc `focus`. */
  snapshot: Pick<Snapshot, 'focus'> | undefined;
  /** Đang tự chạy (autoplay) hay không. */
  playing: boolean;
}

/**
 * Quyết định camera nên bay tới đâu, không tác dụng phụ. Ưu tiên: chính thể đang chọn thắng
 * focus của mốc. Trả về `null` khi không có gì để bay tới (ví dụ: không chọn và không tự chạy).
 */
export function cameraTarget({
  selected,
  anchors,
  snapshot,
  playing
}: CameraTargetInput): CameraFlight | null {
  if (selected) {
    const a = anchors?.get(selected);
    if (!a) return null;
    return { pose: focusPose(a.lon, a.lat, distanceForArea(a.area)), key: `anchor:${a.cellIndex}` };
  }
  if (playing && snapshot?.focus) {
    const { lon, lat, distance } = snapshot.focus;
    return { pose: focusPose(lon, lat, distance ?? 110), key: 'focus' };
  }
  return null;
}
