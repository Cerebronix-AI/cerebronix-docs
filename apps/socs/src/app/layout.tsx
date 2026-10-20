import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { docsAsset, siteOrigin } from '@cerebronix/docs-ui';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin('socs')),
  title: {
    default: 'Cerebronix Developers',
    template: '%s | Cerebronix Developers',
  },
  description: 'Public API, authentication, webhooks, and Developer MCP.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Cerebronix Developer Platform',
    description: 'Public API, authentication, webhooks, and Developer MCP.',
    url: siteOrigin('socs'),
    siteName: 'Cerebronix Developers',
    type: 'website',
    images: [
      {
        url: docsAsset('/assets/brand/logo.png'),
        width: 1200,
        height: 630,
        alt: 'Cerebronix Developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cerebronix Developer Platform',
    description: 'Public API, authentication, webhooks, and Developer MCP.',
    images: [docsAsset('/assets/brand/logo.png')],
  },
  icons: {
    icon: docsAsset('/assets/brand/favicon.ico'),
    shortcut: docsAsset('/assets/brand/favicon.ico'),
    apple: docsAsset('/assets/brand/logo-icon.svg'),
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
