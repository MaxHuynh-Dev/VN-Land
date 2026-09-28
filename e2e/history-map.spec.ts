import { expect, test } from '@playwright/test';
import { SNAPSHOTS } from '../src/data/history';

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
  await expect(page.getByTestId('timeline-current')).toHaveText('1471');
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
