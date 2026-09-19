import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("free/out");
const base = process.env.RADAR_BASE_PATH ?? "";
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) { res.writeHead(404).end(); return; }
    let path = resolve(root, `.${pathname.slice(base.length) || "/"}`);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const data = await readFile(path);
    res.writeHead(200, { "Content-Type": types[extname(path)] ?? "application/octet-stream", "Cache-Control": "no-cache" }).end(data);
  } catch { res.writeHead(404).end("Not found"); }
});
server.listen(Number(process.env.PORT ?? 3101), "127.0.0.1", () => console.log(`Static preview: http://localhost:${process.env.PORT ?? 3101}${base}/`));
