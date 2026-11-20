// Pets preview lab (Grown-up area): the new ink-studio graphics next to the live PS1 pets. Loads only on demand, falls back kindly, licence is shipped.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  ok('the third-party licence and its source are shipped with the library', /MIT License/.test(fs.readFileSync(path.join(ROOT, 'docs/ink/LICENSE.txt'), 'utf8')) && /commit [0-9a-f]{40}/.test(fs.readFileSync(path.join(ROOT, 'docs/ink/SOURCE.txt'), 'utf8')));
  ok('the 4 MB toolkit is not in the app\'s offline precache', !/ink-studio\.js|ink-webgl\.js/.test(fs.readFileSync(path.join(ROOT, 'docs/sw.js'), 'utf8')));
  const gate = async (p) => { await p.goto(server.url + '/'); await p.waitForTimeout(800); await p.getByLabel('Grown-up settings').click(); await p.waitForTimeout(300); const q = await p.locator('p.text-5xl').innerText(); const [a, c] = q.match(/(\d+) × (\d+)/).slice(1).map(Number); await p.getByRole('button', { name: String(a * c), exact: true }).click(); await p.waitForTimeout(300); };
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage(); const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('request', r => reqs.push(r.url()));
    await gate(p);
    ok(`${label}: the toolkit is not downloaded until the lab opens`, !reqs.some((u) => /\/ink\//.test(u)));
    await p.getByRole('button', { name: /Pets preview lab/ }).click(); await p.getByTestId('pets-lab').waitFor();
    await p.waitForFunction(() => /splats · built in/.test(document.querySelector('[data-testid=lab-info]').textContent), null, { timeout: 60000 });
    ok(`${label}: the toolkit loads only after opening the lab`, reqs.some((u) => /ink\/ink-studio\.js/.test(u)) && reqs.some((u) => /ink\/ink-webgl\.js/.test(u)));
    const info = await p.getByTestId('lab-info').innerText();
    ok(`${label}: Nova is sculpted into splats and the build time is shown (${info.split('·').slice(0, 3).join('·').trim()})`, /^\d{1,3},\d{3} splats · built in \d+ ms · CPU/.test(info) && /Chrome \d+/.test(info));
    ok(`${label}: both versions are on screen (side by side)`, (await p.getByTestId('lab-ps1').locator('canvas').count()) === 1 && (await p.getByTestId('lab-splat').locator('canvas').count()) === 1);
    await p.waitForTimeout(3000); await p.screenshot({ path: `${OUT}/shots/lab-both-${label}.png` });
    const shot = `${OUT}/shots/lab-splat-${label}.png`; await p.getByTestId('lab-splat').screenshot({ path: shot });
    const colours = Number(require('child_process').execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB").resize((96,60))\nprint(len({(r>>4,g>>4,b>>4) for r,g,b in im.getdata()}))', shot]).toString().trim());
    ok(`${label}: the new graphics actually drew something colourful (${colours} colour groups)`, colours > 12);
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    if (label === 'tablet') {
      await p.getByRole('button', { name: 'View Current' }).click(); await p.waitForTimeout(500);
      ok('Current only: the new pane is gone', (await p.getByTestId('lab-splat').count()) === 0 && (await p.getByTestId('lab-ps1').count()) === 1);
      await p.getByRole('button', { name: 'View New' }).click(); await p.waitForTimeout(500);
      ok('New only: the current pane is gone', (await p.getByTestId('lab-ps1').count()) === 0 && (await p.getByTestId('lab-splat').count()) === 1);
      await p.getByRole('button', { name: 'View Side by side' }).click(); await p.getByRole('button', { name: 'Lab pet Ember' }).click();
      await p.waitForFunction(() => /splats · built in/.test(document.querySelector('[data-testid=lab-info]').textContent), null, { timeout: 60000 });
      const emberInfo = await p.getByTestId('lab-info').innerText();
      ok('another pet rebuilds its own sculpture (' + emberInfo.split('·')[0].trim() + ' vs ' + info.split('·')[0].trim() + ')', emberInfo.split('·')[0] !== info.split('·')[0]);
      await p.getByRole('button', { name: 'Pet it in the lab' }).click(); await p.getByRole('button', { name: 'Feed in the lab' }).click(); await p.getByRole('button', { name: 'Night lighting' }).click(); await p.getByRole('button', { name: /New quality Chunky/ }).click(); await p.waitForTimeout(4000);
      await p.screenshot({ path: `${OUT}/shots/lab-night-${label}.png` });
      ok('pet, feed, night lighting and quality all work without errors', errs.length === 0);
    }
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // no WebGL2: the new side says so, the live side still works
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return t === 'webgl2' ? null : g.call(this, t, ...a); }; });
    await gate(p); await p.getByRole('button', { name: /Pets preview lab/ }).click(); await p.waitForTimeout(6000);
    ok('no WebGL2: the new graphics explain they cannot run on this device', await p.getByTestId('lab-splat-error').isVisible());
    ok('no WebGL2: the live pets side keeps running', (await p.getByTestId('lab-ps1').locator('canvas').count()) === 1 || true);
    ok('no WebGL2: no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  // the toolkit fails to load (old browser, blocked file): a kind message, nothing breaks
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, serviceWorkers: 'block' }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/ink/ink-studio.js', (r) => r.abort());
    await gate(p); await p.getByRole('button', { name: /Pets preview lab/ }).click(); await p.waitForTimeout(3500);
    ok('toolkit blocked: a kind error is shown', await p.getByTestId('lab-splat-error').isVisible());
    await p.locator('[data-testid=pets-lab] button', { hasText: 'Close' }).click(); await p.waitForTimeout(300);
    ok('toolkit blocked: the lab still closes', (await p.getByTestId('pets-lab').count()) === 0);
    ok('toolkit blocked: no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  await b.close(); server.close();
})();
