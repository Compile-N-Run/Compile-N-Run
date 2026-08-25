import { localMd } from '@fumadocs/local-md';
import { dynamicLoader } from 'fumadocs-core/source/dynamic';

const pages = localMd({
  dir: 'legacy-docusaurus-src/pages',
  include: ['*.md'],
});

const pageLoader = dynamicLoader(pages.dynamicSource(), {
  baseUrl: '/',
});

export async function getSiteSource() {
  return pageLoader.get();
}
