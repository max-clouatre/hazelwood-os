// Hazelwild narrator is off by default (sounds and music stay on); the 🗣️ button turns it on; other activities keep their voice.
const { serve, owned, wildsState, ROOT, ok } = require('../lib');
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const server = await serve(path.join(ROOT, 'docs'));
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await (await b.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true })).newPage();
  await p.addInitScript(() => { window.__said = []; const S = window.speechSynthesis; if (S) { S.speak = (u) => { window.__said.push(u.text); }; } });
  await p.goto(server.url + '/'); await p.waitForTimeout(300);
  await p.evaluate((s) => localStorage.setItem('hwos:v1', JSON.stringify(s)), wildsState(['mossling','bubbo','embit','bramblit','ducky'].map((s, i) => owned('o' + i, s, 0))));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel', { exact: true }).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__said.length = 0; });
  const tap = async () => { await p.getByTestId('landing-crew').locator('button').first().click({ force: true }); await p.waitForTimeout(400); };
  await tap();
  const said = await p.evaluate(() => window.__said.slice()); ok('narrator is silent by default in Hazelwild ' + JSON.stringify(said), said.length === 0);
  ok('music and sound switch is untouched', await p.getByLabel('Sound').isVisible());
  await p.getByLabel('Narrator voice').click(); await p.waitForTimeout(200); await p.getByTestId('landing-crew').locator('button').nth(1).click({ force: true }); await p.waitForTimeout(500);
  ok('button turns the narrator on', (await p.evaluate(() => window.__said.length)) > 0);
  await p.getByLabel('Narrator voice').click(); await p.evaluate(() => { window.__said.length = 0; }); await p.getByTestId('landing-crew').locator('button').nth(2).click({ force: true }); await p.waitForTimeout(400);
  ok('and off again', (await p.evaluate(() => window.__said.length)) === 0);
  await b.close(); server.close();
})();
