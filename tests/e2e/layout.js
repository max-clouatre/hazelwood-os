// Every screen of every activity fits the screen, for both kids, on a tablet and a phone, with no console errors.
const { BASE } = require('../lib');
const { chromium } = require('playwright');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
const SIZES = process.env.FULL ? [[960, 600], [600, 960], [800, 480], [390, 844]] : [[960, 600], [390, 844]];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [w, h] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto(BASE + '/'); await p.waitForTimeout(500);
    for (const who of ['Violet', 'Hazel']) {
      await p.getByText(who, { exact: true }).first().click(); await p.waitForTimeout(500);
      const n = (await p.$$('button.anim-pop')).length;
      for (let i = 0; i < n; i++) {
        const cards = await p.$$('button.anim-pop'); const label = (await cards[i].innerText()).replace(/\n/g, ' ');
        await cards[i].click(); await p.waitForTimeout(900);
        const over = await p.evaluate(() => { const W = innerWidth, H = innerHeight; return [...document.querySelectorAll('button,canvas,p')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > W + 2 || r.bottom > H + 2 || r.left < -2) && !e.closest('.overflow-y-auto,.overflow-auto'); }).length; });
        ok(`${w}x${h} ${who} ${label}`, over === 0);
        await p.getByLabel('Home').click(); await p.waitForTimeout(200);
      }
      await p.getByLabel('Home').click(); await p.waitForTimeout(200);
    }
    await ctx.close();
  }
  ok('no console or page errors ' + JSON.stringify(errs.slice(0, 3)), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
