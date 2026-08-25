import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const workspace = process.cwd();
const docsRoot = path.join(workspace, 'docs');
const compareProduction = process.argv.includes('--production');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolutePath)));
    else files.push(absolutePath);
  }
  return files;
}

function normalizeUrl(url) {
  const pathname = url.startsWith('http') ? new URL(url).pathname : url;
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
}

function stripNumberPrefix(segment) {
  return segment.replace(/^\d+[-_](?=\D)/, '');
}

function readSlug(content) {
  const frontmatter = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---/.exec(content)?.[1];
  const value = frontmatter?.match(/^slug:\s*(.*?)\s*$/m)?.[1];
  return value?.replace(/^['"]|['"]$/g, '');
}

function routeForDocument(file, content) {
  const relativePath = path.relative(docsRoot, file).split(path.sep).join('/');
  const withoutExtension = relativePath.replace(/\.(?:md|mdx)$/, '');
  const rawSegments = withoutExtension.split('/');
  if (rawSegments.at(-1) === 'index') rawSegments.pop();
  const defaultSegments = rawSegments.map(stripNumberPrefix);
  const explicitSlug = readSlug(content);

  if (!explicitSlug) return normalizeUrl(`/docs/${defaultSegments.join('/')}`);
  const explicitSegments = explicitSlug.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (explicitSlug.startsWith('/')) return normalizeUrl(`/docs/${explicitSegments.join('/')}`);
  return normalizeUrl(`/docs/${[...defaultSegments.slice(0, -1), ...explicitSegments].join('/')}`);
}

const files = (await walk(docsRoot)).filter((file) => ['.md', '.mdx'].includes(path.extname(file)));
const routes = new Map();
for (const file of files) {
  const route = routeForDocument(file, await readFile(file, 'utf8'));
  const existing = routes.get(route);
  if (existing) throw new Error(`Duplicate route ${route}\n- ${existing}\n- ${file}`);
  routes.set(route, path.relative(workspace, file));
}

const metadataFiles = (await walk(docsRoot)).filter((file) => path.basename(file) === 'meta.json');
const numericRoutes = [...routes].filter(([route]) => /\/\d+[-_](?=\D)/.test(route));
if (numericRoutes.length > 0) {
  throw new Error(`Numeric prefixes leaked into ${numericRoutes.length} public routes.`);
}

const docusaurusConfig = (await readFile(path.join(workspace, 'docusaurus.config.js'), 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('//'))
  .join('\n');
const navigationTargets = new Set(
  [...docusaurusConfig.matchAll(/to:\s*['"](\/docs\/[^'"]+)['"]/g)].map((match) => normalizeUrl(match[1])),
);
const missingNavigationTargets = [...navigationTargets].filter((target) => !routes.has(target));
if (missingNavigationTargets.length > 0) {
  throw new Error(`Missing legacy navigation targets:\n${missingNavigationTargets.join('\n')}`);
}

const report = {
  documents: files.length,
  routes: routes.size,
  metadataFiles: metadataFiles.length,
  legacyNavigationTargets: navigationTargets.size,
  productionComparison: null,
};

if (compareProduction) {
  const response = await fetch('https://www.compilenrun.com/sitemap.xml');
  if (!response.ok) throw new Error(`Unable to fetch production sitemap: ${response.status}`);
  const xml = await response.text();
  const productionDocs = new Set(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map((match) => normalizeUrl(match[1]))
      .filter((url) => url.startsWith('/docs/') && !url.startsWith('/docs/category/')),
  );
  const productionCategories = new Set(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map((match) => normalizeUrl(match[1]))
      .filter((url) => url.startsWith('/docs/category/')),
  );
  const categoryRoutes = JSON.parse(
    await readFile(path.join(workspace, 'lib', 'legacy-category-routes.json'), 'utf8'),
  );
  const localCategories = new Set(Object.keys(categoryRoutes).map((slug) => `/docs/category/${slug}`));
  const missingCategories = [...productionCategories].filter((url) => !localCategories.has(url));
  const newCategories = [...localCategories].filter((url) => !productionCategories.has(url));
  const localDocs = new Set(routes.keys());
  const missingLocally = [...productionDocs].filter((url) => !localDocs.has(url));
  const newLocally = [...localDocs].filter((url) => !productionDocs.has(url));
  report.productionComparison = {
    productionDocumentRoutes: productionDocs.size,
    missingLocally: missingLocally.length,
    newLocally: newLocally.length,
    productionCategoryRoutes: productionCategories.size,
    missingCategories: missingCategories.length,
    newCategories: newCategories.length,
    missingSamples: missingLocally.slice(0, 20),
    newSamples: newLocally.slice(0, 20),
  };
  if (
    missingLocally.length > 0 ||
    newLocally.length > 0 ||
    missingCategories.length > 0 ||
    newCategories.length > 0
  ) {
    process.exitCode = 1;
  }
}

console.log(JSON.stringify(report, null, 2));
