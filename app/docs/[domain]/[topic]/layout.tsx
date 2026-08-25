import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { Announcement, SiteFooter } from '@/components/site-chrome';
import { baseOptions } from '@/lib/navigation';
import { getTutorialTree } from '@/lib/page-tree';
import { getSource } from '@/lib/source';

export default async function TutorialLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ domain: string; topic: string }>;
}) {
  const { domain, topic } = await params;
  const source = await getSource();
  const tree = getTutorialTree(source.getPageTree(), domain, topic);

  return (
    <>
      <Announcement />
      <DocsLayout {...baseOptions()} tree={tree} sidebar={{ defaultOpenLevel: 1 }}>
        {children}
      </DocsLayout>
      <SiteFooter />
    </>
  );
}
