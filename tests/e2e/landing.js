// Merged landing meadow: chosen crew wanders, picker rules, workers visible in camp yard / map / zone cards.
const { serve, owned, wildsState, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const sp = ['mossling', 'bubbo', 'embit', 'bramblit', 'mossling', 'mossling', 'bubbo', 'embit'];
  const team = sp.map((s, i) => owned('o' + i, s, i * 5));
  for (const [label, vp] of [['phone', { width: 390, height: 844 }], ['tablet', { width: 960, height: 600 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const start = async (state) => { await p.goto(server.url + '/'); await p.waitForTimeout(300); await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), state); await p.reload(); await p.waitForTimeout(600);
      await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(1200); };
    const noScroll = async (t) => ok(`${label}: ${t} has no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    // old save (no homeCrew field) with 8 friends: 5 wander by default
    await start(wildsState(team, { camps: { meadow: { workers: ['o7'], extra: 0, basket: 0, speed: 0, since: Date.now() - 20 * 60000 } } }));
    const crew = () => p.getByTestId('landing-crew').locator('button').count();
    ok(`${label}: old save shows 5 friends wandering`, (await crew()) === 5);
    await p.screenshot({ path: `${OUT}/shots/landing-${label}.png` }); await noScroll('landing');
    ok(`${label}: berry pill is tappable on the landing (crew layer does not block it)`, await (async () => { await p.getByRole('button', { name: 'How to get more berries' }).first().click({ timeout: 3000 }).catch(() => {}); const v = await p.getByText('How to get more berries').first().isVisible().catch(() => false); if (v) { await p.getByRole('button', { name: 'Close' }).click(); await p.waitForTimeout(200); } return v; })());
    // crew picker: add up to 7, cannot go below 5, worker is not offered
    await p.getByRole('button', { name: /Crew/ }).click(); await p.waitForTimeout(300);
    ok(`${label}: working friend not in the crew picker`, (await p.locator('[aria-pressed]').count()) === 7);
    await p.screenshot({ path: `${OUT}/shots/landing-crew-${label}.png` });
    await p.locator('[aria-pressed=false]').first().click(); await p.waitForTimeout(150);
    await p.locator('[aria-pressed=false]').first().click(); await p.waitForTimeout(150);
    ok(`${label}: picker now has 7 chosen`, (await p.locator('[aria-pressed=true]').count()) === 7);
    for (let i = 0; i < 4; i++) { await p.locator('[aria-pressed=true]').first().click(); await p.waitForTimeout(100); }
    ok(`${label}: picker will not go below 5`, (await p.locator('[aria-pressed=true]').count()) === 5);
    await p.locator('[aria-pressed=false]').first().click(); await p.waitForTimeout(100);
    await p.getByRole('button', { name: 'Close' }).click(); await p.waitForTimeout(300);
    ok(`${label}: landing shows the chosen 6`, (await crew()) === 6);
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(1200);
    ok(`${label}: crew choice survives a reload`, (await crew()) === 6);
    // map shows the worker on its zone card and a glow badge
    await p.getByRole('button', { name: 'Adventure!' }).click(); await p.waitForTimeout(300);
    ok(`${label}: zone card shows its worker`, (await p.getByTestId('zone-workers-meadow').locator('svg').count()) >= 1);
    ok(`${label}: zone card shows glow waiting`, await p.getByText(/✨ \d+/).first().isVisible());
    await p.screenshot({ path: `${OUT}/shots/landing-map-${label}.png` });
    await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(700);
    ok(`${label}: worker wanders on the zone map`, (await p.getByTestId('map-workers').locator('svg').count()) >= 1);
    await p.screenshot({ path: `${OUT}/shots/landing-explore-${label}.png`}); await noScroll('explore');
    await p.getByRole('button', { name: 'Camp mode' }).click(); await p.waitForTimeout(600);
    ok(`${label}: camp yard shows the worker`, (await p.getByTestId('camp-yard').locator('svg').count()) >= 1);
    await p.screenshot({ path: `${OUT}/shots/landing-camp-${label}.png` }); await noScroll('camp');
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  await b.close(); server.close();
})();
