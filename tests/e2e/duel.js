// A friendly duel plays to the end and pays out berries.
const { BASE, OUT, owned, wildsState } = require('../lib');
const { chromium } = require('playwright');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  const team = ['mossling', 'bubbo', 'embit'].map((s, i) => owned('o' + i, s, [45, 20, 0][i], { name: 'Friend' + i }));
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(team));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  await p.locator('button', { hasText: 'Duel' }).last().click(); await p.waitForTimeout(300);
  await p.getByText(/Start duel/).click(); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/shots/duel-start.png` });
  let ended = false;
  for (let i = 0; i < 60 && !ended; i++) {
    ended = await p.getByText(/You won!|Good duel!/).isVisible().catch(() => false); if (ended) break;
    const atk = p.locator('button.flex-\\[2\\]'); if (await atk.isEnabled().catch(() => false)) await atk.click();
    await p.waitForTimeout(2700);
  }
  ok('the duel ends', ended);
  ok('the result screen explains the reward', await p.getByText(/🍓/).first().isVisible().catch(() => false));
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
