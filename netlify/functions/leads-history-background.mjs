import { runHandler } from "./leads-history.mjs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("POST required", { status: 405 });
  }
  const url = new URL(request.url);
  const event = {
    httpMethod: "POST",
    headers: Object.fromEntries(request.headers),
    body: (await request.text()) || "action=import",
    isBase64Encoded: false,
    rawQuery: url.search.replace(/^\?/, ""),
    blobs: process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext || null,
  };
  const result = await runHandler(event, { forceImport: true });
  return new Response(result.body || "Import finished", { status: result.statusCode, headers: result.headers || {} });
};
