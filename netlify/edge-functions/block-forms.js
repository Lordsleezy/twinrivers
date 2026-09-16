export default async (request) => {
  if (request.method !== "POST") return;
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/.netlify/") || pathname.startsWith("/admin/")) return;
  return new Response("Online requests are closed. Call (916) 906-2254.", {
    status: 410,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
};
