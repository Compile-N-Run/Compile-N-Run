import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { Comments } from '@/components/comments';
import { getMDXComponents } from '@/components/mdx';
import { getSource } from '@/lib/source';

// Deliberately omit generateStaticParams: the first request renders and caches
// each of the 10k+ docs instead of compiling every document during the build.
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ domain: string; topic: string; slug?: string[] }>;
};

async function resolvePage(params: PageProps['params']) {
  const { domain, topic, slug = [] } = await params;
  const source = await getSource();
  const page = source.getPage([domain, topic, ...slug]);
  return { page, source };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await resolvePage(params);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const { page, source } = await resolvePage(params);
  if (!page) notFound();

  const renderer = await page.data.load();
  const { body, toc } = await renderer.render(
    getMDXComponents({
      a: createRelativeLink(source, page),
    }),
  );
  const editUrl = `https://github.com/Compile-N-Run/Compile-N-Run/edit/main/docs/${page.path}`;

  return (
    <DocsPage toc={toc}>
      <DocsBody>{body}</DocsBody>
      <div className="doc-feedback">
        <p>
          <Link href={editUrl} target="_blank" rel="noreferrer">
            Edit this page
          </Link>
        </p>
        <p className="mb-6 text-sm text-fd-muted-foreground">
          💡 Found a typo or mistake? Suggest a correction—your feedback is greatly appreciated.
        </p>
        <Comments />
      </div>
    </DocsPage>
  );
}
