import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const socsCurrent = path.join(root, "apps/socs/content/docs/current");
const socsPreview = path.join(root, "apps/socs/content/docs/platform-preview");
const docsContent = path.join(root, "apps/docs/content/docs");

const requiredCurrent = [
  "overview.mdx",
  "quickstart.mdx",
  "authentication.mdx",
  "authorization.mdx",
  "conversations.mdx",
  "contacts-and-groups.mdx",
  "whatsapp-and-campaigns.mdx",
  "webhooks-and-websockets.mdx",
  "agents-and-ask.mdx",
  "knowledge.mdx",
  "channels.mdx",
  "analytics.mdx",
  "developer-mcp.mdx",
  "billing.mdx",
  "observability.mdx",
  "errors-rate-limits-audit.mdx",
  "not-available-yet.mdx",
  "changelog.mdx",
  "security.mdx",
];

const requiredPreview = [
  "knowledge.mdx",
  "agent-writes.mdx",
  "channels.mdx",
  "analytics.mdx",
];

const requiredSearchSnippets = [
  { file: "authorization.mdx", needle: "invite" },
  { file: "authorization.mdx", needle: "credits" },
  { file: "quickstart.mdx", needle: "healthz" },
  { file: "authentication.mdx", needle: "API key" },
  { file: "whatsapp-and-campaigns.mdx", needle: "WhatsApp opt-in" },
];

const requiredCurrentCurls = [
  { file: "quickstart.mdx", needle: "/v1/oauth/token" },
  { file: "quickstart.mdx", needle: "/v1/me" },
  { file: "authentication.mdx", needle: "public-api.cerebronix.com/v1/" },
  { file: "conversations.mdx", needle: "/v1/organizations/" },
  { file: "developer-mcp.mdx", needle: "POST /mcp" },
  { file: "developer-mcp.mdx", needle: "confirm" },
  { file: "webhooks-and-websockets.mdx", needle: "Cerebronix-Signature" },
  { file: "knowledge.mdx", needle: "/data_sources" },
  { file: "channels.mdx", needle: "/channels" },
  { file: "analytics.mdx", needle: "/analytics/summary" },
  { file: "billing.mdx", needle: "/billing/balance" },
];

const publicHostRe = /public-api\.cerebronix\.com/;
const bannedLocalApiRe = /Port B|:8010|127\.0\.0\.1:8010|cnx_test_/i;

function walk(dir, suffix = ".mdx") {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, suffix));
    else if (!suffix || entry.name.endsWith(suffix)) out.push(p);
  }
  return out;
}

const errors = [];

if (!fs.existsSync(socsCurrent)) {
  errors.push("missing apps/socs/content/docs/current");
} else {
  for (const file of requiredCurrent) {
    if (!fs.existsSync(path.join(socsCurrent, file))) {
      errors.push(`missing current page ${file}`);
    }
  }
}

if (!fs.existsSync(socsPreview)) {
  errors.push("missing apps/socs/content/docs/platform-preview");
} else {
  for (const file of requiredPreview) {
    const full = path.join(socsPreview, file);
    if (!fs.existsSync(full)) {
      errors.push(`missing preview page ${file}`);
      continue;
    }
    const text = fs.readFileSync(full, "utf8");
    if (!text.includes("ComingSoon") && !text.includes("Coming soon")) {
      errors.push(`${file} must include ComingSoon or Coming soon`);
    }
  }
}

