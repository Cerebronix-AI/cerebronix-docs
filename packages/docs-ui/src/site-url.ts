export type DocsSite = "docs" | "socs";

export function siteOrigin(site: DocsSite): string {
  if (site === "docs") {
    return process.env.NEXT_PUBLIC_DOCS_URL ?? "http://127.0.0.1:4000";
  }
  return process.env.NEXT_PUBLIC_SOCS_URL ?? "http://127.0.0.1:4001";
}

export function siteHref(site: DocsSite, path: string): string {
  const prefix = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin(site)}${prefix}`;
}

/** Public R2 custom domain for guide screenshots. Not served from the app. */
export const DOCS_ASSET_ORIGIN =
  process.env.NEXT_PUBLIC_DOCS_ASSET_ORIGIN ?? "https://docs-cdn.cerebronix.com";

export function docsAsset(path: string): string {
  const prefix = path.startsWith("/") ? path : `/${path}`;
  return `${DOCS_ASSET_ORIGIN}${prefix}`;
}
