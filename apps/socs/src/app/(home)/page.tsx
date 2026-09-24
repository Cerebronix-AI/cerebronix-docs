import Link from 'next/link';
import { siteOrigin } from '@cerebronix/docs-ui';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-6">
      <h1 className="text-2xl font-bold">Cerebronix developer platform</h1>
      <p>
        Public API contract. Wave 0 is <code>GET /healthz</code>. Waves 1–6
        are platform preview.
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