if (fs.existsSync(socsCurrent)) {
  for (const file of walk(socsCurrent)) {
    const rel = path.relative(socsCurrent, file);
    const text = fs.readFileSync(file, "utf8");
    if (/public\.api\.cerebronix\.com/i.test(text)) {
      errors.push(`${rel} must not use public.api.cerebronix.com`);
    }
    if (
      /ingest[^\n]*session[^\n]*openapi\.yaml/i.test(text) &&
      !/do not ingest/i.test(text) &&
      !/must not ingest/i.test(text)
    ) {
      errors.push(`${rel} must not ingest session openapi.yaml`);
    }
    if (/as public auth/i.test(text) && /X-User-ID/i.test(text) && !rel.endsWith("security.mdx")) {
      errors.push(`${rel} must not document X-User-ID as public auth`);
    }
    if (
      /(?:curl[^\n]*|POST)\s+`?\/mcp\/v1/i.test(text) ||
      /call\s+`?\/mcp\/v1/i.test(text) && !/do not call/i.test(text)
    ) {
      errors.push(`${rel} must not tell developers to call /mcp/v1`);
    }
  }

  for (const { file, needle } of requiredSearchSnippets) {
    const full = path.join(socsCurrent, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    if (!text.toLowerCase().includes(needle.toLowerCase())) {
      errors.push(`${file} must contain "${needle}"`);
    }
  }

  for (const { file, needle } of requiredCurrentCurls) {
    const full = path.join(socsCurrent, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    if (!text.includes(needle)) {
      errors.push(`${file} must contain "${needle}"`);
    }
    if (
      (file === "quickstart.mdx" || file === "authentication.mdx" || file === "conversations.mdx") &&
      !publicHostRe.test(text)
    ) {
      errors.push(`${file} must curl public-api.cerebronix.com`);
    }
  }
}

if (!fs.existsSync(docsContent)) {
  errors.push("missing apps/docs/content/docs");
} else {
  const requiredDocs = [
    "getting-started/what-cerebronix-is.mdx",
    "concepts/conversations.mdx",
    "guides/ecommerce-marketronix.mdx",
  ];
  for (const file of requiredDocs) {
    if (!fs.existsSync(path.join(docsContent, file))) {
      errors.push(`missing product title page ${file}`);
    }
  }
}

for (const file of [...walk(socsCurrent), ...walk(socsPreview), ...walk(docsContent)]) {
  const text = fs.readFileSync(file, "utf8");
  if (bannedLocalApiRe.test(text)) {
    errors.push(
      `${path.relative(root, file)} must not mention Port B, :8010, or cnx_test_`,
    );
  }
  const imgs = [...text.matchAll(/!\[[^\]]*\]\([^)]+\)|<Screenshot\b[^>]*>/g)];
  for (const match of imgs) {
    const tag = match[0];
    if (tag.startsWith("![") && tag.startsWith("![]")) {
      errors.push(`${path.relative(root, file)} image missing alt text`);
    }
    if (tag.startsWith("<Screenshot") && !/alt=/.test(tag)) {
      errors.push(`${path.relative(root, file)} Screenshot missing alt`);
    }
    if (/\]\(\/(?:guides|brand)\//.test(tag) || /src=["']\/(?:guides|brand)\//.test(tag)) {
      errors.push(
        `${path.relative(root, file)} image must use https://docs-cdn.cerebronix.com, not an app-served path`,
      );
    }
  }
}

const imageExt = /\.(png|jpe?g|gif|webp|svg|ico)$/i;
for (const dir of [
  path.join(root, "apps/docs/public"),
  path.join(root, "apps/socs/public"),
]) {
  for (const file of walk(dir, "")) {
    if (imageExt.test(file)) {
      errors.push(
        `${path.relative(root, file)} must not live in the app; upload to docs-cdn.cerebronix.com`,
      );
    }
  }
}
for (const icon of [
  path.join(root, "apps/docs/src/app/icon.ico"),
  path.join(root, "apps/socs/src/app/icon.ico"),
]) {
  if (fs.existsSync(icon)) {
    errors.push(
      `${path.relative(root, icon)} must not live in the app; use docs-cdn assets/brand/favicon.ico`,
    );
  }
}

// ============================================================================
// Black-Box Architecture & Information Disclosure Enforcement
// ============================================================================

