// The Grown-up "Check for updates" button: with the same version it says up to date; after a new
// version is "deployed" it installs it, restarts, and keeps saved progress. Uses its own temp folder.
const { ROOT, serve } = require('../lib');
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hw-update-'));
  const build = (id) => execSync(`npx vite build --outDir "${tmp}" --emptyOutDir`, { cwd: path.join(ROOT, 'app'), stdio: 'ignore', env: { ...process.env, BUILD_ID: id } });
  build('TEST-A');
  const server = await serve(tmp); const errs = [];
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(server.url + '/'); await p.waitForTimeout(1500);
  ok('installed version is shown on the profile screen', (await p.getByText(/^version /).innerText()) === 'version TEST-A');
  await p.evaluate(() => localStorage.setItem('hwos:marker', 'kept'));
  await p.getByLabel('Grown-up settings').click(); await p.waitForTimeout(300);
  const q = await p.locator('p.text-5xl').innerText(); const [a, c] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
  await p.getByRole('button', { name: String(a * c), exact: true }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Check for updates/ }).click(); await p.waitForTimeout(1200);
  ok('same version says up to date', await p.getByText(/newest version/).isVisible());
  build('TEST-B'); // "deploy" a newer version while the app is open
  await p.getByRole('button', { name: /Check for updates/ }).click();
  await p.waitForNavigation({ timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2500);
  ok('pressing update restarts into the new version', (await p.getByText(/^version /).innerText()) === 'version TEST-B');
  ok('saved progress survives the update', (await p.evaluate(() => localStorage.getItem('hwos:marker'))) === 'kept');
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close(); server.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
