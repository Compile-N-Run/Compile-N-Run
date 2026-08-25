import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Announcement, SiteFooter } from '@/components/site-chrome';
import { baseOptions } from '@/lib/navigation';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Announcement />
      <HomeLayout {...baseOptions()}>{children}</HomeLayout>
      <SiteFooter />
    </>
  );
}
