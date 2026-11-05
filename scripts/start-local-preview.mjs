import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const PUBLIC_DIR = path.resolve("public");
const DIST_DIR = path.resolve("dist");

process.on("uncaughtException", (err) => {
  console.error("Preview server uncaughtException:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Preview server unhandledRejection:", reason);
});

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
  try {
    const urlPath = req.url ? req.url.split("?")[0] : "/";
    let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    if (safePath === "/" || safePath === "\\" || safePath === "") {
      safePath = "/redesign-proposal.html";
    }

    let filePath = path.join(PUBLIC_DIR, safePath);
    try {
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, safePath);
      }
    } catch {
      filePath = path.join(DIST_DIR, safePath);
    }

    let isFile = false;
    try {
      isFile = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
      isFile = false;
    }

    if (isFile) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      });
      const stream = fs.createReadStream(filePath);
      stream.on("error", (err) => {
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain" });
        }
        res.end("Stream error: " + err.message);
      });
      stream.pipe(res);
    } else if (!path.extname(safePath) || safePath.startsWith("/cartilla")) {
      const indexPath = path.join(DIST_DIR, "index.html");
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        });
        const stream = fs.createReadStream(indexPath);
        stream.pipe(res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not Found: " + safePath);
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found: " + safePath);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Server error: " + (err instanceof Error ? err.message : String(err)));
  }
});

server.on("error", (err) => {
  console.error("Preview server listener error:", err.message);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`PREVIEW_SERVER_READY: http://127.0.0.1:${PORT}`);
});
