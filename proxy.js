// proxy.js
const http = require("http");
const { createProxyServer } = require("http-proxy");

const TARGET = "https://us-central1-fleetmate-5d316.cloudfunctions.net";
const proxy = createProxyServer({ target: TARGET, changeOrigin: true });

//  Log when we see the incoming request
proxy.on("start", (_, req) => {
  console.log(`--> [IN ] ${req.method} ${req.url}`);
});

// Log right before sending to CF
proxy.on("proxyReq", (proxyReq, req) => {
  console.log(`    → [REQ]   ${TARGET}${req.url}`);
});

// Log when the CF response comes back
proxy.on("proxyRes", (proxyRes, req) => {
  console.log(`    ← [RES]   ${proxyRes.statusCode} for ${req.url}`);
});

// Handle errors
proxy.on("error", (err, req, res) => {
  console.error(`    !! [ERR]   ${err.message}`);
  res.writeHead(502);
  res.end("Proxy error");
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.listen(8080, () => {
  console.log("Proxy listening on http://localhost:8080");
});
