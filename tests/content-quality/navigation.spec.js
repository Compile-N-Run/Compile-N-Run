import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:8018';
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.route('**/api/auth/session', route => route.fulfill({ json: { configured: false, providers: { google: false, email: false }, user: null } }));
});

const categories = ['Fundamentals', 'Languages', 'Web', 'Data & AI', 'DevOps & Systems', 'Mobile & IoT'];
for (const width of [997, 1024, 1100, 1200, 1280, 1440]) {
  test(`six category menus fit ${width}px without losing course links`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/api/auth/session', route => route.fulfill({ json: { configured: true, providers: { google: true, email: true }, user: null } }));
    await page.goto('/learn/');
    const nav = page.locator('[data-navbar]');
    await expect(nav.locator('[data-navbar-toggle]')).not.toBeVisible();
    const categoryToggles = nav.locator('.cnr-nav-categories [data-browse-toggle]');
    expect((await categoryToggles.allTextContents()).map(label => label.trim())).toEqual(categories);
    // The brand stays intact and the categories start right after it, on the left.
    await expect(nav.locator('.navbar__inner .navbar__title')).toBeVisible();
    const brand = await nav.locator('.navbar__inner .navbar__brand').boundingBox(), first = await categoryToggles.first().boundingBox();
    expect(first.x - (brand.x + brand.width)).toBeLessThan(32);
    expect(Math.abs(first.y - brand.y) < brand.height).toBe(true);
    for (const control of await nav.locator('.navbar__inner a:visible, [data-browse-toggle]').all()) {
      const rect = await control.boundingBox();
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    }
    let courseLinks = 0;
    for (const menu of await nav.locator('.cnr-nav-categories [data-tutorial-browse]').all()) {
      const toggle = menu.locator('[data-browse-toggle]');
      await toggle.click();
      const panel = menu.locator('[data-browse-panel]');
      await expect(panel).toBeVisible();
      await expect(nav.locator('[data-tutorial-browse][open]')).toHaveCount(1);
      courseLinks += await panel.locator('.cnr-nav-browse__group a').count();
      const box = await panel.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await page.keyboard.press('Escape');
      await expect(panel).not.toBeVisible();
      await expect(toggle).toBeFocused();
    }
    expect(courseLinks).toBe(80);
    await categoryToggles.nth(3).click();
    await expect(nav.locator('[data-tutorial-browse][open]')).toContainText('Databases');
    await categoryToggles.nth(4).click();
    await expect(nav.locator('[data-tutorial-browse][open]')).toHaveCount(1);
    for (const group of ['DevOps', 'Observability', 'Middleware', 'Linux']) {
      await expect(nav.locator('[data-tutorial-browse][open] h3').filter({ hasText: group })).toBeVisible();
    }
    await page.mouse.click(2, 240);
    await expect(nav.locator('[data-tutorial-browse][open]')).toHaveCount(0);
    // Roadmap, Playground and My learning are folded into one Learn menu; Forum stays one click away.
    await nav.locator('#cnr-learn-toggle').click();
    const learn = nav.locator('#cnr-learn-panel');
    for (const href of ['/roadmap/', '/playground/', '/learn/']) await expect(learn.locator(`a[href="${href}"]`)).toBeVisible();
    const learnBox = await learn.boundingBox();
    expect(learnBox.x + learnBox.width).toBeLessThanOrEqual(width);
    const forumVisible = await nav.locator('.cnr-nav__forum').isVisible();
    if (!forumVisible) await expect(learn.locator('a[href="https://forum.compilenrun.com/"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(learn).not.toBeVisible();
    await expect(nav.locator('.navbar__inner > .navbar__items--right > .cnr-nav__link[href="/roadmap/"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
  const categoryButtons = nav.locator('[data-nav-primary] [data-collapse]');
  expect(await categoryButtons.allTextContents()).toEqual(categories);
  await categoryButtons.nth(4).click();
  await expect(nav.locator('[data-nav-primary] a[href="/docs/devops/docker/"]')).toBeVisible();
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

test('profile uses the header popup for sign-in and reset links stay out of request URLs', async ({ page }) => {
  const apiCalls = [];
  await page.route('**/api/auth/**', route => {
    const request = route.request(); apiCalls.push({ url: request.url(), method: request.method() });
    return route.fulfill({ json: request.url().endsWith('/session') ? { configured: true, providers: { google: true, email: true }, user: null } : { ok: true } });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile/#reset=' + 'A'.repeat(43));
  await expect(page.locator('[data-profile-reset]')).toBeVisible();
  await expect(page.locator('[data-profile-guest] [data-auth-open]')).toBeVisible();
  await expect(page.locator('[data-profile-form="login"], [data-profile-form="register"]')).toHaveCount(0);
  await expect(page.locator('form[data-auth-form="login"]')).toHaveCount(1);
  expect(new URL(page.url()).hash).toBe('');
  expect(apiCalls.every(call => call.method === 'GET' && !call.url.includes('reset='))).toBe(true);
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
  const sources = await page.locator('script[src]').evaluateAll(nodes => nodes.map(node => node.src));
  expect(sources.some(src => /clarity|umami|googletagmanager|googlesyndication/.test(src))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('header sign-in popup becomes an avatar menu with profile access', async ({ page }) => {
  let session = { configured: true, providers: { google: true, email: true }, user: null };
  let remote = { revision: 0, data: null, updatedAt: null };
  await page.route('**/api/auth/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/login') session = { ...session, csrfToken: 't'.repeat(43), user: { id: '00000000-0000-4000-8000-000000000001', name: 'Example Learner', email: 'learner@example.invalid', emailVerified: true, hasPassword: true, googleLinked: false } };
    if (path === '/api/auth/logout') session = { ...session, user: null };
    return route.fulfill({ json: path === '/api/auth/session' ? session : { ok: true } });
  });
  await page.route('**/api/learning', route => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      remote = { revision: remote.revision + 1, data: body.data, updatedAt: new Date().toISOString() };
    }
    return route.fulfill({ json: remote });
  });
  await page.goto('/learn/');
  await expect(page.locator('[data-accounts]')).toHaveCount(0);
  await page.locator('[data-auth-open]').first().click();
  const dialog = page.locator('[data-auth-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-auth-form="login"] input[name="email"]').fill('learner@example.invalid');
  await dialog.locator('[data-auth-form="login"] input[name="password"]').fill('A long test password 2026');
  await dialog.locator('[data-auth-form="login"] button[type="submit"]').click();
  await expect(dialog).not.toBeVisible();
  const avatar = page.locator('[data-auth-avatar]');
  await expect(avatar).toBeVisible();
  await avatar.click();
  await expect(page.locator('[data-auth-menu] a[href="/profile/"]')).toBeVisible();
  await expect(page.locator('[data-auth-name]')).toHaveText('Example Learner');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-auth-menu]')).not.toBeVisible();
  await expect(avatar).toBeFocused();
});
