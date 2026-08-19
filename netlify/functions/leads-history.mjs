import crypto from "node:crypto";

const STORE_NAME = "twin-rivers-leads";
const LAST_RUN_KEY = "meta/backfill-last-run.json";
const RANGE_START = new Date("2026-02-01T08:00:00.000Z");
const RANGE_END = new Date("2026-08-19T06:59:59.999Z");
const TWIN_RIVERS_SITE_ID = "2d936422-c5d4-40ca-b521-380d14c81015";
const KNOWN_SITES = [
  { domain: "twinriversfence.com", labels: ["twinrivers", "twin-rivers"] },
  { domain: "rocklinfencing.com", labels: ["rocklin"] },
  { domain: "rosevillefencingca.com", labels: ["roseville"] },
  { domain: "folsomfencing.com", labels: ["folsom"] },
  { domain: "elkgrovefencing.com", labels: ["elk-grove", "elkgrove"] },
  { domain: "granitebayfencing.com", labels: ["granite-bay", "granitebay"] },
  { domain: "grassvalleyfencing.com", labels: ["grass-valley", "grassvalley"] },
];
const DOMAIN_SET = new Set(KNOWN_SITES.map((site) => site.domain));
const EXPECTED_IMPORT = 25;
const SKIP_RESUBMIT_IDS = new Set([
  "netlify:4026f8ff-e2f9-4751-9dff-ecf8637e3488:6a7bd98a3f00db2d37c997e2",
  "netlify:2c9398fb-a826-49c1-98cf-42225bc3e4ed:6a6158e524978d55727b16a2",
]);

