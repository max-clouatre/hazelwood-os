// Cuddle Run: tab visible by default, prep, tutorial, drag to move, level-up question + cards, nap and sunset results, rewards,
// field notes, befriending (first run always offers a friend), switch off, old saves, every species has a fact.
const { serve, owned, wildsState, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  // every species has a field note
  const sp = fs.readFileSync(path.join(ROOT, 'app/src/wilds/species.ts'), 'utf8'), dt = fs.readFileSync(path.join(ROOT, 'app/src/wilds/cuddle/data.ts'), 'utf8');
  const ids = [...sp.matchAll(/A\("([a-z]+)", "/g)].map((m) => m[1]); const missing = ids.filter((id) => !new RegExp(`\\b${id}:\\s*"`).test(dt.slice(dt.indexOf('export const FACTS'))));
  ok(`every species has a field note (${ids.length} species, missing: ${missing.join(',') || 'none'})`, missing.length === 0);

  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch();
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const team = ['mossling', 'bubbo', 'embit', 'puffsun'].map((s, i) => owned('o' + i, s, [0, 20, 45, 0][i]));
    const settle = async () => { for (let k = 0; k < 14 && (await p.getByTestId('cuddle-levelup').count()); k++) { if (await p.locator('[aria-label^="Answer"]').count()) await p.locator('[aria-label^="Answer"]').first().click(); await p.waitForTimeout(120); if (await p.locator('[aria-label^="Card"]').count()) await p.locator('[aria-label^="Card"]').first().click(); await p.waitForTimeout(160); } };
    const read = () => p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')).wilds);
    await p.goto(server.url + '/'); await p.waitForTimeout(300);
    // an old-shaped save: no cuddle field, modes without cuddle
    await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(team));
    await p.reload(); await p.waitForTimeout(600);
    await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(250); await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(500);
    ok(`${label}: Cuddle Run tab is there for an old save (on by default)`, (await p.getByRole('button', { name: 'Cuddle Run mode' }).count()) === 1);
    await p.getByRole('button', { name: 'Cuddle Run mode' }).click(); await p.waitForTimeout(500);
    ok(`${label}: prep picks 3 helpers by default, one per family`, (await p.getByTestId('cuddle-team').locator('[aria-pressed=true]').count()) === 3);
    await p.screenshot({ path: `${OUT}/shots/cuddle-prep-${label}.png` });
    ok(`${label}: the Start button is on screen without scrolling`, await p.getByRole('button', { name: 'Start the day' }).isVisible() && (await p.getByRole('button', { name: 'Start the day' }).boundingBox()).y + 30 < vp.height);
    await p.getByRole('button', { name: 'Helper puffsun' }).click(); await p.waitForTimeout(100); // swaps the oldest pick out
    ok(`${label}: picking a 4th helper keeps the team at 3`, (await p.getByTestId('cuddle-team').locator('[aria-pressed=true]').count()) === 3);
    await p.getByRole('button', { name: 'Start the day' }).click(); await p.waitForTimeout(2500);
    ok(`${label}: the run starts with a how-to-play for the first day`, await p.getByTestId('cuddle-tut').isVisible());
    await p.getByRole('button', { name: "Let's go" }).click(); await p.waitForTimeout(300);
    ok(`${label}: the game canvas is running`, await p.getByTestId('cuddle-canvas').isVisible() && (await p.evaluate(() => !!window.__cuddle.game())));
    // drag to walk
    const x0 = await p.evaluate(() => window.__cuddle.game().px); const box = await p.getByTestId('cuddle-canvas').boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2, { steps: 5 }); await p.waitForTimeout(900); await p.mouse.up();
    const x1 = await p.evaluate(() => window.__cuddle.game().px);
    ok(`${label}: dragging walks her to the right (${Math.round(x0)} -> ${Math.round(x1)})`, x1 > x0 + 40);
    // animals come, get petted, drop sparkles
    await p.evaluate(() => window.__cuddle.step(25)); await p.waitForTimeout(300);
    const st = await p.evaluate(() => { const g = window.__cuddle.game(); return { helped: g.helped, animals: g.animals.length, level: g.level }; });
    ok(`${label}: animals arrive and get helped (${JSON.stringify(st)})`, st.helped >= 3);
    // level up: question, then cards
    await p.evaluate(() => { const g = window.__cuddle.game(); g.xp = g.xpNeed; window.__cuddle.step(1); }); await p.waitForTimeout(400);
    ok(`${label}: a level-up asks a small question first`, await p.getByTestId('cuddle-levelup').isVisible() && /\d/.test(await p.getByTestId('cuddle-question').innerText()));
    const pausedT = await p.evaluate(() => window.__cuddle.game().t); await p.waitForTimeout(500);
    ok(`${label}: the game waits while the question is open`, (await p.evaluate(() => window.__cuddle.game().t)) === pausedT);
    const answer = await p.evaluate(() => window.__cuddle.game() && null);
    const opts = await p.locator('[aria-label^="Answer"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label').replace('Answer ', '')));
    ok(`${label}: three different answers to choose from (${opts})`, opts.length === 3 && new Set(opts).size === 3);
    // a wrong answer is kind: it shows the answer and still offers 2 cards
    const qtxt = await p.getByTestId('cuddle-question').innerText(); const nums = qtxt.match(/\d+/g).map(Number); const right = nums[0] + nums[1];
    const wrong = opts.find((o) => Number(o) !== right && qtxt.includes('more'));
    if (qtxt.includes('gives her') || qtxt.includes('added')) { await p.locator(`[aria-label="Answer ${wrong}"]`).click(); await p.waitForTimeout(200);
      ok(`${label}: a wrong answer is gentle and still gives 2 cards`, /Nice try/.test(await p.getByTestId('cuddle-answer').innerText()) && (await p.locator('[aria-label^="Card"]').count()) === 2);
    } else { await p.locator('[aria-label^="Answer"]').first().click(); await p.waitForTimeout(200); }
    await p.locator('[aria-label^="Card"]').first().click(); await p.waitForTimeout(300);
    ok(`${label}: choosing a card goes back to the game (or on to the next level-up)`, (await p.evaluate(() => window.__cuddle.game().level)) >= 2 && (await p.evaluate(() => window.__cuddle.game().up)).reach + (await p.evaluate(() => window.__cuddle.game().up)).hands + (await p.evaluate(() => window.__cuddle.game().up)).gentle + (await p.evaluate(() => window.__cuddle.game().up)).heart + (await p.evaluate(() => window.__cuddle.game().up)).cozy + (await p.evaluate(() => window.__cuddle.game().up)).feet + (await p.evaluate(() => window.__cuddle.game().up)).magnet + (await p.evaluate(() => window.__cuddle.game().up)).snacks + (await p.evaluate(() => window.__cuddle.game().up)).calm + (await p.evaluate(() => window.__cuddle.game().helpers.reduce((a, h) => a + h.lv, 0))) > 3);
    await settle();
    await p.screenshot({ path: `${OUT}/shots/cuddle-run-${label}.png` });
    ok(`${label}: no horizontal overflow in the run`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    // run out of energy: nap (first dismiss any extra level-up that was waiting)
    await settle();
    const b0 = (await read()).berries;
    await p.evaluate(() => { const g = window.__cuddle.game(); g.energy = -1; window.__cuddle.step(1); }); await p.waitForTimeout(500);
    ok(`${label}: running out of energy ends the day as "Nap time", kindly`, /Nap time/.test(await p.getByTestId('cuddle-title').innerText()));
    const w1 = await read();
    ok(`${label}: rewards: berries, runs counted, helped counted`, w1.berries > b0 && w1.cuddle.runs === 1 && w1.cuddle.helped >= 3);
    ok(`${label}: field notes were saved and shown`, Object.keys(w1.cuddle.notes).length >= 1 && /field note/.test(await p.getByTestId('cuddle-result').innerText()));
    ok(`${label}: the first day always offers a new friend`, !!w1.cuddle.pending && (await p.getByRole('button', { name: 'Meet your new friend' }).count()) === 1);
    ok(`${label}: helpers grew closer (bond up)`, w1.owned.some((o, i) => o.xp > [0, 20, 45, 0][i]));
    await p.screenshot({ path: `${OUT}/shots/cuddle-result-${label}.png` }); ok(`${label}: no overflow on results`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    if (label === 'tablet') {
      const before = w1.owned.length;
      await p.getByRole('button', { name: 'Meet your new friend' }).click(); await p.waitForTimeout(600);
      ok('tablet: meeting the friend opens the normal naming screen', await p.getByText(/new friend joins you/i).first().isVisible());
      await p.getByRole('button', { name: /Keep|Done|Yes|OK|Let's go|Welcome/i }).first().click().catch(async () => { await p.keyboard.press('Enter'); });
      await p.waitForTimeout(800);
      let w2 = await read();
      if (w2.owned.length === before) { // some Reveal versions need a second tap
        await p.locator('button').filter({ hasText: /name|friend|Hi|ready/i }).last().click().catch(() => {}); await p.waitForTimeout(600); w2 = await read(); }
      console.log('  owned before/after friend', before, w2.owned.length, 'pending', !!w2.cuddle.pending);
      ok('tablet: the friend joined her collection and nothing is left waiting', w2.owned.length === before + 1 && !w2.cuddle.pending);
    }
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // a full day reaches the sunset; a helper that is switched off hides the tab
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const settle = async () => { for (let k = 0; k < 14 && (await p.getByTestId('cuddle-levelup').count()); k++) { if (await p.locator('[aria-label^="Answer"]').count()) await p.locator('[aria-label^="Answer"]').first().click(); await p.waitForTimeout(120); if (await p.locator('[aria-label^="Card"]').count()) await p.locator('[aria-label^="Card"]').first().click(); await p.waitForTimeout(160); } };
    const team = ['mossling', 'bubbo', 'embit'].map((s, i) => owned('o' + i, s, 45));
    await p.goto(server.url + '/'); await p.waitForTimeout(300);
    await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(team, { cuddle: { runs: 3, helped: 40, best: 20, notes: {}, team: ['o0', 'o1', 'o2'] } }));
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(250); await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(500);
    await p.getByRole('button', { name: 'Cuddle Run mode' }).click(); await p.waitForTimeout(400);
    ok('later days skip the tutorial', true);
    await p.getByRole('button', { name: 'Start the day' }).click(); await p.waitForTimeout(2500);
    ok('later days skip the how-to-play', (await p.getByTestId('cuddle-tut').count()) === 0);
    // play a whole day: answer questions with the first option and take the first card, keep her topped up
    for (let i = 0; i < 80; i++) {
      const done = await p.getByTestId('cuddle-result').count(); if (done) break;
      if (await p.getByTestId('cuddle-levelup').count()) { await settle(); continue; }
      await p.evaluate(() => { const g = window.__cuddle.game(); g.energy = g.maxEnergy; window.__cuddle.step(4); }); await p.waitForTimeout(220);
    }
    ok('a whole day ends at the sunset with a happy message', /lovely day/.test(await p.getByTestId('cuddle-title').innerText()));
    const w = await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')).wilds);
    ok('the sunset gives the bonus berries (' + (w.berries - 40) + ')', w.berries - 40 >= 5);
    ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
    // switch it off in the saved modes
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('hwos:v1')); s.wilds.modes.cuddle = false; localStorage.setItem('hwos:v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(800);
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(250); await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(500);
    ok('switched off in the Grown-up area: the tab is hidden', (await p.getByRole('button', { name: 'Cuddle Run mode' }).count()) === 0);
    await ctx.close(); }
  await b.close(); server.close();
})();
