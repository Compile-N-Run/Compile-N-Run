import { defineConfig } from '@playwright/test';
import path from 'node:path';
export default defineConfig({
  testDir: '.',
  testMatch: ['application.spec.js', 'navigation.spec.js'],
  workers: 1,
  timeout: 45_000,
  reporter: 'list',
  outputDir: process.env.RUNNER_TEMP ? path.join(process.env.RUNNER_TEMP, 'cnr-application-results') : '/tmp/cnr-application-results',
  use: { baseURL: 'http://127.0.0.1:8018', browserName: 'chromium', viewport: { width: 1440, height: 1000 }, acceptDownloads: true },
  webServer: {
    command: 'python3 -m http.server 8018 --bind 127.0.0.1',
    cwd: path.resolve(import.meta.dirname, '../../hugo/public'),
    url: 'http://127.0.0.1:8018/playground/',
    reuseExistingServer: false,
    timeout: 15_000,
    stdout: 'ignore', stderr: 'ignore',
  },
});
