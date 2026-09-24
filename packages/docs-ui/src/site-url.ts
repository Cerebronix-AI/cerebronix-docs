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
