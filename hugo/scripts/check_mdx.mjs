// Compile source only: never evaluate document JavaScript or imported modules.
// Dependencies intentionally live outside the site's Docusaurus installation.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const require = createRequire(path.join(root, 'tests/content-quality/package.json'));
const { compile } = await import(pathToFileURL(require.resolve('@mdx-js/mdx')));
const { default: remarkGfm } = await import(pathToFileURL(require.resolve('remark-gfm')));
const listFile = process.argv[2];
if (!listFile) throw new Error('Usage: node hugo/scripts/check_mdx.mjs FILE_LIST.json');
const files = JSON.parse(await readFile(listFile, 'utf8'));
let failures = 0;
for (const file of files) {
  const absolute = path.resolve(root, file);
  if (!absolute.startsWith(root + path.sep) || !/\.mdx?$/.test(file)) {
    throw new Error(`Unexpected source path: ${file}`);
  }
  let source = await readFile(absolute, 'utf8');
  // Front matter is checked by check_content.py, not interpreted as MDX.
  source = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
  try {
    await compile({ value: source, path: file }, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    failures++;
    console.error(`${file}: ${error.message}`);
  }
}
console.log(`MDX: compiled ${files.length} documents; ${failures} failures (no source evaluated).`);
process.exitCode = failures ? 1 : 0;
