// Vendors ink-studio (MIT, https://github.com/siliconjungle/shapeshift-labs-ink-studio) for the Pets preview lab.
// Usage:  node scripts/vendor-ink.js /path/to/a/clone/of/ink-studio
// Writes app/public/ink/: ink-studio.js (toolkit, minified to Chrome 67 syntax, exposes window.__INK__), ink-webgl.js (WebGL2 renderer, window.InkWebGL),
// LICENSE.txt (its MIT licence, kept as required) and SOURCE.txt (which commit this came from). Loaded only when the lab opens, never part of the app bundle.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const src = path.resolve(process.argv[2] || ""); if (!fs.existsSync(path.join(src, "index.js"))) { console.error("pass the path to an ink-studio checkout"); process.exit(1); }
const esbuild = require(path.join(__dirname, "../app/node_modules/esbuild"));
const out = path.join(__dirname, "../app/public/ink"); fs.mkdirSync(out, { recursive: true });
const studio = require(path.join(src, "index.js"));
const names = String(studio.EXPORTS).split(/\s*,\s*/).filter((n) => /^[A-Za-z_$][\w$]*$/.test(n));
const clone = `if(typeof structuredClone!=="function"){var __sc=function(v,m){if(v===null||typeof v!=="object")return v;m=m||new Map();if(m.has(v))return m.get(v);var r;if(v instanceof Date)return new Date(v.getTime());if(ArrayBuffer.isView(v))return new v.constructor(v);if(v instanceof ArrayBuffer)return v.slice(0);if(v instanceof Map){r=new Map();m.set(v,r);v.forEach(function(x,k){r.set(__sc(k,m),__sc(x,m))});return r}if(v instanceof Set){r=new Set();m.set(v,r);v.forEach(function(x){r.add(__sc(x,m))});return r}r=Array.isArray(v)?[]:{};m.set(v,r);Object.keys(v).forEach(function(k){r[k]=__sc(v[k],m)});return r};window.structuredClone=function(v){return __sc(v)}}\n`;
const expose = `\n;(function(){var o={};${names.map((n) => `if(typeof ${n}!=="undefined")o.${n}=${n};`).join("")}window.__INK__=o;})();\n`;
const kit = esbuild.transformSync(clone + studio.bundle() + expose, { minify: true, target: "es2019", supported: { bigint: true }, logLevel: "warning" });
fs.writeFileSync(path.join(out, "ink-studio.js"), kit.code);
esbuild.buildSync({ entryPoints: [path.join(src, "webgl.mjs")], bundle: true, format: "iife", globalName: "InkWebGL", target: "es2019", supported: { bigint: true }, minify: true, outfile: path.join(out, "ink-webgl.js"), logLevel: "error" });
fs.copyFileSync(path.join(src, "LICENSE"), path.join(out, "LICENSE.txt"));
let sha = "unknown"; try { sha = cp.execSync("git rev-parse HEAD", { cwd: src }).toString().trim(); } catch { /* not a git checkout */ }
fs.writeFileSync(path.join(out, "SOURCE.txt"), `ink-studio (MIT licence, see LICENSE.txt)\nhttps://github.com/siliconjungle/shapeshift-labs-ink-studio\ncommit ${sha}\nvendored with scripts/vendor-ink.js (bundle + minify to es2019, WebGL renderer bundled to one file)\n`);
for (const f of fs.readdirSync(out)) console.log(f, fs.statSync(path.join(out, f)).size);
