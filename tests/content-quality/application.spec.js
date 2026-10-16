import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:8018';
const cssLesson = '/docs/language/css/';

test.beforeEach(async ({ context, page }) => {
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.__applicationErrors = errors;
});
test.afterEach(async ({ page }) => { expect(page.__applicationErrors).toEqual([]); });

async function openLearning(page) {
  const disclosure = page.locator('[data-learning-disclosure]');
  if ((await disclosure.getAttribute('open')) === null) await disclosure.locator(':scope > summary').click();
  await expect(page.locator('[data-learning-tools]')).toBeVisible();
}
async function searchSettled(root) {
  await expect(root.locator('[data-find-status]')).not.toHaveText('Searching…');
  await expect(root.locator('[data-find-results] li').first()).toBeVisible();
}

test('course search, content filters, result context, and keyboard dialog', async ({ page }) => {
  await page.goto(cssLesson);
  const trigger = page.getByRole('button', { name: 'Search this course', exact: true });
  await trigger.click();
  const modal = page.locator('[data-search-modal]');
  await expect(modal).toBeVisible();
  await expect(modal.locator('[data-find-course]')).toHaveValue('language/css');
  await modal.locator('[data-find-query]').fill('grid');
  await modal.locator('[data-find-form]').getByRole('button', { name: 'Search', exact: true }).click();
  await searchSettled(modal);
  const paths = await modal.locator('[data-find-results] h3 a').evaluateAll(links => links.map(link => link.pathname));
  expect(paths.length).toBeGreaterThan(0);
  expect(paths.every(path => path.startsWith('/docs/language/css/') || path === '/docs/category/css-tutorial/')).toBe(true);
  await expect(modal.locator('.cnr-find__context').first()).toContainText('CSS');
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await page.goto('/search/?course=framework/tailwind&type=Project');
  const root = page.locator('[data-find-page]');
  await searchSettled(root);
  await expect(root.locator('[data-find-results] h3 a').first()).toContainText('Capstone');
  expect(await root.locator('.cnr-find__context').allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining('Project')]));
  await root.locator('[data-find-query]').fill('unfindable-unique-zzq94165');
  await root.locator('[data-find-form]').getByRole('button', { name: 'Search', exact: true }).click();
  await expect(root.locator('[data-find-status]')).toContainText('No results');
  await root.locator('[data-find-query]').fill('grid');
  await root.locator('[data-find-clear]').click();
  await searchSettled(root);
  await expect(root.locator('[data-find-course]')).toHaveValue('');
  await expect(root.locator('[data-find-type]')).toHaveValue('');
});

test('reading is explicit; bookmark, note, dashboard, and roadmap agree', async ({ page }) => {
  await page.goto(cssLesson);
  await expect(page.locator('[data-mark-done]').first()).toHaveAttribute('aria-pressed', 'false');
  // Scrolling is not an assessment or an automatic read mark.
  await page.locator('footer.theme-doc-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-mark-done]').first()).toHaveAttribute('aria-pressed', 'false');
  await openLearning(page);
  const tools = page.locator('[data-learning-tools]');
  await tools.locator('[data-mark-done]').click();
  await tools.locator('[data-learning-bookmark]').click();
  await tools.getByText('Your lesson notes', { exact: true }).click();
  await tools.locator('[data-learning-note]').fill('Grid: remember the intrinsic minimum size. <script>not executable</script>');
  await tools.locator('[data-learning-save-note]').click();
  await expect(tools.locator('[data-learning-note-status]')).toContainText('saved', { ignoreCase: true });
  await tools.locator('[data-learning-practiced]').click();
  await expect(tools.locator('[data-learning-states]')).toContainText('Practiced');
  await expect(tools.locator('[data-learning-states] .cnr-learning__badge').filter({ hasText: 'Check passed' })).not.toHaveClass(/is-recorded/);
  await page.goto('/learn/');
  await expect(page.locator('[data-learning-bookmarks]')).toContainText('Introduction to CSS');
  await expect(page.locator('[data-learning-notes]')).toContainText('intrinsic minimum size');
  await expect(page.locator('[data-learning-notes] script')).toHaveCount(0);
  await expect(page.locator('[data-learning-courses]')).toContainText('CSS');
  await expect(page.locator('[data-learning-catalog-status]')).not.toContainText('could not');
  await page.goto('/roadmap/#frontend');
  await expect(page.locator('#frontend [data-id="css"] .cnr-rm__meta')).toHaveText('1 / 30 pages read');
});

