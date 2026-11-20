// Cloheart Pets yard scene: a garden theme with a fence, tree, pool and butterflies; chases butterflies; day sun / night moon; every care action still works; remembered after restart.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const now = Date.now();
  const seed = { nova: { fullness: 70, joy: 60, clean: 60, rest: 60, at: now, firstSeen: now, pats: 0, feeds: 0, plays: 0, baths: 0, naps: 0, tricks: 0, acc: 'none' } };
  const open = async (p, hour = 12) => {
    await p.clock.setFixedTime(new Date(2026, 10, 20, hour, 0, 0));
    await p.goto(server.url + '/'); await p.waitForTimeout(400);
    await p.evaluate((s) => { localStorage.setItem('hwos:pets', JSON.stringify(s)); }, seed);
    await p.reload(); await p.waitForTimeout(500); await p.getByText('Hazel', { exact: true }).click(); await p.waitForTimeout(300); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(3500);
  };
  const waitFor = async (p, fn, tries = 80, ms = 300) => { for (let i = 0; i < tries; i++) { if (await p.evaluate(fn)) return true; await p.waitForTimeout(ms); } return false; };
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await open(p);
    await p.getByRole('button', { name: 'Style' }).click(); await p.waitForTimeout(400);
    ok(`${label}: Style offers a Yard room`, (await p.getByRole('button', { name: 'Room Yard' }).count()) === 1);
    await p.getByRole('button', { name: 'Room Yard' }).click(); await p.waitForTimeout(400);
    ok(`${label}: choosing the Yard applies it, adds three butterflies and saves it`, (await p.evaluate(() => window.__pet.stats().theme)) === 'yard' && (await p.evaluate(() => window.__pet.stats().flies)) === 3 && (await p.evaluate(() => localStorage.getItem('hwos:pets:room'))) === 'yard');
    await p.getByRole('button', { name: 'Close style' }).click(); await p.waitForTimeout(900);
    await p.screenshot({ path: `${OUT}/shots/yard-${label}.png` });
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    if (label === 'tablet') {
      ok('the pet chases a butterfly while wandering', await waitFor(p, () => window.__pet.stats().chases >= 1, 150, 300));
      // care still works in the yard
      await p.getByRole('button', { name: 'Feed' }).click(); ok('feeding works in the yard', await waitFor(p, () => window.__pet.stats().task === 'feed', 20));
      await waitFor(p, () => window.__pet.stats().task === null, 60);
      await p.getByRole('button', { name: 'Bath' }).click(); ok('a bath at the wading pool starts', await waitFor(p, () => window.__pet.stats().task === 'bath', 20));
      await p.waitForTimeout(2500); await p.screenshot({ path: `${OUT}/shots/yard-bath.png` });
      for (let i = 0; i < 6; i++) { await p.getByRole('button', { name: 'Pet' }).click(); await p.waitForTimeout(250); }
      await waitFor(p, () => window.__pet.stats().task === null, 200);
      await p.getByRole('button', { name: 'Nap' }).click(); ok('napping under the tree works', await waitFor(p, () => window.__pet.stats().task === 'nap', 20));
      await waitFor(p, () => window.__pet.stats().mode === 'sleep', 60); await p.waitForTimeout(1800); await p.screenshot({ path: `${OUT}/shots/yard-nap.png` });
      ok('napping dims the light (the yard gets dusky)', (await p.evaluate(() => window.__pet.stats().dim)) > 0.2);
      await p.getByRole('button', { name: 'Pet' }).click(); await waitFor(p, () => window.__pet.stats().task === null, 60);
      // restart: the yard is remembered
      await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.waitForTimeout(300); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(3500);
      ok('after a restart the yard is still the room', (await p.evaluate(() => window.__pet.stats().theme)) === 'yard');
      // switching back and forth does not break the other rooms
      await p.getByRole('button', { name: 'Style' }).click(); await p.waitForTimeout(300); await p.getByRole('button', { name: 'Room Cozy' }).click(); await p.waitForTimeout(500);
      ok('switching back to Cozy removes the butterflies', (await p.evaluate(() => window.__pet.stats().theme)) === 'cozy' && (await p.evaluate(() => window.__pet.stats().flies)) === 0);
    }
    ok(`${label}: no page errors ` + JSON.stringify(errs), errs.length === 0); await ctx.close();
  }
  // ---- at night the sun goes, the moon comes, the butterflies sleep
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await open(p, 22); await p.evaluate(() => localStorage.setItem('hwos:pets:room', 'yard')); await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.waitForTimeout(300); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(4500);
    ok('at night the yard dims', (await p.evaluate(() => window.__pet.stats().theme)) === 'yard' && (await p.evaluate(() => window.__pet.stats().dim)) > 0.2);
    await p.screenshot({ path: `${OUT}/shots/yard-night.png` });
    ok('no page errors at night ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  await b.close(); server.close();
})();
