// Regression test for the "gray boxes around everything" bug on the family tablet (an old Android Chrome, before v88).
// Simulates that browser: Tailwind's :where() rules are unreadable (so the browser drops them), Array.prototype.at
// is missing, and the offline cache is bypassed. Then checks that buttons have no default gray face.
const { BASE, OUT, owned, wildsState } = require('../lib');
const { chromium } = require('playwright');
const ok = (l, v) => console.log((v ? 'PASS ' : 'FAIL ') + l);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 600, height: 960 }, hasTouch: true, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*.css', async (route) => {
    const r = await route.fetch(); let css = await r.text();
    css = css.replace(/input:where\(\[type=button\]\),input:where\(\[type=reset\]\),input:where\(\[type=submit\]\)/g, 'input:not-a-real-pseudo(x)');
    await route.fulfill({ response: r, body: css });
  });
  await p.addInitScript(() => { delete Array.prototype.at; Object.defineProperty(Array.prototype, 'at', { value() { throw new Error('Array.at was called!'); }, writable: false, configurable: false }); });
  const team = ['mossling', 'bramblit', 'fernfox', 'bubbo', 'embit', 'lunalet'].map((s, i) => owned('o' + i, s, [0, 20, 45][i % 3]));
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(team));
  await p.reload(); await p.waitForTimeout(600);
  const plainButtons = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => !/(^|\s)bg-/.test(b.className) && !b.getAttribute('style')?.includes('background')).map(b => getComputedStyle(b).backgroundColor));
  const clean = async (label) => { const bgs = await plainButtons(); ok(`${label}: buttons without a background class have no gray face (${[...new Set(bgs)].join(',') || 'none'})`, bgs.every(c => c === 'rgba(0, 0, 0, 0)')); };

  await p.getByText('Violet', { exact: true }).click(); await p.waitForTimeout(400);
  await p.getByText('Letter Pals').first().click(); await p.waitForTimeout(500); await clean('Violet / Letter Pals');
  await p.getByLabel('Home').click(); await p.getByLabel('Home').click(); await p.waitForTimeout(300);
  await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(500);
  await p.locator('button', { hasText: 'Home' }).last().click(); await p.waitForTimeout(900); await clean('Hazelwild / Home meadow');
  await p.screenshot({ path: `${OUT}/shots/old-chrome-habitat.png` });
  await p.getByText('◀ Back').first().click(); await p.waitForTimeout(300);
  await p.locator('button', { hasText: 'Friends' }).last().click(); await p.waitForTimeout(500);
  ok('Friends screen opens with Array.at missing', await p.getByText(/My Friends/).isVisible()); await clean('Hazelwild / Friends');
  await p.getByText('◀ Back').first().click(); await p.waitForTimeout(300);
  await p.locator('button', { hasText: 'Meadow' }).first().click(); await p.waitForTimeout(800); await clean('Hazelwild / Explore');
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  console.log('errors', JSON.stringify(errs)); await b.close();
})();
