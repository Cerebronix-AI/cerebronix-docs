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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("content policy ok");
