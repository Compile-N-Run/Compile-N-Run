import { localMd } from '@fumadocs/local-md';
import { dynamicLoader } from 'fumadocs-core/source/dynamic';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const blog = localMd({
  dir: 'blog',
  frontmatterSchema: pageSchema.extend({
    slug: z.string().optional(),
  }),
});

const blogLoader = dynamicLoader(blog.dynamicSource(), {
  baseUrl: '/blog',
  slugs(file, next) {
    return file.data.frontmatter.slug ? [file.data.frontmatter.slug] : next();
  },
});

export async function getBlogSource() {
  return blogLoader.get();
}
