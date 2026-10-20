import Link from 'next/link';
import { docsAsset, getWebsiteSchema, siteOrigin, StructuredData } from '@cerebronix/docs-ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cerebronix Product Documentation',
  description: 'Task-oriented guides and operational documentation for the Cerebronix operator console.',
  alternates: {
    canonical: siteOrigin('docs'),
  },
  openGraph: {
    title: 'Cerebronix Product Documentation',
    description: 'Task-oriented guides and operational documentation for the Cerebronix operator console.',
    url: siteOrigin('docs'),
    siteName: 'Cerebronix Docs',
    type: 'website',
    images: [
      {
        url: docsAsset('/assets/brand/logo.png'),
        width: 1200,
        height: 630,
        alt: 'Cerebronix Product Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cerebronix Product Documentation',
    description: 'Task-oriented guides and operational documentation for the Cerebronix operator console.',
    images: [docsAsset('/assets/brand/logo.png')],
  },
};

export default function HomePage() {
  const schema = getWebsiteSchema(
    'docs',
    'Cerebronix Product Documentation',
    'Task-oriented guides and operational documentation for the Cerebronix operator console.'
  );

  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-6 items-center">
      <StructuredData schema={schema} />
      <img
        src={docsAsset('/assets/brand/logo.png')}
        alt="Cerebronix"
        className="h-10 w-auto"
      />
      <h1 className="text-2xl font-bold">Cerebronix product documentation</h1>
      <p>
        Task-oriented guides for operators. Start with an account, then
        add a source, a channel, and an agent.
      </p>
      <p>
        <Link href="/docs/getting-started/what-cerebronix-is" className="font-medium underline">
          Getting started
        </Link>
        {' · '}
        <a href={siteOrigin('socs')} className="font-medium underline">
          Developer platform
        </a>
      </p>
    </div>
  );
}
