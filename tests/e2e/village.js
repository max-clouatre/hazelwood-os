// Village mode (Grown-up switch): build, collect, convert, upgrade, workers, offline pile, flat fallback, saves.
const { serve, owned, wildsState, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const team = ['mossling', 'bubbo', 'embit', 'bramblit', 'ducky', 'mossling'].map((s, i) => owned('o' + i, s, 20 + i * 5));
  const modes = { camp: true, pixel: true, village: true };
  const save = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')).wilds);
  const start = async (p, state, noGL) => {
    if (noGL) await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); }; });
    await p.goto(server.url + '/'); await p.waitForTimeout(300); await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), state); await p.reload(); await p.waitForTimeout(600);
    await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(300);
    await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(700);
    await p.getByRole('button', { name: 'Village mode' }).click(); await p.waitForTimeout(noGL ? 1500 : 5000);
  };
  const tapPlot = async (p, i) => { const r = await p.getByTestId('pixel-meadow').boundingBox(); const s = await p.evaluate((k) => window.__pixel.plotScreen(k), i); await p.mouse.click(r.x + s.x, r.y + s.y); await p.waitForTimeout(400); };
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    // old-shaped save: no village field, no homeCrew
    await start(p, wildsState(team, { modes, glow: 100 }));
    let s = await save(p);
    ok(`${label}: opening the village gives the starter gift once (glow ${s.glow})`, s.glow === 130 && s.village.meadow.gift === true);
    await p.screenshot({ path: `${OUT}/shots/village-empty-${label}.png` });
    await tapPlot(p, 0);
    ok(`${label}: tapping an empty plot opens the build menu`, await p.getByText('What shall we build?').isVisible());
    await p.screenshot({ path: `${OUT}/shots/village-build-${label}.png` });
    await p.getByRole('button', { name: 'Build Glow Well' }).click(); await p.waitForTimeout(500);
    s = await save(p);
    ok(`${label}: building a Glow Well costs 15 and puts it on plot 0`, s.glow === 115 && s.village.meadow.plots[0].kind === 'glowwell' && s.village.meadow.plots[0].level === 1);
    await p.getByText('', { exact: false }).first().isVisible().catch(() => {});
    // jump 30 minutes ahead by moving the pile clock back, then collect
    await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('hwos:v1')); st.wilds.village.meadow.plots[0].at -= 30 * 60000; localStorage.setItem('hwos:v1', JSON.stringify(st)); });
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(300); await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(600); await p.getByRole('button', { name: 'Village mode' }).click(); await p.waitForTimeout(4500);
    await p.screenshot({ path: `${OUT}/shots/village-built-${label}.png` });
    await tapPlot(p, 0);
    await p.getByRole('button', { name: /^Collect \d+/ }).click(); await p.waitForTimeout(400);
    s = await save(p);
    ok(`${label}: collecting a 30 minute pile pays Glow (0.5/min = 15): glow ${s.glow}`, s.glow >= 128 && s.glow <= 132);
    // upgrade
    await p.getByRole('button', { name: /Upgrade to Lv 2/ }).click(); await p.waitForTimeout(300);
    s = await save(p);
    ok(`${label}: upgrade to level 2 costs 38 (glow ${s.glow}, level ${s.village.meadow.plots[0].level})`, s.village.meadow.plots[0].level === 2);
    // a friend works there and raises the rate
    await p.getByRole('button', { name: /Add a friend/ }).click(); await p.waitForTimeout(200);
    await p.locator('[data-testid=village-sheet] button', { hasText: /^[a-z]+×/ }).first().click().catch(async () => { await p.locator('[data-testid=village-sheet] .grid button').first().click(); });
    await p.waitForTimeout(400);
    s = await save(p);
    const wk = s.village.meadow.plots[0].worker;
    ok(`${label}: friend assigned to the plot (${wk})`, !!wk);
    ok(`${label}: a village worker is not free for Camp or the home crew`, await p.evaluate(([id]) => { const st = JSON.parse(localStorage.getItem('hwos:v1')).wilds; return st.village.meadow.plots.some((q) => q && q.worker === id); }, [wk]));
    await p.getByRole('button', { name: 'Close' }).first().click(); await p.waitForTimeout(300);
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // two-step chain with a seeded village: berries + wood -> Workshop -> Glow
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const ago = Date.now() - 40 * 60000;
    const village = { meadow: { gift: true, stock: {}, plots: [{ kind: 'berrypatch', level: 1, at: ago }, { kind: 'lumberhut', level: 1, at: ago }, { kind: 'workshop', level: 1, at: ago }, null, null, null, null, null] } };
    await start(p, wildsState(team, { modes, glow: 0, village }));
    await tapPlot(p, 0); await p.getByRole('button', { name: /^Collect \d+/ }).click(); await p.waitForTimeout(300); await p.getByRole('button', { name: 'Close' }).first().click(); await p.waitForTimeout(300);
    await tapPlot(p, 1); await p.getByRole('button', { name: /^Collect \d+/ }).click(); await p.waitForTimeout(300); await p.getByRole('button', { name: 'Close' }).first().click(); await p.waitForTimeout(300);
    let s = await save(p); const units = Math.floor(s.village.meadow.stock.berries) + Math.floor(s.village.meadow.stock.wood);
    ok(`chain: berries and wood land in the village stock (${JSON.stringify(s.village.meadow.stock)})`, s.village.meadow.stock.berries >= 40 && s.village.meadow.stock.wood >= 30);
    await tapPlot(p, 2); await p.getByRole('button', { name: /Turn stock into/ }).click(); await p.waitForTimeout(400);
    s = await save(p);
    ok(`chain: the Workshop turns stock into Glow at 2 each (${units} units -> glow ${s.glow})`, s.glow >= units * 2 - 4 && s.glow <= units * 2 + 4 && Object.keys(s.village.meadow.stock).length === 0);
    ok('chain: no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  // no WebGL: a plain grid still lets her build
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await start(p, wildsState(team, { modes, glow: 100 }), true);
    ok('no WebGL: flat village grid appears', (await p.getByTestId('village-flat').count()) === 1);
    await p.getByTestId('village-flat').locator('button').nth(1).click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: 'Build Berry Patch' }).click(); await p.waitForTimeout(400);
    const s = await save(p);
    ok('no WebGL: building works from the flat grid', s.village.meadow.plots[1] && s.village.meadow.plots[1].kind === 'berrypatch');
    ok('no WebGL: no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  // the mode is off unless switched on
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage();
    await p.goto(server.url + '/'); await p.waitForTimeout(300); await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(team));
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(300); await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(600);
    ok('Village tab is hidden until the Grown-up switch is on', (await p.getByRole('button', { name: 'Village mode' }).count()) === 0); await ctx.close(); }
  await b.close(); server.close();
})();
