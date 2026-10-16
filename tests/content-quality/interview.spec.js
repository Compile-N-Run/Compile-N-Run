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

test('company cards show a logo or initial and keep one size at every width', async ({ page }) => {
  for (const width of [1280, 820, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/interview/');
    const result = await page.evaluate(async () => {
      const cards = [...document.querySelectorAll('[data-iv-companies] li a')];
      const images = [...document.querySelectorAll('[data-iv-companies] img')];
      images.forEach(img => { img.loading = 'eager'; });
      await Promise.all(images.map(img => img.complete ? null : new Promise(done => { img.onload = img.onerror = done; })));
      return {
        heights: [...new Set(cards.map(a => Math.round(a.getBoundingClientRect().height)))],
        withoutBadge: cards.filter(a => !a.querySelector('.cnr-iv-logo')).length,
        broken: images.filter(img => !img.naturalWidth).map(img => img.src),
        initials: document.querySelectorAll('[data-iv-companies] .cnr-iv-logo--initial').length,
      };
    });
    expect(result.heights, `card heights at ${width}px`).toHaveLength(1);
    expect(result.withoutBadge).toBe(0);
    expect(result.broken).toEqual([]);
    expect(result.initials).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
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
  await expect(rows.first().locator('.cnr-iv-title a').first()).toHaveText('1. Two Sum');
  await expect(rows.first().locator('a.cnr-iv-solution')).toHaveAttribute('href', '/interview/problems/two-sum/');
  await expect(rows.first().locator('a.cnr-iv-lc')).toHaveAttribute('href', 'https://leetcode.com/problems/two-sum/');
  await page.locator('[data-iv-status]').selectOption('explained');
  for (const link of await rows.locator('.cnr-iv-title a:first-child').all()) await expect(link).toHaveAttribute('href', /^\/interview\/problems\//);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('global ranking lists every problem, most asked first, with a recent view', async ({ page }) => {
  await page.goto('/interview/most-asked/');
  await expect(page.locator('[data-iv-rows] tr').first().locator('.cnr-iv-title a').first()).toHaveText('1. Two Sum');
  const total = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(total).toBeGreaterThan(3000);
  await page.locator('[data-iv-window="m6"]').click();
  const recent = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(recent).toBeGreaterThan(100);
  expect(recent).toBeLessThan(total);
});

test('problem page puts the write-up beside an editor that runs the tests in the browser', async ({ page }) => {
  await page.goto('/interview/problems/two-sum/');
  const workspace = page.locator('[data-iv-workspace]');
  await expect(workspace).toBeVisible();
  await expect(page.locator('[data-iv-body] h2#solutions')).toHaveCount(0); // moved into the editor's Solution view
  const tabs = workspace.locator('[role=tab]');
  await expect(tabs).toHaveText(['Python', 'JavaScript', 'Java', 'C++', 'Go']);
  const article = await page.locator('.cnr-iv-split__text').boundingBox();
  const aside = await workspace.boundingBox();
  expect(aside.x).toBeGreaterThan(article.x + article.width - 1); // two columns at desktop width
  const editor = workspace.locator('textarea');
  await expect(editor).toHaveValue(/class Solution:\n    def twoSum\(self, nums: List\[int\], target: int\) -> List\[int\]:/);
  await tabs.nth(1).click();
  await expect(editor).toHaveValue(/^var twoSum = function \(nums, target\) \{/);
  await editor.fill('var twoSum = function (nums, target) {\n  return [0, 0];\n};');
  await workspace.locator('.cnr-iv-ws__run--tests').click();
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText('Some tests failed');
  await expect(workspace.locator('.cnr-iv-ws__err')).toContainText('expected');
  await workspace.locator('[aria-pressed]:has-text("Solution")').click();
  await expect(workspace.locator('.cnr-iv-ws__solution-body .theme-code-block.language-javascript')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await workspace.locator('button:has-text("Load into editor")').click();
  await expect(editor).toHaveValue(/const seen = new Map\(\)|new Map\(\)/);
  await workspace.locator('.cnr-iv-ws__run--tests').click();
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText('All tests passed');
  await page.waitForFunction(() => window.CNRLearning && window.CNRLearning.canWrite());
  await workspace.locator('.cnr-iv-ws__verdict button:has-text("Mark as solved")').click();
  await expect(page.locator('[data-iv-solve-toggle]')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(workspace.locator('[role=tab][aria-selected=true]')).toHaveText('JavaScript'); // remembered
  await expect(editor).toHaveValue(/new Map\(\)/); // the draft survives a reload
  await expect(page.locator('[data-iv-chips] a').first()).toHaveAttribute('href', /^\/interview\/company\//);
  await expect(page.locator('.cnr-iv-meta__topics a').first()).toHaveAttribute('href', /^\/interview\/topics\//);
  await page.setViewportSize({ width: 820, height: 900 });
  const narrowArticle = await page.locator('.cnr-iv-split__text').boundingBox();
  const narrowAside = await workspace.boundingBox();
  expect(narrowAside.y).toBeGreaterThan(narrowArticle.y + narrowArticle.height - 1); // stacked on narrow screens
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('topics directory groups the guides, searches, and a topic page teaches then lists its problems', async ({ page }) => {
  await page.goto('/interview/topics/');
  expect(await page.locator('[data-iv-topic-group]').count()).toBeGreaterThan(3);
  expect(await page.locator('.cnr-iv-topic-card').count()).toBeGreaterThan(30);
  await page.locator('[data-iv-topic-search]').fill('sliding');
  await expect(page.locator('[data-iv-topics] li:visible')).toHaveCount(1);
  await page.locator('[data-iv-topic-search]').press('Enter');
  await expect(page).toHaveURL(/\/interview\/topics\/sliding-window\/$/);
  await expect(page.locator('h1')).toHaveText('Sliding Window');
  await expect(page.locator('[data-iv-body] h2').first()).toHaveText('What it is');
  const tabs = page.locator('.cnr-iv-solutions [role=tab]');
  await expect(tabs).toHaveText(['Python', 'Java', 'C++', 'JavaScript', 'Go']);
  await expect(page.locator('.cnr-iv-solutions [role=tabpanel]:visible')).toHaveCount(1);
  const total = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(total).toBeGreaterThan(100);
  await expect(page.locator('[data-iv-rows] tr').first().locator('.cnr-iv-title a').first()).toHaveText(/^\d+\. /);
  await expect(page.locator('.cnr-iv-table thead')).toContainText('Score');
  await page.goto('/interview/topics/segment-tree/');
  await expect(page.locator('h1')).toHaveText('Segment Tree');
  await page.goto('/interview/topics/eulerian-circuit/'); // a topic without a guide still lists its problems
  await expect(page.locator('[data-iv-rows] tr').first()).toBeVisible();
  await expect(page.locator('main')).toContainText('no guide for this topic yet');
});

test('catalog lists every LeetCode problem by number, finds one by number, and solved marks reach the dashboard', async ({ page }) => {
  await page.goto('/interview/problems/');
  const rows = page.locator('[data-iv-rows] tr');
  const total = Number((await page.locator('[data-iv-count]').innerText()).split(' ')[0]);
  expect(total).toBeGreaterThan(4000);
  await expect(rows.first().locator('.cnr-iv-num')).toHaveText('1');
  await expect(rows.first().locator('.cnr-iv-title a').first()).toHaveText('1. Two Sum');
  await page.locator('[data-iv-search]').fill('146');
  await expect(rows.first().locator('.cnr-iv-title a').first()).toHaveText('146. LRU Cache');
  await page.locator('[data-iv-search]').fill('');
  await expect(rows.first().locator('.cnr-iv-title a').first()).toHaveText('1. Two Sum'); // the search is debounced
  await page.waitForFunction(() => window.CNRLearning && window.CNRLearning.canWrite());
  await expect(rows.first().locator('.cnr-iv-solve-toggle')).toBeEnabled();
  await rows.first().locator('.cnr-iv-solve-toggle').click();
  await expect(rows.first().locator('.cnr-iv-solve-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-iv-count]')).toContainText('1 solved');
  await page.locator('[data-iv-status]').selectOption('solved');
  await expect(rows).toHaveCount(1);
  // The mark is committed asynchronously; wait until it has reached storage before leaving the page.
  await expect.poll(() => page.evaluate(() => !!window.CNRLearning.readDiskSnapshot().learning.lessons['/interview/problems/two-sum/']?.practice?.solved)).toBe(true);
  await page.goto('/interview/problems/two-sum/');
  await expect(page.locator('[data-iv-solve-toggle]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/learn/');
  await expect(page.locator('[data-learning-solved]')).toContainText('1. Two Sum');
  await expect(page.locator('[data-learning-solved-summary]')).toContainText('Easy 1');
  await page.locator('[data-learning-solved] button').click();
  await expect(page.locator('[data-learning-solved]')).not.toContainText('Two Sum');
  await expect.poll(() => page.evaluate(() => !window.CNRLearning.readDiskSnapshot().learning.lessons['/interview/problems/two-sum/']?.practice?.solved)).toBe(true);
  await page.goto('/interview/problems/two-sum/');
  await expect(page.locator('[data-iv-solve-toggle]')).toHaveAttribute('aria-pressed', 'false');
});
