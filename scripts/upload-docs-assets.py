#!/usr/bin/env python3
"""Upload image files to the cerebronix-docs R2 bucket.

Uses the production r2-cerebronix-prod-token via env (never commit keys):

  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  AWS_ENDPOINT_URL=https://<accountid>.r2.cloudflarestorage.com

Public reads go through https://docs-cdn.cerebronix.com/<key>.

Pass one or more local directories. Object keys are relative to each
directory root (e.g. brand/logo.png, guides/inbox/01-contacts-empty.png).
"""

from __future__ import annotations

import mimetypes
import os
import sys
from pathlib import Path

import boto3
from botocore.config import Config

TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}

BUCKET = "cerebronix-docs"


def main() -> int:
    for name in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL"):
        if not os.environ.get(name):
            print(f"missing {name}", file=sys.stderr)
            return 2
    roots = [Path(arg).resolve() for arg in sys.argv[1:]]
    if not roots:
        print("usage: upload-docs-assets.py <dir> [dir...]", file=sys.stderr)
        return 2
    client = boto3.client(
        "s3",
        endpoint_url=os.environ["AWS_ENDPOINT_URL"],
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )
    uploaded = 0
    for root in roots:
        if not root.is_dir():
            print(f"not a directory: {root}", file=sys.stderr)
            return 1
        for path in sorted(root.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in TYPES:
                continue
            key = str(path.relative_to(root))
            content_type = TYPES[path.suffix.lower()]
            guessed, _ = mimetypes.guess_type(path.name)
            if guessed:
                content_type = guessed
            client.put_object(
                Bucket=BUCKET,
                Key=key,
                Body=path.read_bytes(),
                ContentType=content_type,
                CacheControl="public, max-age=31536000, immutable",
            )
            print("put", key, path.stat().st_size)
            uploaded += 1
    if not uploaded:
        print("no image files under", *[str(r) for r in roots], file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
