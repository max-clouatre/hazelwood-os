// Pixel meadow mode (Grown-up switch): the landing becomes a 3D pixel island; taps, turning, camp workers, flat fallback.
const { serve, owned, wildsState, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const sp = ['mossling', 'bubbo', 'embit', 'bramblit', 'mossling', 'bubbo', 'ducky'];
  const team = sp.map((s, i) => owned('o' + i, s, i * 9));
  const state = wildsState(team, { modes: { camp: true, pixel: true }, camps: { meadow: { workers: ['o6'], extra: 0, basket: 0, speed: 0, since: Date.now() - 600000 } } });
  const open = async (p) => { await p.goto(server.url + '/'); await p.waitForTimeout(300); await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), state); await p.reload(); await p.waitForTimeout(600);
    await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(6000); };
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await open(p);
    ok(`${label}: pixel meadow replaces the flat one`, (await p.getByTestId('pixel-meadow').count()) === 1 && (await p.getByTestId('landing-crew').count()) === 0);
    const st = await p.evaluate(() => window.__pixel && window.__pixel.stats());
    ok(`${label}: 5 crew + 1 camp worker are on the island, drawn small ${JSON.stringify(st && { w: st.w, h: st.h, actors: st.actors, fps: st.fps })}`, !!st && st.actors === 6 && st.w < 520);
    await p.screenshot({ path: `${OUT}/shots/pixel-meadow-${label}.png` });
    // tap the first crew friend
    const pos = await p.evaluate(() => window.__pixel.screenOf(document.__x || (window.__ids && window.__ids[0]) || 'o0'));
    const rect = await p.getByTestId('pixel-meadow').boundingBox();
    // find any crew member on screen and tap it
    let tapped = false;
    for (const id of ['o3', 'o2', 'o1', 'o0', 'o4', 'o5']) {
      const s = await p.evaluate((i) => window.__pixel.screenOf(i), id); if (!s) continue;
      await p.mouse.click(rect.x + s.x, rect.y + s.y); await p.waitForTimeout(500);
      if (await p.locator('span.anim-pop').first().isVisible().catch(() => false)) { tapped = true; break; }
    }
    ok(`${label}: tapping a friend shows a speech bubble`, tapped);
    await p.getByRole('button', { name: 'Turn the view right' }).click(); await p.waitForTimeout(900);
    ok(`${label}: turn button rotates the view`, (await p.evaluate(() => window.__pixel.stats().yawK)) === 1);
    await p.screenshot({ path: `${OUT}/shots/pixel-meadow-turned-${label}.png` });
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(400);
    ok(`${label}: dock and map still work over the pixel meadow`, await p.getByText('Where to explore?').isVisible());
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // no WebGL: the flat meadow takes over by itself
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); }; });
  await open(p);
  ok('no WebGL: falls back to the flat meadow with her crew', (await p.getByTestId('landing-crew').count()) === 1 && (await p.getByTestId('pixel-meadow').count()) === 0);
  ok('no WebGL: no page errors ' + JSON.stringify(errs), errs.length === 0);
  await ctx.close();
  await b.close(); server.close();
})();