test('learning backup downloads, previews and merges in a clean browser', async ({ page, browser }) => {
  await page.goto(cssLesson);
  await openLearning(page);
  await page.locator('[data-learning-bookmark]').click();
  await page.locator('[data-learning-tools] [data-mark-done]').click();
  await page.goto('/learn/');
  const downloaded = page.waitForEvent('download');
  await page.locator('[data-learning-export]').click();
  const file = await downloaded;
  const buffer = await readFile(await file.path());
  const backup = JSON.parse(buffer.toString('utf8'));
  expect(backup).toBeTruthy();
  const other = await browser.newContext();
  await other.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const restored = await other.newPage();
  await restored.goto(origin + '/learn/');
  await restored.locator('[data-learning-import-file]').setInputFiles({ name: 'learning-backup.json', mimeType: 'application/json', buffer });
  await expect(restored.locator('[data-learning-import-preview]')).toBeVisible();
  expect(await restored.evaluate(() => localStorage.getItem('cnr_progress'))).toBeNull();
  await restored.locator('[data-learning-import-apply]').click();
  await expect(restored.locator('[data-learning-backup-status]')).toContainText('Backup merged');
  await expect(restored.locator('[data-learning-bookmarks]')).toContainText('Introduction to CSS');
  await restored.goto(origin + cssLesson);
  await expect(restored.locator('[data-mark-done]').first()).toHaveAttribute('aria-pressed', 'true');
  await other.close();
});

test('standalone playground renders all files, checks an exercise and records evidence', async ({ page }) => {
  await page.goto('/playground/');
  const workspace = page.locator('[data-playground-root]');
  await expect(workspace).toBeVisible();
  await expect(workspace.frameLocator('iframe').getByRole('heading', { name: 'Hello, web!' })).toBeVisible();
  await workspace.getByRole('tab', { name: 'index.html', exact: true }).click();
  await workspace.getByLabel('HTML source', { exact: true }).fill('<h1 id="result">Live heading</h1><button id="change">Change it</button>');
  await expect(workspace.frameLocator('iframe').locator('#result')).toHaveText('Live heading');
  await workspace.getByRole('tab', { name: 'styles.css', exact: true }).click();
  await workspace.getByLabel('CSS source', { exact: true }).fill('h1 { color: rgb(180, 20, 30); }');
  await expect(workspace.frameLocator('iframe').locator('#result')).toHaveCSS('color', 'rgb(180, 20, 30)');
  await workspace.getByRole('tab', { name: 'script.js', exact: true }).click();
  await workspace.getByLabel('JavaScript source', { exact: true }).fill("document.querySelector('#change').addEventListener('click', () => document.querySelector('#result').textContent = 'JavaScript works');");
  await workspace.getByRole('button', { name: 'Run', exact: true }).click();
  await workspace.frameLocator('iframe').locator('#change').click();
  await expect(workspace.frameLocator('iframe').locator('#result')).toHaveText('JavaScript works');
  await workspace.getByLabel('Auto-run JavaScript', { exact: true }).check();
  await workspace.getByLabel('JavaScript source', { exact: true }).fill("document.querySelector('#result').textContent = 'Live JavaScript';");
  await expect(workspace.frameLocator('iframe').locator('#result')).toHaveText('Live JavaScript');
  const downloading = page.waitForEvent('download');
  await workspace.getByRole('button', { name: 'Download ZIP', exact: true }).click();
  const zip = await readFile(await (await downloading).path());
  expect(zip.subarray(0, 2).toString()).toBe('PK');

  await workspace.getByLabel('Practice exercise', { exact: true }).selectOption({ label: 'JavaScript: Count button clicks' });
  await workspace.getByRole('button', { name: 'Check my work', exact: true }).click();
  await expect(workspace.locator('.cnr-pg__status')).toContainText('Some practice checks need attention');
  page.once('dialog', dialog => dialog.accept());
  await workspace.getByRole('button', { name: 'Load solution', exact: true }).click();
  await workspace.getByRole('button', { name: 'Check my work', exact: true }).click();
  await expect(workspace.locator('.cnr-pg__status')).toContainText('Practice checks passed');
  await page.goto('/learn/');
  await expect(page.locator('[data-learning-practice] .cnr-learning__badge.is-recorded').filter({ hasText: 'Check passed' }).first()).toBeVisible();
  await expect(page.locator('[data-learning-drafts]')).not.toBeEmpty();
});

