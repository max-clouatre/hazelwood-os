// Shared helpers for the end-to-end tests. Run them with `npm run test:e2e` (from app/) or `node tests/run.js`.
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const OUT = process.env.OUT || path.join(__dirname, "out"); // screenshots and logs (git-ignored)
fs.mkdirSync(path.join(OUT, "shots"), { recursive: true });
const BASE = (process.env.BASE || "http://localhost:8123").replace(/\/$/, "");

/** Print a verdict line. The runner counts lines that start with PASS or FAIL. */
const ok = (label, v) => console.log((v ? "PASS " : "FAIL ") + label);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
/** Tiny static file server for a built folder. Resolves { url, close }. */
function serve(dir, port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p.endsWith("/")) p += "index.html";
      const f = path.join(dir, p);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
      res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(port, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${srv.address().port}`, close: () => srv.close() }));
  });
}

/** Seed helpers: build a saved-game object like the app stores in localStorage["hwos:v1"]. */
const owned = (id, sp, xp, extra = {}) => ({ id, sp, name: sp, shiny: false, seed: 21 + id.length, pers: "gentle", xp, got: "x", pet: { day: "", n: 0 }, foods: [0, 0], ...extra });
const wildsState = (ownedList, w = {}) => ({
  wilds: {
    started: true, tipSeen: true, owned: ownedList, seen: {}, berries: 40, fromStars: 0, eggs: [], day: "", visitorDone: false, treeDone: false,
    duelDay: "", favs: {}, legend: false, seq: 50, duelWins: 0, goals: { day: "", list: [] }, badges: [], newBadge: null, bushAt: {},
    glow: 0, camps: {}, boost: { from: 0, until: 0 }, caught: {}, modes: { camp: true }, ...w,
  },
});

module.exports = { ROOT, OUT, BASE, ok, serve, owned, wildsState };
