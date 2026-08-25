import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { getBlogSource } from '@/lib/blog-source';

type BlogPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await getBlogSource();
  const page = source.getPage([slug]);
  return page ? { title: page.data.title, description: page.data.description } : {};
}

export default async function BlogPost({ params }: BlogPageProps) {
  const { slug } = await params;
  const source = await getBlogSource();
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
