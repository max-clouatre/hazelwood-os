// Grown-up area > Pixel Lab: opens, builds the 3D pixel scene, runs frames, closes; the main game does not load three.js.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage();
    const errs = [], reqs = []; p.on('pageerror', e => errs.push(e.message)); p.on('request', r => reqs.push(r.url()));
    await p.goto(server.url + '/'); await p.waitForTimeout(1200);
    ok(`${label}: main game does not load three.js up front`, !reqs.some(u => /three\.module/.test(u)));
    await p.getByLabel('Grown-up settings').click(); await p.waitForTimeout(300);
    const q = await p.locator('p.text-5xl').innerText(); const [a, c] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
    await p.getByRole('button', { name: String(a * c), exact: true }).click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /Pixel Lab/ }).click();
    await p.getByTestId('pixel-lab').waitFor(); await p.waitForTimeout(4000);
    ok(`${label}: three.js loads only when the lab opens`, reqs.some(u => /three\.module/.test(u)));
    const px = await p.evaluate(() => { const c = document.querySelector('[data-testid=pixel-lab] canvas'); return c ? { w: c.width, h: c.height } : null; });
    ok(`${label}: low-res canvas exists ${JSON.stringify(px)}`, !!px && px.w === 280);
    const fps = parseInt(await p.getByTestId('pixel-fps').innerText());
    ok(`${label}: scene is running (${fps} fps in software GL)`, fps > 0);
    await p.screenshot({ path: `${OUT}/shots/pixel-lab-${label}.png` });
    await p.getByRole('button', { name: 'Chunky' }).click(); await p.waitForTimeout(2500);
    ok(`${label}: resolution switch rebuilds the canvas`, (await p.evaluate(() => document.querySelector('[data-testid=pixel-lab] canvas').width)) === 200);
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await p.getByRole('button', { name: 'Close' }).click(); await p.waitForTimeout(300);
    ok(`${label}: lab closes`, (await p.getByTestId('pixel-lab').count()) === 0);
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  await b.close(); server.close();
})();
