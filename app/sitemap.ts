import type { MetadataRoute } from 'next';
import { getBlogSource } from '@/lib/blog-source';
import { getSource } from '@/lib/source';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const source = await getSource();
  const blog = await getBlogSource();
  const docs = source.getPages().map((page) => ({
    url: new URL(page.url, 'https://www.compilenrun.com').toString(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  return [
    { url: 'https://www.compilenrun.com/', changeFrequency: 'daily', priority: 1 },
    { url: 'https://www.compilenrun.com/about/', changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://www.compilenrun.com/contact/', changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://www.compilenrun.com/blog/', changeFrequency: 'daily', priority: 0.5 },
    { url: 'https://www.compilenrun.com/blog/archive/', changeFrequency: 'daily', priority: 0.5 },
    ...blog.getPages().map((page) => ({
      url: new URL(page.url, 'https://www.compilenrun.com').toString(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
    ...docs,
  ];
}
