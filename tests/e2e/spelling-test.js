// Spelling "Test Me": every word on the list, once each; typed from memory; scored; misses remembered; works for long lists.
const { serve, ROOT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
const NEW = ['page', 'germ', 'digit', 'gray', 'space', 'face', 'cell', 'center', 'carpet', 'are'];
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch();
  for (const [label, vp, list] of [['tablet', { width: 960, height: 600 }, NEW], ['phone', { width: 390, height: 844 }, Array.from({ length: 25 }, (_, i) => 'word' + String.fromCharCode(97 + (i % 26)) + String.fromCharCode(98 + (i % 20)))]]) {
    const p = await (await b.newContext({ viewport: vp, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__said.push(u.text); }; });
    await p.clock.install(); await p.goto(server.url + '/'); await p.clock.runFor(500);
    await p.evaluate((w) => localStorage.setItem('hwos:v1', JSON.stringify({ spelling: w, spellingId: '2026-11-10', misses: {}, stars: { hazel: 0, violet: 0 } })), list);
    await p.reload(); await p.clock.runFor(700);
    await p.getByText('Hazel', { exact: true }).click(); await p.clock.runFor(300); await p.getByText('Spelling Unicorn').first().click(); await p.clock.runFor(600);
    const dismiss = async () => { while (await p.locator('button.fixed.inset-0').count()) { await p.locator('button.fixed.inset-0').first().click(); await p.clock.runFor(200); } };
    const typeWord = async (w) => { for (const ch of w) await p.locator(`[data-key="${ch}"]`).click(); };
    const stars = () => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('hwos:v1') || 'null'); return s ? s.stars.hazel : 0; });
    const runTest = async (wrongAt) => {
      const asked = [];
      for (let n = 0; n < list.length; n++) {
        const prog = await p.getByTestId('test-progress').innerText();
        if (prog !== `Word ${n + 1} of ${list.length}`) { console.log('  progress mismatch', prog, n + 1); }
        const word = await p.evaluate((l) => { const s = window.__said.filter((t) => l.includes(t)); return s[s.length - 1]; }, list);
        asked.push(word);
        await typeWord(wrongAt.includes(n) ? 'zzz' : word);
        await p.getByRole('button', { name: 'Check my word' }).click(); await p.clock.runFor(wrongAt.includes(n) ? 3400 : 1500); await dismiss();
      }
      return asked;
    };
    await p.getByRole('button', { name: 'Test Me mode' }).click(); await p.clock.runFor(500);
    ok(`${label}: Test Me opens at word 1 of ${list.length}`, (await p.getByTestId('test-progress').innerText()) === `Word 1 of ${list.length}`);
    ok(`${label}: there are no letter tiles or hints, just a full keyboard`, (await p.getByTestId('test-keys').locator('[data-key]').count()) === 26);
    const wrong = [2, 6];
    const asked = await runTest(wrong);
    ok(`${label}: it asked every word on the list (${asked.length} of ${list.length})`, asked.length === list.length && list.every((w) => asked.includes(w)));
    ok(`${label}: each word exactly once`, new Set(asked).size === list.length);
    const score = await p.getByTestId('test-score').innerText();
    ok(`${label}: score is right (${score})`, score === `You got ${list.length - 2} out of ${list.length}!`);
    const missedText = await p.getByTestId('test-missed').innerText();
    ok(`${label}: the two missed words are listed with what she wrote`, missedText.includes(asked[2]) && missedText.includes(asked[6]) && missedText.includes('zzz'));
    const misses = await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')).misses);
    ok(`${label}: missed words are remembered for Practice`, misses[asked[2]] >= 1 && misses[asked[6]] >= 1 && Object.keys(misses).length === 2);
    if (label === 'tablet') {
      const s0 = await stars();
      await p.getByRole('button', { name: /Test again/ }).click(); await p.clock.runFor(500);
      const asked2 = await runTest([]);
      ok(`${label}: Test again is a fresh pass over the whole list`, new Set(asked2).size === list.length && JSON.stringify(asked2) !== JSON.stringify(asked));
      ok(`${label}: a perfect test says so and gives a bonus`, /Every word right/.test(await p.getByTestId('test-result').innerText()) && (await stars()) >= s0 + list.length + 3);
      await p.getByRole('button', { name: /Practice/ }).last().click(); await p.clock.runFor(500);
      ok(`${label}: Practice is still there`, await p.getByText('Hear it').first().isVisible());
    }
    ok(`${label}: no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
  }
  await b.close(); server.close();
})();
