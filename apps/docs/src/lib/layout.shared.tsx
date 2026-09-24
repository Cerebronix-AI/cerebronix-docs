import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { siteOrigin } from '@cerebronix/docs-ui';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
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
