import Link from 'next/link';
import Image from 'next/image';
import { navigationGroups } from '@/lib/navigation';

const homeGroups = new Set(['Fundamentals', 'Languages', 'Web', 'Observability', 'Data & AI', 'Databases', 'DevOps', 'Middleware', 'Linux', 'IoT']);

export default function HomePage() {
  return (
    <main>
      <header className="hero">
        <h1>omniscanner</h1>
        <Image
          src="/img/cyd-world-clock.png"
          alt="CYD World Clock"
          width={1280}
          height={640}
          className="mx-auto mt-8 h-auto w-full max-w-3xl rounded-xl shadow-2xl"
          priority
        />
        <p>The best website to learn any programming language for free!</p>
        <Link href="/docs/language/python">Let&apos;s get started with Python!</Link>
      </header>
      <div className="topic-sections">
        {navigationGroups
          .filter((group) => homeGroups.has(group.text))
          .map((group) => {
            const uniqueItems = [...new Map(group.items.map((item) => [item.url, item])).values()];
            return (
              <section className="topic-section" key={group.text}>
                <h2>{group.text}</h2>
                <div className="topic-grid">
                  {uniqueItems.map((item) => (
                    <Link className="topic-card" href={item.url} key={item.url}>
                      <strong>{item.text}</strong>
                      <span className="mt-2 block text-sm text-fd-muted-foreground">Read the complete tutorial</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </main>
  );
}
