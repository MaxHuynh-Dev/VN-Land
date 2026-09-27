import type { Anchor } from './centroid';
import { px, pz } from './projection';

export type Bbox = Anchor['bbox'];

/**
 * Khung phủ cờ (tọa độ world, trục x/z) cho một lãnh thổ: phủ kín khung bao `bbox` và giữ
 * tỉ lệ `aspect` = w/h của cờ (kiểu CSS `object-fit: cover`), tâm ở tâm khung bao. Phần cờ
 * thừa ra ngoài lãnh thổ bị cắt tự nhiên vì shader chỉ tô lên mặt trên của các ô.
 */
export function coverRect(
  bbox: Bbox,
  aspect: number
): { cx: number; cz: number; w: number; h: number } {
  const x0 = px(bbox.minLon);
  const x1 = px(bbox.maxLon);
  const z0 = pz(bbox.maxLat); // bắc = z nhỏ
  const z1 = pz(bbox.minLat);
  const bw = Math.max(1e-3, x1 - x0);
  const bh = Math.max(1e-3, z1 - z0);
  const h = Math.max(bh, bw / aspect);
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: h * aspect, h };
}

/**
 * Bố cục atlas cờ: `cols` cột, mỗi ô `slotW`×`slotH` px. `rect(i)` trả uv của ô thứ i đã
 * trừ lề `pad` (tránh lem màu ô bên cạnh khi lọc/mipmap), tính theo `flipY` của
 * CanvasTexture: hàng 0 nằm ở đỉnh ảnh canvas ⇒ v gần 1.
 */
export function atlasLayout(count: number, cols = 8, slotW = 256, slotH = 171, pad = 4) {
  const rows = Math.max(1, Math.ceil(count / cols));
  const width = cols * slotW;
  const height = rows * slotH;
  return {
    width,
    height,
    slotW,
    slotH,
    cols,
    rect(i: number): { u0: number; v0: number; u1: number; v1: number } {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        u0: (c * slotW + pad) / width,
        u1: ((c + 1) * slotW - pad) / width,
        v1: 1 - (r * slotH + pad) / height,
        v0: 1 - ((r + 1) * slotH - pad) / height
      };
    }
  };
}

/**
 * Dữ liệu cho DataTexture `uPolity` (RGBA float, rộng P, cao 2): hàng 0 là rect atlas
 * `(u0, v0, u1, v1)`, hàng 1 là khung phủ `(cx, cz, w, h)`. Chính thể vắng mặt ở mốc hiện tại
 * giữ nguyên giá trị trong `prev` — các ô của chủ cũ đang mờ dần vẫn lấy cờ đúng chỗ.
 */
export function polityParamsData(
  polityIds: string[],
  anchors: Map<string, Anchor>,
  aspects: number[],
  prev?: Float32Array
): Float32Array {
  const P = polityIds.length;
  const out =
    prev && prev.length === P * 2 * 4 ? Float32Array.from(prev) : new Float32Array(P * 2 * 4);
  const layout = atlasLayout(P);
  polityIds.forEach((id, i) => {
    const r = layout.rect(i);
    out.set([r.u0, r.v0, r.u1, r.v1], i * 4);
    const a = anchors.get(id);
    if (!a) return; // vắng mặt: giữ giá trị cũ
    const c = coverRect(a.bbox, aspects[i] ?? 1.5);
    out.set([c.cx, c.cz, c.w, c.h], (P + i) * 4);
  });
  return out;
}
