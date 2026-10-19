import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import React from 'react';
import { ComingSoon, CrossLink, WarnNever } from '@cerebronix/docs-ui';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Mermaid } from './Mermaid';

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    const props = node.props as Record<string, unknown>;
    const text = props?.children ? extractText(props.children as React.ReactNode) : '';
    if (typeof props?.className === 'string' && props.className.includes('line') && !text.endsWith('\n')) {
      return text + '\n';
    }
    return text;
  }
  return '';
}

function isMermaidSource(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const firstWord = trimmed.split(/[\s\n(]/)[0];
  const mermaidKeywords = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'stateDiagram-v2',
    'erDiagram',
    'gantt',
    'pie',
    'gitGraph',
    'mindmap',
    'timeline',
    'zenuml',
    'C4Context',
    'sankey-beta',
    'quadrantChart',
    'xychart-beta',
    'block-beta',
    'packet-beta',
    'kanban',
    'architecture',
  ];
  return mermaidKeywords.includes(firstWord);
}

function CustomPre(props: React.ComponentProps<'pre'>) {
  const anyProps = props as Record<string, unknown>;
  const child = React.isValidElement(props.children)
    ? (props.children as React.ReactElement<Record<string, unknown>>)
    : null;

  const rawChart = extractText(props.children).trim();

  const isMermaid =
    anyProps['data-language'] === 'mermaid' ||
    (typeof props.className === 'string' && props.className.includes('mermaid')) ||
    (child !== null &&
      (child.props['data-language'] === 'mermaid' ||
        (typeof child.props.className === 'string' &&
          child.props.className.includes('mermaid')))) ||
    isMermaidSource(rawChart);

  if (isMermaid && rawChart) {
    return <Mermaid chart={rawChart} />;
  }

  const DefaultPre = defaultMdxComponents.pre as React.ComponentType<React.ComponentProps<'pre'>>;
  return <DefaultPre {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: CustomPre,
    Mermaid,
    ComingSoon,
    CrossLink,
    WarnNever,
    Step,
    Steps,
    Tab,
    Tabs,
    Callout,
    Card,
    Cards,
    Accordion,
    Accordions,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
