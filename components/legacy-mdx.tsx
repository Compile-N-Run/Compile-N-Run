'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Callout } from 'fumadocs-ui/components/callout';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { Tab, Tabs as FumadocsTabs } from 'fumadocs-ui/components/tabs';
import type { TOCItemType } from 'fumadocs-core/toc';

type LegacyTabProps = {
  children: ReactNode;
  value?: string;
  label?: string;
  title?: string;
  default?: boolean;
};

export function TabItem({ children, value, label, title }: LegacyTabProps) {
  return <Tab value={label ?? title ?? value}>{children}</Tab>;
}

export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<LegacyTabProps>[];
  const items = tabs.map((tab, index) => tab.props.label ?? tab.props.title ?? tab.props.value ?? `Tab ${index + 1}`);
  const defaultIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.props.default),
  );

  return (
    <FumadocsTabs items={items} defaultIndex={defaultIndex}>
      {tabs.map((tab, index) =>
        cloneElement(tab, {
          key: tab.key ?? items[index],
          label: items[index],
        }),
      )}
    </FumadocsTabs>
  );
}

const admonitionTypes = {
  note: 'info',
  tip: 'info',
  info: 'info',
  important: 'warn',
  caution: 'warn',
  warning: 'warn',
  danger: 'error',
  success: 'success',
} as const;

export function Admonition({
  children,
  type = 'info',
  title,
}: {
  children: ReactNode;
  type?: keyof typeof admonitionTypes;
  title?: string;
}) {
  return (
    <Callout type={admonitionTypes[type] ?? 'info'} title={title}>
      {children}
    </Callout>
  );
}

export function Image({
  img,
  alt = '',
  style,
  className,
}: {
  img: string | { src?: string };
  alt?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const src = typeof img === 'string' ? img : img.src;
  if (!src) return null;
  // Content images intentionally stay unoptimized in the on-demand renderer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={style} className={className} loading="lazy" />;
}

export function MarkdownImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  // Legacy Markdown images do not carry intrinsic dimensions.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} loading={props.loading ?? 'lazy'} alt={props.alt ?? ''} />;
}

export function TOCInline({ toc }: { toc: TOCItemType[] }) {
  return <InlineTOC items={toc} />;
}
