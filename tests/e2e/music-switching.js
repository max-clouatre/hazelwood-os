// Sound bug guard: only ONE song chain lives at a time; leaving Hazelwild silences everything.
const { serve, owned, wildsState, ROOT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const team = ['mossling', 'bubbo', 'embit', 'bunny'].map((s, i) => owned('o' + i, i === 3 ? 'bramblit' : s, 0));
  await p.goto(server.url + '/'); await p.waitForTimeout(300);
  await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(team));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => ({ cur: window.__hwMusic.current(), alive: window.__hwMusic.alive() }));
  let s = await st();
  ok('hub song plays, one chain alive ' + JSON.stringify(s), s.cur === 'hub' && s.alive === 1);
  for (let i = 0; i < 4; i++) {
    await p.getByRole('button',{name:'Adventure!'}).click(); await p.waitForTimeout(250); await p.locator('button',{hasText:'Meadow'}).first().click(); await p.waitForTimeout(400);
    await p.getByText('◀ Map').first().click(); await p.waitForTimeout(400);
  }
  await p.waitForTimeout(1500);
  s = await st();
  ok('after rapid hub/zone switching only one chain is alive ' + JSON.stringify(s), s.alive === 1);
  await p.getByLabel('Home').click(); await p.waitForTimeout(1500);
  s = await st();
  ok('leaving Hazelwild stops every chain ' + JSON.stringify(s), s.alive === 0 && !s.cur);
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  await b.close(); server.close();
})();
