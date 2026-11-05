import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const PUBLIC_DIR = path.resolve("public");
const DIST_DIR = path.resolve("dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  if (safePath === "/" || safePath === "\\") safePath = "/redesign-proposal.html";

  // Check in public first, then dist
  let filePath = path.join(PUBLIC_DIR, safePath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, safePath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found: " + safePath);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`PREVIEW_SERVER_READY: http://127.0.0.1:${PORT}`);
});
