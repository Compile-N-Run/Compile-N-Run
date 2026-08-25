import { localMd } from '@fumadocs/local-md';
import { watchWithDevServer } from '@fumadocs/local-md/dev/ws';
import { dynamicLoader } from 'fumadocs-core/source/dynamic';
import { pageSchema } from 'fumadocs-core/source/schema';
import { remarkDirectiveAdmonition, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import { z } from 'zod';

const legacyAdmonitionTypes = {
  note: 'info',
  tip: 'info',
  info: 'info',
  important: 'warning',
  caution: 'warning',
  warn: 'warning',
  warning: 'warning',
  danger: 'error',
  success: 'success',
};

const docs = localMd({
  dir: 'docs',
  frontmatterSchema: pageSchema.extend({
    slug: z.string().optional(),
  }),
  mdxOptions: {
    rehypeCodeOptions: {
      fallbackLanguage: 'text',
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    remarkPlugins: [
      remarkDirective,
      [remarkDirectiveAdmonition, { types: legacyAdmonitionTypes }],
      remarkMath,
      remarkMdxMermaid,
    ],
    rehypePlugins: [rehypeKatex],
  },
});

if (process.env.NODE_ENV === 'development') {
  void watchWithDevServer(docs);
}

const docsLoader = dynamicLoader(docs.dynamicSource(), {
  baseUrl: '/docs',
  slugs(file, next) {
    const explicitSlug = file.data.frontmatter.slug;
    if (explicitSlug) {
      const explicitSegments = explicitSlug
        .replace(/^\/+|\/+$/g, '')
        .split('/')
        .filter(Boolean);
      if (explicitSlug.startsWith('/')) return explicitSegments;

      const parentSegments = next()
        .slice(0, -1)
        .map((segment) => segment.replace(/^\d+[-_](?=\D)/, ''));
      return [...parentSegments, ...explicitSegments];
    }

    return next().map((segment) => segment.replace(/^\d+[-_](?=\D)/, ''));
  },
});

export async function getSource() {
  return docsLoader.get();
}

export type DocsSource = Awaited<ReturnType<typeof getSource>>;
