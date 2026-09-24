#!/usr/bin/env python3
"""Upload apps/docs/public/guides/*.png to the cerebronix-docs R2 bucket.

Uses the production r2-cerebronix-prod-token via env (never commit keys):

  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  AWS_ENDPOINT_URL=https://<accountid>.r2.cloudflarestorage.com

Public reads go through https://docs-cdn.cerebronix.com/<key>.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import boto3
from botocore.config import Config

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / "apps/docs/public"
BUCKET = "cerebronix-docs"


def main() -> int:
    for name in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL"):
        if not os.environ.get(name):
            print(f"missing {name}", file=sys.stderr)
            return 2
    client = boto3.client(
        "s3",
        endpoint_url=os.environ["AWS_ENDPOINT_URL"],
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )
    files = sorted(LOCAL.rglob("*.png"))
    if not files:
        print("no png files under", LOCAL)
        return 1
    for path in files:
        key = str(path.relative_to(LOCAL))
        client.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=path.read_bytes(),
            ContentType="image/png",
            CacheControl="public, max-age=31536000, immutable",
        )
        print("put", key, path.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
