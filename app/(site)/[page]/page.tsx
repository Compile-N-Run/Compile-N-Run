import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { SearchPage } from '@/components/search-page';
import { getSiteSource } from '@/lib/site-source';

type PageProps = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page: slug } = await params;
  if (slug === 'search') return { title: 'Search' };
  const source = await getSiteSource();
  const page = source.getPage([slug]);
  return page ? { title: page.data.title, description: page.data.description } : {};
}

export default async function StaticContentPage({ params }: PageProps) {
  const { page: slug } = await params;
  if (slug === 'search') return <SearchPage />;

  const source = await getSiteSource();
  const page = source.getPage([slug]);
  if (!page) notFound();
  const renderer = await page.data.load();
  const { body } = await renderer.render(
    getMDXComponents({
      a: createRelativeLink(source, page),
    }),
  );

  return (
    <main className="content-page">
      <DocsBody>{body}</DocsBody>
    </main>
  );
}
