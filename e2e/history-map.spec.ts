import { expect, test } from '@playwright/test';
import { ERAS, SNAPSHOTS } from '../src/data/history';

const SCREEN_DIR = '.superpowers/sdd/2026-09-27-vn-history-map';

const ready = async (page: import('@playwright/test').Page, q = ''): Promise<void> => {
  await page.goto(`/${q}`);
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', {
    timeout: 30_000
  });
};

test('trang chủ là bản đồ lịch sử', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('history-map-root')).toBeVisible();
});

test('bản đồ tải xong và có canvas WebGL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await ready(page);
  // Chỉ định vào bên trong root: môi trường dev có thêm canvas khác (react-scan toolbar,
  // Next.js Dev Tools indicator) từ uiHelper.isDevelopment(), không thuộc bản đồ.
  await expect(page.getByTestId('history-map-root').locator('canvas').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('lỗi tải dữ liệu hiện nút thử lại và thử lại được', async ({ page }) => {
  await page.route('**/data/cells.topo.json', (r) => r.fulfill({ status: 500, body: 'x' }));
  await page.goto('/');
  const retry = page.getByRole('button', { name: 'Thử lại' });
  await expect(retry).toBeVisible();
  await page.unroute('**/data/cells.topo.json');
  await retry.click();
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', {
    timeout: 30_000
  });
});

test('?y=1471 mở đúng mốc', async ({ page }) => {
  await ready(page, '?y=1471');
  const snap = SNAPSHOTS.find((s) => s.id === '1471');
  expect(snap).toBeDefined();
  await expect(page.getByTestId('timeline-current')).toHaveText(snap?.yearLabel ?? '');
});

test('?y rác → mốc đầu', async ({ page }) => {
  await ready(page, '?y=abc');
  await expect(page.getByTestId('timeline-current')).toHaveText(SNAPSHOTS[0].yearLabel);
});

test('phím → chuyển mốc và cập nhật URL', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('timeline-current')).toHaveText(SNAPSHOTS[1].yearLabel);
  await expect(page).toHaveURL(new RegExp(`[?&]y=${SNAPSHOTS[1].id}`));
});

test('focus bàn phím vào thanh trượt hiện viền focus rõ', async ({ page }) => {
  await ready(page);
  const slider = page.getByRole('slider');
  await slider.focus();
  await expect(slider).toBeFocused();
  const track = page.getByTestId('timeline-track');
  const outlineStyle = await track.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).not.toBe('none');
});

test('bấm một thời kỳ trên dải → nhảy tới mốc đầu của thời kỳ đó', async ({ page }) => {
  await page.goto('/?y=tcn700');
  await page.getByRole('button', { name: /Tới thời kỳ Lê sơ/ }).click();
  const firstLeSo = SNAPSHOTS.find((s) => s.era === 'le-so');
  await expect(page.getByTestId('timeline-current')).toHaveText(firstLeSo?.yearLabel ?? '');
  await expect(page.getByTestId('timeline-era')).toHaveText(/Lê sơ/i);
});

