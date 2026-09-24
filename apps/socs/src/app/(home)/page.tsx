import Link from 'next/link';
import { docsAsset, siteOrigin } from '@cerebronix/docs-ui';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-6 items-center">
      <img
        src={docsAsset('/assets/brand/logo.png')}
        alt="Cerebronix"
        className="h-10 w-auto"
      />
      <h1 className="text-2xl font-bold">Cerebronix developer platform</h1>
      <p>
        Public API contract on <code>public-api.cerebronix.com</code>.
        P0 (Waves 0–6) is live. Start with a token and{' '}
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
