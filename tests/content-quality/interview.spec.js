import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:8018';
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.route('**/api/auth/session', route => route.fulfill({ json: { configured: false, providers: { google: false, email: false }, user: null } }));
});

test('company directory search narrows the list and Enter opens the first match', async ({ page }) => {
  await page.goto('/interview/');
  const items = page.locator('[data-iv-companies] li');
  const total = await items.count();
  expect(total).toBeGreaterThan(400);
  await page.locator('[data-iv-company-search]').fill('goog');
  await expect(page.locator('[data-iv-companies] li:visible')).toHaveCount(1);
  await expect(page.locator('[data-iv-company-count]')).toHaveText(`1 of ${total} companies`);
  await page.locator('[data-iv-company-search]').press('Enter');
  await expect(page).toHaveURL(/\/interview\/company\/google\/$/);
});

test('company table switches time windows, filters, pages and links each problem', async ({ page }) => {
  await page.goto('/interview/company/google/');
  const rows = page.locator('[data-iv-rows] tr');
  await expect(rows).toHaveCount(100);
  const total = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(total).toBeGreaterThan(1000);
  await page.locator('[data-iv-more]').click();
  await expect(rows).toHaveCount(200);
  await page.locator('[data-iv-window="d30"]').click();
  await expect(page).toHaveURL(/window=d30/);
  const recent = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(recent).toBeLessThan(total);
  await page.locator('[data-iv-difficulty]').selectOption('Hard');
  for (const badge of await page.locator('[data-iv-rows] .cnr-iv-diff-col .cnr-iv-diff').allInnerTexts()) expect(badge).toBe('Hard');
  await page.locator('[data-iv-difficulty]').selectOption('');
  await page.locator('[data-iv-search]').fill('two sum');
  await expect(rows.first().locator('.cnr-iv-title a')).toHaveText('Two Sum');
  await expect(rows.first().locator('a.cnr-iv-solution')).toHaveAttribute('href', '/interview/problems/two-sum/');
  await expect(rows.first().locator('a.cnr-iv-lc')).toHaveAttribute('href', 'https://leetcode.com/problems/two-sum/');
  await page.locator('[data-iv-written]').check();
  for (const link of await rows.locator('.cnr-iv-title a').all()) await expect(link).toHaveAttribute('href', /^\/interview\/problems\//);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('global ranking lists every problem, most asked first, with a recent view', async ({ page }) => {
  await page.goto('/interview/most-asked/');
  await expect(page.locator('[data-iv-rows] tr').first().locator('.cnr-iv-title a')).toHaveText('Two Sum');
  const total = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(total).toBeGreaterThan(3000);
  await page.locator('[data-iv-window="m6"]').click();
  const recent = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(recent).toBeGreaterThan(100);
  expect(recent).toBeLessThan(total);
});

test('problem write-up shows one solution tab at a time and remembers the language', async ({ page }) => {
  await page.goto('/interview/problems/two-sum/');
  const tabs = page.locator('.cnr-iv-solutions [role=tab]');
  await expect(tabs).toHaveText(['Python', 'Java', 'C++', 'JavaScript', 'Go']);
  await expect(page.locator('.cnr-iv-solutions [role=tabpanel]:visible')).toHaveCount(1);
  await tabs.nth(3).click();
  await expect(page.locator('#iv-solution-javascript')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#iv-solution-go')).toBeVisible();
  await page.reload();
  await expect(page.locator('#iv-solution-go')).toBeVisible();
  await expect(page.locator('[data-iv-chips] a').first()).toHaveAttribute('href', /^\/interview\/company\//);
  await expect(page.locator('a.cnr-iv-button')).toHaveAttribute('href', 'https://leetcode.com/problems/two-sum/');
});
