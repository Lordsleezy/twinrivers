/**
 * Batch-fix Twin Rivers flagship HTML:
 * - broken <parameter name="viewport"> tags
 * - missing self-referencing canonicals
 */
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
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function pageUrl(filePath) {
  const rel = path.relative(root, filePath).split(path.sep).join("/");
  if (rel === "index.html") return `${domain}/`;
  if (rel === "404.html") return `${domain}/404.html`;
  if (rel.endsWith("/index.html")) return `${domain}/${rel.slice(0, -"index.html".length)}`;
  return `${domain}/${rel}`;
}

let viewportFixes = 0;
let canonicalAdds = 0;

for (const file of walk(root)) {
  let html = fs.readFileSync(file, "utf8");
  const original = html;

  if (html.includes("<parameter name=\"viewport\"")) {
    html = html.replace(/<parameter name="viewport" content="width=device-width, initial-scale=1\.0">/g, '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    viewportFixes++;
  }

  const url = pageUrl(file);
  if (!/rel=["']canonical["']/i.test(html) && !file.endsWith(`${path.sep}404.html`)) {
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>\n<link rel="canonical" href="${url}">`);
      canonicalAdds++;
    }
  }

  if (html !== original) fs.writeFileSync(file, html);
}

console.log(`Viewport fixes: ${viewportFixes}`);
console.log(`Canonicals added: ${canonicalAdds}`);