function clip(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function digits(value) {
  return clip(value, 40).replace(/\D/g, "");
}

function hostFromUrl(value) {
  return String(value || "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
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

function pacificDay(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso || "").slice(0, 10);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  return parts.year + "-" + parts.month + "-" + parts.day;
}

function fingerprint(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 12);
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  return { Authorization: "Bearer " + ctx.token, "Netlify-Consistency": "strong" };
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

function apiToken(event) {
  return process.env.NETLIFY_AUTH_TOKEN || (readBlobsContext(event) || {}).token || "";
}

async function netlifyGet(token, path) {
  const res = await fetch("https://api.netlify.com/api/v1" + path, {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = null;
  }
  if (!res.ok) {
    const err = new Error("Netlify API " + res.status);
    err.status = res.status;
    throw err;
  }
  return data;
}

function domainFromSite(site) {
  const hosts = [site.custom_domain, site.ssl_url, site.url, site.default_domain]
    .filter(Boolean)
    .map((value) => hostFromUrl(value));
  for (const host of hosts) {
    if (DOMAIN_SET.has(host)) return host;
  }
  const name = String(site.name || "").toLowerCase();
  for (const known of KNOWN_SITES) {
    if (known.labels.some((label) => name === label || name === label + "-site" || name.startsWith(label + "-") || name.endsWith("-" + label))) {
      return known.domain;
    }
  }
  return "";
}

function parseCityLeadMessage(message) {
  const text = String(message || "");
  const source = (text.match(/^[\s\S]*?Source:\s*(\S+)/i) || [])[1] || "";
  const page = (text.match(/\nPage:\s*([^\n]+)/i) || [])[1] || "";
  const city = (text.match(/\nCity:\s*([^\n]+)/i) || [])[1] || "";
  const name = (text.match(/\nName:\s*([^\n]+)/i) || [])[1] || "";
  const phone = (text.match(/\nPhone:\s*([^\n]+)/i) || [])[1] || "";
  const email = (text.match(/\nEmail:\s*([^\n]+)/i) || [])[1] || "";
  const originalId = (text.match(/\nLead ID:\s*([^\n]+)/i) || [])[1] || "";
  const host = hostFromUrl(source);
  return {
    isForward: /CITY SITE (LEAD|FENCE QUOTE)/i.test(text),
    source_domain: DOMAIN_SET.has(host) ? host : "",
    source_page: clip(page === "unknown" ? "" : page, 300),
    city: clip(city === "unknown" ? "" : city, 80),
    name: clip(name, 120),
    phone: clip(phone, 40),
    email: clip(email === "none" ? "" : email, 200),
    originalId: clip(originalId, 160),
  };
}

function isQa(record) {
  const blob = [record.name, record.email, record.message, record.lead_id, record.project_details, record._originalId].join(" ");
  return /SEO QA TEST|QA TEST -- DELETE|qa-delete@example\.com|^qa-/i.test(blob);
}

function isSpam(record, submission) {
  const data = (submission && submission.data) || {};
  if (data["bot-field"] || data.bot_field) return true;
  const blob = [record.name, record.email, record.message].join(" ").toLowerCase();
  if (/viagra|cialis|crypto wallet|seo ranking guaranteed/.test(blob)) return true;
  if (!record.name && !record.phone && !record.email && !record.message) return true;
  return false;
}

function quoteDetails(data) {
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

function stripInternal(lead) {
  const clean = { ...lead };
  delete clean._phoneKey;
  delete clean._minuteKey;
  delete clean._isForward;
  delete clean._siteDomain;
  delete clean._form;
  delete clean._originalId;
  return clean;
}

function normalizeSubmission(siteDomain, formName, submission) {
  const data = submission.data || {};
  const created = submission.created_at || submission.createdAt || "";
  const parsed = parseCityLeadMessage(data.message || data.notes || "");
  let sourceDomain = siteDomain;
  if (siteDomain === "twinriversfence.com" && parsed.source_domain) {
    sourceDomain = parsed.source_domain;
  }
  if (!DOMAIN_SET.has(sourceDomain)) {
    const fromSubmission = hostFromUrl(submission.site_url);
    if (DOMAIN_SET.has(fromSubmission)) sourceDomain = fromSubmission;
  }
  if (!DOMAIN_SET.has(sourceDomain)) sourceDomain = "historical-unknown";

  const form = clip(formName || data["form-name"] || submission.form_name, 80);
  let leadType = clip(data.lead_type, 80);
  if (!leadType) {
    if (form === "instant-quote" || (parsed.isForward && /FENCE QUOTE/i.test(data.message || ""))) leadType = "fence-quote";
    else if (form === "lead-chat") leadType = parsed.isForward ? "contact" : "chat";
    else if (form === "contact") leadType = "contact";
    else leadType = form || "historical";
  }

  return {
    lead_id: "netlify:" + clip(submission.site_id || "", 40) + ":" + clip(submission.id, 80),
    submitted_at: created,
    name: clip(data.name || parsed.name || submission.name, 120),
    email: clip(data.email || parsed.email || submission.email, 200),
    phone: clip(data.phone || parsed.phone, 40),
    city: clip(data.city || parsed.city, 80),
    source_domain: sourceDomain,
    source_page: clip(data.source_page || parsed.source_page, 300),
    form_name: form,
    lead_type: leadType,
    message: clip(data.message || data.notes, 4000),
    project_details: clip(data.project_details || data.project_type, 4000),
    quote_details: quoteDetails(data),
    utm_source: clip(data.utm_source, 120),
    utm_medium: clip(data.utm_medium, 120),
    utm_campaign: clip(data.utm_campaign, 120),
    utm_term: clip(data.utm_term, 120),
    utm_content: clip(data.utm_content, 120),
    referrer: clip(data.referrer, 300),
    _phoneKey: digits(data.phone || parsed.phone),
    _minuteKey: created ? String(Math.floor(new Date(created).getTime() / 120000)) : "",
    _isForward: parsed.isForward,
    _siteDomain: siteDomain,
    _form: form,
    _originalId: parsed.originalId,
  };
}

async function loadExistingFingerprints(event) {
  const ids = new Set();
  const phones = new Set();
  for (let month = 1; month <= 12; month++) {
    const monthKey = "2026-" + String(month).padStart(2, "0");
    const monthIds = (await blobGetJson(event, "months/" + monthKey)) || [];
    for (const id of monthIds) {
      ids.add(id);
      const record = await blobGetJson(event, "by-id/" + id);
      if (record && digits(record.phone)) {
        phones.add(digits(record.phone) + "|" + String(record.submitted_at).slice(0, 16));
      }
    }
  }
  return { ids, phones };
}

async function collectHistory(event, token) {
  let coverage = "account";
  let sites = [];
  try {
    sites = (await netlifyGet(token, "/sites?per_page=100")) || [];
  } catch (error) {
    if (error.status !== 401 && error.status !== 403) throw error;
    coverage = "twin-rivers-only";
    const ctx = readBlobsContext(event) || {};
    const siteID = ctx.siteID || ctx.site_id || TWIN_RIVERS_SITE_ID;
    try {
      const site = await netlifyGet(token, "/sites/" + siteID);
      sites = site ? [site] : [];
    } catch (inner) {
      sites = [{ id: siteID, name: "twinrivers", custom_domain: "twinriversfence.com" }];
    }
  }

  const selected = [];
  const seen = new Set();
  for (const site of sites) {
    const domain = domainFromSite(site) || (site.id === TWIN_RIVERS_SITE_ID ? "twinriversfence.com" : "");
    if (!domain || seen.has(site.id)) continue;
    seen.add(site.id);
    selected.push({ site, domain });
  }
  if (!selected.some((item) => item.domain === "twinriversfence.com")) {
    selected.push({
      site: { id: TWIN_RIVERS_SITE_ID, name: "twinrivers", custom_domain: "twinriversfence.com" },
      domain: "twinriversfence.com",
    });
  }

  const buckets = await Promise.all(
    selected.map(async (item) => {
      const local = { raw: [], formCounts: {}, siteCount: 0, earliest: "", latest: "", olderThanWindow: 0 };
      let forms = [];
      try {
        forms = (await netlifyGet(token, "/sites/" + item.site.id + "/forms")) || [];
      } catch (error) {
        return local;
      }
      for (const form of forms) {
        const formName = form.name || form.id;
        local.formCounts[formName] = 0;
        let page = 1;
        while (page <= 20) {
          const submissions = await netlifyGet(token, "/forms/" + form.id + "/submissions?per_page=100&page=" + page);
          if (!Array.isArray(submissions) || !submissions.length) break;
          for (const submission of submissions) {
            submission.site_id = item.site.id;
            submission.form_name = form.name;
            const created = submission.created_at || "";
            if (created && (!local.earliest || created < local.earliest)) local.earliest = created;
            if (created && (!local.latest || created > local.latest)) local.latest = created;
            const when = created ? new Date(created) : null;
            if (when && when < RANGE_START) {
              local.olderThanWindow += 1;
              continue;
            }
            if (when && when > RANGE_END) continue;
            local.raw.push({ domain: item.domain, formName: form.name, submission });
            local.formCounts[formName] += 1;
            local.siteCount += 1;
          }
          if (submissions.length < 100) break;
          page += 1;
        }
      }
      return local;
    })
  );

  const raw = [];
  const formCounts = {};
  const siteCounts = {};
  let earliest = "";
  let latest = "";
  let olderThanWindow = 0;
  for (let i = 0; i < selected.length; i++) {
    const local = buckets[i];
    raw.push(...local.raw);
    olderThanWindow += local.olderThanWindow;
    if (local.earliest && (!earliest || local.earliest < earliest)) earliest = local.earliest;
    if (local.latest && (!latest || local.latest > latest)) latest = local.latest;
    siteCounts[selected[i].domain] = (siteCounts[selected[i].domain] || 0) + local.siteCount;
    for (const [form, count] of Object.entries(local.formCounts)) {
      formCounts[form] = (formCounts[form] || 0) + count;
    }
  }

  return {
    raw,
    formCounts,
    siteCounts,
    earliest,
    latest,
    olderThanWindow,
    coverage,
    sites: selected.map((item) => item.domain),
  };
}

function inspectRecord(record) {
  const message = String(record.message || "");
  const sourceHost = hostFromUrl((message.match(/^[\s\S]*?Source:\s*(\S+)/i) || [])[1] || "");
  return {
    lead_id: record.lead_id,
    submitted_at: record.submitted_at,
    netlify_site: record._siteDomain || "",
    attributed_site: record.source_domain || "",
    form_name: record.form_name || "",
    lead_type: record.lead_type || "",
    is_forward: Boolean(record._isForward),
    has_embedded_lead_id: Boolean(record._originalId),
    source_line_host: DOMAIN_SET.has(sourceHost) ? sourceHost : sourceHost ? "non-network-host" : "",
    city_header: /CITY SITE FENCE QUOTE/i.test(message) ? "CITY SITE FENCE QUOTE" : /CITY SITE LEAD/i.test(message) ? "CITY SITE LEAD" : "",
    message_len: message.length,
    message_fp: fingerprint(message),
    quote_fp: fingerprint(record.quote_details || ""),
    has_quote: Boolean(record.quote_details),
  };
}

function ambiguousGroups(keep) {
  const buckets = new Map();
  for (const record of keep) {
    const phone = record._phoneKey || "";
    const email = String(record.email || "").toLowerCase();
    if (phone.length < 10 || !email) continue;
    const key = phone + "|" + email + "|" + pacificDay(record.submitted_at);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(record);
  }
  return [...buckets.values()]
    .filter((records) => records.length > 1)
    .map((records) => {
      const sorted = records.slice().sort((a, b) => String(a.submitted_at).localeCompare(String(b.submitted_at)));
      const first = new Date(sorted[0].submitted_at).getTime();
      return {
        pacific_day: pacificDay(sorted[0].submitted_at),
        size: sorted.length,
        seconds_apart: sorted.map((record) => Math.round((new Date(record.submitted_at).getTime() - first) / 1000)),
        shared_embedded_lead_id: sorted.every((record) => record._originalId) && new Set(sorted.map((record) => record._originalId)).size === 1,
        records: sorted.map(inspectRecord),
      };
    });
}

function classify(rawItems, existing) {
  const pairs = rawItems.map((item) => ({
    record: normalizeSubmission(item.domain, item.formName, item.submission),
    submission: item.submission,
  }));
  const nativeKeys = new Set();
  for (const pair of pairs) {
    if (!pair.record._isForward && pair.record._phoneKey && pair.record._minuteKey) {
      nativeKeys.add(pair.record._phoneKey + "@" + pair.record._minuteKey);
    }
  }

  const keep = [];
  const skipped = { spam: 0, qa: 0, exact: 0, forward: 0, existing: 0 };
  const seenIds = new Set(existing.ids);
  const seenForward = new Set();
  const seenOriginal = new Set(existing.ids);

  for (const pair of pairs) {
    const record = pair.record;
    if (isSpam(record, pair.submission)) {
      skipped.spam += 1;
      continue;
    }
    if (isQa(record)) {
      skipped.qa += 1;
      continue;
    }
    if (seenIds.has(record.lead_id) || (record._originalId && seenOriginal.has(record._originalId))) {
      if (seenIds.has(record.lead_id)) skipped.existing += 1;
      else skipped.forward += 1;
      continue;
    }
    const fwdKey = record._phoneKey && record._minuteKey ? record._phoneKey + "@" + record._minuteKey : "";
    const existingPhoneHit = record._phoneKey ? existing.phones.has(record._phoneKey + "|" + String(record.submitted_at).slice(0, 16)) : false;
    if (record._isForward && fwdKey && (nativeKeys.has(fwdKey) || seenForward.has(fwdKey) || existingPhoneHit)) {
      skipped.forward += 1;
      continue;
    }
    if (record._isForward && fwdKey) seenForward.add(fwdKey);
    seenIds.add(record.lead_id);
    if (record._originalId) seenOriginal.add(record._originalId);
    keep.push(record);
  }

  const filtered = dropSameFormResubmits(keep, skipped);
  const unknown = filtered.filter((record) => record.source_domain === "historical-unknown").length;
  const byMonth = {};
  const bySite = {};
  for (const record of filtered) {
    const month = monthKeyFromIso(record.submitted_at);
    byMonth[month] = (byMonth[month] || 0) + 1;
    bySite[record.source_domain] = (bySite[record.source_domain] || 0) + 1;
  }

  const accounted = filtered.length + skipped.spam + skipped.qa + skipped.existing + skipped.forward + skipped.exact;
  return { keep: filtered, skipped, unknown, byMonth, bySite, nativeCount: nativeKeys.size, accounted, ambiguous: ambiguousGroups(filtered) };
}

function dropSameFormResubmits(keep, skipped) {
  const sorted = keep.slice().sort((a, b) => String(a.submitted_at).localeCompare(String(b.submitted_at)));
  const seen = new Set();
  const out = [];
  for (const record of sorted) {
    if (SKIP_RESUBMIT_IDS.has(record.lead_id)) {
      skipped.exact += 1;
      continue;
    }
    const fp = fingerprint(record.message || "");
    const key = [record._siteDomain, record.form_name, fp, record._phoneKey, String(record.email || "").toLowerCase()].join("|");
    if (fp && record._phoneKey && seen.has(key)) {
      skipped.exact += 1;
      continue;
    }
    if (fp && record._phoneKey) seen.add(key);
    out.push(record);
  }
  return out;
}

async function importLeads(event, keep) {
  const monthAdds = {};
  const writtenLeads = [];
  const CHUNK = 8;
  for (let i = 0; i < keep.length; i += CHUNK) {
    const chunk = keep.slice(i, i + CHUNK).map(stripInternal);
    const written = await Promise.all(
      chunk.map(async (lead) => {
        const existingLead = await blobGetJson(event, "by-id/" + lead.lead_id);
        if (existingLead) return null;
        await blobSetJson(event, "by-id/" + lead.lead_id, lead);
        return lead;
      })
    );
    for (const lead of written) {
      if (!lead) continue;
      writtenLeads.push(lead);
      const monthKey = monthKeyFromIso(lead.submitted_at);
      if (!/^\d{4}-\d{2}$/.test(monthKey)) continue;
      monthAdds[monthKey] = monthAdds[monthKey] || [];
      monthAdds[monthKey].push(lead.lead_id);
    }
  }
  for (const monthKey of Object.keys(monthAdds)) {
    const ids = (await blobGetJson(event, "months/" + monthKey)) || [];
    await blobSetJson(event, "months/" + monthKey, [...new Set([...ids, ...monthAdds[monthKey]])]);
  }
  return writtenLeads;
}

async function verifyImport(event, writtenLeads) {
  const ids = writtenLeads.map((lead) => lead.lead_id);
  const submissionIds = ids.map((id) => String(id).split(":").slice(2).join(":"));
  const bySite = {};
  let missing = 0;
  let badDomain = 0;
  let unknown = 0;
  for (const id of ids) {
    const record = await blobGetJson(event, "by-id/" + id);
    if (!record || record.lead_id !== id) {
      missing += 1;
      continue;
    }
    const site = record.source_domain || "";
    bySite[site] = (bySite[site] || 0) + 1;
    if (site === "historical-unknown") unknown += 1;
    else if (!DOMAIN_SET.has(site)) badDomain += 1;
  }
  const uniqueLeadIds = new Set(ids).size === ids.length;
  const uniqueSubmissionIds = submissionIds.every(Boolean) && new Set(submissionIds).size === submissionIds.length;
  return {
    imported: ids.length,
    expected: EXPECTED_IMPORT,
    unique_lead_ids: uniqueLeadIds,
    unique_netlify_submission_ids: uniqueSubmissionIds,
    missing_records: missing,
    unknown_source: unknown,
    invalid_source: badDomain,
    by_site: bySite,
    netlify_form_deletes: 0,
    originals_untouched: true,
    ok:
      ids.length === EXPECTED_IMPORT &&
      uniqueLeadIds &&
      uniqueSubmissionIds &&
      missing === 0 &&
      badDomain === 0,
  };
}

function renderAmbiguous(groups) {
  if (!groups || !groups.length) return "";
  return groups
    .map((group, index) => {
      const rows = (group.records || [])
        .map((record, recIndex) => `<li>
          ${recIndex + 1}. id=${escapeHtml(record.lead_id)}
          time=${escapeHtml(record.submitted_at)}
          netlify_site=${escapeHtml(record.netlify_site)}
          form=${escapeHtml(record.form_name)}
          type=${escapeHtml(record.lead_type)}
          attributed=${escapeHtml(record.attributed_site)}
          forward=${record.is_forward}
          header=${escapeHtml(record.city_header || "none")}
          source_host=${escapeHtml(record.source_line_host || "none")}
          embedded_lead_id=${record.has_embedded_lead_id}
          msg_len=${record.message_len}
          msg_fp=${escapeHtml(record.message_fp)}
          quote_fp=${escapeHtml(record.quote_fp)}
          +${group.seconds_apart[recIndex]}s
        </li>`)
        .join("");
      return `<h3>Group ${index + 1} — ${escapeHtml(group.pacific_day)} (${group.size} records, shared embedded lead id: ${group.shared_embedded_lead_id})</h3><ul>${rows}</ul>`;
    })
    .join("");
}

function listRows(obj) {
  return Object.keys(obj || {})
    .sort()
    .map((key) => `<li>${escapeHtml(key)} → ${obj[key]}</li>`)
    .join("");
}

function renderReport({ tokenMissing, error, collected, classified, imported, mode, lastRun, stopped, verification }) {
  const skipped = classified ? classified.skipped : {};
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex,nofollow">
<title>Historical lead backfill</title>
<style>
  body { font-family: Georgia, serif; background:#fffaf2; color:#24324a; margin:0; padding:2rem 1.2rem; }
  main { max-width: 800px; margin: 0 auto; }
  p, li { color:#68748a; }
  a, button { font: inherit; }
  button { min-height: 44px; border:0; background:#ff6b5b; color:#fff; font-weight:700; padding:.5rem .9rem; }
  .warn { color:#9b1c1c; }
</style>
</head>
<body>
<main>
  <p><a href="/admin/leads">← Lead ledger</a></p>
  <h1>Historical Netlify backfill</h1>
  ${error ? `<p class="warn">${escapeHtml(error)}</p>` : ""}
  ${tokenMissing ? `<p class="warn">Set NETLIFY_AUTH_TOKEN on the Twin Rivers Netlify site (Personal Access Token from app.netlify.com/user/applications with form read access), then redeploy. This copies submissions into the ledger. It does not delete Netlify form inboxes.</p>` : ""}
  ${lastRun ? `<p>Last completed run: ${escapeHtml(lastRun.finished_at || "")} (${escapeHtml(lastRun.mode || "")}). Imported: ${lastRun.imported ?? "n/a"}.</p>` : ""}
  ${collected ? `
    <p>Mode: ${escapeHtml(mode)}</p>
    <p>API coverage: ${escapeHtml(collected.coverage)} (${escapeHtml((collected.sites || []).join(", "))})</p>
    <p>Earliest submission found: ${escapeHtml(collected.earliest || "")}</p>
    <p>Latest submission found: ${escapeHtml(collected.latest || "")}</p>
    <p>Raw submissions in Feb 1–Aug 18, 2026 window: <strong>${collected.raw.length}</strong></p>
    <p>Older than February 2026 (not imported): ${collected.olderThanWindow}</p>
    <h2>Forms in window</h2><ul>${listRows(collected.formCounts) || "<li>None</li>"}</ul>
    <h2>Raw by Netlify site</h2><ul>${listRows(collected.siteCounts) || "<li>None</li>"}</ul>
  ` : ""}
  ${classified ? `
    <h2>Dry-run classification</h2>
    <p>Legitimate to import: <strong>${classified.keep.length}</strong></p>
    <p>Already in ledger: ${skipped.existing || 0}</p>
    <p>Forwarding duplicates skipped: ${skipped.forward || 0}</p>
    <p>Spam skipped: ${skipped.spam || 0}</p>
    <p>QA/test skipped: ${skipped.qa || 0}</p>
    <p>Same-form resubmits skipped: ${skipped.exact || 0}</p>
    <p>Unknown-source records in import set: ${classified.unknown}</p>
    <p>Accounted vs raw: ${classified.accounted} / ${collected ? collected.raw.length : "?"}</p>
    <p>Ambiguous same-customer groups remaining: ${classified.ambiguous.length}</p>
    ${classified.ambiguous.length ? `<h2>Ambiguous groups (no customer PII)</h2>${renderAmbiguous(classified.ambiguous)}` : ""}
    ${stopped ? `<p class="warn">${escapeHtml(error || "Import was not written.")}</p>` : ""}
    <h2>By month</h2><ul>${listRows(classified.byMonth) || "<li>None</li>"}</ul>
    <h2>By attributed site</h2><ul>${listRows(classified.bySite) || "<li>None</li>"}</ul>
    ${imported != null ? `<p><strong>Imported this run: ${imported}</strong></p>` : ""}
    ${verification ? `
      <h2>Post-import verification</h2>
      <p>Expected new historical records: ${verification.expected}</p>
      <p>Imported: ${verification.imported}</p>
      <p>Unique ledger IDs: ${verification.unique_lead_ids}</p>
      <p>Unique Netlify submission IDs: ${verification.unique_netlify_submission_ids}</p>
      <p>Unknown source: ${verification.unknown_source}</p>
      <p>Invalid source: ${verification.invalid_source}</p>
      <p>Netlify form deletes: ${verification.netlify_form_deletes}</p>
      <p>Originals untouched: ${verification.originals_untouched}</p>
      <p><strong>Verification ${verification.ok ? "PASSED" : "FAILED"}</strong></p>
      <h3>Imported by site</h3><ul>${listRows(verification.by_site) || "<li>None</li>"}</ul>
    ` : ""}
    ${mode === "preview" && classified.keep.length === EXPECTED_IMPORT && !stopped ? `
      <p id="import-status"></p>
      <form method="POST" action="/admin/leads/history">
        <input type="hidden" name="action" value="import">
        <button type="submit">Import 25 historical leads</button>
      </form>
      <p>This copies into the ledger only. Netlify form inboxes are not changed or deleted.</p>
    ` : ""}
  ` : ""}
</main>
</body>
</html>`;
}

function summarizeRun({ collected, classified, imported, mode, stopped, verification }) {
  return {
    finished_at: new Date().toISOString(),
    mode: stopped ? "stopped" : mode,
    imported,
    raw: collected ? collected.raw.length : 0,
    keep: classified ? classified.keep.length : 0,
    skipped: classified ? classified.skipped : {},
    unknown: classified ? classified.unknown : 0,
    byMonth: classified ? classified.byMonth : {},
    bySite: classified ? classified.bySite : {},
    formCounts: collected ? collected.formCounts : {},
    earliest: collected ? collected.earliest : "",
    latest: collected ? collected.latest : "",
    olderThanWindow: collected ? collected.olderThanWindow : 0,
    coverage: collected ? collected.coverage : "",
    sites: collected ? collected.sites : [],
    accounted: classified ? classified.accounted : 0,
    ambiguous: classified ? classified.ambiguous.length : 0,
    verification: verification || null,
  };
}

async function runHandler(event, options = {}) {
  const auth = checkAuth(event);
  if (auth === "unconfigured") {
    return html(503, "<!DOCTYPE html><html><body><p>Lead admin is not configured.</p></body></html>");
  }
  if (!auth) return unauthorized();

  const token = apiToken(event);
  const lastRun = await blobGetJson(event, LAST_RUN_KEY).catch(() => null);
  if (!token) {
    return html(200, renderReport({ tokenMissing: true, mode: "blocked", lastRun }));
  }

  const query = new URLSearchParams(event.rawQuery || "");
  const wantInspect = query.get("inspect") === "1";
  const body =
    event.httpMethod === "POST"
      ? Object.fromEntries(new URLSearchParams(event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : event.body || ""))
      : {};
  const doImport = Boolean(options.forceImport) || (event.httpMethod === "POST" && body.action === "import");

  try {
    const collected = await collectHistory(event, token);
    const existing = await loadExistingFingerprints(event);
    const classified = classify(collected.raw, existing);
    const countMismatch = classified.keep.length !== EXPECTED_IMPORT;
    const stopped = Boolean(doImport && countMismatch);
    const stopError = doImport && countMismatch ? "Import blocked: keep is " + classified.keep.length + ", expected " + EXPECTED_IMPORT + "." : "";
    let imported = null;
    let verification = null;
    if (doImport && !stopped) {
      const written = await importLeads(event, classified.keep);
      imported = written.length;
      verification = await verifyImport(event, written);
    }
    const mode = doImport ? (stopped ? "stopped" : "import") : "preview";
    const summary = summarizeRun({ collected, classified, imported, mode, stopped, verification });
    const inspect = {
      keep: classified.keep.length,
      skipped: classified.skipped,
      unknown: classified.unknown,
      groups: classified.ambiguous,
      verification,
    };
    if (doImport) await blobSetJson(event, LAST_RUN_KEY, summary);
    if (wantInspect) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
        body: JSON.stringify(inspect),
      };
    }
    return html(200, renderReport({ collected, classified, imported, mode, lastRun: doImport ? summary : lastRun, stopped, error: stopError, verification: verification || (lastRun && lastRun.verification) }));
  } catch (error) {
    const status = error && error.status;
    const message = status === 401 || status === 403 ? "Netlify API token was rejected or cannot read form submissions." : "Historical backfill failed.";
    console.error("history backfill failed", error && error.message);
    return html(200, renderReport({ error: message, tokenMissing: status === 401 || status === 403, mode: "error", lastRun }));
  }
}

export { runHandler, monthKeyFromIso };

export default async (request) => {
  const url = new URL(request.url);
  const event = {
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers),
    body: request.method === "GET" || request.method === "HEAD" ? "" : await request.text(),
    isBase64Encoded: false,
    rawQuery: url.search.replace(/^\?/, ""),
    blobs: process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext || null,
  };
  const result = await runHandler(event);
  return new Response(result.body || "", { status: result.statusCode, headers: result.headers || {} });
};
