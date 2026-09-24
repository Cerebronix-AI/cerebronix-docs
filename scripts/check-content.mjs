import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const socsCurrent = path.join(root, "apps/socs/content/docs/current");
const socsPreview = path.join(root, "apps/socs/content/docs/platform-preview");
const docsContent = path.join(root, "apps/docs/content/docs");

const requiredCurrent = [
  "overview.mdx",
  "quickstart.mdx",
  "authorization.mdx",
  "observability.mdx",
  "not-available-yet.mdx",
  "security.mdx",
  "changelog.mdx",
];

const requiredPreview = [
  "authentication.mdx",
  "developer-mcp.mdx",
  "resources/conversations-and-messages.mdx",
  "resources/contacts-and-groups.mdx",
  "resources/whatsapp.mdx",
  "resources/ask-agent.mdx",
  "resources/billing.mdx",
  "resources/webhooks-and-websockets.mdx",
];

const requiredSearchSnippets = [
  { file: "authorization.mdx", needle: "invite" },
  { file: "not-available-yet.mdx", needle: "API key" },
  { file: "not-available-yet.mdx", needle: "WhatsApp opt-in" },
  { file: "authorization.mdx", needle: "credits" },
  { file: "quickstart.mdx", needle: "healthz" },
];

const bannedCurrent = [
  /POST\s+https?:\/\/public\.api\.cerebronix\.com\/v1\//i,
  /openapi\.yaml/i,
  /X-User-ID/i,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".mdx")) out.push(p);
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
    if (/curl[\s\S]{0,80}public\.api\.cerebronix\.com\/v1\//i.test(text)) {
      errors.push(`${file} must not show live /v1 curl`);
    }
  }
}

if (fs.existsSync(socsCurrent)) {
  for (const file of requiredCurrent) {
    const full = path.join(socsCurrent, file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const re of bannedCurrent) {
      if (re.test(text) && file !== "overview.mdx" && file !== "security.mdx") {
        errors.push(`${file} matches banned pattern ${re}`);
      }
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
  const imgs = [...text.matchAll(/!\[[^\]]*\]\([^)]+\)|<Screenshot\b[^>]*>/g)];
  for (const match of imgs) {
    const tag = match[0];
    if (tag.startsWith("![") && tag.startsWith("![]")) {
      errors.push(`${path.relative(root, file)} image missing alt text`);
    }
    if (tag.startsWith("<Screenshot") && !/alt=/.test(tag)) {
      errors.push(`${path.relative(root, file)} Screenshot missing alt`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("content policy ok");
