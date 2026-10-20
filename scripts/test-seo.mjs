import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

// Parse CLI flags
const args = process.argv.slice(2);
const appFlagIdx = args.indexOf("--app");
const targetApp = appFlagIdx !== -1 ? args[appFlagIdx + 1] : process.env.APP || "all";

console.log(`=== Running Automated SEO Verification Test Suite (Target: ${targetApp}) ===\n`);

let passedTests = 0;

function pass(name) {
  passedTests++;
  console.log(`  ✔ [PASS] ${name}`);
}

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

const checkDocs = targetApp === "all" || targetApp === "docs";
const checkSocs = targetApp === "all" || targetApp === "socs";

// ============================================================================
// 1. MDX Frontmatter SEO Quality
// ============================================================================
console.log("--- Test 1: MDX Frontmatter SEO Quality ---");
const docsMdx = checkDocs ? walk(path.join(root, "apps/docs/content/docs")) : [];
const socsMdx = checkSocs ? walk(path.join(root, "apps/socs/content/docs")) : [];
const allMdx = [...docsMdx, ...socsMdx];

assert.ok(allMdx.length > 0, "No MDX files found to test");

for (const filePath of allMdx) {
  const content = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(root, filePath);
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fmMatch, `${rel} must have valid YAML frontmatter`);

  const fm = fmMatch[1];
  const titleMatch = fm.match(/^title:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);

  assert.ok(titleMatch && titleMatch[1].trim().length > 0, `${rel} missing frontmatter title`);
  assert.ok(descMatch && descMatch[1].trim().length >= 20, `${rel} description must be at least 20 chars, got: "${descMatch?.[1]}"`);
}
pass(`Verified frontmatter title and description quality across all ${allMdx.length} MDX files`);


// ============================================================================
// 2. Production Build Artifacts Audit (Sitemaps, Robots.txt, SSG HTML)
// ============================================================================
console.log("\n--- Test 2: Production Build Artifacts (Sitemaps & Robots.txt) ---");

const bannedHosts = ["localhost", "127.0.0.1", "dev.cerebronix.com", "staging.cerebronix.com"];

const docsSitemapPath = path.join(root, "apps/docs/.next/server/app/sitemap.xml.body");
const socsSitemapPath = path.join(root, "apps/socs/.next/server/app/sitemap.xml.body");
const docsRobotsPath = path.join(root, "apps/docs/.next/server/app/robots.txt.body");
const socsRobotsPath = path.join(root, "apps/socs/.next/server/app/robots.txt.body");

const docsHasBuild = fs.existsSync(docsSitemapPath) && fs.existsSync(docsRobotsPath);
const socsHasBuild = fs.existsSync(socsSitemapPath) && fs.existsSync(socsRobotsPath);

if (checkDocs && !docsHasBuild && (process.argv.includes("--require-build") || process.env.REQUIRE_BUILD)) {
  assert.fail("Docs build artifacts missing. Run build first.");
}
if (checkSocs && !socsHasBuild && (process.argv.includes("--require-build") || process.env.REQUIRE_BUILD)) {
  assert.fail("Socs build artifacts missing. Run build first.");
}

const docsUrls = [];
const socsUrls = [];

