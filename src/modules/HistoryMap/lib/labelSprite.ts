/**
 * Chiều cao nhãn tên chính thể trên `<sprite>` khi `sizeAttenuation=false` —
 * đơn vị NDC chuẩn hoá (không phải đơn vị thế giới), độc lập khoảng cách
 * camera. Canh bằng mắt qua ảnh chụp ở viewport 1440×900, fov=40° (xem
 * CameraRig/Scene) sao cho chữ cao ~12–14px CSS. Đổi fov thì phải canh lại.
 * Xem FlagPole.tsx và task-8-report.md, "Fix round 1", finding 1.
 */
export const LABEL_SCREEN_H = 0.035;

/**
 * Tính `scale` cho `<sprite>` nhãn từ tỉ lệ khung hình (width/height) của
 * texture canvas đã vẽ — giữ nguyên tỉ lệ, chiều cao cố định `screenH`.
 */
export function labelSpriteScale(
  aspect: number,
  screenH: number = LABEL_SCREEN_H
): [number, number, number] {
  return [screenH * aspect, screenH, 1];
}
