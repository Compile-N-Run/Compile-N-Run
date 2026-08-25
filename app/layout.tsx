import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.compilenrun.com'),
  title: {
    default: 'omniscanner',
    template: '%s | omniscanner',
  },
  description: 'The best website to learn any programming language for free!',
  keywords: ['learn programming', 'programming', 'python', 'java', 'javascript', 'sql', 'go'],
  applicationName: 'omniscanner',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'omniscanner',
    images: ['/img/docusaurus-social-card.jpg'],
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#312e81',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        <Script src="/_clarity.js" strategy="afterInteractive" />
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="5cd1a168-25dd-480c-8560-15c0becd3768"
          strategy="afterInteractive"
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8558870819217345"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
