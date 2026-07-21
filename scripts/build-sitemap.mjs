import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const domain = "https://twinriversfence.com";
const skipDirs = new Set(["node_modules", ".git", "admin", "templates", "server", "scripts", "screenshots", ".netlify"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && (entry.name === "index.html" || entry.name === "privacy.html" || entry.name === "terms.html")) {
      files.push(full);
    }
  }
  return files;
}

function toUrl(filePath) {
  const rel = path.relative(root, filePath).split(path.sep).join("/");
  if (rel === "index.html") return `${domain}/`;
  if (rel.endsWith("/index.html")) return `${domain}/${rel.slice(0, -"index.html".length)}`;
  return `${domain}/${rel}`;
}

const files = walk(root);
const urls = [...new Set(files.map(toUrl))].sort();
const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
console.log(`Wrote ${urls.length} URLs to sitemap.xml`);
const bad = urls.filter((u) => u.includes("twinriversllc.org") || u.includes("www."));
if (bad.length) {
  console.error("Bad URLs:", bad);
  process.exit(1);
}
