import { createReadStream } from 'node:fs';
import { parseReport } from './report.js';

const MAX_BYTES = 1024 * 1024;

async function readBounded(path) {
  const chunks = [];
  let size = 0;
  for await (const chunk of createReadStream(path)) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new RangeError('Input exceeds the 1 MiB limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

try {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !args[0]) throw new Error('Usage: node src/cli.js FILE.json');
  const report = parseReport(await readBounded(args[0]));
  console.log(JSON.stringify(report));
} catch (error) {
  console.error(`Report failed: ${error.message}`);
  process.exitCode = 1;
}