test('lesson workspace combines nearby HTML and CSS, preserves a draft, and closes cleanly', async ({ page }) => {
  await page.goto(cssLesson);
  const triggers = page.getByRole('button', { name: 'Try in playground', exact: true });
  expect(await triggers.count()).toBeGreaterThan(1);
  await triggers.first().click();
  const panel = page.getByRole('complementary', { name: 'Lesson practice panel', exact: true });
  await expect(panel).toBeVisible();
  await expect(page.locator('.theme-doc-markdown')).toHaveClass(/cnr-pg-reading/);
  const reader = await page.locator('.theme-doc-markdown').boundingBox();
  const side = await panel.boundingBox();
  expect(reader.width).toBeGreaterThan(400);
  expect(reader.x + reader.width).toBeLessThanOrEqual(side.x + 2);
  await panel.getByRole('tab', { name: 'styles.css', exact: true }).click();
  await expect(panel.getByLabel('CSS source', { exact: true })).not.toHaveValue('');
  await panel.getByRole('tab', { name: 'index.html', exact: true }).click();
  await panel.getByLabel('HTML source', { exact: true }).fill('<main><h1>My saved lesson draft</h1></main>');
  await panel.getByRole('button', { name: 'Close practice', exact: true }).click();
  await expect(panel).not.toBeVisible();
  await expect(triggers.first()).toBeFocused();
  await triggers.nth(1).click();
  await expect(panel.getByLabel('HTML source', { exact: true })).toHaveValue('<main><h1>My saved lesson draft</h1></main>');
  await expect(panel.getByRole('button', { name: 'Keep saved draft', exact: true })).toBeVisible();
});

test('mobile layouts, theme, review metadata and the course catalog stay usable', async ({ page, request }) => {
  const response = await request.get('/learning-catalog.json');
  expect(response.ok()).toBe(true);
  const catalog = await response.json();
  expect(catalog.v).toBe(1);
  expect(catalog.courses.find(c => c.id === 'language/css').lessons).toHaveLength(30);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/learn/', '/playground/', '/search/', cssLesson]) {
    await page.goto(path);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true);
  }
  await expect(page.locator('[data-content-review]')).toContainText('Reviewed');
  await page.getByRole('button', { name: 'Try in playground', exact: true }).first().click();
  const panel = page.locator('.cnr-pg-lesson-panel');
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('search can retry after its lazy module fails to load', async ({ page, context }) => {
  let attempts = 0;
  await context.route('**/pagefind/pagefind.js*', route => ++attempts === 1 ? route.abort() : route.continue());
  await page.goto('/search/?q=flexbox&course=language/css');
  const root = page.locator('[data-find-page]');
  await expect(root.locator('[data-find-status]')).toContainText('Search could not load');
  await root.locator('[data-find-form]').getByRole('button', { name: 'Search', exact: true }).click();
  await searchSettled(root);
  expect(attempts).toBeGreaterThan(1);
});
