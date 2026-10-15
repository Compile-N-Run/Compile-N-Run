import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { summarize, parseReport } from '../src/report.js';
import { createApp } from '../src/http.js';

const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));

test('reports count, total and average', () => {
  assert.deepEqual(parseReport('[2,4,6]'), { count: 3, total: 12, average: 4 });
  assert.deepEqual(summarize([-2, 2]), { count: 2, total: 0, average: 0 });
});

test('rejects malformed, empty, nonnumeric, excessive and overflowing input', () => {
  assert.throws(() => parseReport('{'), SyntaxError);
  for (const value of [[], {}, [2, '4'], [NaN], [Infinity], Array(10001).fill(1)]) {
    assert.throws(() => summarize(value), TypeError);
  }
  assert.throws(() => summarize([Number.MAX_VALUE, Number.MAX_VALUE]), RangeError);
});

test('CLI returns JSON and rejects bad files without successful output', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'node-report-'));
  try {
    const file = join(directory, 'values with spaces.json');
    await writeFile(file, '[2,4,6]');
    const success = spawnSync(process.execPath, [cli, file], { encoding: 'utf8' });
    assert.equal(success.status, 0);
    assert.equal(success.stderr, '');
    assert.deepEqual(JSON.parse(success.stdout), { count: 3, total: 12, average: 4 });
    await writeFile(file, '[2,"4"]');
    const invalid = spawnSync(process.execPath, [cli, file], { encoding: 'utf8' });
    assert.equal(invalid.status, 1);
    assert.equal(invalid.stdout, '');
    assert.match(invalid.stderr, /finite number/);
    await writeFile(file, ' '.repeat(1024 * 1024 + 1));
    const oversized = spawnSync(process.execPath, [cli, file], { encoding: 'utf8' });
    assert.equal(oversized.status, 1);
    assert.match(oversized.stderr, /1 MiB limit/);
    const missing = spawnSync(process.execPath, [cli, join(directory, 'missing')], { encoding: 'utf8' });
    assert.equal(missing.status, 1);
    assert.equal(missing.stdout, '');
    const usage = spawnSync(process.execPath, [cli], { encoding: 'utf8' });
    assert.equal(usage.status, 1);
    assert.match(usage.stderr, /Usage:/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('HTTP endpoint handles health, unknown paths and unsupported methods', async () => {
  const server = createApp();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const healthy = await fetch(`${base}/health`);
    assert.equal(healthy.status, 200);
    assert.deepEqual(await healthy.json(), { status: 'ok' });
    const missing = await fetch(`${base}/missing`);
    assert.equal(missing.status, 404);
    await missing.text();
    const wrongMethod = await fetch(`${base}/health`, { method: 'POST' });
    assert.equal(wrongMethod.status, 405);
    assert.equal(wrongMethod.headers.get('allow'), 'GET');
    await wrongMethod.text();
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
