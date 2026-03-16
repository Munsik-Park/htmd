#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.argv[2] ? parseInt(process.argv[2]) : 3000;
const ROOT = path.resolve(__dirname, "..");

const MIME = {
  ".htmd": "text/html; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.htmd";

  const filePath = path.join(ROOT, urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`Not found: ${urlPath}`);
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
    console.log(`  ${req.method} ${urlPath} -> 200`);
  });
});

server.listen(PORT, () => {
  console.log(`HTMD server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${ROOT}`);
  console.log("Press Ctrl+C to stop.");
});
