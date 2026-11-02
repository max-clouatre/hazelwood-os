// Renders every song off-screen and checks it makes sound at a sane level; then switches songs live.
const { BASE } = require('../lib');
const { chromium } = require('playwright');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 800, height: 700 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(BASE + '/#music');
  await p.waitForFunction(() => [...document.querySelectorAll('[data-stat]')].every(e => !e.textContent.includes('measuring')), null, { timeout: 90000 });
  const rows = await p.$$eval('[data-stat]', els => els.map(e => [e.getAttribute('data-stat'), e.textContent]));
  for (const [id, t] of rows) {
    const peak = parseFloat(/peak ([\d.]+)/.exec(t)[1]), avg = parseFloat(/avg ([\d.]+)/.exec(t)[1]);
    ok(`song "${id}" is audible and does not clip (${t.split(' · ').slice(0, 2).join(', ')})`, peak < 0.9 && peak > 0.05 && avg > 0.005);
  }
  ok('seven songs exist', rows.length === 7);
  for (const id of ['hub', 'meadow', 'forest', 'shore', 'cave', 'peak', 'duel']) { await p.getByRole('button', { name: new RegExp('▶ ' + id + '$') }).click(); await p.waitForTimeout(1200); }
  ok('switching songs live causes no errors ' + JSON.stringify(errs), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
