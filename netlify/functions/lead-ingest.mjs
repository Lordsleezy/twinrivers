import crypto from "node:crypto";

const STORE_NAME = "twin-rivers-leads";
const ALLOWED_DOMAINS = new Set([
  "twinriversfence.com",
  "rocklinfencing.com",
  "rosevillefencingca.com",
  "folsomfencing.com",
  "elkgrovefencing.com",
  "granitebayfencing.com",
  "grassvalleyfencing.com",
  "localhost",
]);

function clip(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function normalizeDomain(value) {
  return clip(value, 200)
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .split(":")[0]
    .toLowerCase();
}

function monthKeyFromIso(iso) {
  const stamp = clip(iso, 40);
  const match = stamp.match(/^(\d{4}-\d{2})/);
  if (match) return match[1];
  return new Date().toISOString().slice(0, 7);
}

function quoteDetailsFrom(data) {
  if (clip(data.quote_details, 4000)) return clip(data.quote_details, 4000);
  const parts = [];
  const fields = [
    ["fence_type", "Fence type"],
    ["height", "Height"],
    ["footage", "Linear feet"],
    ["gates", "Gates"],
    ["removal", "Removal"],
    ["estimated_range", "Estimated range"],
  ];
  for (const [key, label] of fields) {
    const value = clip(data[key], 120);
    if (value) parts.push(label + ": " + value);
  }
  return parts.join("\n");
}

function normalizeLead(data, context) {
  const now = new Date().toISOString();
  const claimedDomain = normalizeDomain(data.source_domain || data.source);
  const requestHost = normalizeDomain(context.host || "");
  const sourceDomain = ALLOWED_DOMAINS.has(claimedDomain)
    ? claimedDomain
    : ALLOWED_DOMAINS.has(requestHost)
      ? requestHost
      : claimedDomain || requestHost;

  return {
    lead_id: clip(data.lead_id, 160),
    submitted_at: clip(data.submitted_at, 40) || now,
    name: clip(data.name, 120),
    email: clip(data.email, 200),
    phone: clip(data.phone, 40),
    city: clip(data.city, 80),
    source_domain: sourceDomain,
    source_page: clip(data.source_page, 300),
    form_name: clip(data.form_name || data["form-name"], 80),
    lead_type: clip(data.lead_type, 80),
    message: clip(data.message || data.notes, 4000),
    project_details: clip(data.project_details, 4000),
    quote_details: quoteDetailsFrom(data),
    utm_source: clip(data.utm_source, 120),
    utm_medium: clip(data.utm_medium, 120),
    utm_campaign: clip(data.utm_campaign, 120),
    utm_term: clip(data.utm_term, 120),
    utm_content: clip(data.utm_content, 120),
    referrer: clip(data.referrer, 300),
  };
}

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

async function upsertLead(event, lead) {
  const existing = await blobGetJson(event, "by-id/" + lead.lead_id);
  if (existing && existing.lead_id) {
    return { lead: existing, duplicate: true };
  }
  await blobSetJson(event, "by-id/" + lead.lead_id, lead);
  const monthKey = monthKeyFromIso(lead.submitted_at);
  const monthIds = (await blobGetJson(event, "months/" + monthKey)) || [];
  if (!monthIds.includes(lead.lead_id)) {
    monthIds.push(lead.lead_id);
    await blobSetJson(event, "months/" + monthKey, monthIds);
  }
  return { lead, duplicate: false };
}

const CITY_GATE_SECRET = "trf-city-gate-v4";
const rateWindow = new Map();
const RATE_LIMIT = 6;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_MS = 4000;

function formProof(startedAt) {
  const s = String(startedAt || "");
  let n = 2166136261;
  for (let i = 0; i < s.length; i++) {
    n ^= s.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  return (n >>> 0).toString(16);
}

function cityGateToken(leadId) {
  return crypto.createHash("sha256").update(CITY_GATE_SECRET + "|" + String(leadId || "")).digest("hex").slice(0, 24);
}

function headerValue(event, name) {
  const headers = event.headers || {};
  return String(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "").trim();
}

function headerHost(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "").toLowerCase();
  } catch (error) {
    return "";
  }
}

function botUa(event) {
  const ua = headerValue(event, "user-agent").toLowerCase();
  return /python-requests|curl\/|scrapy|httpx|aiohttp|go-http-client|libwww-perl|php\/|java\/|wget|postman|insomnia|node-fetch|axios\/|okhttp|libcurl/.test(ua);
}

function phoneSane(phone) {
  const d = digits(phone);
  if (d.length < 10) return false;
  if (/^(\d)\1{9,}$/.test(d)) return false;
  const last10 = d.slice(-10);
  return !["1234567890", "0123456789", "9876543210", "5555555555", "1111111111"].includes(last10);
}

function powOk(data) {
  const started = clip(data.form_started_at, 80);
  const nonce = clip(data.form_pow, 20);
  if (!started || !/^\d+$/.test(nonce)) return false;
  if (Number(nonce) > 400000) return false;
  return formProof(started + ":" + nonce).slice(0, 3) === "000";
}

function cityGateOk(event, data) {
  const leadId = clip(data.lead_id, 160);
  const sent = headerValue(event, "x-fence-city");
  return Boolean(leadId && sent && sent === cityGateToken(leadId));
}

