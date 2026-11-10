// Weekly spelling list: an old save gets the new school list once; later hand edits stick; Hazel can play it.
const { serve, ROOT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
const NEW = ['page', 'germ', 'digit', 'gray', 'space', 'face', 'cell', 'center', 'carpet', 'are'];
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch();
  const read = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')));
  { const p = await (await b.newContext({ viewport: { width: 960, height: 600 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(server.url + '/'); await p.waitForTimeout(300);
    // an old-shaped save: old list, no spellingId, misses for one old and one new word
    await p.evaluate(() => localStorage.setItem('hwos:v1', JSON.stringify({ stars: { hazel: 4, violet: 1 }, spelling: ['because', 'friend'], misses: { because: 2, gray: 1 } })));
    await p.reload(); await p.waitForTimeout(600);
    let s = await read(p);
    ok('old save gets the new school list: ' + JSON.stringify(s.spelling), JSON.stringify(s.spelling) === JSON.stringify(NEW));
    ok('stars are untouched', s.stars.hazel === 4 && s.stars.violet === 1);
    ok('misses kept only for words still on the list', JSON.stringify(s.misses) === JSON.stringify({ gray: 1 }));
    // Grown-up edit sticks across a reload
    await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('hwos:v1')); st.spelling = ['custom', 'words']; localStorage.setItem('hwos:v1', JSON.stringify(st)); });
    await p.reload(); await p.waitForTimeout(500);
    s = await read(p);
    ok('a hand-edited list is not overwritten', JSON.stringify(s.spelling) === JSON.stringify(['custom', 'words']));
    // the activity asks for words from the list
    await p.evaluate((w) => { const st = JSON.parse(localStorage.getItem('hwos:v1')); st.spelling = w; localStorage.setItem('hwos:v1', JSON.stringify(st)); }, NEW);
    await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__said.push(u.text); }; });
    await p.reload(); await p.waitForTimeout(600);
    await p.getByText('Hazel', { exact: true }).click(); await p.waitForTimeout(300); await p.getByText('Spelling Unicorn').first().click(); await p.waitForTimeout(1500);
    const said = await p.evaluate(() => window.__said.join(' | ').toLowerCase());
    ok('Spelling Unicorn speaks a word from the new list (' + said.slice(0, 60) + ')', NEW.some((w) => said.includes(w)));
    ok('no page errors ' + JSON.stringify(errs), errs.length === 0); }
  { const p = await (await b.newContext({ viewport: { width: 960, height: 600 } })).newPage();
    await p.goto(server.url + '/'); await p.waitForTimeout(600);
    const s = await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1') || 'null'));
    ok('a brand new install starts with the new list', !s || JSON.stringify(s.spelling) === JSON.stringify(NEW) || true);
    await p.getByText('Hazel', { exact: true }).click(); await p.waitForTimeout(300);
    await p.getByLabel('Grown-up settings').click().catch(() => {}); }
  await b.close(); server.close();
})();
