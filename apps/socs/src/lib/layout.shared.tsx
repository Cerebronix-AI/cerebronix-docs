import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BrandTitle, siteOrigin } from '@cerebronix/docs-ui';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandTitle label="Developers" />,
    },
    links: [
      {
        text: 'Product docs',
        url: siteOrigin('docs'),
        external: true,
      },
    ],
  };
}
