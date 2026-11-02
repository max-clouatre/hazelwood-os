#!/usr/bin/env node
// The project harness. Claude Code runs this from .claude/settings.json hooks so project state stays durable:
//   session-start  prints "where we are" into the new session (from STATE.md + git)
//   stop           refuses to let a session finish while work is unsaved, unpushed, or STATE.md is stale
//   state          prints the same summary for a human:  npm run state   (from app/)
// Turn the hooks off for a session with HARNESS_OFF=1.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const sh = (cmd, raw = false) => { try { const t = execSync(cmd, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString(); return raw ? t : t.trim(); } catch { return ""; } };
const ok = (cmd) => { try { execSync(cmd, { cwd: ROOT, stdio: "ignore" }); return true; } catch { return false; } };
const mode = process.argv[2] || "state";
if (process.env.HARNESS_OFF === "1") process.exit(0);

function readInput() {
  if (process.stdin.isTTY) return {};
  try { return JSON.parse(fs.readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}
function section(file, heading) {
  try {
    const t = fs.readFileSync(path.join(ROOT, file), "utf8");
    const m = t.match(new RegExp(`^## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"));
    return m ? m[1].trim() : "";
  } catch { return ""; }
}
function gitFacts() {
  const branch = sh("git rev-parse --abbrev-ref HEAD");
  const dirty = sh("git status --porcelain", true).split("\n").filter(Boolean).map((l) => l.trim());
  const upstream = sh("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
  const unpushed = upstream ? parseInt(sh("git rev-list --count @{u}..HEAD") || "0", 10) : 0;
  const last = sh("git log -1 --format=%h\\ %s");
  // Has any code, test or rule file changed since STATE.md was last committed?
  const lastCode = sh("git log -1 --format=%H -- app/src app/package.json tests scripts .claude CLAUDE.md");
  const lastState = sh("git log -1 --format=%H -- STATE.md");
  const stateStale = !!(lastCode && lastState && lastCode !== lastState && !ok(`git merge-base --is-ancestor ${lastCode} ${lastState}`));
  return { branch, dirty, upstream, unpushed, last, stateStale };
}

if (mode === "session-start" || mode === "state") {
  const g = gitFacts();
  const out = [];
  out.push("HAZELWOOD OS PROJECT HARNESS");
  out.push("Rules live in CLAUDE.md. Current state lives in STATE.md. Read both before changing anything.");
  out.push(`Git: branch ${g.branch || "?"} | ${g.dirty.length} uncommitted file(s) | ${g.unpushed} commit(s) not pushed | last: ${g.last}`);
  if (g.dirty.length) out.push("WARNING: the working tree is not clean (earlier work may be unsaved):\n  " + g.dirty.slice(0, 8).join("\n  "));
  if (g.stateStale) out.push("WARNING: code changed after STATE.md was last updated. Refresh STATE.md.");
  const resume = section("STATE.md", "Resume here");
  out.push("\nRESUME HERE (from STATE.md):\n" + (resume || "(STATE.md missing a 'Resume here' section: fix that first)"));
  out.push("\nFactory loop: INTAKE > TRIAGE > PLAN > BUILD > VERIFY > SHIP > RECORD > REPORT. Log playtest feedback first (/log-feedback). Verify with `cd app && npm run verify`. Ship with /ship.");
  console.log(out.join("\n"));
  process.exit(0);
}

if (mode === "stop") {
  const input = readInput();
  if (input.stop_hook_active) process.exit(0); // already nudged once: never loop
  const g = gitFacts();
  const problems = [];
  if (g.dirty.length) problems.push(`${g.dirty.length} file(s) are modified or untracked and not committed (${g.dirty.slice(0, 4).join(", ")}${g.dirty.length > 4 ? ", ..." : ""})`);
  if (g.unpushed > 0) problems.push(`${g.unpushed} commit(s) are not pushed to ${g.upstream}`);
  if (g.stateStale && !g.dirty.length) problems.push("code, tests or rules changed since STATE.md was last updated");
  if (!problems.length) process.exit(0);
  const reason = [
    "Project harness: do not finish yet. Project state must be durable in the repo.",
    "Problems: " + problems.join("; ") + ".",
    "Do now: (1) update STATE.md ('Resume here', what changed, known issues), BACKLOG.md and CHANGELOG.md if relevant; (2) commit everything (a WIP commit is fine if you are pausing for the user); (3) push the session branch (and main when delivering a release). Then finish.",
    "If this is a pure question-and-answer turn with nothing to save, say so and stop.",
  ].join("\n");
  console.log(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}

console.error("usage: harness.js session-start | stop | state");
process.exit(2);
