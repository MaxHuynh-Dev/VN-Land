import { expect, test } from '@playwright/test';

test('trang chủ là bản đồ lịch sử', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('history-map-root')).toBeVisible();
});

test('bản đồ tải xong và có canvas WebGL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', {
    timeout: 30_000
  });
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
