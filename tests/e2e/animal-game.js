// Animal Game: categories, Start, a new animal every N seconds (fake clock), pause, skip, no repeats in a bag, star every 5, both profiles.
const { serve, ROOT, OUT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [who, label, vp] of [['Hazel', 'tablet', { width: 960, height: 600 }], ['Violet', 'phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.__said = []; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { window.__said.push(u.text); }; });
    await p.clock.install(); await p.goto(server.url + '/');
    await p.clock.runFor(500);
    await p.getByText(who, { exact: true }).click(); await p.clock.runFor(300);
    await p.getByText('Animal Game').first().click(); await p.clock.runFor(500);
    ok(`${label}/${who}: the Animal Game is on ${who}'s home screen and opens`, await p.getByText('Pick animals, press Start').isVisible());
    await p.screenshot({ path: `${OUT}/shots/animal-menu-${label}.png` });
    const cats = await p.getByTestId('animal-cats').locator('button').count();
    ok(`${label}: mix plus 6 categories (${cats})`, cats === 7);
    await p.getByRole('button', { name: 'Category Farm' }).click(); await p.clock.runFor(200);
    await p.getByRole('button', { name: '10 seconds' }).click();
    await p.getByRole('button', { name: 'Start' }).click(); await p.clock.runFor(300);
    const name1 = await p.getByTestId('animal-name').innerText(); const pic1 = await p.getByTestId('animal-pic').innerText();
    const said = await p.evaluate(() => window.__said.slice());
    ok(`${label}: Start shouts the first animal ("${name1}", said ${JSON.stringify(said)})`, /^Be a /.test(name1) && said.length >= 1 && said[said.length - 1].toLowerCase().includes(name1.replace('Be a ', '').replace('!', '')));
    await p.screenshot({ path: `${OUT}/shots/animal-play-${label}.png` });
    // a farm round: 7 farm animals; play 7 rounds, all different, all farm
    const seen = [name1]; 
    for (let i = 0; i < 6; i++) { await p.clock.runFor(10100); seen.push(await p.getByTestId('animal-name').innerText()); }
    ok(`${label}: a new animal every 10 seconds, no repeats until all 7 farm animals have had a turn (${seen.join(', ')})`, new Set(seen).size === 7);
    const sounds = await p.evaluate(() => window.__said.filter((t) => /!/.test(t)).length);
    ok(`${label}: it also shouts each animal's sound halfway (${sounds} lines)`, sounds >= 12);
    const count = await p.getByTestId('animal-count').innerText();
    ok(`${label}: finished animals are counted and a star came after 5 (${count})`, /6 done/.test(count) || /7 done/.test(count));
    const stars = await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:v1')).stars);
    ok(`${label}: 5 finished animals earned a star ${JSON.stringify(stars)}`, (stars[who.toLowerCase()] || 0) >= 1);
    // pause stops the clock
    await p.getByRole('button', { name: 'Pause' }).click(); const before = await p.getByTestId('animal-name').innerText(); await p.clock.runFor(30000);
    ok(`${label}: paused means no new animal for 30 seconds`, before === 'Paused' && (await p.getByTestId('animal-name').innerText()) === 'Paused');
    await p.getByRole('button', { name: 'Resume' }).click(); await p.clock.runFor(300);
    const a = await p.getByTestId('animal-name').innerText(); await p.getByRole('button', { name: 'Next animal' }).click(); await p.clock.runFor(300);
    ok(`${label}: Next skips ahead (${a} -> ${await p.getByTestId('animal-name').innerText()})`, (await p.getByTestId('animal-name').innerText()) !== a);
    ok(`${label}: no horizontal overflow while playing`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await p.getByRole('button', { name: 'Stop' }).click(); await p.clock.runFor(300);
    ok(`${label}: Done goes back to the menu with a total`, await p.getByText(/You acted like \d+ animal/).isVisible());
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  await b.close(); server.close();
})();