function browserGateOk(data, event) {
  const startedAt = data.form_started_at || "";
  const timing = timingReason(startedAt);
  const proofOk = clip(data.form_js, 40) === formProof(startedAt);
  const headerOk = headerValue(event, "x-fence-lead") === "1";
  const jsonOk = headerValue(event, "content-type").includes("application/json");
  const fetchOk = /^(same-origin|same-site)$/i.test(headerValue(event, "sec-fetch-site"));
  const cookieOk = /(?:^|;\s*)tr_js=1(?:;|$)/.test(headerValue(event, "cookie"));
  const intOk = Number(data.form_int) >= 2;
  const originHost = headerHost(headerValue(event, "origin") || headerValue(event, "referer"));
  const originOk = ALLOWED_DOMAINS.has(originHost) || originHost.endsWith(".netlify.app");
  const uaOk = !botUa(event);
  const workOk = powOk(data);
  return timing === "pass" && proofOk && headerOk && jsonOk && fetchOk && cookieOk && intOk && originOk && uaOk && workOk;
}

function requestOrigin(event) {
  const origin = clip(event.headers.origin || event.headers.Origin, 200);
  const host = normalizeDomain(origin);
  if (origin && ALLOWED_DOMAINS.has(host)) return origin;
  return "";
}

function json(statusCode, payload, event) {
  const origin = event ? requestOrigin(event) : "";
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(origin
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Headers": "Content-Type, X-Fence-Lead",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            Vary: "Origin",
          }
        : {}),
    },
    body: JSON.stringify(payload),
  };
}

function timingReason(startedAt) {
  if (!clip(startedAt, 40)) return "missing";
  const started = Date.parse(String(startedAt));
  if (!Number.isFinite(started)) return "invalid";
  if (Date.now() - started < MIN_FILL_MS) return "too-fast";
  return "pass";
}

async function verifyTurnstile(token, ip, startedAt) {
  const hasToken = Boolean(clip(token, 4000));
  const hasTiming = Boolean(clip(startedAt, 40));
  if (!hasToken && !hasTiming) return { ok: false, reason: "no-js-signal" };
  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) return { ok: false, reason: "secret-missing" };
  if (!hasToken) return { ok: false, reason: "token-missing" };
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: String(token),
        remoteip: ip || "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(data.success), reason: data.success ? "pass" : "siteverify-fail" };
  } catch (error) {
    return { ok: false, reason: "siteverify-error" };
  }
}

function parseBody(event) {
  const raw = event.body || "";
  const decoded = event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf8") : raw;
  if (decoded.length > 50000) return { __tooLarge: true };
  const contentType = String(event.headers["content-type"] || event.headers["Content-Type"] || "");
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(decoded || "{}");
    } catch (error) {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(decoded));
}

function clientIp(event) {
  return (
    clip(event.headers["x-nf-client-connection-ip"], 80) ||
    clip(event.headers["x-forwarded-for"], 200).split(",")[0].trim() ||
    "unknown"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  const bucket = rateWindow.get(ip) || [];
  const fresh = bucket.filter((stamp) => now - stamp < RATE_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT) {
    rateWindow.set(ip, fresh);
    return true;
  }
  fresh.push(now);
  rateWindow.set(ip, fresh);
  return false;
}

function digits(value) {
  return clip(value, 40).replace(/\D/g, "");
}

function newLeadId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
}

async function runHandler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, { ok: true }, event);
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" }, event);
  }

  const ip = clientIp(event);
  if (rateLimited(ip)) {
    return json(429, { ok: false, error: "Too many requests" }, event);
  }

  const data = parseBody(event);
  if (data.__tooLarge) {
    return json(413, { ok: false, error: "Request too large" }, event);
  }
  if (data["bot-field"] || clip(data.website, 200)) {
    return json(200, { ok: true, ignored: true }, event);
  }

  if (!cityGateOk(event, data) && !browserGateOk(data, event)) {
    console.warn(
      "lead-ingest blocked",
      "form=" + clip(data.form_name || data["form-name"], 80),
      "source=" + clip(data.source_domain || data.source, 80)
    );
    return json(400, { ok: false, error: "Verification failed." }, event);
  }

  if (!phoneSane(data.phone)) {
    return json(400, { ok: false, error: "A valid phone number is required." }, event);
  }

  const host = String(event.headers.host || event.headers.Host || "");
  const lead = normalizeLead(
    {
      ...data,
      lead_id: clip(data.lead_id, 160) || newLeadId(),
      form_name: clip(data.form_name || data["form-name"], 80) || "instant-quote",
      lead_type: clip(data.lead_type, 80) || "fence-quote",
    },
    { host }
  );

  if (!lead.lead_id) {
    return json(400, { ok: false, error: "Invalid lead." }, event);
  }

  try {
    const result = await upsertLead(event, lead);
    return json(200, { ok: true, lead_id: result.lead.lead_id, duplicate: result.duplicate }, event);
  } catch (error) {
    console.error("lead-ingest failed", error && error.message);
    return json(503, { ok: false, error: "Lead ledger unavailable." }, event);
  }
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
