import { expect, test } from '@playwright/test';

test('trang chủ là bản đồ lịch sử', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('history-map-root')).toBeVisible();
});
