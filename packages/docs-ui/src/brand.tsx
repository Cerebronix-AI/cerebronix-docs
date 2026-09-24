import { docsAsset } from "./site-url";

export function BrandTitle({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={docsAsset("/assets/brand/logo-icon.svg")}
        alt="Cerebronix"
        width={28}
        height={28}
        className="h-7 w-7"
      />
      <span className="font-semibold">{label}</span>
    </span>
  );
}
