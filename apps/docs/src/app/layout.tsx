import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { docsAsset, siteOrigin } from '@cerebronix/docs-ui';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin('docs')),
  title: {
    default: 'Cerebronix Docs',
    template: '%s | Cerebronix Docs',
  },
  description: 'Product guides for the Cerebronix operator console.',
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
    title: 'Cerebronix Product Documentation',
    description: 'Product guides for the Cerebronix operator console.',
    url: siteOrigin('docs'),
    siteName: 'Cerebronix Docs',
    type: 'website',
    images: [
      {
        url: docsAsset('/assets/brand/logo.png'),
        width: 1200,
        height: 630,
        alt: 'Cerebronix Docs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cerebronix Product Documentation',
    description: 'Product guides for the Cerebronix operator console.',
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
