# cerebronix-docs

Product docs (`apps/docs`) and developer contract / socs (`apps/socs`).

```bash
pnpm install
pnpm docs   # http://127.0.0.1:4000
pnpm socs   # http://127.0.0.1:4001
pnpm typecheck
pnpm check:content
```

Production hosts: `https://docs.cerebronix.com` and `https://developer.cerebronix.com`. Cross-links use `NEXT_PUBLIC_DOCS_URL` and `NEXT_PUBLIC_SOCS_URL` (local defaults are the ports above).

Deploy is Woodpecker → `registry.cerebronix.com/cerebronix/docs` and `.../socs` → gitops `docs-sites-manifests.yaml`. Public HTTPS, no mTLS.

Do not put secrets in this repository.