if (checkDocs && docsHasBuild) {
  const docsXml = fs.readFileSync(docsSitemapPath, "utf8");
  assert.ok(docsXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Docs sitemap missing XML header");
  assert.ok(docsXml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Docs sitemap missing sitemaps.org schema");

  const urls = [...docsXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  docsUrls.push(...urls);

  assert.ok(urls.length >= 70, `Expected at least 70 docs URLs, got ${urls.length}`);
  for (const u of urls) {
    assert.ok(u.startsWith("https://docs.cerebronix.com"), `Docs URL must start with https://docs.cerebronix.com: ${u}`);
    for (const bh of bannedHosts) {
      assert.ok(!u.includes(bh), `Docs sitemap URL must not contain non-prod host ${bh}: ${u}`);
    }
  }
  assert.ok(!urls.includes("https://docs.cerebronix.com/docs"), "Docs sitemap must not include redirecting /docs");
  assert.ok(!urls.some(u => u.includes("/api/")), "Docs sitemap must not include /api/ endpoints");
  assert.ok(!urls.some(u => u.includes("/llms")), "Docs sitemap must not include llms endpoints");

  const unique = new Set(urls);
  assert.equal(unique.size, urls.length, "Docs sitemap contains duplicate URLs");

  const docsRobots = fs.readFileSync(docsRobotsPath, "utf8");
  assert.match(docsRobots, /User-Agent:\s*\*/i);
  assert.match(docsRobots, /Allow:\s*\//i);
  assert.match(docsRobots, /Disallow:\s*\/api\//i);
  assert.match(docsRobots, /Sitemap:\s*https:\/\/docs\.cerebronix\.com\/sitemap\.xml/i);

  pass(`Docs sitemap (${urls.length} canonical URLs) & robots.txt verified`);
}

if (checkSocs && socsHasBuild) {
  const socsXml = fs.readFileSync(socsSitemapPath, "utf8");
  assert.ok(socsXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Socs sitemap missing XML header");
  assert.ok(socsXml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Socs sitemap missing sitemaps.org schema");

  const urls = [...socsXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  socsUrls.push(...urls);

  assert.ok(urls.length >= 25, `Expected at least 25 socs URLs, got ${urls.length}`);
  for (const u of urls) {
    assert.ok(u.startsWith("https://developer.cerebronix.com"), `Socs URL must start with https://developer.cerebronix.com: ${u}`);
    for (const bh of bannedHosts) {
      assert.ok(!u.includes(bh), `Socs sitemap URL must not contain non-prod host ${bh}: ${u}`);
    }
  }
  assert.ok(!urls.includes("https://developer.cerebronix.com/docs"), "Socs sitemap must not include redirecting /docs");
  assert.ok(!urls.some(u => u.includes("/api/")), "Socs sitemap must not include /api/ endpoints");
  assert.ok(!urls.some(u => u.includes("/llms")), "Socs sitemap must not include llms endpoints");

  const unique = new Set(urls);
  assert.equal(unique.size, urls.length, "Socs sitemap contains duplicate URLs");

  const socsRobots = fs.readFileSync(socsRobotsPath, "utf8");
  assert.match(socsRobots, /User-Agent:\s*\*/i);
  assert.match(socsRobots, /Allow:\s*\//i);
  assert.match(socsRobots, /Disallow:\s*\/api\//i);
  assert.match(socsRobots, /Sitemap:\s*https:\/\/developer\.cerebronix\.com\/sitemap\.xml/i);

  pass(`Developer sitemap (${urls.length} canonical URLs) & robots.txt verified`);
}


// ============================================================================
// 3. Pre-Rendered HTML Metadata & Structured Data Validation (SSG)
// ============================================================================
console.log("\n--- Test 3: Pre-Rendered HTML Metadata, Open Graph & Structured Data (SSG) ---");

if (checkDocs && docsHasBuild) {
  const docsHomeHtml = fs.readFileSync(path.join(root, "apps/docs/.next/server/app/index.html"), "utf8");
  assert.match(docsHomeHtml, /<link[^>]*rel="canonical"[^>]*href="https:\/\/docs\.cerebronix\.com"/);
  assert.match(docsHomeHtml, /<meta[^>]*property="og:url"[^>]*content="https:\/\/docs\.cerebronix\.com"/);
  assert.match(docsHomeHtml, /"@type":"WebSite"/);

  const docsHtmlFiles = walk(path.join(root, "apps/docs/.next/server/app/docs"), ".html");
  assert.ok(docsHtmlFiles.length >= 69, `Expected >= 69 docs html files, found ${docsHtmlFiles.length}`);

  for (const file of docsHtmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);

    // Canonical tag matches sitemap entry
    const canMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert.ok(canMatch, `${rel} missing canonical link`);
    assert.ok(canMatch[1].startsWith("https://docs.cerebronix.com/docs/"), `${rel} canonical must start with https://docs.cerebronix.com/docs/`);
    assert.ok(docsUrls.includes(canMatch[1]), `${rel} canonical URL (${canMatch[1]}) must exist in sitemap.xml`);

    // Open Graph
    assert.match(html, /<meta[^>]*property="og:title"/, `${rel} missing og:title`);
    assert.match(html, /<meta[^>]*property="og:description"/, `${rel} missing og:description`);
    assert.match(html, /<meta[^>]*property="og:url"/, `${rel} missing og:url`);

    // Verify Open Graph image URL resolves to generated asset
    const ogImgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
    assert.ok(ogImgMatch, `${rel} missing og:image`);
    const ogImgUrl = ogImgMatch[1];
    assert.ok(ogImgUrl.startsWith("https://docs.cerebronix.com/og/docs/"), `${rel} og:image must start with origin: ${ogImgUrl}`);
    const ogRelativePath = ogImgUrl.replace("https://docs.cerebronix.com/og/docs/", "").replace("/image.png", "");
    const generatedOgBody = path.join(root, "apps/docs/.next/server/app/og/docs", ogRelativePath, "image.png.body");
    assert.ok(fs.existsSync(generatedOgBody), `${rel} OG image asset not found at ${generatedOgBody}`);

    // Twitter Card
    assert.match(html, /<meta[^>]*name="twitter:card"[^>]*content="summary_large_image"/, `${rel} missing twitter:card`);

    // Robots
    assert.match(html, /<meta[^>]*name="robots"[^>]*content="index, follow"/, `${rel} missing robots tag`);

    // Structured Data (JSON-LD)
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `${rel} missing JSON-LD script`);
    const ldData = JSON.parse(ldMatch[1]);
    const breadcrumb = ldData.find(s => s["@type"] === "BreadcrumbList");
    const article = ldData.find(s => s["@type"] === "TechArticle");

    assert.ok(breadcrumb, `${rel} missing BreadcrumbList schema`);
    assert.equal(breadcrumb.itemListElement[0].item, "https://docs.cerebronix.com");
    assert.ok(article, `${rel} missing TechArticle schema`);
    assert.equal(article.url, canMatch[1], `${rel} TechArticle URL must match canonical URL`);
    assert.equal(article.author?.name, "Cerebronix");
    assert.equal(article.publisher?.name, "Cerebronix");
  }
  pass(`Validated canonical links, OG image routes, Twitter cards, and JSON-LD for ${docsHtmlFiles.length} Product doc pages`);
}

if (checkSocs && socsHasBuild) {
  const socsHomeHtml = fs.readFileSync(path.join(root, "apps/socs/.next/server/app/index.html"), "utf8");
  assert.match(socsHomeHtml, /<link[^>]*rel="canonical"[^>]*href="https:\/\/developer\.cerebronix\.com"/);
  assert.match(socsHomeHtml, /<meta[^>]*property="og:url"[^>]*content="https:\/\/developer\.cerebronix\.com"/);
  assert.match(socsHomeHtml, /"@type":"WebSite"/);

  const socsHtmlFiles = walk(path.join(root, "apps/socs/.next/server/app/docs"), ".html");
  assert.ok(socsHtmlFiles.length >= 24, `Expected >= 24 socs html files, found ${socsHtmlFiles.length}`);

  for (const file of socsHtmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);

    // Canonical tag matches sitemap entry
    const canMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert.ok(canMatch, `${rel} missing canonical link`);
    assert.ok(canMatch[1].startsWith("https://developer.cerebronix.com/docs/"), `${rel} canonical must start with https://developer.cerebronix.com/docs/`);
    assert.ok(socsUrls.includes(canMatch[1]), `${rel} canonical URL (${canMatch[1]}) must exist in sitemap.xml`);

    // Open Graph
    assert.match(html, /<meta[^>]*property="og:title"/, `${rel} missing og:title`);
    assert.match(html, /<meta[^>]*property="og:description"/, `${rel} missing og:description`);
    assert.match(html, /<meta[^>]*property="og:url"/, `${rel} missing og:url`);

    // Verify Open Graph image URL resolves to generated asset
    const ogImgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
    assert.ok(ogImgMatch, `${rel} missing og:image`);
    const ogImgUrl = ogImgMatch[1];
    assert.ok(ogImgUrl.startsWith("https://developer.cerebronix.com/og/docs/"), `${rel} og:image must start with origin: ${ogImgUrl}`);
    const ogRelativePath = ogImgUrl.replace("https://developer.cerebronix.com/og/docs/", "").replace("/image.png", "");
    const generatedOgBody = path.join(root, "apps/socs/.next/server/app/og/docs", ogRelativePath, "image.png.body");
    assert.ok(fs.existsSync(generatedOgBody), `${rel} OG image asset not found at ${generatedOgBody}`);

    // Twitter Card
    assert.match(html, /<meta[^>]*name="twitter:card"[^>]*content="summary_large_image"/, `${rel} missing twitter:card`);

    // Robots
    assert.match(html, /<meta[^>]*name="robots"[^>]*content="index, follow"/, `${rel} missing robots tag`);

    // Structured Data (JSON-LD)
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, `${rel} missing JSON-LD script`);
    const ldData = JSON.parse(ldMatch[1]);
    const breadcrumb = ldData.find(s => s["@type"] === "BreadcrumbList");
    const article = ldData.find(s => s["@type"] === "TechArticle");

    assert.ok(breadcrumb, `${rel} missing BreadcrumbList schema`);
    assert.equal(breadcrumb.itemListElement[0].item, "https://developer.cerebronix.com");
    assert.ok(article, `${rel} missing TechArticle schema`);
    assert.equal(article.url, canMatch[1], `${rel} TechArticle URL must match canonical URL`);
    assert.equal(article.author?.name, "Cerebronix");
    assert.equal(article.publisher?.name, "Cerebronix");
  }
  pass(`Validated canonical links, OG image routes, Twitter cards, and JSON-LD for ${socsHtmlFiles.length} Developer doc pages`);
}


// ============================================================================
// 4. Content Disclosure / Black-Box Architecture Scanner on SEO Metadata
// ============================================================================
console.log("\n--- Test 4: Black-Box Disclosure Check on All SEO Artifacts ---");
const bannedTerms = [
  "saastronix",
  "lexatronix",
  "logatronix",
  "milvus",
  "nats",
  "lago",
  "oathkeeper",
  "kratos",
  "cluster.local",
  "fuma-nama",
];

const filesToScan = [];
if (checkDocs && docsHasBuild) {
  filesToScan.push(path.join(root, "apps/docs/.next/server/app/index.html"));
  filesToScan.push(docsSitemapPath);
  filesToScan.push(docsRobotsPath);
  filesToScan.push(...walk(path.join(root, "apps/docs/.next/server/app/docs"), ".html"));
}
if (checkSocs && socsHasBuild) {
  filesToScan.push(path.join(root, "apps/socs/.next/server/app/index.html"));
  filesToScan.push(socsSitemapPath);
  filesToScan.push(socsRobotsPath);
  filesToScan.push(...walk(path.join(root, "apps/socs/.next/server/app/docs"), ".html"));
}

for (const file of filesToScan) {
  const content = fs.readFileSync(file, "utf8").toLowerCase();
  const rel = path.relative(root, file);

  for (const term of bannedTerms) {
    assert.ok(!content.includes(term), `${rel} contains forbidden disclosure: "${term}"`);
  }
}
pass(`Zero internal architecture disclosures across all ${filesToScan.length} SEO files`);

console.log(`\n=======================================================`);
console.log(`🎉 ALL ${passedTests} SEO VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
console.log(`=======================================================\n`);
