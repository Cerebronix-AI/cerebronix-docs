import Link from 'next/link';
import { docsAsset, getWebsiteSchema, siteOrigin, StructuredData } from '@cerebronix/docs-ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cerebronix Developer Platform',
  description: 'Authoritative developer reference, OpenAPI 3.0.3 contracts, authentication lifecycle, and Model Context Protocol (MCP) documentation for Cerebronix.',
  alternates: {
    canonical: siteOrigin('socs'),
  },
  openGraph: {
    title: 'Cerebronix Developer Platform',
    description: 'Authoritative developer reference, OpenAPI 3.0.3 contracts, authentication lifecycle, and Model Context Protocol (MCP) documentation for Cerebronix.',
    url: siteOrigin('socs'),
    siteName: 'Cerebronix Developers',
    type: 'website',
    images: [
      {
        url: docsAsset('/assets/brand/logo.png'),
        width: 1200,
        height: 630,
        alt: 'Cerebronix Developer Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cerebronix Developer Platform',
    description: 'Authoritative developer reference, OpenAPI 3.0.3 contracts, authentication lifecycle, and Model Context Protocol (MCP) documentation for Cerebronix.',
    images: [docsAsset('/assets/brand/logo.png')],
  },
};

export default function HomePage() {
  const schema = getWebsiteSchema(
    'socs',
    'Cerebronix Developer Platform',
    'Authoritative developer reference, OpenAPI 3.0.3 contracts, authentication lifecycle, and Model Context Protocol (MCP) documentation for Cerebronix.'
  );

  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-6 items-center">
      <StructuredData schema={schema} />
      <img
        src={docsAsset('/assets/brand/logo.png')}
        alt="Cerebronix"
        className="h-10 w-auto"
      />
      <h1 className="text-2xl font-bold">Cerebronix developer platform</h1>
      <p>
        Public API contract on <code>public-api.cerebronix.com</code>.
        P0 and P1 are live. Start with a token and{' '}
        <code>GET /v1/me</code>.
      </p>
      <p>
        <Link href="/docs/current/overview" className="font-medium underline">
          Overview
        </Link>
        {' · '}
        <Link href="/docs/current/quickstart" className="font-medium underline">
          Quickstart
        </Link>
        {' · '}
        <a href={siteOrigin('docs')} className="font-medium underline">
          Product docs
        </a>
      </p>
    </div>
  );
}
