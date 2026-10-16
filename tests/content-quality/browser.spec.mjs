import { test, expect } from '@playwright/test';

for (const example of ['html', 'css', 'tailwind', 'web-accessibility']) {
  test(`${example}: narrow layout and native controls`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/examples/${example}/index.html`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    const disclosure = page.locator('details').first();
    await disclosure.locator('summary').focus();
    await page.keyboard.press('Space');
    await expect(disclosure).toHaveAttribute('open', '');
    if (['css', 'tailwind'].includes(example)) {
      await page.getByRole('checkbox').first().check();
      await page.getByRole('button', { name: 'Reset checklist' }).click();
      await expect(page.getByRole('checkbox').first()).not.toBeChecked();
    }
    expect(errors).toEqual([]);
  });
}

test('accessibility form: recover from errors without stale state', async ({ page }) => {
  await page.goto('/examples/web-accessibility/index.html');
  await page.getByRole('button', { name: 'Check practice details' }).click();
  await expect(page.locator('#error-summary')).toBeFocused();
  await expect(page.locator('#error-list li')).toHaveCount(2);
  await page.locator('#error-list a').first().click();
  await expect(page.locator('#practice-name')).toBeFocused();
  await page.getByLabel('Practice name (required)').fill('Practice Learner');
  await page.getByLabel('Session (required)').selectOption('html');
  await page.getByRole('button', { name: 'Check practice details' }).click();
  await expect(page.locator('#error-summary')).toBeHidden();
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Practice details checked. Nothing was sent or saved.');
});

test('accessibility form: native fallback works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:8017/examples/web-accessibility/index.html');
    await page.getByLabel('Practice name (required)').fill('Practice Learner');
    await page.getByLabel('Session (required)').selectOption('html');
    await page.getByRole('button', { name: 'Check practice details' }).click();
    await expect(page).toHaveURL(/preview\.html\?practice_name=Practice\+Learner&session=html/);
    await expect(page.getByRole('heading', { name: 'Static practice preview' })).toBeVisible();
  } finally {
    await context.close();
  }
});
