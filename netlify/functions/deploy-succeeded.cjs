const https = require("https");

const INDEXNOW_KEY = "8f3a2c91e8b04d6a9c1f5e2d8a4b6c0e";

const PATHS_BY_HOST = {
  "rosevillefencingca.com": ["/", "/fence-repair/", "/gates/", "/wood-fencing/"],
  "rocklinfencing.com": ["/", "/fence-repair/", "/gates/", "/wood-fencing/"],
  "folsomfencing.com": ["/", "/fence-repair/", "/gates/", "/wood-fencing/"],
  "elkgrovefencing.com": ["/", "/fence-repair/", "/gates/", "/wood-fencing/"],
  "granitebayfencing.com": ["/", "/fence-repair/", "/gates/", "/wood-fencing/"],
  "grassvalleyfencing.com": ["/", "/fence-repair/", "/gates/", "/wood-fencing/"],
  "twinriversfence.com": ["/", "/fence-repair/", "/gate-installation/", "/services/wood-fence-installation/"],
};

function postIndexNow(host, urlList) {
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList,
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.indexnow.org",
        path: "/indexnow",
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode || 0);
      }
    );
    req.on("error", () => resolve(0));
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (process.env.INDEXNOW_NOTIFY === "0") {
    return { statusCode: 200, body: "indexnow disabled" };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    payload = {};
  }

  const deploy = payload.payload || payload;
  const context = deploy.context || process.env.CONTEXT;
  if (context && context !== "production") {
    return { statusCode: 200, body: "skip non-production" };
  }

  const rawUrl = deploy.url || process.env.URL || "";
  let host;
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return { statusCode: 200, body: "no host" };
  }

  if (host.endsWith("netlify.app") || host.endsWith("netlify.com")) {
    return { statusCode: 200, body: "skip preview host" };
  }

  const paths = PATHS_BY_HOST[host];
  if (!paths) {
    return { statusCode: 200, body: `no path map for ${host}` };
  }

  const urlList = paths.map((p) => `https://${host}${p}`);
  const status = await postIndexNow(host, urlList);
  return {
    statusCode: 200,
    body: JSON.stringify({ host, submitted: urlList.length, indexNow: status }),
  };
};
