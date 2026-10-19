'use client';

import React, { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

export function Mermaid({ chart }: { chart: string }) {
  const rawId = useId();
  // Ensure valid DOM element ID
  const id = 'm' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        const cleanChart = chart.trim();
        if (!cleanChart) return;

        const isDark =
          typeof document !== 'undefined' &&
          document.documentElement.classList.contains('dark');

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'inherit',
          theme: isDark ? 'dark' : 'default',
        });

        // Use a unique ID for each render to avoid collisions
        const renderId = `${id}-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(renderId, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError((err as Error)?.message || 'Failed to render diagram');
        }
      }
    };
    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="p-4 my-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-mono overflow-x-auto">
        <p className="font-semibold mb-1">Diagram Syntax Notice</p>
        <pre className="text-xs">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex items-center justify-center p-8 bg-fd-card rounded-xl border border-fd-border text-fd-muted-foreground text-sm animate-pulse">
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      className="my-6 p-4 rounded-xl border border-fd-border bg-white dark:bg-zinc-900 shadow-sm flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
