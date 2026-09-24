import type { ReactNode } from "react";

export function WarnNever({ children }: { children: ReactNode }) {
  return <aside role="note">{children}</aside>;
}
