#!/usr/bin/env node
// Test runner. Serves the built app (docs/), runs each end-to-end test in its own process, and prints a summary.
//   node tests/run.js                 fast suite (about 6 minutes)
//   node tests/run.js --full          every test (about 15 minutes)
//   node tests/run.js --only camp,music
//   node tests/run.js --build         rebuild docs/ first
// Needs Playwright with Chromium (preinstalled in the Claude cloud sandbox; locally: npm i -D playwright && npx playwright install chromium).
const { spawn, execSync } = require("child_process");
const path = require("path");
const { serve, ROOT, OUT } = require("./lib");

const TESTS = [
  { name: "layout", file: "layout.js", fast: true, what: "every screen fits phone + tablet, no console errors" },
  { name: "old-chrome", file: "old-chrome.js", fast: true, what: "regression: old tablet Chrome (no :where, no Array.at) shows no gray button boxes" },
  { name: "mystery", file: "mystery.js", fast: true, what: "creatures are a mystery shadow until caught; hints in hub and Wilddex" },
  { name: "creatures-ui", file: "creatures-ui.js", fast: true, what: "tap feedback, 38 species, info screens, old-Chrome trap (Friends screen)" },
  { name: "camp", file: "camp.js", fast: true, what: "Camp idle math, boost, caps, training, mastery, modes switch" },
  { name: "update", file: "update.js", fast: true, own: true, what: "Grown-up update button installs a newer build, keeps progress" },
  { name: "music", file: "music.js", fast: true, what: "every song renders at sane levels; live switching has no errors" },
  { name: "music-switching", file: "music-switching.js", fast: true, what: "only one song chain alive; leaving Hazelwild silences it" },
  { name: "landing", file: "landing.js", fast: true, what: "merged landing meadow, crew picker, workers in camp yard and on the map" },
  { name: "animal-game", file: "animal-game.js", fast: true, what: "Animal Game: categories, timed shouts, pause, skip, stars" },
  { name: "piano", file: "piano.js", fast: false, what: "Piano: free play, lessons, songs (follow, play along, listen), My Songs" },
  { name: "narrator", file: "narrator.js", fast: true, what: "Hazelwild narrator is off by default; the button toggles it" },
  { name: "spelling-list", file: "spelling-list.js", fast: true, what: "Weekly spelling list is adopted once; hand edits stick" },
  { name: "spelling-variety", file: "spelling-variety.js", fast: true, what: "Spelling Unicorn rotates the whole list, no flooding" },
  { name: "spelling-test", file: "spelling-test.js", fast: true, what: "Spelling Test Me: every word once, typed, scored, misses remembered" },
  { name: "pixel-lab", file: "pixel-lab.js", fast: false, what: "Grown-up Pixel Lab opens, dials work, three.js loads lazily" },
  { name: "pixel-meadow", file: "pixel-meadow.js", fast: false, what: "Pixel meadow mode: island, taps, turning, camp workers, flat fallback" },
  { name: "village", file: "village.js", fast: false, what: "Village mode: build, collect, convert, upgrade, workers, flat fallback" },
  { name: "catch-flow", file: "catch-flow.js", fast: false, what: "starter, explore, throw, catch, reveal" },
  { name: "progression", file: "progression.js", fast: false, what: "evolution branches, badges, goals, berry guide, eggs" },
  { name: "color-by-number", file: "color-by-number.js", fast: false, what: "Hazel's color-by-number pages complete" },
  { name: "duel", file: "duel.js", fast: false, what: "duel plays to the end and pays out" },
];

const args = process.argv.slice(2);
const full = args.includes("--full");
const only = (args.find((a) => a.startsWith("--only=")) || (args.includes("--only") ? "--only=" + args[args.indexOf("--only") + 1] : "")).replace("--only=", "").split(",").filter(Boolean);
const selected = TESTS.filter((t) => (only.length ? only.includes(t.name) : full || t.fast));

(async () => {
  if (args.includes("--build")) { console.log("Building..."); execSync("npm run build", { cwd: path.join(ROOT, "app"), stdio: "inherit" }); }
  const server = await serve(path.join(ROOT, "docs"));
  console.log(`Serving docs/ at ${server.url}\nRunning ${selected.length} test file(s): ${selected.map((t) => t.name).join(", ")}\nScreenshots: ${OUT}\n`);
  const results = [];
  for (const t of selected) {
    const started = Date.now();
    process.stdout.write(`=== ${t.name}: ${t.what}\n`);
    const r = await new Promise((resolve) => {
      const child = spawn("node", [path.join(__dirname, "e2e", t.file)], { env: { ...process.env, BASE: server.url, OUT }, cwd: ROOT });
      let out = "";
      const timer = setTimeout(() => { out += "FAIL timed out\n"; child.kill("SIGKILL"); }, (t.fast ? 360 : 600) * 1000);
      child.stdout.on("data", (d) => { out += d; process.stdout.write(d); });
      child.stderr.on("data", (d) => { out += d; process.stdout.write(d); });
      child.on("close", (code) => { clearTimeout(timer); resolve({ code, out }); });
    });
    const lines = r.out.split("\n");
    const pass = lines.filter((l) => l.startsWith("PASS")).length;
    const fail = lines.filter((l) => l.startsWith("FAIL")).length;
    const bad = fail > 0 || r.code !== 0 || pass === 0 || /^errors \[[^\]]/m.test(r.out);
    results.push({ name: t.name, pass, fail, code: r.code, bad, secs: Math.round((Date.now() - started) / 1000) });
    console.log("");
  }
  server.close();
  console.log("\n================ SUMMARY ================");
  for (const r of results) console.log(`${r.bad ? "FAILED" : "ok    "}  ${r.name.padEnd(16)} ${r.pass} passed, ${r.fail} failed, exit ${r.code}, ${r.secs}s`);
  const anyBad = results.some((r) => r.bad);
  console.log(anyBad ? "\nSOME TESTS FAILED" : "\nALL TESTS PASSED");
  process.exit(anyBad ? 1 : 0);
})();
