import type { Snapshot } from '@/data/history/types';
import type { Anchor } from './centroid';
import { px, pz } from './projection';

export interface Pose {
  position: [number, number, number];
  target: [number, number, number];
}

export const HOME_POS: [number, number, number] = [10, 130, 120];
export const HOME_TARGET: [number, number, number] = [0, 0, 0];

/** Khoảng cách camera → gốc tọa độ ở tư thế toàn cảnh gốc (tỉ lệ khung hình tham chiếu). */
const HOME_DISTANCE = Math.hypot(...HOME_POS);

/** Tỉ lệ khung hình mà HOME_POS/HOME_TARGET được tinh chỉnh cho (ngang, ~16:10). */
const REF_ASPECT = 1.6;

/** Trần phóng khoảng cách camera home — màn dọc hẹp nhất cũng không lùi quá xa. */
const MAX_HOME_SCALE = 2.4;

/**
 * Hệ số phóng khoảng cách camera "toàn cảnh" theo tỉ lệ khung hình hiện tại. `aspect` càng nhỏ
 * (màn dọc, điện thoại) thì hệ số càng lớn — camera lùi xa hơn để lãnh thổ phía tây (Lào, Campuchia)
 * và phía bắc (Quảng Tây) không bị cắt ra ngoài khung hình. Kẹp trong [1, MAX_HOME_SCALE].
 */
export function homeScale(aspect: number): number {
  return Math.min(MAX_HOME_SCALE, Math.max(1, REF_ASPECT / aspect));
}

/** Khoảng cách camera → gốc tọa độ ở tư thế toàn cảnh, theo tỉ lệ khung hình hiện tại. */
export function homeDistance(aspect: number): number {
  return HOME_DISTANCE * homeScale(aspect);
}

/**
 * Tư thế camera "toàn cảnh" (home), tương thích ngược với HOME_POS/HOME_TARGET (aspect =
 * REF_ASPECT trả về đúng HOME_POS) nhưng lùi xa hơn theo tỉ lệ khung hình hẹp — cùng hướng nhìn
 * (vì target luôn là gốc tọa độ, nhân vị trí với một hệ số vô hướng không đổi hướng).
 */
export function homePose(aspect: number): Pose {
  const scale = homeScale(aspect);
  return {
    position: [HOME_POS[0] * scale, HOME_POS[1] * scale, HOME_POS[2] * scale],
    target: HOME_TARGET
  };
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
