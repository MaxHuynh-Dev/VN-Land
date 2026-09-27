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
