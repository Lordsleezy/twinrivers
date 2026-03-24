import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const GRASS = path.join(REPO, "..", "grassvalley-site", "index.html");
const ASSETS = path.join(REPO, "assets");

const HEAD_START = "<!-- twinrivers-lead-chat:head-start -->";
const HEAD_END = "<!-- twinrivers-lead-chat:head-end -->";
const BODY_START = "<!-- twinrivers-lead-chat:body-start -->";
const BODY_END = "<!-- twinrivers-lead-chat:body-end -->";

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, out);
    else if (ent.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function relPrefix(filePath) {
  const relDir = path.dirname(path.relative(REPO, filePath));
  if (!relDir || relDir === ".") return "";
  const depth = relDir.split(path.sep).filter(Boolean).length;
  return "../".repeat(depth);
}

function stripInjection(html) {
  html = html.replace(
    new RegExp(
      `\\s*${escapeRe(HEAD_START)}[\\s\\S]*?${escapeRe(HEAD_END)}\\s*`,
      "i"
    ),
    "\n"
  );
  html = html.replace(
    new RegExp(
      `\\s*${escapeRe(BODY_START)}[\\s\\S]*?${escapeRe(BODY_END)}\\s*`,
      "i"
    ),
    "\n"
  );
  return html;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLeadChatCss(html) {
  const a = html.indexOf("/* Twin Rivers lead chat (Netlify) */");
  if (a < 0) throw new Error("Lead chat CSS marker not found in grassvalley-site index.html");
  const b = html.indexOf(".topbar-inner", a);
  if (b < 0) throw new Error(".topbar-inner not found after chat CSS");
  let slice = html.slice(a, b);
  slice = slice.replace(/^ {4}/gm, "");
  return `/* Twin Rivers lead chat — shared widget */\n${slice.trim()}\n`;
}

function extractLeadChatJs(html) {
  const needle = '<script>\n  (function () {\n    "use strict";\n\n    var STORAGE_KEY';
  const start = html.indexOf(needle);
  if (start < 0) throw new Error("Lead chat script start not found");
  const scriptOpen = html.lastIndexOf("<script>", start);
  const end = html.indexOf("})();\n  </script>", start);
  if (end < 0) throw new Error("Lead chat script end not found");
  const inner = html.slice(scriptOpen + "<script>".length, end + "})();".length).trim();
  return inner + "\n";
}

function buildBodySnippet(prefix) {
  return `${BODY_START}
<form name="lead-chat" method="POST" action="/" data-netlify="true" netlify>
  <input type="hidden" name="form-name" value="lead-chat">
  <p style="display:none;">
    <label>Project Type <input name="project_type"></label>
    <label>City <input name="city"></label>
    <label>Size <input name="size"></label>
    <label>Name <input name="name"></label>
    <label>Phone <input name="phone"></label>
  </p>
</form>
<div class="lead-chat-nudge" id="leadChatNudge" role="status" aria-live="polite">
  Want a quick fence estimate?
  <button type="button" id="leadChatNudgeBtn">Open chat</button>
</div>
<button type="button" class="lead-chat-toggle" id="leadChatToggle" aria-label="Open chat" aria-expanded="false" aria-controls="leadChatPanel">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
</button>
<div class="lead-chat-backdrop" id="leadChatBackdrop" hidden></div>
<section class="lead-chat-panel" id="leadChatPanel" role="dialog" aria-labelledby="leadChatTitle" aria-modal="true" hidden>
  <header class="lead-chat-header">
    <div>
      <h2 id="leadChatTitle">Twin Rivers Assistant</h2>
      <span>Usually replies instantly</span>
    </div>
    <button type="button" class="lead-chat-close" id="leadChatClose" aria-label="Close chat">×</button>
  </header>
  <div class="lead-chat-messages" id="leadChatMessages" role="log" aria-live="polite" aria-relevant="additions"></div>
  <div class="lead-chat-typing" id="leadChatTyping" aria-hidden="true">
    <span></span><span></span><span></span>
  </div>
  <div class="lead-chat-options" id="leadChatOptions" hidden></div>
  <p class="lead-chat-status" id="leadChatStatus"></p>
  <p class="lead-chat-consent" id="leadChatConsent">By submitting your information, you agree to be contacted by Twin Rivers Fence regarding your project.</p>
  <div class="lead-chat-input-row">
    <input type="text" id="leadChatInput" placeholder="Type your message…" autocomplete="section-chat" enterkeyhint="send">
    <button type="button" class="lead-chat-send" id="leadChatSend">Send</button>
  </div>
</section>
<script src="${prefix}assets/lead-chat.js" defer></script>
${BODY_END}`;
}

function skipTwinriversMobile(filePath) {
  const rel = path.relative(REPO, filePath).replace(/\\/g, "/");
  return rel.startsWith("admin/") || rel.startsWith("templates/");
}

function inject(html, filePath) {
  const prefix = relPrefix(filePath);
  html = stripInjection(html);

  const mobileLink = skipTwinriversMobile(filePath)
    ? ""
    : `<link rel="stylesheet" href="${prefix}assets/twinrivers-mobile.css">\n`;
  const headBlock = `\n${HEAD_START}\n<link rel="stylesheet" href="${prefix}assets/lead-chat.css">\n${mobileLink}${HEAD_END}\n`;
  const bodyBlock = `\n${buildBodySnippet(prefix)}\n`;

  const headClose = html.search(/<\/head>/i);
  if (headClose < 0) throw new Error("No </head> in " + filePath);
  html = html.slice(0, headClose) + headBlock + html.slice(headClose);

  const bodyClose = html.lastIndexOf("</body>");
  if (bodyClose < 0) throw new Error("No </body> in " + filePath);
  html = html.slice(0, bodyClose) + bodyBlock + html.slice(bodyClose);

  return html;
}

function main() {
  if (!fs.existsSync(GRASS)) {
    console.error("Missing source template:", GRASS);
    process.exit(1);
  }
  const master = fs.readFileSync(GRASS, "utf8").replace(/\r\n/g, "\n");
  fs.mkdirSync(ASSETS, { recursive: true });
  fs.writeFileSync(path.join(ASSETS, "lead-chat.css"), extractLeadChatCss(master));
  fs.writeFileSync(path.join(ASSETS, "lead-chat.js"), extractLeadChatJs(master));

  const files = walkHtml(REPO);
  let n = 0;
  for (const fp of files) {
    const base = path.basename(fp).toLowerCase();
    if (base === "privacy.html" || base === "terms.html") continue;
    let h = fs.readFileSync(fp, "utf8").replace(/\r\n/g, "\n");
    h = inject(h, fp);
    fs.writeFileSync(fp, h);
    n++;
    console.log("embedded:", path.relative(REPO, fp));
  }
  console.log("Done.", n, "HTML files, assets in assets/");
}

main();
