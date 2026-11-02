// Grown-up area > Pixel Lab: opens, runs the pixel diorama, dials work, closes; three.js loads lazily.
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
    await p.getByTestId('pixel-lab').waitFor(); await p.waitForTimeout(5000);
    ok(`${label}: three.js loads only when the lab opens`, reqs.some(u => /three\.module/.test(u)));
    const st = await p.evaluate(() => window.__pixel && window.__pixel.stats());
    ok(`${label}: diorama is running with 8 friends ${JSON.stringify(st && { w: st.w, h: st.h, fps: st.fps, actors: st.actors })}`, !!st && st.actors === 8 && st.w < 600);
    await p.screenshot({ path: `${OUT}/shots/pixel-lab-${label}.png` });
    await p.getByRole('button', { name: 'Outlines' }).click(); await p.getByRole('button', { name: 'Dither' }).click(); await p.waitForTimeout(300);
    const st2 = await p.evaluate(() => window.__pixel.stats());
    ok(`${label}: dials switch the effects off`, !st2.post.outline && !st2.post.dither && st2.post.palette);
    await p.locator('input[type=range]').fill('5'); await p.waitForTimeout(800);
    const st3 = await p.evaluate(() => window.__pixel.stats());
    ok(`${label}: pixel size slider makes the picture smaller (${st.w} -> ${st3.w})`, st3.w < st.w);
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await p.getByRole('button', { name: 'Close' }).click(); await p.waitForTimeout(300);
    ok(`${label}: lab closes`, (await p.getByTestId('pixel-lab').count()) === 0);
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  await b.close(); server.close();
})();
