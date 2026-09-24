import Link from 'next/link';
import { siteOrigin } from '@cerebronix/docs-ui';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-6">
      <h1 className="text-2xl font-bold">Cerebronix product documentation</h1>
      <p>
        Task-oriented guides for operators. Start with an account, then
        add a source, a channel, and an agent.
      </p>
      <p>
        <Link href="/docs/getting-started/what-cerebronix-is" className="font-medium underline">
          Getting started
        </Link>
        {' · '}
        <a href={siteOrigin('socs')} className="font-medium underline">
          Developer platform
        </a>
      </p>
    </div>
  );
}
