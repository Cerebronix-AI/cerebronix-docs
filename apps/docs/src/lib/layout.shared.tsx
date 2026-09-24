import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BrandTitle, siteOrigin } from '@cerebronix/docs-ui';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandTitle label="Docs" />,
    },
    links: [
      {
        text: 'Developers',
        url: siteOrigin('socs'),
        external: true,
      },
    ],
  };
}
