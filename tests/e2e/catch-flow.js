// Ported from the first-session scratch tests; see tests/README.md
const { chromium } = require('playwright');
const { OUT: S, BASE } = require('../lib');
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const ok = (l,v)=>console.log((v?'PASS ':'FAIL ')+l);
(async () => {
  const b = await chromium.launch(); const errs=[];
  const ctx = await b.newContext({ viewport:{width:960,height:600}, hasTouch:true }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR '+e.message)); p.on('console', m => m.type()==='error' && errs.push('CONSOLE '+m.text()));
  await p.addInitScript(() => { const r = Math.random; window.__forceRand = null; Math.random = () => (window.__forceRand ?? r()); });
  await p.goto(BASE + '/'); await p.waitForTimeout(700);
  await p.getByText('Hazel',{exact:true}).click();
  await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  await p.screenshot({path:`${S}/shots/w-starter.png`});
  ok('starter screen shows', await p.getByText('Pick your very first friend').isVisible());
  await p.getByText('Fishy',{exact:true}).click(); await p.waitForTimeout(400);
  await p.screenshot({path:`${S}/shots/w-reveal.png`});
  await p.locator('input').fill('Splashy');
  await p.getByText('Welcome home!').click(); await p.waitForTimeout(400); await p.getByText("Let's go!").click(); await p.waitForTimeout(300);
  await p.screenshot({path:`${S}/shots/w-hub.png`});
  
  // Wishing tree
  await p.getByText('Wishing Tree').click();
  
  // Explore meadow until an encounter
  await p.getByText('Sunny Meadow').click(); await p.waitForTimeout(400);
  await p.screenshot({path:`${S}/shots/w-explore.png`});
  let enc=false;
  for (let i=0;i<40 && !enc;i++){
    await p.getByLabel('Rustling bush').first().click(); await p.waitForTimeout(1100);
    enc = await p.getByText('Throw!').isVisible();
  }
  ok('exploring finds a creature', enc);
  await p.screenshot({path:`${S}/shots/w-catch.png`});
  // throw when the ring reaches the target (great throw)
  const quality = await p.evaluate(() => new Promise((res) => {
    const find = () => { const r = [...document.querySelectorAll('div')].find(d => d.style.transform && d.style.transform.includes('scale(') && d.className.includes('border-[6px]')); return r; };
    const tick = () => { const r = find(); if (r) { const m = /scale\(([\d.]+)\)/.exec(r.style.transform); const s = m ? parseFloat(m[1]) : 9; if (Math.abs(s-1) < 0.05) { [...document.querySelectorAll('button')].find(b=>b.textContent.includes('Throw!')).click(); return res(s); } } requestAnimationFrame(tick); };
    tick();
  }));
  console.log('threw at scale', quality);
  await p.waitForTimeout(500); await p.screenshot({path:`${S}/shots/w-throw.png`});
  await p.waitForTimeout(3200);
  const revealed = await p.getByText('Welcome home!').isVisible();
  ok('a good throw catches it and shows the reveal', revealed);
  if (revealed) { await p.screenshot({path:`${S}/shots/w-caught.png`}); await p.getByText('Welcome home!').click(); await p.waitForTimeout(400); }
  console.log('errors', JSON.stringify(errs));
  await ctx.storageState({path:`${S}/state1.json`});
  await b.close();
})();
