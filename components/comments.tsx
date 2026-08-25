'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export function Comments() {
  const { resolvedTheme } = useTheme();
  return (
    <Giscus
      id="comments"
      repo="Compile-N-Run/Compile-N-Run"
      repoId="R_kgDOOAqVEQ"
      category="General"
      categoryId="DIC_kwDOOAqVEc4CnZ-y"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === 'dark' ? 'dark_tritanopia' : 'light_tritanopia'}
      lang="en"
      loading="lazy"
    />
  );
}
