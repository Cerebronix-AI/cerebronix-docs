import type { MetadataRoute } from 'next';
import { siteOrigin } from '@cerebronix/docs-ui';

export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin('docs');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
