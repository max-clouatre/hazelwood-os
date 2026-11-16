// Spelling "Starts": fill in the beginning of the word (kn / wr / wh / qu look-alikes); every tricky-start word once; read-aloud sentences.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
const NEW = ['knotted', 'knitting', 'knocked', 'wringing', 'wronged', 'whipped', 'whined', 'quitting', 'quacked', 'all'];
const START = { knotted: 'kn', knitting: 'kn', knocked: 'kn', wringing: 'wr', wronged: 'wr', whipped: 'wh', whined: 'wh', quitting: 'qu', quacked: 'qu' };
const OPTS = { kn: ['kn', 'n', 'gn'], wr: ['wr', 'r'], wh: ['wh', 'w'], qu: ['qu', 'kw', 'q'] };
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch();
  for (const [label, vp] of [['tablet', { width: 960, height: 600 }], ['phone', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__said.push(u.text); }; });
    await p.clock.install(); await p.goto(server.url + '/'); await p.clock.runFor(500);
    // an old save (previous list, no spellingId): updating should give her "Skills 3"
    await p.evaluate(() => localStorage.setItem('hwos:v1', JSON.stringify({ stars: { hazel: 2, violet: 0 }, spelling: ['page', 'germ', 'are'], spellingId: '2026-11-10', misses: {} })));
    await p.reload(); await p.clock.runFor(700);
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')));
    ok(`${label}: Skills 3 is her list after the update (${saved.spellingId})`, JSON.stringify(saved.spelling) === JSON.stringify(NEW) && saved.stars.hazel === 2);
    await p.getByText('Hazel', { exact: true }).click(); await p.clock.runFor(300); await p.getByText('Spelling Unicorn').first().click(); await p.clock.runFor(800);
    ok(`${label}: the list is named Skills 3 on screen`, (await p.getByTestId('list-name').innerText()) === 'Skills 3');
    const said0 = await p.evaluate(() => window.__said.join(' | '));
    ok(`${label}: Practice reads the word and its sentence aloud`, /Spell the word: (\w+)\. .+/.test(said0));
    await p.getByRole('button', { name: 'Starts mode' }).click(); await p.clock.runFor(500);
    ok(`${label}: Starts opens at word 1 of 9 (the 'all' word has no tricky start)`, (await p.getByTestId('starts-progress').innerText()) === 'Word 1 of 9');
    await p.screenshot({ path: `${OUT}/shots/starts-${label}.png` });
    const asked = []; let firstTryRight = 0;
    for (let n = 0; n < 9; n++) {
      const word = await p.evaluate(() => { const s = window.__said.filter((t) => /\. /.test(t)); return s[s.length - 1].split('.')[0]; });
      asked.push(word);
      const opts = await p.getByTestId('starts-options').locator('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label').replace('Starts with ', '')));
      if (n === 2) { // one deliberate wrong pick first
        const bad = opts.find((o) => o !== START[word]); await p.getByRole('button', { name: `Starts with ${bad}` }).click(); await p.clock.runFor(200);
        ok(`${label}: a wrong pick is gentle: try another, nothing is lost`, /Try another/.test(await p.getByTestId('starts-hint').innerText()));
      } else firstTryRight++;
      if (n === 0) ok(`${label}: the choices are the look-alikes for ${word} (${opts})`, JSON.stringify([...opts].sort()) === JSON.stringify([...OPTS[START[word]]].sort()));
      await p.getByRole('button', { name: `Starts with ${START[word]}` }).click(); await p.clock.runFor(300);
      if (n === 0) ok(`${label}: the right pick fills the gap`, (await p.getByTestId('starts-word').innerText()).replace(/\s/g, '') === word);
      await p.clock.runFor(2000);
      while (await p.locator('button.fixed.inset-0').count()) { await p.locator('button.fixed.inset-0').first().click(); await p.clock.runFor(200); }
    }
    ok(`${label}: every tricky-start word came up exactly once (${asked.join(' ')})`, new Set(asked).size === 9 && Object.keys(START).every((w) => asked.includes(w)));
    ok(`${label}: score counts first tries (8 of 9)`, (await p.getByTestId('starts-score').innerText()) === 'You got 8 out of 9 on the first try!');
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
  }
  { // a list without any kn/wr/wh/qu words explains itself
    const p = await (await b.newContext({ viewport: { width: 960, height: 600 } })).newPage();
    await p.goto(server.url + '/'); await p.waitForTimeout(300);
    await p.evaluate(() => localStorage.setItem('hwos:v1', JSON.stringify({ spelling: ['cat', 'dog'], spellingId: '2026-11-16', misses: {}, stars: { hazel: 0, violet: 0 } })));
    await p.reload(); await p.waitForTimeout(600); await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Spelling Unicorn').first().click(); await p.waitForTimeout(500);
    await p.getByRole('button', { name: 'Starts mode' }).click(); await p.waitForTimeout(300);
    ok('a custom list with no tricky starts explains Starts and offers Practice', await p.getByTestId('starts-empty').isVisible());
    ok('a hand-made list is shown as "My list"', (await p.getByTestId('list-name').innerText()) === 'My list'); }
  await b.close(); server.close();
})();
