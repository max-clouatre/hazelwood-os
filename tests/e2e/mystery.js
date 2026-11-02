// What she is chasing is a mystery: a dark shadow, no name, until she catches it.
const { BASE, OUT, owned, wildsState } = require('../lib');
const { chromium } = require('playwright');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState([owned('a', 'ducky', 0)]));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(500);
  const hubText = await p.evaluate(() => document.getElementById('root').innerText);
  ok('Wild of the Day is a mystery until caught (shows a hint instead of a name)', /Wild of the Day[\s\S]*(\?\?\? Mystery[\s\S]*Hint:|appears more often today)/.test(hubText));
  await p.locator('button', { hasText: /^📖Dex/ }).click(); await p.waitForTimeout(400);
  ok('unknown creatures show ??? and where to look', (await p.getByText('???', { exact: true }).count()) > 5);
  await p.screenshot({ path: `${OUT}/shots/mystery-dex.png` });
  await p.getByText('◀ Back').click(); await p.waitForTimeout(300);
  await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(500);
  let found = false;
  for (let i = 0; i < 40 && !found; i++) {
    await p.getByLabel('Rustling bush').first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(1100);
    found = await p.getByText('Throw!').isVisible().catch(() => false);
  }
  ok('exploring finds something', found);
  const text = await p.evaluate(() => document.getElementById('root').innerText);
  ok('the catch screen says ??? instead of a name', /appeared!/.test(text) && /\?\?\? appeared!/.test(text));
  ok('the creature is drawn as a mystery shadow', (await p.locator('svg[aria-label="a mystery"]').count()) >= 1);
  ok('no element, rarity or name is shown yet', !/(Common|Uncommon|Rare|Leaf|Water|Fire|Sun|Moon|Star)\b.*Mystery/.test(text) && /Mystery creature/.test(text));
  await p.screenshot({ path: `${OUT}/shots/mystery-catch.png` });
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
