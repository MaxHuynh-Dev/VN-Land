export interface LabelRect {
  id: string;
  /** Góc trái, đơn vị px màn hình (CSS px, y hướng xuống). */
  x: number;
  /** Góc trên. */
  y: number;
  w: number;
  h: number;
  /** Càng lớn càng ưu tiên giữ lại khi chồng lấn (diện tích lãnh thổ). */
  priority: number;
}

function intersects(a: LabelRect, b: LabelRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Trả về tập id các nhãn nên ẨN vì chồng lấn màn hình với một nhãn khác có
 * `priority` (diện tích lãnh thổ) cao hơn — cờ vẫn hiện bình thường, chỉ ẩn
 * chữ. Luật đơn giản, xét TỪNG CẶP độc lập (không bỏ qua cặp đã có một bên bị
 * ẩn bởi cặp khác): với chuỗi 3 nhãn chồng lấn liên tiếp (a-b, b-c, a không
 * chồng c), cả b lẫn c đều bị ẩn nếu priority giảm dần a > b > c, chỉ nhãn ưu
 * tiên cao nhất trong chuỗi còn hiện — xem `labelOverlap.test.ts`.
 * O(n²) — số cờ hiển thị cùng lúc rất nhỏ (≤ ~15), chạy mỗi khung hình được.
 */
export function resolveLabelOverlaps(rects: LabelRect[]): Set<string> {
  const hidden = new Set<string>();
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i];
      const b = rects[j];
      if (!intersects(a, b)) continue;
      if (a.priority === b.priority) {
        hidden.add(a.id < b.id ? b.id : a.id);
      } else {
        hidden.add(a.priority < b.priority ? a.id : b.id);
      }
    }
  }
  return hidden;
}
