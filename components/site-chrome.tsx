import Link from 'next/link';

export function Announcement() {
  return (
    <div className="announcement">
      The best website to learn any programming language for free! ⭐ Star us on{' '}
      <a href="https://github.com/Compile-N-Run/Compile-N-Run" target="_blank" rel="noreferrer">
        GitHub
      </a>{' '}
      to support the project!
    </div>
  );
}

const footerGroups = [
  {
    title: 'omniscanner',
    items: [
      ['Home', '/'],
      ['Search', '/search'],
      ['Feedback', 'mailto:feedback@compilenrun.com'],
    ],
  },
  {
    title: 'Links',
    items: [
      ['About', '/about'],
      ['Contact', '/contact'],
      ['Maintainer', 'https://www.yuyangwang.org/'],
      ['GitHub', 'https://github.com/Compile-N-Run/Compile-N-Run'],
    ],
  },
  {
    title: 'Legal',
    items: [
      ['Privacy Policy', '/privacy-policy'],
      ['Terms of Use', '/terms'],
    ],
  },
  {
    title: 'Tools',
    items: [
      ['Emoji to PNG', 'https://emoji.compilenrun.com/'],
      ['Image Resizer', 'https://resizer.compilenrun.com/'],
      ['SVG Viewer', 'https://svgviewer.compilenrun.com/'],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        {footerGroups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map(([label, url]) => (
                <li key={label}>
                  <Link href={url}>{label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p>Copyright © {new Date().getFullYear()} omniscanner.</p>
    </footer>
  );
}
