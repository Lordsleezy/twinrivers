import crypto from "node:crypto";

const STORE_NAME = "twin-rivers-leads";

function readBlobsContext(event) {
  const headers = (event && event.headers) || {};
  const candidates = [
    process.env.NETLIFY_BLOBS_CONTEXT,
    event && event.blobs,
    headers["x-nf-blobs-info"],
    headers["X-Nf-Blobs-Info"],
  ].filter(Boolean);
  for (const raw of candidates) {
    try {
      if (typeof raw === "object") return raw;
      const text = String(raw);
      const json = text.trim().startsWith("{") ? text : Buffer.from(text, "base64").toString("utf8");
      const parsed = JSON.parse(json);
      if (parsed && (parsed.siteID || parsed.site_id) && parsed.token) return parsed;
    } catch (error) {}
  }
  return null;
}

function blobUrl(ctx, key) {
  const siteID = ctx.siteID || ctx.site_id;
  const encodedKey = encodeURIComponent(key);
  if (ctx.edgeURL || ctx.edge_url) {
    return String(ctx.edgeURL || ctx.edge_url).replace(/\/$/, "") + "/" + siteID + "/" + encodeURIComponent(STORE_NAME) + "/" + encodedKey;
  }
  const api = String(ctx.apiURL || ctx.api_url || "https://api.netlify.com").replace(/\/$/, "");
  return api + "/api/v1/blobs/" + siteID + "/" + encodeURIComponent(STORE_NAME) + "/" + encodedKey;
}

function blobHeaders(ctx) {
  return {
    Authorization: "Bearer " + ctx.token,
    "Netlify-Consistency": "strong",
  };
}

