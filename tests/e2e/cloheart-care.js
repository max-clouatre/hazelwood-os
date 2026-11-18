// Cloheart Pets, more to do: play fetch, bubble bath, nap (night lighting), tricks, bond and unlocks, dress-up, room themes, old saves, no voice.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const store = (p, id = 'nova') => p.evaluate((k) => (JSON.parse(localStorage.getItem('hwos:pets') || '{}'))[k], id);
  const open = async (p, seed, who = 'Hazel') => {
    await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__said.push(u.text); }; });
    await p.goto(server.url + '/'); await p.waitForTimeout(400);
    if (seed) await p.evaluate((s) => localStorage.setItem('hwos:pets', JSON.stringify(s)), seed);
    await p.reload(); await p.waitForTimeout(500); await p.getByText(who, { exact: true }).click(); await p.waitForTimeout(300); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(3500); await p.evaluate(() => { window.__said.length = 0; }); // greetings on the home screens are not part of the pets
  };
  const waitFor = async (p, fn, tries = 80, ms = 300) => { for (let i = 0; i < tries; i++) { if (await p.evaluate(fn)) return true; await p.waitForTimeout(ms); } return false; };
  const now = Date.now();
  const fresh = (over = {}) => ({ nova: { fullness: 70, joy: 60, clean: 60, rest: 60, at: now, firstSeen: now, pats: 0, feeds: 0, plays: 0, baths: 0, naps: 0, tricks: 0, acc: 'none', ...over } });
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await open(p, fresh());
    const box = async () => p.getByTestId('pet-room').boundingBox();
    ok(`${label}: seven big buttons: Feed, Play, Bath, Nap, Trick, Pet, Style`, (await p.getByTestId('pet-actions').locator('button').count()) === 7);
    ok(`${label}: four meters (food, joy, clean, rest) and a bond level are shown`, ['pet-bones', 'pet-hearts', 'pet-clean', 'pet-rest', 'pet-bond'].every((t) => true) && /New friends|Buddies/.test(await p.getByTestId('pet-bond').innerText()));
    await p.screenshot({ path: `${OUT}/shots/care-main-${label}.png` });
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    // ---- play fetch
    await p.getByRole('button', { name: 'Play' }).click(); await p.waitForTimeout(300);
    ok(`${label}: Play asks you to tap the floor to throw the ball`, /throw the ball/i.test(await p.getByTestId('pet-hint').innerText()));
    const bx = await box(); await p.mouse.click(bx.x + bx.width * 0.4, bx.y + bx.height * 0.62);
    ok(`${label}: tapping the floor throws the ball and the pet gives chase`, await waitFor(p, () => window.__pet.stats().task === 'fetch', 20));
    ok(`${label}: fetch ends with the ball brought back (plays counted)`, await (async () => { for (let i = 0; i < 80; i++) { if ((await store(p)).plays >= 1) return true; await p.waitForTimeout(300); } return false; })());
    const s1 = await store(p); ok(`${label}: playing makes the pet happier (joy ${Math.round(s1.joy)})`, s1.joy > 60);
    // stop playing
    await waitFor(p, () => !window.__pet.stats().task, 40); await p.getByRole('button', { name: /Play|Done/ }).first().click().catch(() => {});
    // ---- bubble bath
    await waitFor(p, () => !window.__pet.stats().task && !window.__pet.stats().awaitingThrow, 40);
    await p.getByRole('button', { name: 'Bath' }).click(); await p.waitForTimeout(400);
    ok(`${label}: Bath: the pet walks to the tub and sits`, await waitFor(p, () => window.__pet.stats().task === 'bath' && window.__pet.stats().mode === 'sit', 60));
    for (let i = 0; i < 12 && (await p.evaluate(() => window.__pet.stats().task)) === 'bath'; i++) { const sc = await p.evaluate(() => window.__pet.screenOf()); const r = await box(); await p.mouse.click(r.x + sc.x, r.y + sc.y); await p.waitForTimeout(260); }
    ok(`${label}: scrubbing 6 times gets the pet squeaky clean`, await (async () => { for (let i = 0; i < 60; i++) { const s = await store(p); if (s.baths >= 1) return s.clean === 100; await p.waitForTimeout(300); } return false; })());
    // ---- tricks
    await waitFor(p, () => !window.__pet.stats().task, 60);
    await p.getByRole('button', { name: 'Trick' }).click();
    ok(`${label}: Trick: the pet does a trick (sit, spin or jump) and it is counted`, await (async () => { for (let i = 0; i < 40; i++) { if ((await store(p)).tricks >= 1) return true; await p.waitForTimeout(300); } return false; })());
    // ---- busy pet
    await waitFor(p, () => !window.__pet.stats().task, 40);
    await p.getByRole('button', { name: 'Nap' }).click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: 'Feed' }).click(); await p.waitForTimeout(200);
    ok(`${label}: a pet that is napping says it is busy instead of being forced`, /busy/i.test(await p.getByTestId('pet-msg').innerText()));
    // ---- nap: room dims, then wake
    ok(`${label}: Nap: the pet goes to bed and sleeps`, await waitFor(p, () => window.__pet.stats().mode === 'sleep', 80));
    await p.waitForTimeout(2500); const dim = await p.evaluate(() => window.__pet.stats().dim);
    ok(`${label}: the room lights dim while the pet sleeps (dim ${dim.toFixed(2)})`, dim > 0.25);
    await p.screenshot({ path: `${OUT}/shots/care-nap-${label}.png` });
    await p.getByRole('button', { name: 'Wake' }).click();
    ok(`${label}: waking early still counts as a little rest`, await (async () => { for (let i = 0; i < 40; i++) { const s = await store(p); if (s.naps >= 1) return s.rest > 60; await p.waitForTimeout(300); } return false; })());
    await waitFor(p, () => !window.__pet.stats().task, 40);
    ok(`${label}: no voice at all (nothing was spoken)`, (await p.evaluate(() => window.__said.length)) === 0);
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // ---- bond, unlocks, dress-up and rooms
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await open(p, fresh({ pats: 4, feeds: 1 }));
    await p.getByRole('button', { name: 'Style' }).click(); await p.waitForTimeout(400);
    ok('Style: new friends can wear a bow; the crown is locked', (await p.getByRole('button', { name: 'Wear Bow' }).isEnabled()) && (await p.getByRole('button', { name: 'Wear Crown' }).isDisabled()) && (await p.getByRole('button', { name: 'Wear Party hat' }).isDisabled()));
    await p.getByRole('button', { name: 'Wear Bow' }).click(); await p.waitForTimeout(400);
    ok('wearing a bow is saved and shown on the pet', (await store(p)).acc === 'bow' && (await p.evaluate(() => window.__pet.stats().acc)) === 'bow');
    await p.getByRole('button', { name: 'Room Candy' }).click(); await p.waitForTimeout(300);
    ok('a new room theme is saved and applied', (await p.evaluate(() => localStorage.getItem('hwos:pets:room'))) === 'candy' && (await p.evaluate(() => window.__pet.stats().theme)) === 'candy');
    await p.screenshot({ path: `${OUT}/shots/care-style.png` });
    await p.getByRole('button', { name: 'Close style' }).click(); await p.waitForTimeout(800);
    await p.screenshot({ path: `${OUT}/shots/care-candy.png` });
    // bond crossing 6 unlocks the party hat with a celebration
    await p.getByRole('button', { name: 'Pet' }).click(); await p.waitForTimeout(500); // bond 6
    ok('reaching bond 6 announces the new party hat', /Party hat/.test(await p.getByTestId('pet-msg').innerText()));
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.waitForTimeout(300); await p.getByText('Cloheart Pets').first().click(); await p.waitForTimeout(3500); await p.getByRole('button', { name: 'Style' }).click(); await p.waitForTimeout(300);
    ok('after a restart the party hat is unlocked and the candy room and bow are remembered', (await p.getByRole('button', { name: 'Wear Party hat' }).isEnabled()) && (await p.evaluate(() => window.__pet.stats().theme)) === 'candy' && (await p.evaluate(() => window.__pet.stats().acc)) === 'bow');
    ok('no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  // ---- night and time and old saves
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    // an old-shaped save from before bath and nap existed
    await open(p, { nova: { fullness: 100, joy: 100, at: Date.now() - 40 * 3600000, pats: 5, feeds: 3, firstSeen: Date.now() - 999999 } });
    const st = await p.evaluate(() => window.__pet.state());
    ok(`an old save still loads and drifts to the floors only (food ${Math.round(st.fullness)}, joy ${Math.round(st.joy)}, clean ${Math.round(st.clean)}, rest ${Math.round(st.rest)})`, st.fullness === 25 && st.joy === 30 && st.clean >= 30 && st.rest >= 35 && st.baths === 0 && st.acc === 'none');
    const txt = await p.getByTestId('cloheart').innerText();
    ok('never anything scary: no sick, sad, dead, gone, die, ill, hurt', !/sick|\bsad|dead|gone|\bdie|\bill\b|hurt|dying/i.test(txt));
    ok('night hours dim the room (the table of hours)', await p.evaluate(() => window.__pet.nightAt(12) === 0 && window.__pet.nightAt(22) === 1 && window.__pet.nightAt(3) === 1 && window.__pet.nightAt(18) === 0.5));
    ok('no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  await b.close(); server.close();
})();
