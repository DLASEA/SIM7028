// proxy.js
const http = require("http");
const { createProxyServer } = require("http-proxy");

const TARGET = process.env.TARGET || "https://us-central1-fleetmate-5d316.cloudfunctions.net";
const proxy = createProxyServer({ target: TARGET, changeOrigin: true });

// Log incoming requests
proxy.on("start", (_, req) => {
  console.log(`--> [IN ] ${req.method} ${req.url}`);
});
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

const server = http.createServer((req, res) => {
  // Health-check endpoint for “/”
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK");
  }
  // All other requests get proxied
  proxy.web(req, res);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT}`);
});
