import { docsAsset, siteOrigin, type DocsSite } from './site-url';

export const SECTION_NAMES: Record<string, string> = {
  // Product docs categories
  'getting-started': 'Getting Started',
  concepts: 'Concepts',
  'ai-agents': 'AI Agents',
  'data-sources': 'Data Sources',
  ecommerce: 'Ecommerce',
  channels: 'Channels',
  conversations: 'Conversations',
  'multilingual-and-voice': 'Multilingual & Voice',
  'admin-and-billing': 'Admin & Billing',
  analytics: 'Analytics',
  troubleshooting: 'Troubleshooting',
  guides: 'Guides',
  // Developer docs categories
  current: 'API Reference (v1)',
  'platform-preview': 'Platform Preview',
};

export function formatSegmentName(segment: string): string {
  if (SECTION_NAMES[segment]) {
    return SECTION_NAMES[segment];
  }
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export function getBreadcrumbSchema(
  site: DocsSite,
  slugs: string[],
  pageTitle: string
) {
  const origin = siteOrigin(site);
  const homeName = site === 'docs' ? 'Product Docs' : 'Developer Docs';

  const items: BreadcrumbItem[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeName,
      item: origin,
    },
  ];

  if (slugs.length > 1) {
    const sectionSlug = slugs[0];
    const sectionName = formatSegmentName(sectionSlug);
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: sectionName,
      item: `${origin}/docs/${slugs.join('/')}`,
    });

    items.push({
      '@type': 'ListItem',
      position: 3,
      name: pageTitle,
      item: `${origin}/docs/${slugs.join('/')}`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: pageTitle,
      item: `${origin}/docs/${slugs.join('/')}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function getArticleSchema(
  site: DocsSite,
  pageUrl: string,
  title: string,
  description?: string
) {
  const origin = siteOrigin(site);
  const canonicalUrl = `${origin}${pageUrl}`;
  const desc = description || title;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: desc,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Cerebronix',
      url: 'https://cerebronix.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cerebronix',
      url: 'https://cerebronix.com',
      logo: {
        '@type': 'ImageObject',
        url: docsAsset('/assets/brand/logo.png'),
      },
    },
  };
}

export function getWebsiteSchema(
  site: DocsSite,
  title: string,
  description: string
) {
  const origin = siteOrigin(site);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    url: origin,
    description: description,
    publisher: {
      '@type': 'Organization',
      name: 'Cerebronix',
      url: 'https://cerebronix.com',
      logo: {
        '@type': 'ImageObject',
        url: docsAsset('/assets/brand/logo.png'),
      },
    },
  };
}
