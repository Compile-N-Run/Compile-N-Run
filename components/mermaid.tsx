'use client';

import { useEffect, useId, useRef } from 'react';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }: { chart: string }) {
  const container = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(':', '');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let active = true;
    void import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      });
      const result = await mermaid.render(`mermaid-${id}`, chart.replaceAll('\\n', '\n'));
      if (active && container.current) {
        container.current.innerHTML = result.svg;
        result.bindFunctions?.(container.current);
      }
    });
    return () => {
      active = false;
    };
  }, [chart, id, resolvedTheme]);

  return <div ref={container} className="my-6 flex justify-center overflow-x-auto" />;
}
