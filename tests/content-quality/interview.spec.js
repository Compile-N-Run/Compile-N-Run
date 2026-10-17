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

test('problem page is a workspace: tabbed write-up on the left, a highlighted editor with the solution and test cases on the right', async ({ page, context }) => {
  await context.route('https://esm.sh/**', route => route.continue()); // CodeMirror comes from the CDN
  await page.goto('/interview/problems/two-sum/');
  const workspace = page.locator('[data-iv-workspace]');
  await expect(workspace).toBeVisible();
  await expect(page.locator('[data-iv-body] h2#solutions')).toHaveCount(0); // the code lives in the editor now
  await expect(page.locator('[data-iv-pane-tab]')).toHaveText(['Problem', 'Solution', 'Companies', 'Notes']);
  await expect(page.locator('[data-iv-body] h2#key-idea')).toBeHidden();
  await page.locator('[data-iv-pane-tab="solution"]').click();
  await expect(page.locator('[data-iv-body] h2#problem')).toBeHidden();
  await expect(page.locator('[data-iv-body] h2#key-idea')).toBeHidden(); // a hint ladder: nothing is revealed yet
  await page.locator('.cnr-iv-hints__reveal:visible').click();
  await expect(page.locator('[data-iv-body] h2#key-idea')).toBeVisible();
  await expect(page.locator('[data-iv-body] h2#approach')).toBeHidden();
  await page.locator('.cnr-iv-hints__reveal:visible').click();
  await expect(page.locator('[data-iv-body] h2#approach')).toBeVisible();
  await expect(page.locator('[data-iv-body] h2#complexity')).toBeHidden();
  await page.locator('.cnr-iv-hints__reveal:visible').click();
  await expect(page.locator('[data-iv-body] h2#complexity')).toBeVisible();
  await expect(page.locator('.cnr-iv-hints__reveal')).toHaveCount(0);
  await page.locator('[data-iv-pane-tab="companies"]').click();
  await expect(page.locator('[data-iv-chips] a').first()).toBeVisible();
  await expect(page.locator('[data-iv-chips] a').first()).toHaveAttribute('href', /^\/interview\/company\//);
  await page.locator('[data-iv-pane-tab="problem"]').click();
  await expect(page.locator('.cnr-iv-meta__topics a').first()).toHaveAttribute('href', /^\/interview\/topics\//);
  const text = await page.locator('.cnr-iv-split__text').boundingBox();
  const aside = await workspace.boundingBox();
  expect(aside.x).toBeGreaterThan(text.x + text.width - 1); // two panes at desktop width
  expect(aside.height).toBeGreaterThan(500);
  const tabs = workspace.locator('[role=tab].cnr-iv-ws__lang');
  await expect(tabs).toHaveText(['Python', 'JavaScript', 'Java', 'C++', 'Go']);
  await expect(page.locator('.cnr-iv-ws--cm .cnr-iv-ws__editor .cm-editor')).toBeVisible({ timeout: 30000 }); // CodeMirror loaded
  const doc = () => page.evaluate(() => document.querySelector('.cnr-iv-ws__editor .cm-content').textContent);
  expect(await doc()).not.toMatch(/:\n\n\s+seen/); // no doubled line breaks
  expect(await doc()).toMatch(/class Solution:\s+def twoSum\(self, nums: List\[int\], target: int\) -> List\[int\]:/); // the solution is loaded by default
  expect(await page.evaluate(() => document.querySelectorAll('.cnr-iv-ws__editor .cm-content span[class]').length)).toBeGreaterThan(5); // highlighted
  await expect(workspace.locator('.cnr-iv-ws__cases-code .cm-content')).toContainText('check('); // test cases shown
  await tabs.nth(1).click();
  expect(await doc()).toMatch(/var twoSum = function \(nums, target\) \{/);
  await workspace.locator('.cnr-iv-ws__run').click(); // Run executes the test cases on the reference solution
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText(/All tests passed \(\d+ of \d+ checks\)/);
  expect(await workspace.locator('.cnr-iv-ws__case--pass').count()).toBeGreaterThan(5);
  await expect(workspace.locator('.cnr-iv-ws__case--fail')).toHaveCount(0);
  await expect(workspace.locator('.cnr-iv-ws__stats')).toContainText(/Time: [\d.]+ (ms|s)/); // timing feedback
  await expect(workspace.locator('.cnr-iv-ws__case-ms').first()).toContainText(/ms|s/);
  // Test cases are editable: add a case of our own and it is reported with the rest.
  await workspace.locator('.cnr-iv-ws__panel-tab').first().click();
  await page.locator('.cnr-iv-ws__cases-code .cm-content').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.insertText('\ncheck(twoSum([1, 2], 3), [9, 9], "my own case");\n');
  await workspace.locator('.cnr-iv-ws__run').click();
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText('Some tests failed');
  await expect(workspace.locator('.cnr-iv-ws__case--fail .cnr-iv-ws__case-label')).toHaveText('my own case');
  await workspace.locator('.cnr-iv-ws__panel-tab').first().click();
  await workspace.locator('.cnr-iv-ws__cases-note .cnr-iv-ws__link').click(); // Reset cases
  await expect(page.locator('.cnr-iv-ws__cases-code .cm-content')).not.toContainText('my own case');
  await workspace.locator('.cnr-iv-ws__run').click();
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText('All tests passed');
  await page.waitForFunction(() => window.CNRLearning && window.CNRLearning.canWrite());
  await workspace.locator('.cnr-iv-ws__verdict button:has-text("Mark as solved")').click();
  await expect(page.locator('[data-iv-solve-toggle]')).toHaveAttribute('aria-pressed', 'true');
  // Notes on the problem go to the learning store and show on the dashboard.
  await page.locator('[data-iv-pane-tab="notes"]').click();
  await page.locator('.cnr-iv-notes__field').fill('Check before storing, or the same index is used twice.');
  await page.locator('.cnr-iv-notes button:has-text("Save note")').click();
  await expect(page.locator('.cnr-iv-notes__status')).toHaveText('Saved.');
  await page.locator('[data-iv-pane-tab="problem"]').click();
  await workspace.locator('summary:has-text("Reset")').click();
  await workspace.locator('.cnr-iv-ws__menu-item:has-text("Starter code")').click();
  expect(await doc()).toMatch(/^var twoSum = function \(nums, target\) \{\s*\/\/ your code here/);
  await workspace.locator('.cnr-iv-ws__run').click();
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText(/stopped with an error|Some tests failed/); // the stub returns nothing
  await expect(workspace.locator('.cnr-iv-ws__io-title').last()).toHaveText('Errors');
  await expect(workspace.locator('.cnr-iv-ws__err')).toContainText('TypeError');
  await page.locator('.cnr-iv-ws__editor .cm-content').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('var twoSum = function (nums, target) { return [0, 1]; };');
  await workspace.locator('.cnr-iv-ws__run').click();
  await expect(workspace.locator('.cnr-iv-ws__verdict')).toContainText(/Some tests failed: \d+ of \d+ checks passed/);
  const failed = workspace.locator('.cnr-iv-ws__case--fail').first();
  await expect(failed.locator('dt')).toHaveText(['Expected', 'Actual']); // each failing check shows both values
  await expect(failed.locator('dd').first()).toHaveText('[1,3]');
  await expect(failed.locator('dd').last()).toHaveText('[0,1]');
  await expect(workspace.locator('.cnr-iv-ws__case--pass').first()).toBeVisible(); // [2,7,11,15] 9 -> [0,1] passes
  await page.reload();
  await expect(workspace.locator('[role=tab][aria-selected=true].cnr-iv-ws__lang')).toHaveText('JavaScript'); // remembered
  await expect(page.locator('.cnr-iv-ws--cm .cnr-iv-ws__editor .cm-editor')).toBeVisible({ timeout: 30000 });
  expect(await doc()).toMatch(/return \[0, 1\]/); // the draft survives a reload
  await expect.poll(() => page.evaluate(() => window.CNRLearning.readDiskSnapshot().learning.lessons['/interview/problems/two-sum/']?.note?.text || '')).toContain('Check before storing');
  await page.goto('/learn/');
  await expect(page.locator('[data-learning-notes]')).toContainText('Check before storing');
  await expect(page.locator('[data-learning-notes]')).toContainText('1. Two Sum');
  await page.goto('/interview/problems/two-sum/');
  await expect(page.locator('.cnr-iv-ws--cm .cnr-iv-ws__editor .cm-editor')).toBeVisible({ timeout: 30000 });
  await page.setViewportSize({ width: 820, height: 900 });
  const narrowText = await page.locator('.cnr-iv-split__text').boundingBox();
  const narrowAside = await workspace.boundingBox();
  expect(narrowAside.y).toBeGreaterThan(narrowText.y + narrowText.height - 1); // stacked on narrow screens
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('study plans track solved problems day by day, on the plan, the directory and the dashboard', async ({ page }) => {
  await page.goto('/interview/plans/');
  expect(await page.locator('[data-iv-plan-card]').count()).toBeGreaterThan(10);
  await page.locator('[data-iv-plan-card="top-75"]').click();
  await expect(page).toHaveURL(/\/interview\/plans\/top-75\/$/);
  await expect(page.locator('[data-iv-plan-day]')).toHaveCount(15);
  await expect(page.locator('[data-iv-plan-problem]')).toHaveCount(75);
  await page.waitForFunction(() => window.CNRLearning && window.CNRLearning.canWrite());
  await expect(page.locator('[data-iv-plan-today]')).toContainText('Day 1');
  const day1 = page.locator('[data-iv-plan-day="1"]');
  await expect(day1).toHaveClass(/cnr-iv-plan__day--today/);
  for (const toggle of await day1.locator('.cnr-iv-solve-toggle').all()) await toggle.click();
  await expect(page.locator('[data-iv-plan-solved]')).toHaveText('5');
  await expect(day1).toHaveClass(/cnr-iv-plan__day--done/);
  await expect(page.locator('[data-iv-plan-today]')).toContainText('Day 2');
  await expect(page.locator('[data-iv-plan-day="2"]')).toHaveClass(/cnr-iv-plan__day--today/);
  await expect.poll(() => page.evaluate(() => Object.keys(window.CNRLearning.readDiskSnapshot().learning.lessons).length)).toBeGreaterThanOrEqual(5);
  await page.goto('/interview/plans/');
  await expect(page.locator('[data-iv-plan-card="top-75"] [data-iv-plan-card-progress]')).toHaveText('Your progress: 5 of 75 solved');
  await expect(page.locator('[data-iv-plan-card="top-150"] [data-iv-plan-card-progress]')).toContainText('5 of 150'); // the same problems count in every plan that has them
  await page.goto('/learn/');
  await expect(page.locator('[data-learning-plans]')).toContainText('Top 75 most asked');
  await expect(page.locator('[data-learning-plans]')).toContainText('5 of 75 solved · Day 2 next:');
  const planRow = page.locator('[data-learning-plans] li', { hasText: 'Top 75 most asked' });
  await expect(planRow.locator('a').first()).toHaveAttribute('href', '/interview/plans/top-75/');
  await expect(planRow.locator('a').last()).toHaveAttribute('href', '/interview/plans/top-75/#day-2');
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
