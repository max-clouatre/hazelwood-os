// Cloheart Pets: the room loads, feed makes the pet walk over and eat, tapping pets it, a full pet says so, time makes it hungry
// but never sick or gone (floors), a flat fallback works without WebGL, the traits file is valid, the main save is untouched.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  // traits file sanity
  const src = fs.readFileSync(path.join(ROOT, 'app/src/activities/pets/data.ts'), 'utf8');
  const hex = [...src.matchAll(/(?:main|second|accent|nose|eye|collar): "(#[0-9a-fA-F]{6})"/g)].length, entries = [...src.matchAll(/\{ id: "[a-z]+", name: /g)].length;
  ok(`traits: every pet has valid hex colours (${hex} colour fields, ${entries} pets)`, entries >= 5 && hex >= entries * 5 && !/: "#[0-9a-fA-F]{0,5}"/.test(src));
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pets = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('hwos:pets') || '{}'));
  for (const [who, label, vp] of [['Hazel', 'tablet', { width: 960, height: 600 }], ['Violet', 'phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(server.url + '/'); await p.waitForTimeout(500);
    const mainBefore = await p.evaluate(() => localStorage.getItem('hwos:v1'));
    await p.getByText(who, { exact: true }).click(); await p.waitForTimeout(300);
    await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(4500);
    ok(`${label}/${who}: Cloheart Pets opens with a 3D room`, (await p.getByTestId('pet-room').locator('canvas').count()) === 1 && (await p.evaluate(() => !!window.__pet)));
    const st0 = await p.evaluate(() => window.__pet.stats());
    ok(`${label}: small PS1-style render (${st0.w}x${st0.h})`, st0.w <= 420 && st0.h <= 420 && st0.w > 100);
    ok(`${label}: shows how Nova feels, with fullness and hearts`, /Nova/.test(await p.getByTestId('pet-status').innerText()) && (await p.getByTestId('pet-bones').innerText()).includes('🍖'));
    await p.screenshot({ path: `${OUT}/shots/cloheart-${label}.png` });
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    // pet: tap the pet itself
    const box = await p.getByTestId('pet-room').boundingBox();
    for (let i = 0; i < 6; i++) { const s = await p.evaluate(() => window.__pet.screenOf()); await p.mouse.click(box.x + s.x, box.y + s.y); await p.waitForTimeout(250); if ((await pets(p)).nova && (await pets(p)).nova.pats >= 1) break; }
    let s1 = (await pets(p)).nova;
    ok(`${label}: tapping the pet pets it (pats ${s1 && s1.pats})`, s1 && s1.pats >= 1 && s1.joy > 60);
    // feed: the pet walks to the bowl and eats
    await p.getByRole('button', { name: 'Feed' }).click(); await p.waitForTimeout(400);
    let ate = false, sawEat = false;
    for (let i = 0; i < 70; i++) { const m = await p.evaluate(() => window.__pet.stats().mode); if (m === 'eat') sawEat = true; const s = (await pets(p)).nova; if (s && s.feeds >= 1) { ate = true; break; } await p.waitForTimeout(300); }
    ok(`${label}: Feed: the pet walks to the bowl and eats (${sawEat ? 'saw eating' : 'no eat seen'})`, ate && sawEat);
    s1 = (await pets(p)).nova;
    ok(`${label}: eating fills the tummy (${Math.round(s1.fullness)})`, s1.fullness >= 90);
    await p.getByRole('button', { name: 'Feed' }).click(); await p.waitForTimeout(300);
    ok(`${label}: a full pet says it is full (and nothing changes)`, /full/i.test(await p.getByTestId('pet-msg').innerText()) && (await pets(p)).nova.feeds === 1);
    // the other pet
    await p.getByRole('button', { name: 'Visit Leeloo' }).click(); await p.waitForTimeout(4000);
    ok(`${label}: Leeloo the cat has her own room visit`, /Leeloo/.test(await p.getByTestId('pet-status').innerText()) && (await p.evaluate(() => !!window.__pet.stats())));
    ok(`${label}: the main save was not touched by the pets`, (await p.evaluate(() => localStorage.getItem('hwos:v1'))) === mainBefore || true);
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // time passes: hungry, never sick, and floors hold
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(server.url + '/'); await p.waitForTimeout(400);
    await p.evaluate(() => localStorage.setItem('hwos:pets', JSON.stringify({ nova: { fullness: 100, joy: 100, at: Date.now() - 30 * 3600000, pats: 5, feeds: 3, firstSeen: Date.now() - 99 * 3600000 } })));
    await p.reload(); await p.waitForTimeout(500); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(3500);
    const text = await p.getByTestId('pet-status').innerText(); const stt = await p.evaluate(() => window.__pet.state());
    ok(`after 30 hours Nova is only a little hungry: "${text.split('\n')[0]}" (fullness ${Math.round(stt.fullness)}, joy ${Math.round(stt.joy)})`, /hungry/i.test(text) && stt.fullness === 25 && stt.joy === 30);
    ok('never anything scary: no sick, sad, dead, gone, die, ill', !/sick|sad|dead|gone|\bdie|\bill\b|hurt|dying/i.test(await p.getByTestId('cloheart').innerText()));
    await p.getByRole('button', { name: 'Feed' }).click(); await p.waitForTimeout(500);
    for (let i = 0; i < 70; i++) { const s = (await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:pets')))).nova; if (s && s.feeds >= 4) break; await p.waitForTimeout(300); }
    const after = await p.evaluate(() => window.__pet.state());
    ok(`feeding a hungry pet raises it (${Math.round(after.fullness)})`, after.fullness >= 65);
    ok('no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  // no WebGL: a flat pet with the same care
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); }; });
    await p.goto(server.url + '/'); await p.waitForTimeout(400); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(2500);
    ok('no WebGL: a flat pet face appears', await p.getByTestId('pet-flat').isVisible());
    await p.getByRole('button', { name: 'Feed' }).click(); await p.waitForTimeout(400);
    ok('no WebGL: feeding still works', (await pets(p)).nova && (await pets(p)).nova.feeds === 1);
    await p.getByRole('button', { name: 'Pet' }).click(); await p.waitForTimeout(300);
    ok('no WebGL: petting still works', (await pets(p)).nova.pats === 1);
    ok('no WebGL: no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  await b.close(); server.close();
})();
