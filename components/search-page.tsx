'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';

export function SearchPage() {
  const { setOpenSearch } = useSearchContext();
  return (
    <main className="content-page text-center">
      <Search className="mx-auto mb-5 size-12" />
      <h1 className="mb-3 text-3xl font-bold">Search omniscanner</h1>
      <p className="mb-6 text-fd-muted-foreground">Search every tutorial using the existing Typesense index.</p>
      <button
        type="button"
        className="rounded-lg bg-fd-primary px-5 py-3 font-medium text-fd-primary-foreground"
        onClick={() => setOpenSearch(true)}
      >
        Open search
      </button>
    </main>
  );
}
