'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { CompileNRunSearchDialog } from '@/components/search-dialog';

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{ SearchDialog: CompileNRunSearchDialog }}
      theme={{ defaultTheme: 'system', enableSystem: true }}
    >
      {children}
    </RootProvider>
  );
}
