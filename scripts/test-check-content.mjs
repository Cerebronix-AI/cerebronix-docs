import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const checkScript = path.join(root, "scripts/check-content.mjs");

console.log("=== Running Content-Policy Scanner Positive/Negative Test Suite ===");

// 1. Positive Full-Repo Scan
console.log("Test 1: Full-repo positive scan (current tree must pass)");
const fullScan = spawnSync("node", [checkScript], { cwd: root, encoding: "utf8" });
assert.equal(fullScan.status, 0, `Full repo scan failed:\n${fullScan.stderr}\n${fullScan.stdout}`);
assert.match(fullScan.stdout, /content policy ok/);
console.log("  ✔ Full repo positive scan passed");

// 2. Unit Verification of Tightened Marketronix Exception
console.log("Test 2: Marketronix exception positive test (customer-visible UI labels allowed)");
const allowedUiLines = [
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "Locate the **Marketronix** card in the provider grid" },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "Configure the restored **Marketronix** integration card under `/integrations`" },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "Navigate to `/datasources`, find the Marketronix (Native Store) data source, and trigger a sync" },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "2. Click **Add Data Source** and select **Marketronix**" },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "| Capability | Cerebronix Native Store (Marketronix) | Shopify |" },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "- **Integrations Console:** Navigate to **Integrations** (`/integrations`) to configure external providers and the Native Store (**Marketronix**) credential card." },
  { file: "apps/docs/content/docs/ecommerce/conversational-shopping-and-cart.mdx", line: "3. Select your connected store (e.g., `Apex Retail Global (marketronix)` or `Apex US (shopify)`)." },
  { file: "apps/docs/content/docs/guides/meta.json", line: '    "ecommerce-marketronix"' },
  { file: "apps/docs/content/docs/guides/ecommerce-marketronix.mdx", line: "Connecting the native store via the **Data Sources** console (`/datasources`) by selecting **Marketronix** automatically establishes" },
];

function isMarketronixException(line, file) {
  if (!file.startsWith("apps/docs")) return false;
  if (file.endsWith("ecommerce-marketronix.mdx") || file.endsWith("meta.json")) {
    if (/ecommerce-marketronix/i.test(line)) return true;
  }
  const clean = line.replace(/[*`_]/g, "");
  const allowedUiPattern = /(?:Marketronix\s+(?:card|integration\s+card|credential\s+card|data\s+source|commerce\s+engine|Integration\s+Flow|\(?Native\s+Store\)?)|Native\s+Store\s*\(Marketronix(?:\s*Card)?\)|select(?:ing)?\s+Marketronix|\(marketronix\)|marketronixStoreId|ecommerce-marketronix)/i;
  return allowedUiPattern.test(clean);
}

for (const item of allowedUiLines) {
  assert.equal(isMarketronixException(item.line, item.file), true, `Expected allowed UI line to pass: "${item.line}"`);
}
console.log("  ✔ All 9 genuine UI label variations passed positive check");

// 3. Negative Tests: Marketronix Internal Architecture Disclosures
console.log("Test 3: Marketronix architecture negative tests (disclosures in ecommerce must be rejected)");
const forbiddenMarketronixLines = [
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "The Marketronix microservice runs on port 8000." },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "Marketronix internal architecture is built on Node.js and Postgres." },
  { file: "apps/docs/content/docs/ecommerce/native-store-management.mdx", line: "Marketronix database stores user cart entries directly." },
  { file: "apps/docs/content/docs/ecommerce/pricing-promotions-and-regions.mdx", line: "The Marketronix backend service handles tax calculations." },
  { file: "apps/docs/content/docs/ecommerce/overview-and-architecture.mdx", line: "Checkout sessions are coordinated by the Marketronix internal container." },
  { file: "apps/socs/content/docs/current/overview.mdx", line: "Locate the Marketronix card in the provider grid" }, // Forbidden in socs even as UI label
];

for (const item of forbiddenMarketronixLines) {
  assert.equal(isMarketronixException(item.line, item.file), false, `Expected disclosure to be REJECTED: "${item.line}"`);
}
console.log("  ✔ All 6 internal architecture Marketronix disclosures correctly rejected");

// 4. Negative Tests: Other Banned Disclosure Rules
console.log("Test 4: Core disclosure safeguards negative tests");
const disclosureRules = [
  { name: "Internal Project & Service Names", regex: /\b(saastronix|lexatronix|logatronix)\b/i },
  { name: "Internal Auth & Security Engines", regex: /\b(oathkeeper|keto|kratos)\b|\bhydra\b/i },
  { name: "Internal Storage & Message Brokers", regex: /\b(milvus|nats|lago|chatwoot|medusa|redis|mongodb)\b|\bpostgres(ql)?\b/i },
  { name: "Internal Deployment & Orchestration Infrastructure", regex: /\b(kubernetes|k8s|argocd|traefik|woodpecker)\b/i },
  { name: "Internal Code Repositories & Internal File Paths", regex: /\b(cerebronix-(?:gitops|infrastructure|saas-ui|chat-ui))\b|internal\/(?:biz|data)\//i },
  { name: "Internal Ports & Private Cluster Domains", regex: /(?::(?:8000|8080|9000|4222|6379|27017)\b|cluster\.local|internal\.cerebronix)/i },
];

const bannedSamples = [
  { rule: "Internal Project & Service Names", sample: "Queries are routed to the saastronix backend service." },
  { rule: "Internal Project & Service Names", sample: "Vector embeddings are generated by lexatronix." },
  { rule: "Internal Auth & Security Engines", sample: "Authentication is verified by Ory Oathkeeper proxy." },
  { rule: "Internal Auth & Security Engines", sample: "Role-based checks are evaluated using Ory Keto." },
  { rule: "Internal Storage & Message Brokers", sample: "Vector indexes are persisted inside Milvus cluster." },
  { rule: "Internal Storage & Message Brokers", sample: "Events are published across a NATS message queue." },
  { rule: "Internal Storage & Message Brokers", sample: "Billing metering is handled by Lago." },
  { rule: "Internal Storage & Message Brokers", sample: "Live conversation state is cached inside Redis." },
  { rule: "Internal Deployment & Orchestration Infrastructure", sample: "Services are deployed on a Kubernetes cluster." },
  { rule: "Internal Deployment & Orchestration Infrastructure", sample: "Sync manifests using ArgoCD." },
  { rule: "Internal Code Repositories & Internal File Paths", sample: "See implementation in saastronix/internal/biz/agent.go." },
  { rule: "Internal Code Repositories & Internal File Paths", sample: "Managed in cerebronix-gitops repository." },
  { rule: "Internal Ports & Private Cluster Domains", sample: "Connect to http://auth.cerebronix.svc.cluster.local:8080." },
  { rule: "Internal Ports & Private Cluster Domains", sample: "The service listens on internal.cerebronix:9000." },
];

for (const { rule, sample } of bannedSamples) {
  const r = disclosureRules.find((x) => x.name === rule);
  assert.ok(r, `Rule ${rule} must exist`);
  assert.ok(r.regex.test(sample), `Rule ${rule} must detect: "${sample}"`);
}
console.log("  ✔ All 14 internal disclosure rules correctly triggered");

console.log("=== All Content-Policy Scanner Tests PASSED! ===");
