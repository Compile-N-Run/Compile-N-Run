import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  Admonition,
  Image,
  MarkdownImage,
  TabItem,
  Tabs,
  TOCInline,
} from '@/components/legacy-mdx';
import { Mermaid } from '@/components/mermaid';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Admonition,
    Image,
    img: MarkdownImage,
    Mermaid,
    TabItem,
    Tabs,
    TOCInline,
    ...components,
  } satisfies MDXComponents;
}
