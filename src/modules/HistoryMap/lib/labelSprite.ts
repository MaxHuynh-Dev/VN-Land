/** Chiều cao đích của nhãn (viên thuốc nền + chữ) trên màn hình, đơn vị CSS px. */
export const LABEL_TARGET_PX = 22;

/**
 * Tính `scale` cho `<sprite>` nhãn tên chính thể khi `spriteMaterial` đặt
 * `sizeAttenuation={false}` (giữ kích thước không đổi trên màn hình bất kể
 * khoảng cách camera — xem scene/Labels.tsx và task-8-report.md, "Fix round 1",
 * finding 1). Suy ra từ mã nguồn shader sprite của three.js
 * (`node_modules/three/src/renderers/shaders/ShaderLib/sprite.glsl.js`): khi
 * tắt attenuation, phép chia phối cảnh bị triệt tiêu và
 *
 *   pixelHeight ≈ scaleY × proj5 × (viewportH / 2)
 *
 * với `proj5 = camera.projectionMatrix.elements[5]` (= 1/tan(fovY/2) cho
 * PerspectiveCamera đối xứng) và `viewportH` là chiều cao canvas hiện tại,
 * đơn vị CSS px (từ `useThree().size.height`, phản ứng khi resize). Đảo
 * ngược công thức để tính `scaleY` từ `targetPx` mong muốn — xem
 * `labelSprite.test.ts` để có ví dụ số cụ thể (fov 40°, viewport 900px,
 * target 22px ⇒ scaleY ≈ 0.0178; trước đây "Fix round 1" canh bằng mắt ra
 * 0.035, gấp đôi mục tiêu 22px — xem task-8-report.md, "Fix round 2").
 */
export function labelSpriteScale(
  aspect: number,
  targetPx: number,
  proj5: number,
  viewportH: number
): [number, number, number] {
  const screenH = targetPx / (proj5 * (viewportH / 2));
  return [screenH * aspect, screenH, 1];
}
