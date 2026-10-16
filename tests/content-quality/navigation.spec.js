import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:8018';
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
});

for (const width of [1024, 1280, 1440]) {
  test(`navigation fits ${width}px and offers every topic in one menu`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/learn/');
    const nav = page.locator('[data-navbar]');
    await expect(nav.locator('[data-navbar-toggle]')).not.toBeVisible();
    await expect(nav.locator('[data-browse-toggle]')).toBeVisible();
    const links = nav.locator('.navbar__inner a:visible');
    for (const link of await links.all()) {
      const rect = await link.boundingBox();
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    }
    await nav.locator('[data-browse-toggle]').click();
    const panel = nav.locator('[data-browse-panel]');
    await expect(panel).toBeVisible();
    for (const name of ['Fundamentals', 'Languages', 'Web', 'Observability', 'Data & AI', 'Mobile', 'Linux', 'Databases', 'DevOps', 'Middleware', 'IoT']) {
      await expect(panel.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(panel.locator('a[href="/docs/language/html/"]').first()).toBeVisible();
    const box = await panel.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
    await expect(nav.locator('[data-browse-toggle]')).toBeFocused();
    await nav.locator('[data-browse-toggle]').click();
    await page.mouse.click(2, 200);
    await expect(panel).not.toBeVisible();
  });
}

test('mobile navigation switches between course contents and global links and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/language/css/');
  const nav = page.locator('[data-navbar]');
  const toggle = nav.locator('[data-navbar-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.locator('[data-navbar-back]')).toBeVisible();
  await nav.locator('[data-navbar-back]').click();
  await expect(nav.locator('[data-nav-primary] a[href="/playground/"]')).toBeVisible();
  await nav.locator('[data-navbar-course]').click();
  await expect(nav.locator('[data-navbar-back]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('learning dashboard keeps personal notes away from analytics and advert scripts', async ({ page }) => {
  await page.goto('/learn/');
  const sources = await page.locator('script[src]').evaluateAll(nodes => nodes.map(node => node.src));
  expect(sources.some(src => /clarity|umami|googletagmanager|googlesyndication/.test(src))).toBe(false);
});

test('profile renders email forms and reset links stay out of request URLs', async ({ page }) => {
  const apiCalls = [];
  await page.route('**/api/auth/**', route => {
    const request = route.request(); apiCalls.push({ url: request.url(), method: request.method() });
    return route.fulfill({ json: request.url().endsWith('/session') ? { configured: true, providers: { google: true, email: true }, user: null } : { ok: true } });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile/#reset=' + 'A'.repeat(43));
  await expect(page.locator('[data-profile-reset]')).toBeVisible();
  await expect(page.locator('[data-profile-form="login"]')).toBeVisible();
  expect(new URL(page.url()).hash).toBe('');
  expect(apiCalls.every(call => call.method === 'GET' && !call.url.includes('reset='))).toBe(true);
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
  const sources = await page.locator('script[src]').evaluateAll(nodes => nodes.map(node => node.src));
  expect(sources.some(src => /clarity|umami|googletagmanager|googlesyndication/.test(src))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
