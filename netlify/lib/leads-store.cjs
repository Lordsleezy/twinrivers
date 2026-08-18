const { getStore } = require("@netlify/blobs");

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

function getLeadStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
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

async function upsertLead(lead) {
  const store = getLeadStore();
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

async function listMonth(year, month) {
  const store = getLeadStore();
  const monthKey = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0");
  const ids = (await store.get("months/" + monthKey, { type: "json" })) || [];
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const leads = [];
  for (const id of uniqueIds) {
    const record = await store.get("by-id/" + id, { type: "json" });
    if (record && record.lead_id) leads.push(record);
  }
  leads.sort((a, b) => String(a.submitted_at).localeCompare(String(b.submitted_at)));
  return { monthKey, leads };
}

async function deleteLead(leadId) {
  const id = clip(leadId, 80);
  if (!id) return false;
  const store = getLeadStore();
  const existing = await store.get("by-id/" + id, { type: "json" });
  await store.delete("by-id/" + id);
  if (existing && existing.submitted_at) {
    const monthKey = monthKeyFromIso(existing.submitted_at);
    const ids = (await store.get("months/" + monthKey, { type: "json" })) || [];
    const next = ids.filter((item) => item !== id);
    await store.setJSON("months/" + monthKey, next);
  }
  return true;
}

module.exports = {
  ALLOWED_DOMAINS,
  clip,
  normalizeDomain,
  normalizeLead,
  upsertLead,
  listMonth,
  deleteLead,
  monthKeyFromIso,
};
