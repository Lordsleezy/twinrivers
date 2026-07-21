import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
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

const files = walk(root);
let missingCanonical = [];
let brokenViewport = [];
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  if (!/rel=["']canonical["']/i.test(html)) missingCanonical.push(f);
  if (/<parameter name="viewport"/.test(html)) brokenViewport.push(f);
}

console.log("Total real pages checked:", files.length);
console.log("Missing canonical:", missingCanonical.length);
missingCanonical.forEach((m) => console.log("  -", path.relative(root, m)));
console.log("Broken viewport tags remaining:", brokenViewport.length);
brokenViewport.forEach((m) => console.log("  -", path.relative(root, m)));

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const urlCount = (sitemap.match(/<loc>/g) || []).length;
const badDomain = (sitemap.match(/twinriversllc\.org/g) || []).length;
console.log("Sitemap URL count:", urlCount);
console.log("Sitemap twinriversllc.org occurrences:", badDomain);
