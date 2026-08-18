const crypto = require("crypto");
const { clip, normalizeLead, upsertLead } = require("../lib/leads-store.cjs");

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
    const result = await upsertLead(lead);
    return json(200, { ok: true, lead_id: result.lead.lead_id, duplicate: result.duplicate });
  } catch (error) {
    console.error("lead-ingest failed", error && error.message);
    return json(503, { ok: false, error: "Lead ledger unavailable." });
  }
};
