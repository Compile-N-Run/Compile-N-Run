'use client';

import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useTypesenseSearch } from 'typesense-fumadocs-adapter/client';
import { Client } from 'typesense';

const client = new Client({
  nodes: [
    {
      host: 'search.api.compilenrun.com',
      port: 443,
      protocol: 'https',
    },
  ],
  apiKey: 'hjfkh314jh5hk1j3lh45k3jh254',
  connectionTimeoutSeconds: 5,
});

export function CompileNRunSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useTypesenseSearch({
    client,
    typesenseCollectionName: 'compile-n-run-docusaurus',
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
        <SearchDialogFooter>
          <span className="ms-auto text-xs text-fd-muted-foreground">Search powered by Typesense</span>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
