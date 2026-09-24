import type { ReactNode } from "react";
import { type DocsSite, siteHref } from "./site-url";

export function CrossLink({
  href,
  site,
  path,
  children,
}: {
  href?: string;
  site?: DocsSite;
  path?: string;
  children: ReactNode;
}) {
  const resolved =
    href ?? (site && path ? siteHref(site, path) : "#");
  return <a href={resolved}>{children}</a>;
}
