const http = require("http");
const fs = require("fs");
const path = require("path");
const dist = "D:\\个人\\项目\\暑期实践\\检测系统\\frontend\\dist";
const pub = "D:\\个人\\项目\\暑期实践\\检测系统\\frontend\\public";
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let u = req.url.split("?")[0];
  if (u === "/") u = "/index.html";
  let fp = path.join(dist, u);
  if (!fs.existsSync(fp)) fp = path.join(pub, u);
  if (!fs.existsSync(fp)) fp = path.join(dist, "index.html");
  try {
    const c = fs.readFileSync(fp);
    res.writeHead(200, { "Content-Type": mime[path.extname(fp)] || "application/octet-stream" });
    res.end(c);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(5173, () => console.log("Server on http://localhost:5173/"));
