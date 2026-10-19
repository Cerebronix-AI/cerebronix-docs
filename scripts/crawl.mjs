import http from 'http';

const BASE = 'http://localhost:4000';
const visited = new Set();
const queue = ['/docs'];
const broken = [];

async function get(path) {
  return new Promise((resolve) => {
    http.get(BASE + path, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith(BASE)) loc = loc.slice(BASE.length);
        resolve(get(loc));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', (err) => resolve({ status: 500, error: err }));
  });
}

function extractLinks(html) {
  const links = [];
  const regex = /href="(\/docs[^"#?]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

console.log('Starting documentation crawler at ' + BASE);

while (queue.length > 0) {
  const current = queue.shift();
  if (visited.has(current)) continue;
  visited.add(current);

  const res = await get(current);
  if (res.status >= 400) {
    broken.push({ path: current, status: res.status });
    console.error(`❌ [${res.status}] ${current}`);
  } else {
    // extract links
    const found = extractLinks(res.body);
    for (const link of found) {
      if (!visited.has(link) && !queue.includes(link)) {
        queue.push(link);
      }
    }
  }
}

console.log(`\nCrawl complete. Checked ${visited.size} pages.`);
if (broken.length === 0) {
  console.log('✅ 0 broken links found! All pages resolve with 200 OK.');
  process.exit(0);
} else {
  console.error(`❌ Found ${broken.length} broken links:`, broken);
  process.exit(1);
}
