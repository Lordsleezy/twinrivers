const crypto = require("crypto");

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
    lead_id: clip(data.lead_id, 80),
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

function getBlobsStore(event) {
  const blobs = require("@netlify/blobs");
  if (typeof blobs.connectLambda === "function" && event) {
    try {
      blobs.connectLambda(event);
    } catch (error) {}
  }
  return blobs.getStore({ name: STORE_NAME, consistency: "strong" });
}

async function upsertLead(event, lead) {
  const store = getBlobsStore(event);
  const existing = await store.get("by-id/" + lead.lead_id, { type: "json" });
  if (existing && existing.lead_id) {
    return { lead: existing, duplicate: true };
  }
  await store.setJSON("by-id/" + lead.lead_id, lead);
  const monthKey = monthKeyFromIso(lead.submitted_at);
  const monthIds = (await store.get("months/" + monthKey, { type: "json" })) || [];
  if (!monthIds.includes(lead.lead_id)) {
    monthIds.push(lead.lead_id);
    await store.setJSON("months/" + monthKey, monthIds);
  }
  return { lead, duplicate: false };
}

const rateWindow = new Map();
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(payload),
  };
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

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, { ok: true });
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const ip = clientIp(event);
  if (rateLimited(ip)) {
    return json(429, { ok: false, error: "Too many requests" });
  }

  const data = parseBody(event);
  if (data.__tooLarge) {
    return json(413, { ok: false, error: "Request too large" });
  }
  if (data["bot-field"]) {
    return json(200, { ok: true, ignored: true });
  }

  if (digits(data.phone).length < 10) {
    return json(400, { ok: false, error: "A valid phone number is required." });
  }

  const host = String(event.headers.host || event.headers.Host || "");
  const lead = normalizeLead(
    {
      ...data,
      lead_id: clip(data.lead_id, 80) || newLeadId(),
      form_name: clip(data.form_name || data["form-name"], 80) || "instant-quote",
      lead_type: clip(data.lead_type, 80) || "fence-quote",
    },
    { host }
  );

  if (!lead.lead_id) {
    return json(400, { ok: false, error: "Invalid lead." });
  }

  try {
    const result = await upsertLead(event, lead);
    return json(200, { ok: true, lead_id: result.lead.lead_id, duplicate: result.duplicate });
  } catch (error) {
    console.error("lead-ingest failed", error && error.message);
    return json(503, { ok: false, error: "Lead ledger unavailable." });
  }
};
