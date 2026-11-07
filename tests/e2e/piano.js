// Piano: free play, lessons, songs (Follow me / Play along / Listen), Dads' Corner, My Songs (grown-up gate), saves, layout.
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
    const noOverflow = async (t) => ok(`${label}: ${t} has no horizontal page overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    const key = (m) => p.locator(`[data-midi="${m}"]`);
    const glowNow = async () => (await p.locator('[data-glow="1"]').first().getAttribute('data-midi'));
    const stars = () => p.evaluate((w) => { const s = JSON.parse(localStorage.getItem('hwos:v1') || 'null'); return s ? s.stars[w] : 0; }, who.toLowerCase());
    await p.goto(server.url + '/'); await p.waitForTimeout(700);
    await p.getByText(who, { exact: true }).click(); await p.waitForTimeout(300);
    await p.getByText('Piano', { exact: true }).first().click(); await p.waitForTimeout(500);
    ok(`${label}/${who}: Piano opens with Free Play, Lessons, Songs`, (await p.getByTestId('piano-menu').locator('button').count()) === 3);
    await p.screenshot({ path: `${OUT}/shots/piano-menu-${label}.png` });
    // ---- free play
    await p.getByRole('button', { name: 'Free Play' }).click(); await p.waitForTimeout(400);
    const first = Number(await p.locator('[data-midi]').first().getAttribute('data-midi'));
    ok(`${label}: free play starts at middle C (${first})`, first === 60);
    await key(60).dispatchEvent('pointerdown'); await p.waitForTimeout(80);
    ok(`${label}: a pressed key lights up`, (await key(60).getAttribute('data-lit')) === '1');
    await p.waitForTimeout(400);
    ok(`${label}: and settles back`, (await key(60).getAttribute('data-lit')) === '0');
    await p.getByRole('button', { name: 'Higher notes' }).click(); await p.waitForTimeout(200);
    ok(`${label}: High moves up an octave`, Number(await p.locator('[data-midi]').first().getAttribute('data-midi')) === 72);
    await p.screenshot({ path: `${OUT}/shots/piano-free-${label}.png` }); await noOverflow('free play');
    await p.getByRole('button', { name: /Piano$/ }).first().click(); await p.waitForTimeout(300);
    // ---- lessons
    await p.getByRole('button', { name: 'Lessons' }).click(); await p.waitForTimeout(300);
    ok(`${label}: 8 lessons listed`, (await p.getByTestId('lesson-list').locator('button').count()) === 8);
    await p.getByRole('button', { name: /Lesson 2: Find Middle C/ }).click(); await p.waitForTimeout(500);
    ok(`${label}: lesson reads its step aloud`, (await p.evaluate(() => window.__said.join('|'))).includes('Look for two black keys'));
    await p.screenshot({ path: `${OUT}/shots/piano-lesson-${label}.png` }); await noOverflow('lesson');
    await key(62).dispatchEvent('pointerdown'); await p.waitForTimeout(200);
    ok(`${label}: a wrong key gets a gentle hint, not a penalty`, /glowing key/.test(await p.getByTestId('lesson-hint').innerText()));
    ok(`${label}: the right key to press is glowing (C)`, (await glowNow()) === '60');
    const s0 = await stars();
    for (let guard = 0; guard < 12 && !(await p.getByTestId('lesson-done').count()); guard++) { const g = await p.locator('[data-glow="1"]').first().getAttribute('data-midi').catch(() => null); if (g) await key(g).dispatchEvent('pointerdown'); await p.waitForTimeout(650); }
    ok(`${label}: finishing the lesson shows it is complete and earns a star`, (await p.getByTestId('lesson-done').count()) === 1 && (await stars()) === s0 + 1);
    await p.getByRole('button', { name: /More lessons/ }).click(); await p.waitForTimeout(300);
    ok(`${label}: the finished lesson is ticked in the list`, (await p.getByTestId('lesson-list').getByText('✅').count()) === 1);
    await p.getByRole('button', { name: /Piano$/ }).first().click(); await p.waitForTimeout(300);
    // ---- songs
    await p.getByRole('button', { name: 'Songs', exact: true }).click(); await p.waitForTimeout(300);
    ok(`${label}: song categories: Kids, Holiday, Dads' Corner, My Songs`, (await p.getByTestId('song-cats').locator('button').count()) === 4);
    await p.getByRole('button', { name: "Songs: Dads' Corner" }).click(); await p.waitForTimeout(300);
    const dads = await p.getByTestId('song-list').innerText();
    ok(`${label}: Dads' Corner has Für Elise, Greensleeves, The Entertainer, Auld Lang Syne`, ['Für Elise', 'Greensleeves', 'The Entertainer', 'Auld Lang Syne'].every((t) => dads.includes(t)));
    ok(`${label}: Dads' Corner says where to add Mad World`, await p.getByText(/Mad World/).first().isVisible());
    await p.getByRole('button', { name: 'Back to categories' }).click(); await p.waitForTimeout(200);
    await p.getByRole('button', { name: "Songs: Kids' Songs" }).click(); await p.waitForTimeout(300);
    const kids = await p.getByTestId('song-list').locator('button').count();
    ok(`${label}: Kids' Songs has plenty (${kids})`, kids >= 10);
    await p.getByRole('button', { name: 'Song: Hot Cross Buns' }).click(); await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/shots/piano-song-ready-${label}.png` }); await noOverflow('song screen');
    // Follow me: play the whole song by pressing whatever key glows
    await p.getByRole('button', { name: 'Start song' }).click(); await p.waitForTimeout(800);
    const sf = await stars(); let presses = 0;
    for (let guard = 0; guard < 60 && !(await p.getByTestId('song-done').count()); guard++) {
      const g = await p.locator('[data-glow="1"]').first().getAttribute('data-midi').catch(() => null);
      if (g) { await key(g).dispatchEvent('pointerdown'); presses++; } await p.waitForTimeout(250);
    }
    ok(`${label}: Follow me finishes Hot Cross Buns (${presses} presses) and says so`, (await p.getByTestId('song-done').count()) === 1 && /17 of 17/.test(await p.getByTestId('song-done').innerText()));
    ok(`${label}: a finished Follow me song earns a star`, (await stars()) === sf + 1);
    // wrong key in Follow me: hint, nothing breaks
    await p.getByRole('button', { name: 'Play again' }).click(); await p.waitForTimeout(500);
    const target = Number(await glowNow()); await key(target === 60 ? 62 : 60).dispatchEvent('pointerdown'); await p.waitForTimeout(200);
    ok(`${label}: a wrong key in Follow me shows a hint and the song keeps waiting`, /glowing/.test(await p.getByTestId('song-hint').innerText()) && Number(await glowNow()) === target);
    await p.getByRole('button', { name: 'Restart song' }).click(); await p.waitForTimeout(300);
    // Listen mode plays by itself
    await p.getByRole('button', { name: 'Listen mode' }).click(); await p.waitForTimeout(200);
    await p.getByRole('button', { name: 'Start song' }).click();
    let sawLit = false; for (let i = 0; i < 80 && !(await p.getByTestId('song-done').count()); i++) { if ((await p.locator('[data-lit="1"]').count()) > 0) sawLit = true; await p.waitForTimeout(250); }
    ok(`${label}: Listen mode lights the keys by itself and ends with "Now you try!"`, sawLit && /Now you try/.test(await p.getByTestId('song-done').innerText()));
    await p.getByRole('button', { name: 'Back to songs' }).click(); await p.waitForTimeout(300);
    ok(`${label}: finished song is ticked`, (await p.getByTestId('song-list').getByText('✅').count()) >= 1);
    ok(`${label}: no page errors ${JSON.stringify(errs)}`, errs.length === 0);
    await ctx.close();
  }
  // ---- Play along timing (fake clock) + My Songs (typed in behind the gate) on the tablet
  { const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.clock.install(); await p.goto(server.url + '/'); await p.clock.runFor(700);
    await p.getByText('Hazel', { exact: true }).click(); await p.clock.runFor(300); await p.getByText('Piano', { exact: true }).first().click(); await p.clock.runFor(400);
    await p.getByRole('button', { name: 'Songs', exact: true }).click(); await p.clock.runFor(200); await p.getByRole('button', { name: "Songs: Kids' Songs" }).click(); await p.clock.runFor(200);
    await p.getByRole('button', { name: 'Song: Hot Cross Buns' }).click(); await p.clock.runFor(300);
    await p.getByRole('button', { name: 'Play along mode' }).click(); await p.clock.runFor(100);
    await p.getByRole('button', { name: 'Start song' }).click(); await p.clock.runFor(750); // first note (E4) lands now
    await p.locator('[data-midi="64"]').dispatchEvent('pointerdown'); await p.clock.runFor(100);
    ok('play along: pressing the right key as the note lands counts a hit', /1\/17/.test(await p.getByTestId('song-hits').innerText()));
    await p.locator('[data-midi="67"]').dispatchEvent('pointerdown'); await p.clock.runFor(100);
    ok('play along: a wrong key just makes its sound (no penalty)', /1\/17/.test(await p.getByTestId('song-hits').innerText()));
    await p.clock.runFor(30000);
    ok('play along: missed notes do not stop the song; it ends kindly', (await p.getByTestId('song-done').count()) === 1);
    const stars = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('hwos:v1') || 'null'); return s ? s.stars.hazel : 0; });
    ok('play along: 1 of 14 notes does not earn a star (' + stars + ')', stars === 0);
    // My Songs
    await p.getByRole('button', { name: 'Back to songs' }).click(); await p.clock.runFor(300); await p.getByRole('button', { name: 'Back to categories' }).click(); await p.clock.runFor(200);
    await p.getByRole('button', { name: 'Songs: My Songs' }).click(); await p.clock.runFor(300);
    ok('My Songs: empty at first, with a lock', await p.getByRole('button', { name: 'Grown-up tools' }).isVisible());
    await p.getByRole('button', { name: 'Grown-up tools' }).click(); await p.clock.runFor(200);
    const q = await p.locator('p.text-5xl').innerText(); const [a, c] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
    await p.getByRole('button', { name: String(a * c), exact: true }).click(); await p.clock.runFor(200);
    await p.getByRole('button', { name: 'Add a song' }).click(); await p.clock.runFor(200);
    await p.getByLabel('Song name').fill('My Test Tune'); await p.getByLabel('Notes').fill('E4 D4 C4:2 X9');
    ok('My Songs: a bad note is explained', /not a note/.test(await p.getByTestId('song-check').innerText()));
    await p.getByLabel('Notes').fill('E4 D4 C4:2 R:1 F#4:.5 Bb3');
    ok('My Songs: good notes show a count', /5 notes/.test(await p.getByTestId('song-check').innerText()));
    await p.getByRole('button', { name: 'Save song' }).click(); await p.clock.runFor(300);
    await p.getByRole('button', { name: 'Lock' }).click(); await p.clock.runFor(200);
    ok('My Songs: the song appears in the list', await p.getByRole('button', { name: 'Song: My Test Tune' }).isVisible());
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:songs')));
    ok('My Songs: saved on the tablet only (its own storage key)', saved.length === 1 && saved[0].title === 'My Test Tune');
    await p.reload(); await p.clock.runFor(900);
    ok('My Songs: still there after a restart', (await p.evaluate(() => JSON.parse(localStorage.getItem('hwos:songs')).length)) === 1);
    ok('no page errors ' + JSON.stringify(errs), errs.length === 0); await ctx.close(); }
  await b.close(); server.close();
})();
