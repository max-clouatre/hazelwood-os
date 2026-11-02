// Hazel's Color by Number: a wrong tap never fills; filling every shape completes the picture and pays 2 stars.
const { BASE, OUT } = require('../lib');
const { chromium } = require('playwright');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/'); await p.waitForTimeout(600);
  await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Color by Number').first().click(); await p.waitForTimeout(400);
  const pages = await p.locator('button.overflow-hidden').count(); ok('eight pictures to choose from', pages === 8);
  const stars = async () => (await p.locator('text=/^⭐ \\d+$/').first().innerText()).trim();
  await p.locator('button.overflow-hidden').nth(0).click(); await p.waitForTimeout(400);
  const info = await p.evaluate(() => ({ ids: [...document.querySelectorAll('svg path[data-region]')].map(e => e.dataset.region), nums: [...document.querySelectorAll('svg text')].map(t => t.textContent) }));
  ok('every shape shows a number', info.ids.length === info.nums.length && info.ids.length > 5);
  const wrongIdx = info.nums.findIndex(n => n !== '1');
  await p.locator('svg path[data-region]').nth(wrongIdx).evaluate(el => el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await p.waitForTimeout(150);
  const filled = await p.evaluate(() => [...document.querySelectorAll('svg path[data-region]')].filter(e => !['#ffffff', '#fff2a8'].includes(e.getAttribute('fill'))).length);
  ok('a wrong tap does not fill', filled === 0);
  const maxN = Math.max(...info.nums.map(Number));
  for (let k = 1; k <= maxN; k++) { await p.getByLabel(new RegExp('^number ' + k + ' ')).click(); for (let i = 0; i < info.ids.length; i++) if (info.nums[i] === String(k)) await p.locator('svg path[data-region]').nth(i).evaluate(el => el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await p.waitForTimeout(100); }
  await p.waitForTimeout(700);
  ok('completing the picture shows the banner', await p.getByText('You did it!').isVisible());
  ok('finishing pays 2 stars', (await stars()) === '⭐ 2');
  await p.screenshot({ path: `${OUT}/shots/cbn-done.png` });
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
