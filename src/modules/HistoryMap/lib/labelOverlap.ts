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
 * Trả về tập id các nhãn nên ẨN vì chồng lấn màn hình với một nhãn đang hiện có `priority`
 * (diện tích lãnh thổ) cao hơn. Tham lam theo priority giảm dần (hòa → id nhỏ hơn theo thứ tự
 * chữ cái đi trước): giữ một nhãn nếu nó không chồng nhãn nào ĐÃ GIỮ. Nhãn đã bị ẩn không che
 * nhãn khác — chuỗi a-b-c (a∩b, b∩c, a không chồng c) chỉ ẩn b. Kết quả không phụ thuộc thứ tự
 * đầu vào. O(n²) — số nhãn hiển thị cùng lúc rất nhỏ (≤ ~15), chạy mỗi khung hình được.
 */
export function resolveLabelOverlaps(rects: LabelRect[]): Set<string> {
  const order = [...rects].sort((a, b) =>
    b.priority !== a.priority ? b.priority - a.priority : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  );
  const kept: LabelRect[] = [];
  const hidden = new Set<string>();
  for (const r of order) {
    if (kept.some((k) => intersects(k, r))) hidden.add(r.id);
    else kept.push(r);
  }
  return hidden;
}