test('ray mốc không tràn ngang', async ({ page }) => {
  await page.goto('/');
  const overflow = await page
    .getByTestId('timeline-track')
    .evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('thẻ thông tin đổi theo mốc; mở và đóng chi tiết chính thể', async ({ page, isMobile }) => {
  // Trên mobile, thẻ thông tin nằm trong bottom sheet thu gọn (`aside` bị ẩn); hành vi mobile
  // (mở/đóng sheet, không cuộn ngang) đã có test riêng ở dưới.
  test.skip(isMobile, 'aside bị ẩn trên mobile, xem test bottom sheet riêng');
  await ready(page);
  await expect(page.getByTestId('info-title')).toHaveText(SNAPSHOTS[0].title);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('info-title')).toHaveText(SNAPSHOTS[1].title);
  await page.locator('aside li button').first().click();
  await expect(page.getByTestId('polity-detail')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('info-title')).toBeVisible();
});

test('cờ tải lỗi không làm hỏng cảnh', async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/flags/**', (r) => r.abort());
  await ready(page, '?y=1471');
  await page.keyboard.press('ArrowRight');
  // Trên mobile, thẻ thông tin nằm trong bottom sheet thu gọn: mở ra trước khi đọc info-title.
  if (isMobile) await page.getByTestId('sheet-toggle').click();
  await expect(page.getByTestId('info-title')).toHaveText(
    SNAPSHOTS[SNAPSHOTS.findIndex((s) => s.id === '1471') + 1].title
  );
  expect(errors).toEqual([]);
});

test('mobile: bottom sheet mở ra xem thông tin, không cuộn ngang', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'chỉ chạy project mobile');
  await ready(page);
  const toggle = page.getByTestId('sheet-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByTestId('info-title')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);
});

test('chụp ảnh màn hình tham chiếu', async ({ page }, info) => {
  await ready(page, '?y=1471');
  await page.waitForTimeout(2500); // chờ cờ mọc và chuyển màu xong
  await page.screenshot({ path: `test-results/screens/${info.project.name}-1471.png` });
});

test('mở trang Nguồn & ghi công', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Nguồn & ghi công' }).click();
  await expect(page.getByRole('dialog')).toContainText('geoBoundaries');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('nút Nguồn & ghi công không chồng lên tiêu đề ở màn rất hẹp (360px)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await ready(page);
  const credits = page.getByRole('button', { name: 'Nguồn & ghi công' });
  await expect(credits).toBeVisible();
  const eyebrow = page.locator('header p').first();
  const h1 = page.locator('header h1');
  const [creditsBox, eyebrowBox, h1Box] = await Promise.all([
    credits.boundingBox(),
    eyebrow.boundingBox(),
    h1.boundingBox()
  ]);
  expect(creditsBox).not.toBeNull();
  expect(eyebrowBox).not.toBeNull();
  expect(h1Box).not.toBeNull();
  const intersects = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean =>
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  if (creditsBox && eyebrowBox) expect(intersects(creditsBox, eyebrowBox)).toBe(false);
  if (creditsBox && h1Box) expect(intersects(creditsBox, h1Box)).toBe(false);
});

test('mobile: sheet mở ra không chồng lên thanh thời gian bên dưới', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'chỉ chạy project mobile');
  await ready(page, '?y=1471');
  await page.getByTestId('sheet-toggle').click();
  await expect(page.getByTestId('info-title')).toBeVisible();
  const [sheetBox, navBox] = await Promise.all([
    page.getByTestId('mobile-sheet').boundingBox(),
    page.getByRole('navigation', { name: 'Dòng thời gian' }).boundingBox()
  ]);
  expect(sheetBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  if (sheetBox && navBox) expect(sheetBox.y + sheetBox.height).toBeLessThanOrEqual(navBox.y + 1);
});

test('nhạc nền: tự bật ở thao tác đầu tiên, nút loa tắt và nhớ lựa chọn', async ({ page }) => {
  await ready(page);
  const toggle = page.getByRole('button', { name: /nhạc nền/ });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.getByTestId('timeline-current').click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true', { timeout: 10_000 });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', {
    timeout: 30_000
  });
  await page.getByTestId('timeline-current').click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

// Task E2: màn mở đầu thời kỳ + năm chạy số. Mốc kiểm thử tính từ SNAPSHOTS thật tại thời điểm
// chạy (không hardcode id/năm) vì dữ liệu còn đang được bổ sung — xem global-constraints.md.
const ERA_CHANGE_IDX = SNAPSHOTS.findIndex((s, i) => i > 0 && s.era !== SNAPSHOTS[i - 1].era);
const SAME_ERA_IDX = SNAPSHOTS.findIndex((s, i) => i > 0 && s.era === SNAPSHOTS[i - 1].era);

test('đổi mốc sang thời kỳ khác: hiện màn mở đầu thời kỳ đúng tên, rồi tự biến mất', async ({
  page
}) => {
  expect(ERA_CHANGE_IDX).toBeGreaterThan(0);
  const targetEra = ERAS.find((e) => e.id === SNAPSHOTS[ERA_CHANGE_IDX].era);
  expect(targetEra).toBeDefined();
  await ready(page, `?y=${SNAPSHOTS[ERA_CHANGE_IDX - 1].id}`);
  await page.keyboard.press('ArrowRight');
  // Bắt đầu chờ màn ngay sau khi nhấn phím (không xen một assertion nào khác trước) — máy
  // CI/di động (WebGL software rendering) đôi khi phản hồi rất chậm, nên bất kỳ assertion nào
  // chờ TRƯỚC bước này cũng ăn bớt vào đúng khung thời gian ~2,2 s mà màn còn hiển thị.
  const card = page.getByTestId('era-title-card');
  // Chống nhấp nháy: màn chỉ hiện sau khi dừng ≥ 300 ms ở thời kỳ mới — chờ đủ để xuất hiện,
  // dư nhiều so với 300 ms vì timer JS có thể bị trễ đáng kể trên máy chậm.
  await expect(card).toBeVisible({ timeout: 6000 });
  await expect(card).toContainText(targetEra?.label ?? '');
  await expect(page.getByTestId('timeline-current')).toHaveText(
    SNAPSHOTS[ERA_CHANGE_IDX].yearLabel
  );
  // Tổng thời lượng ~2,2 s kể từ lúc hiện — chờ dư để chắc chắn đã tự biến mất.
  await expect(card).toBeHidden({ timeout: 8000 });
});

test('đổi mốc trong cùng thời kỳ: không hiện màn mở đầu thời kỳ', async ({ page }) => {
  expect(SAME_ERA_IDX).toBeGreaterThan(0);
  await ready(page, `?y=${SNAPSHOTS[SAME_ERA_IDX - 1].id}`);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('timeline-current')).toHaveText(SNAPSHOTS[SAME_ERA_IDX].yearLabel);
  await page.waitForTimeout(1500); // dư nhiều so với ngưỡng chống nhấp nháy 300 ms
  await expect(page.getByTestId('era-title-card')).toHaveCount(0);
});

test('prefers-reduced-motion: đổi thời kỳ không hiện màn mở đầu thời kỳ', async ({ page }) => {
  expect(ERA_CHANGE_IDX).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, `?y=${SNAPSHOTS[ERA_CHANGE_IDX - 1].id}`);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('timeline-current')).toHaveText(
    SNAPSHOTS[ERA_CHANGE_IDX].yearLabel
  );
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('era-title-card')).toHaveCount(0);
});

test('375px: tiêu đề dòng thời gian hiện năm trên một dòng', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'chỉ cần kiểm một lần, tự đặt viewport 375px');
  await page.setViewportSize({ width: 375, height: 812 });
  // Mốc "~700 TCN" (thời kỳ Hồng Bàng) là ví dụ đã ghi nhận lỗi xuống dòng — dùng mốc đầu tiên
  // có yearLabel dạng TCN thật trong SNAPSHOTS thay vì hardcode id.
  const bcSnap = SNAPSHOTS.find((s) => s.year < 0) ?? SNAPSHOTS[0];
  await ready(page, `?y=${bcSnap.id}`);
  const box = await page.getByTestId('timeline-current').boundingBox();
  expect(box).not.toBeNull();
  // Một dòng: chiều cao hộp phải nhỏ hơn hẳn hai lần chiều cao dòng (co giãn theo clamp/responsive).
  if (box) expect(box.height).toBeLessThan(50);
});

test('375px: tiêu đề dòng thời gian giữ chỗ 2 dòng và không đè lên cụm nút', async ({
  page
}, info) => {
  test.skip(info.project.name !== 'desktop', 'chỉ cần kiểm một lần, tự đặt viewport 375px');
  await page.setViewportSize({ width: 375, height: 812 });
  // Mốc có tiêu đề ngắn nhất: nếu vẫn giữ chỗ đủ 2 dòng thì mọi mốc khác cũng vậy.
  const shortest = SNAPSHOTS.reduce((a, b) => (b.title.length < a.title.length ? b : a));
  await ready(page, `?y=${shortest.id}`);
  const title = await page.getByTestId('timeline-title').boundingBox();
  const controls = await page.getByTestId('timeline-controls').boundingBox();
  expect(title).not.toBeNull();
  expect(controls).not.toBeNull();
  if (title && controls) {
    // 2 × 20px (text-sm) — chiều cao thanh thời gian không đổi theo độ dài tiêu đề.
    expect(title.height).toBeGreaterThanOrEqual(39);
    // Hai hộp không giao nhau (tiêu đề nằm hẳn dưới hoặc hẳn cạnh cụm nút prev/play/next).
    const overlaps =
      title.x < controls.x + controls.width &&
      controls.x < title.x + title.width &&
      title.y < controls.y + controls.height &&
      controls.y < title.y + title.height;
    expect(overlaps).toBe(false);
  }
});

test('chụp ảnh: màn mở đầu thời kỳ giữa lúc chạy và số năm chạy giữa chừng — desktop', async ({
  page
}, info) => {
  test.skip(info.project.name !== 'desktop', 'chỉ cần chụp một lần ở kích thước desktop');
  expect(ERA_CHANGE_IDX).toBeGreaterThan(0);
  await ready(page, `?y=${SNAPSHOTS[ERA_CHANGE_IDX - 1].id}`);
  await page.keyboard.press('ArrowRight');
  // 300 ms chống nhấp nháy + giữa đoạn giữ (giữa 0,4–1,6 s kể từ lúc hiện) ⇒ ~1,3 s kể từ phím.
  await page.waitForTimeout(1300);
  await expect(page.getByTestId('era-title-card')).toBeVisible();
  await page.screenshot({ path: `${SCREEN_DIR}/task-E2-era-card-desktop.png` });
  await expect(page.getByTestId('era-title-card')).toBeHidden({ timeout: 5000 });

  // Số năm chạy giữa chừng: mốc kế tiếp, chụp giữa khoảng chạy ~0,9 s.
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SCREEN_DIR}/task-E2-year-counter-running.png` });
});

test('chụp ảnh: màn mở đầu thời kỳ giữa lúc chạy — 375px', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'chỉ cần chụp một lần, tự đặt viewport 375px');
  expect(ERA_CHANGE_IDX).toBeGreaterThan(0);
  await page.setViewportSize({ width: 375, height: 812 });
  await ready(page, `?y=${SNAPSHOTS[ERA_CHANGE_IDX - 1].id}`);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1300);
  await expect(page.getByTestId('era-title-card')).toBeVisible();
  await page.screenshot({ path: `${SCREEN_DIR}/task-E2-era-card-375.png` });

  // Sau khi màn mở đầu thời kỳ tự biến mất: chụp riêng tiêu đề dòng thời gian ở 375px để thấy rõ
  // năm nằm trên một dòng (không bị màn mở đầu che), khớp yêu cầu sửa lỗi xuống dòng đã ghi.
  await expect(page.getByTestId('era-title-card')).toBeHidden({ timeout: 8000 });
  await page.screenshot({ path: `${SCREEN_DIR}/task-E2-timeline-header-375.png` });
});
