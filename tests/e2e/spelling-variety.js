// Spelling Unicorn must rotate through the whole list: no flood of one word, even when some words were missed a lot.
const { serve, ROOT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
const NEW = ['page', 'germ', 'digit', 'gray', 'space', 'face', 'cell', 'center', 'carpet', 'are'];
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__said.push(u.text); }; });
  await p.clock.install(); await p.goto(server.url + '/'); await p.clock.runFor(500);
  await p.evaluate((w) => localStorage.setItem('hwos:v1', JSON.stringify({ spelling: w, spellingId: '2026-11-10', misses: { gray: 5, germ: 3 }, stars: { hazel: 0, violet: 0 } })), NEW);
  await p.reload(); await p.clock.runFor(700);
  await p.getByText('Hazel', { exact: true }).click(); await p.clock.runFor(300); await p.getByText('Spelling Unicorn').first().click(); await p.clock.runFor(800);
  const seen = [];
  for (let n = 0; n < 24; n++) {
    const word = await p.evaluate(() => { const l = window.__said.filter((t) => /^Spell the word: /.test(t)); return l[l.length - 1].replace('Spell the word: ', ''); });
    seen.push(word);
    for (const ch of word) { while (await p.locator('button.fixed.inset-0').count()) { await p.locator('button.fixed.inset-0').first().click(); await p.clock.runFor(200); } await p.locator(`[data-tile="${ch}"]:not([disabled])`).first().click(); await p.clock.runFor(60); }
    await p.clock.runFor(4600); while (await p.locator('button.fixed.inset-0').count()) { await p.locator('button.fixed.inset-0').first().click(); await p.clock.runFor(200); }
  }
  console.log('  words:', seen.join(' '));
  const recentOk = seen.every((w, i) => ![1, 2, 3, 4].some((k) => seen[i - k] === w));
  ok('a word never returns within 4 words of itself', recentOk);
  ok('every 5 in a row (one rainbow) are different words', seen.every((_, i) => i + 5 > seen.length || new Set(seen.slice(i, i + 5)).size === 5));
  ok('the first 10 words cover at least 8 different words (' + new Set(seen.slice(0, 10)).size + ')', new Set(seen.slice(0, 10)).size >= 8);
  ok('all 10 words come up within 24', NEW.every((w) => seen.includes(w)));
  const gray = seen.slice(0, 12).filter((w) => w === 'gray').length;
  ok('a word she keeps missing (gray) comes up at most twice in 12 (' + gray + ')', gray <= 2);
  ok('no page errors ' + JSON.stringify(errs), errs.length === 0);
  await b.close(); server.close();
})();
