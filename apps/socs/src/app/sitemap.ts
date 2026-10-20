import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteOrigin } from '@cerebronix/docs-ui';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin('socs');
  const pages = source.getPages();

  const entries: MetadataRoute.Sitemap = [
    {
      url: origin,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...pages.map((page) => {
      const dataRecord = page.data as unknown as Record<string, unknown>;
      const rawDate = dataRecord.lastModified ?? dataRecord.date;
      return {
        url: `${origin}${page.url}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        ...(rawDate ? { lastModified: new Date(String(rawDate)) } : {}),
      };
    }),
  ];

  return entries;
}