async function blobGetJson(event, key) {
  const ctx = readBlobsContext(event);
  if (!ctx) throw new Error("blobs context missing");
  const res = await fetch(blobUrl(ctx, key), { headers: { ...blobHeaders(ctx), Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("blob get " + res.status);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function blobSetJson(event, key, value) {
  const ctx = readBlobsContext(event);
  if (!ctx) throw new Error("blobs context missing");
  const res = await fetch(blobUrl(ctx, key), {
    method: "PUT",
    headers: { ...blobHeaders(ctx), "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error("blob set " + res.status);
}

async function blobDelete(event, key) {
  const ctx = readBlobsContext(event);
  if (!ctx) throw new Error("blobs context missing");
  const res = await fetch(blobUrl(ctx, key), { method: "DELETE", headers: blobHeaders(ctx) });
  if (res.status !== 404 && !res.ok) throw new Error("blob delete " + res.status);
}

function monthKeyFromIso(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso || "").slice(0, 7);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  return parts.year + "-" + parts.month;
}

async function listMonth(event, year, month) {
  const monthKey = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0");
  const ids = (await blobGetJson(event, "months/" + monthKey)) || [];
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const leads = [];
  for (const id of uniqueIds) {
    const record = await blobGetJson(event, "by-id/" + id);
    if (record && record.lead_id) leads.push(record);
  }
  leads.sort((a, b) => String(a.submitted_at).localeCompare(String(b.submitted_at)));
  return { monthKey, leads };
}

async function deleteLead(event, leadId) {
  const id = String(leadId || "").trim();
  if (!id) return false;
  const existing = await blobGetJson(event, "by-id/" + id);
  await blobDelete(event, "by-id/" + id);
  if (existing && existing.submitted_at) {
    const monthKey = monthKeyFromIso(existing.submitted_at);
    const ids = (await blobGetJson(event, "months/" + monthKey)) || [];
    await blobSetJson(event, "months/" + monthKey, ids.filter((item) => item !== id));
  }
  return true;
}

const CSV_COLUMNS = [
  ["Date", "date"],
  ["Time", "time"],
  ["Name", "name"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["City", "city"],
  ["Source Site", "source_domain"],
  ["Source Page", "source_page"],
  ["Lead Type", "lead_type"],
  ["Form", "form_name"],
  ["Message", "message"],
  ["Project Details", "project_details"],
  ["Quote Details", "quote_details"],
  ["UTM Source", "utm_source"],
  ["UTM Medium", "utm_medium"],
  ["UTM Campaign", "utm_campaign"],
  ["UTM Term", "utm_term"],
  ["UTM Content", "utm_content"],
  ["Referrer", "referrer"],
  ["Lead ID", "lead_id"],
];

function unauthorized() {
  return {
    statusCode: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Twin Rivers Leads"',
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
    body: "Authentication required",
  };
}

function html(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
    body,
  };
}

function csvResponse(filename, body) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + filename + '"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
    body,
  };
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function checkAuth(event) {
  const expectedUser = process.env.LEAD_ADMIN_USER || "twinrivers";
  const expectedPass = process.env.LEAD_ADMIN_PASSWORD;
  if (!expectedPass) return "unconfigured";
  const header = String(event.headers.authorization || event.headers.Authorization || "");
  if (!header.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch (error) {
    return false;
  }
  const idx = decoded.indexOf(":");
  const user = idx === -1 ? decoded : decoded.slice(0, idx);
  const pass = idx === -1 ? "" : decoded.slice(idx + 1);
  return safeEqual(user, expectedUser) && safeEqual(pass, expectedPass);
}

function pacificParts(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    date: parts.year + "-" + parts.month + "-" + parts.day,
    time: parts.hour + ":" + parts.minute + ":" + parts.second,
  };
}

function csvEscape(value) {
  let text = String(value == null ? "" : value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  if (/[",\n\r]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function toCsv(leads) {
  const rows = [CSV_COLUMNS.map((col) => csvEscape(col[0])).join(",")];
  for (const lead of leads) {
    const stamp = pacificParts(lead.submitted_at);
    const mapped = { ...lead, ...stamp };
    rows.push(CSV_COLUMNS.map((col) => csvEscape(mapped[col[1]] || "")).join(","));
  }
  return "\uFEFF" + rows.join("\r\n") + "\r\n";
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseQuery(event) {
  const params = new URLSearchParams(event.rawQuery || "");
  if (event.queryStringParameters) {
    for (const [key, value] of Object.entries(event.queryStringParameters)) {
      if (value != null && !params.has(key)) params.set(key, value);
    }
  }
  return params;
}

function renderAdmin({ year, month, leads, notice }) {
  const rows = leads
    .slice()
    .reverse()
    .map((lead) => {
      const stamp = pacificParts(lead.submitted_at);
      return `<tr>
        <td>${escapeHtml(stamp.date)} ${escapeHtml(stamp.time)}</td>
        <td>${escapeHtml(lead.name)}</td>
        <td>${escapeHtml(lead.email)}</td>
        <td>${escapeHtml(lead.phone)}</td>
        <td>${escapeHtml(lead.city)}</td>
        <td>${escapeHtml(lead.source_domain)}<br>${escapeHtml(lead.form_name || "")}</td>
        <td>${escapeHtml(lead.lead_type || "")}</td>
        <td>
          <form method="POST" action="/admin/leads" onsubmit="return confirm('Delete this lead from the ledger?');">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="lead_id" value="${escapeHtml(lead.lead_id)}">
            <input type="hidden" name="year" value="${escapeHtml(year)}">
            <input type="hidden" name="month" value="${escapeHtml(month)}">
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Twin Rivers Lead Ledger</title>
<style>
  body { font-family: Georgia, serif; background: #fffaf2; color: #24324a; margin: 0; padding: 2rem 1.2rem 4rem; }
  main { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 1.8rem; margin: 0 0 .4rem; }
  p, label { color: #68748a; }
  form.filters, .summary { display: flex; flex-wrap: wrap; gap: .8rem; align-items: end; margin: 1.2rem 0; }
  select, button { font: inherit; min-height: 44px; padding: .5rem .8rem; border-radius: 4px; }
  select { border: 1px solid #cbd7e7; background: #fff; }
  button, .download { border: 0; background: #ff6b5b; color: #fff; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; }
  table { width: 100%; border-collapse: collapse; background: #fff; }
  th, td { border-bottom: 1px solid #e4ecf5; text-align: left; padding: .65rem .5rem; font-size: .92rem; vertical-align: top; }
  th { color: #68748a; font-size: .78rem; letter-spacing: .06em; text-transform: uppercase; }
  .notice { color: #0f7a4a; }
  td form { margin: 0; }
  td button { min-height: 36px; background: #24324a; }
</style>
</head>
<body>
<main>
  <h1>Twin Rivers monthly leads</h1>
  <p>Private customer ledger. Download one month at a time.</p>
  ${notice ? `<p class="notice">${escapeHtml(notice)}</p>` : ""}
  <form class="filters" method="GET" action="/admin/leads">
    <label>Year
      <select name="year">${[2025, 2026, 2027, 2028]
        .map((item) => `<option value="${item}"${String(item) === String(year) ? " selected" : ""}>${item}</option>`)
        .join("")}</select>
    </label>
    <label>Month
      <select name="month">${Array.from({ length: 12 }, (_, i) => {
        const value = String(i + 1).padStart(2, "0");
        const label = new Date(2026, i, 1).toLocaleString("en-US", { month: "long" });
        return `<option value="${value}"${value === String(month).padStart(2, "0") ? " selected" : ""}>${label}</option>`;
      }).join("")}</select>
    </label>
    <button type="submit">View month</button>
    <a class="download" href="/admin/leads?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}&download=1">Download CSV</a>
    <a class="download" href="/admin/leads/history" style="background:#24324a">Historical backfill</a>
  </form>
  <p class="summary"><strong>Total Leads: ${leads.length}</strong></p>
  <table>
    <thead><tr><th>Submitted</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Source / Form</th><th>Type</th><th></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="8">No leads stored for this month.</td></tr>`}</tbody>
  </table>
</main>
</body>
</html>`;
}

async function runHandler(event) {
  const auth = checkAuth(event);
  if (auth === "unconfigured") {
    return html(
      503,
      "<!DOCTYPE html><html><body><p>Lead admin is not configured. Set LEAD_ADMIN_PASSWORD in Netlify environment variables.</p></body></html>"
    );
  }
  if (!auth) return unauthorized();

  const now = new Date();
  const pacific = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit" }).formatToParts(now);
  const parts = Object.fromEntries(pacific.map((part) => [part.type, part.value]));
  let year = parts.year;
  let month = parts.month;
  let notice = "";

  if (event.httpMethod === "POST") {
    const raw = event.body || "";
    const decoded = event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf8") : raw;
    const form = Object.fromEntries(new URLSearchParams(decoded));
    year = form.year || year;
    month = form.month || month;
    if (form.action === "delete" && form.lead_id) {
      try {
        await deleteLead(event, form.lead_id);
        notice = "Lead removed from the ledger.";
      } catch (error) {
        console.error("lead delete failed", error && error.message);
        notice = "Could not delete that lead.";
      }
    }
  }

  const query = parseQuery(event);
  year = query.get("year") || year;
  month = query.get("month") || month;
  let monthKey = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0");
  let leads = [];
  try {
    const listed = await listMonth(event, year, month);
    monthKey = listed.monthKey;
    leads = listed.leads;
  } catch (error) {
    console.error("lead list failed", error && error.message);
    notice = notice || "Lead storage is temporarily unavailable.";
  }

  if (query.get("download") === "1" || query.get("format") === "csv") {
    return csvResponse("twin-rivers-leads-" + monthKey + ".csv", toCsv(leads));
  }

  return html(200, renderAdmin({ year, month, leads, notice }));
};


export default async (request) => {
  const url = new URL(request.url);
  const event = {
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers),
    body: request.method === "GET" || request.method === "HEAD" ? "" : await request.text(),
    isBase64Encoded: false,
    rawQuery: url.search.replace(/^\?/, ""),
    queryStringParameters: Object.fromEntries(url.searchParams),
    blobs: process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext || null,
  };
  const result = await runHandler(event);
  return new Response(result.body || "", { status: result.statusCode, headers: result.headers || {} });
};
