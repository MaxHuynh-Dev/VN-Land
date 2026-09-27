/**
 * Bảo đảm thẻ <svg> gốc có width/height tuyệt đối (không phải %). Ảnh SVG thiếu kích thước
 * có naturalWidth/Height không xác định trong trình duyệt ⇒ atlas cờ tính sai tỉ lệ khi phủ
 * cờ lên lãnh thổ. Nếu thiếu, suy ra từ viewBox với chiều rộng chuẩn 600.
 */
export function ensureSvgSize(svg: string): string {
  const open = svg.match(/<svg\b[^>]*>/);
  if (!open) throw new Error('Không phải SVG');
  const tag = open[0];
  const abs = (name: string) =>
    new RegExp(`\\s${name}="\\s*[\\d.]+(e[+-]?\\d+)?(px)?\\s*"`).test(tag);
  if (abs('width') && abs('height')) return svg;
  const vb = tag.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (!vb) throw new Error('SVG thiếu cả viewBox lẫn width/height');
  const w = 600;
  const h = Math.round((w * Number(vb[2])) / Number(vb[1]));
  const cleaned = tag.replace(/\s(width|height)="[^"]*"/g, '');
  return svg.replace(tag, cleaned.replace(/^<svg\b/, `<svg width="${w}" height="${h}"`));
}