const disclosureRules = [
  {
    name: "Internal Project & Service Names",
    regex: /\b(saastronix|lexatronix|logatronix)\b/i,
    isException: () => false,
  },
  {
    name: "Restored UI Label: Marketronix",
    regex: /\bmarketronix\b/i,
    // Exception: Allow ONLY genuine customer-visible UI labels and the retained legacy URL in Product Documentation.
    // Specifically:
    // - Retained legacy URL route slug and meta.json entry ("ecommerce-marketronix")
    // - Integration card label ("Marketronix card", "Marketronix integration card", "Marketronix credential card", "Marketronix Integration Card")
    // - UI dropdown selector / option ("select **Marketronix**", "select Marketronix", "(marketronix)", "marketronixStoreId")
    // - Data source / provider label ("Marketronix (Native Store)", "Marketronix data source", "Native Store (Marketronix)", "Native Store (Marketronix Card)", "Native Store (**Marketronix**)")
    // - UI flow title / explanation ("Marketronix Integration Flow", "Marketronix commerce engine")
    // All other internal architectural disclosures in ecommerce or elsewhere are rejected.
    isException: (line, file) => {
      if (!file.startsWith("apps/docs")) return false;
      if (file.endsWith("ecommerce-marketronix.mdx") || file.endsWith("meta.json")) {
        if (/ecommerce-marketronix/i.test(line)) return true;
      }
      const clean = line.replace(/[*`_]/g, "");
      const allowedUiPattern = /(?:Marketronix\s+(?:card|integration\s+card|credential\s+card|data\s+source|commerce\s+engine|Integration\s+Flow|\(?Native\s+Store\)?)|Native\s+Store\s*\(Marketronix(?:\s*Card)?\)|select(?:ing)?\s+Marketronix|\(marketronix\)|marketronixStoreId|ecommerce-marketronix)/i;
      return allowedUiPattern.test(clean);
    },
  },
  {
    name: "Internal Auth & Security Engines",
    regex: /\b(oathkeeper|keto|kratos)\b|\bhydra\b/i,
    // Exception: React / Next.js hydration attributes/text
    isException: (line) =>
      /suppressHydrationWarning|hydrate|hydration/i.test(line),
  },
  {
    name: "Internal Storage & Message Brokers",
    regex: /\b(milvus|nats|lago|chatwoot|medusa|redis|mongodb)\b|\bpostgres(ql)?\b/i,
    isException: () => false,
  },
  {
    name: "Internal Deployment & Orchestration Infrastructure",
    regex: /\b(kubernetes|k8s|argocd|traefik|woodpecker)\b/i,
    isException: () => false,
  },
  {
    name: "Internal Code Repositories & Internal File Paths",
    regex: /\b(cerebronix-(?:gitops|infrastructure|saas-ui|chat-ui))\b|internal\/(?:biz|data)\//i,
    isException: () => false,
  },
  {
    name: "Internal Ports & Private Cluster Domains",
    regex: /(?::(?:8000|8080|9000|4222|6379|27017)\b|cluster\.local|internal\.cerebronix)/i,
    isException: () => false,
  },
];

const disclosureScanFiles = [
  ...walk(path.join(root, "apps/docs/content"), ".mdx"),
  ...walk(path.join(root, "apps/socs/content"), ".mdx"),
  ...walk(path.join(root, "apps/docs/content"), ".json"),
  ...walk(path.join(root, "apps/socs/content"), ".json"),
  ...walk(path.join(root, "apps/docs/src"), ".tsx"),
  ...walk(path.join(root, "apps/socs/src"), ".tsx"),
  ...walk(path.join(root, "apps/docs/src"), ".ts"),
  ...walk(path.join(root, "apps/socs/src"), ".ts"),
  path.join(root, "apps/socs/public/public-openapi.v1.yaml"),
];

for (const filePath of disclosureScanFiles) {
  if (!fs.existsSync(filePath)) continue;
  const relPath = path.relative(root, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    for (const rule of disclosureRules) {
      if (rule.regex.test(line)) {
        if (rule.isException(line, relPath)) continue;
        errors.push(
          `[DISCLOSURE] ${relPath}:${idx + 1} reveals internal architecture (${rule.name}): "${line.trim().slice(0, 100)}"`,
        );
      }
    }
  });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("content policy ok");
