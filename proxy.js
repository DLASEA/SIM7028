// proxy.js
const http = require("http");
const { createProxyServer } = require("http-proxy");

const TARGET = process.env.TARGET
  || "https://us-central1-fleetmate-5d316.cloudfunctions.net";

// set up the proxy
const proxy = createProxyServer({ target: TARGET, changeOrigin: true });

// outgoing logs
proxy.on("proxyReq", (proxyReq, req) => {
  console.log(`    → [REQ]   ${TARGET}${req.url}`);
});
proxy.on("proxyRes", (proxyRes, req) => {
  console.log(`    ← [RES]   ${proxyRes.statusCode} for ${req.url}`);
});
proxy.on("error", (err, req, res) => {
  console.error(`    !! [ERR]   ${err.message}`);
  res.writeHead(502);
  res.end("Proxy error");
});

// HTTP server
const server = http.createServer((req, res) => {
  // 1) Log every inbound request (SIM or browser)
  console.log(`--> [IN ] ${req.method} ${req.url}`);

  // 2) Health check
  if (req.method === "GET" && req.url === "/") {
    return res.end("OK");
  }

  // 3) Silence the favicon noise
  if (req.method === "GET" && req.url === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }

  // 4) Everything else, hand off to http-proxy
  proxy.web(req, res);
});

// pick up DO’s assigned port (or default back to 8080 locally)
const PORT = parseInt(process.env.PORT, 10) || 8080;
server.listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT}`);
});
