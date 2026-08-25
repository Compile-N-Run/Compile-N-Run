import Link from 'next/link';
import { getBlogSource } from '@/lib/blog-source';

export default async function BlogIndex() {
  const source = await getBlogSource();
  return (
    <main className="content-page">
      <h1 className="mb-8 text-4xl font-bold">Blog</h1>
      <div className="grid gap-4">
        {source.getPages().map((page) => (
          <Link className="topic-card" href={page.url} key={page.url}>
            <strong>{page.data.title}</strong>
            {page.data.description ? (
              <span className="mt-2 block text-sm text-fd-muted-foreground">{page.data.description}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
