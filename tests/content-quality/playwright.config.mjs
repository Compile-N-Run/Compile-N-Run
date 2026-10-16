import { defineConfig } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: '.',
  testMatch: 'browser.spec.mjs',
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  outputDir: process.env.RUNNER_TEMP ? path.join(process.env.RUNNER_TEMP, 'cnr-browser-results') : '/tmp/cnr-browser-results',
  use: { baseURL: 'http://127.0.0.1:8017', browserName: 'chromium' },
  webServer: {
    command: 'python3 -m http.server 8017 --bind 127.0.0.1',
    cwd: path.resolve(import.meta.dirname, '../../static'),
    url: 'http://127.0.0.1:8017/examples/html/index.html',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
