// Ported from the first-session scratch tests; see tests/README.md
const { chromium } = require('playwright');
const { OUT: S, BASE } = require('../lib');
const ok = (label, v) => console.log((v ? 'PASS ' : 'FAIL ') + label);
(async () => {
  const b = await chromium.launch(); const errs=[];
  const mkp = async (vp) => { const ctx = await b.newContext({ viewport:vp, hasTouch:true }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PAGEERR '+e.message)); p.on('console', m => m.type()==='error' && errs.push('CONSOLE '+m.text()));
    await p.addInitScript(() => { const r = Math.random; window.__forceRand = null; Math.random = () => (window.__forceRand ?? r()); });
    return [ctx,p]; };
  const mk = (id,sp,xp,extra={}) => ({ id, sp, name: sp, shiny:false, seed:21+id.length, pers:'gentle', xp, got:'x', pet:{day:'',n:0}, foods:[0,0], ...extra });
  const base = (owned, w={}) => ({ wilds: { started:true, tipSeen:true, owned, seen:{}, berries:40, fromStars:0, eggs:[], day:'', visitorDone:false, treeDone:false, duelDay:'', favs:{}, legend:false, seq:50, duelWins:0, goals:{day:'',list:[]}, badges:[], newBadge:null, bushAt:{}, glow:0, camps:{}, boost:{from:0,until:0}, caught:{}, modes:{camp:true}, ...w } });
  const open = async (p, state, zoneText='Meadow') => {
    await p.goto(BASE + '/'); await p.waitForTimeout(400);
    await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), state);
    await p.reload(); await p.waitForTimeout(600);
    await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(500);
    await p.getByRole('button',{name:'Adventure!'}).click(); await p.waitForTimeout(250); await p.locator('button',{hasText:zoneText}).first().click(); await p.waitForTimeout(700);
  };
  const pending = async (p) => parseInt(await p.locator('p.text-4xl').first().innerText());
  const glowPill = async (p) => p.evaluate(()=>Math.floor(JSON.parse(localStorage.getItem('hwos:v1')).wilds.glow));

  // ---------- 1. modes + exact idle math ----------
  let [ctx,p] = await mkp({width:960,height:600});
  const owned = [ mk('a','mossling',0), mk('b','bramblit',0), mk('c','embit',0) ];
  const now = await (async()=>{ await p.goto(BASE + '/'); return p.evaluate(()=>Date.now()); })();
  await open(p, base(owned, { camps:{ meadow:{ workers:['a','b'], extra:0, basket:0, speed:0, since: now - 30*60000 } } }));
  ok('Explore is the default mode', await p.getByText('Tap a rustling spot to look!').isVisible());
  ok('mode tabs show Explore and Camp', (await p.getByRole('button',{name:'Explore mode'}).isVisible()) && (await p.getByRole('button',{name:'Camp mode'}).isVisible()));
  await p.getByRole('button',{name:'Camp mode'}).click(); await p.waitForTimeout(500);
  ok('Camp mode opens', await p.getByText('Camp basket').isVisible());
  // expected: each worker 0.6 * form1 * level1 * mastery1 * home1.5 * family(1 other leaf => 1.1) = 0.99 ; two workers = 1.98/min ; 30 min = 59.4
  const pend = await pending(p); console.log('  waiting glow:', pend, '(expected 59 = 1.98/min x 30 min)');
  ok('idle production matches the formula', pend === 59);
  await p.screenshot({path:`${S}/shots/camp-main.png`});
  await p.getByRole('button',{name:/Collect/}).click(); await p.waitForTimeout(300);
  ok('collect moves Glow into the wallet', (await p.getByText(/You collected 59 Glow/).first().isVisible()) && (await glowPill(p)) === 59);
  // train worker a: cost 20 -> level 2
  await p.getByText('mossling').first().click(); await p.waitForTimeout(300);
  await p.screenshot({path:`${S}/shots/camp-worker.png`});
  await p.getByRole('button',{name:/Train/}).click(); await p.waitForTimeout(300);
  ok('training costs 20 Glow and gives Level 2', (await p.getByText(/is now level 2/).first().isVisible()) && (await p.evaluate(()=>JSON.parse(localStorage.getItem('hwos:v1')).wilds.glow)) === 39);
  await p.getByRole('button',{name:'Close',exact:true}).last().click(); await p.waitForTimeout(200);
  // add third worker is blocked until upgrade: 2 slots full, so no "Add friend"
  ok('no free slot until upgraded', (await p.getByText('Add friend').count()) === 0);
  // buy "More workers" costs 40, we have 39 -> should fail, then give glow via storage and buy
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('hwos:v1'));s.wilds.glow=100;localStorage.setItem('hwos:v1',JSON.stringify(s));});
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  await p.getByRole('button',{name:'Adventure!'}).click(); await p.waitForTimeout(250); await p.locator('button',{hasText:'Meadow'}).first().click(); await p.waitForTimeout(400); await p.getByRole('button',{name:'Camp mode'}).click(); await p.waitForTimeout(400);
  await p.locator('div.rounded-2xl', {hasText:'More workers'}).first().locator('button').click(); await p.waitForTimeout(300);
  ok('buying More workers opens a slot (+Add friend appears)', (await p.getByText('Add friend').count()) === 1);
  await p.getByText('Add friend').click(); await p.waitForTimeout(300);
  ok('picker shows the home-zone bonus', await p.getByText(/lives here/).first().isVisible());
  await p.screenshot({path:`${S}/shots/camp-picker.png`});
  await p.getByText('embit').first().click(); await p.waitForTimeout(300);
  ok('friend assigned to camp', (await p.evaluate(()=>JSON.parse(localStorage.getItem('hwos:v1')).wilds.camps.meadow.workers.length)) === 3);
  await ctx.close();

  // ---------- 2. Star Boost doubles the boosted minutes ----------
  [ctx,p] = await mkp({width:960,height:600});
  const t2 = await (async()=>{ await p.goto(BASE + '/'); return p.evaluate(()=>Date.now()); })();
  await open(p, base(owned.slice(0,2), { camps:{ meadow:{ workers:['a','b'], extra:0, basket:0, speed:0, since: t2 - 30*60000 } }, boost:{ from: t2 - 10*60000, until: t2 + 20*60000 } }));
  await p.getByRole('button',{name:'Camp mode'}).click(); await p.waitForTimeout(500);
  const pend2 = await pending(p); console.log('  waiting glow with boost:', pend2, '(expected 79 = 1.98 x (30 + 10 boosted minutes))');
  ok('Star Boost doubles only the boosted minutes', pend2 === 79);
  ok('boost shown in the basket', await p.getByText(/Star Boost: double speed for/).isVisible());
  // away for a long time is capped at 60 minutes
  await ctx.close();
  [ctx,p] = await mkp({width:960,height:600});
  const t3 = await (async()=>{ await p.goto(BASE + '/'); return p.evaluate(()=>Date.now()); })();
  await open(p, base(owned.slice(0,2), { camps:{ meadow:{ workers:['a','b'], extra:0, basket:0, speed:0, since: t3 - 8*3600000 } } }));
  await p.getByRole('button',{name:'Camp mode'}).click(); await p.waitForTimeout(500);
  const pend3 = await pending(p); console.log('  waiting glow after 8 hours away:', pend3, '(expected 118 = 1.98 x 60 min cap)');
  ok('being away is capped at the basket size', pend3 === 118);
  await ctx.close();

  // ---------- 3. a real star from another activity creates a boost ----------
  [ctx,p] = await mkp({width:960,height:600});
  await open(p, base(owned.slice(0,2), { camps:{ meadow:{ workers:['a'], extra:0, basket:0, speed:0, since: Date.now() } } }));
  await p.getByLabel('Home').click(); await p.getByLabel('Home').click(); await p.waitForTimeout(300);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Color by Number').first().click(); await p.waitForTimeout(400);
  await p.locator('button.overflow-hidden').nth(7).click(); await p.waitForTimeout(400);   // rainbow: 9 regions
  const info = await p.evaluate(()=>({ ids:[...document.querySelectorAll('svg path[data-region]')].map(e=>e.dataset.region), nums:[...document.querySelectorAll('svg text')].map(t=>t.textContent) }));
  const maxN = Math.max(...info.nums.map(Number));
  for (let k=1;k<=maxN;k++){ await p.getByLabel(new RegExp('^number '+k+' ')).click(); for (let i=0;i<info.ids.length;i++) if (info.nums[i]===String(k)) await p.locator('svg path[data-region]').nth(i).evaluate(el=>el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))); await p.waitForTimeout(100); }
  await p.waitForTimeout(800);
  const bst = await p.evaluate(()=>{const w=JSON.parse(localStorage.getItem('hwos:v1')).wilds; return Math.round((w.boost.until-Date.now())/60000);});
  console.log('  star boost minutes after finishing a picture (2 stars):', bst);
  ok('finishing a picture (2 stars) gives about 20 minutes of Star Boost', bst >= 19 && bst <= 20);
  await ctx.close();

  // ---------- 4. mastery stars from catching duplicates ----------
  [ctx,p] = await mkp({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(300);
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base(owned, { eggs:[{id:'e1',need:5,have:5}], caught:{ fernfox:2, mossling:8 } }));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  await p.locator('button',{hasText:'Eggs'}).last().click(); await p.waitForTimeout(300);
  await p.evaluate(()=>{window.__forceRand=0;});
  await p.getByText('Ready! Tap to hatch!').click(); await p.waitForTimeout(1900);
  await p.evaluate(()=>{window.__forceRand=null;});
  await p.getByText('Welcome home!').click(); await p.waitForTimeout(600);
  ok('3rd catch of a species earns Mastery ★ with a celebration', (await p.getByText('New badge!').isVisible()) && (await p.getByText(/Mastery ★$/).first().isVisible().catch(()=>false) || await p.getByText(/Mastery/).first().isVisible()));
  await p.screenshot({path:`${S}/shots/camp-mastery.png`});
  await p.getByText('tap to keep playing').click(); await p.waitForTimeout(300);
  await p.getByText('◀ Back').click(); await p.waitForTimeout(200);
  await p.locator('button',{hasText:/^📖Dex/}).click(); await p.waitForTimeout(300);
  await p.getByText('Mousey').first().click(); await p.waitForTimeout(300);
  await p.screenshot({path:`${S}/shots/camp-dex.png`});
  ok('Wilddex card shows Mastery and the camp bonus', (await p.getByText(/Mastery/).first().isVisible()) && (await p.getByText(/work 15% faster in the Camp/).isVisible()));
  await ctx.close();

  // ---------- 5. Grown-up switch hides the Camp tab ----------
  [ctx,p] = await mkp({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(300);
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base(owned));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByLabel('Grown-up settings').click(); await p.waitForTimeout(300);
  const q = await p.locator('p.text-5xl').innerText(); const [a,c] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
  await p.getByRole('button',{name:String(a*c),exact:true}).click(); await p.waitForTimeout(300);
  await p.getByRole('checkbox').first().uncheck(); await p.waitForTimeout(200);
  await p.getByRole('button',{name:'Done'}).click(); await p.waitForTimeout(200);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  await p.getByRole('button',{name:'Adventure!'}).click(); await p.waitForTimeout(250); await p.locator('button',{hasText:'Meadow'}).first().click(); await p.waitForTimeout(500);
  ok('turning the experiment off hides the Camp tab', (await p.getByRole('button',{name:'Camp mode'}).count()) === 0);
  await ctx.close();

  // ---------- 6. phone layout ----------
  [ctx,p] = await mkp({width:390,height:844});
  const t6 = await (async()=>{ await p.goto(BASE + '/'); return p.evaluate(()=>Date.now()); })();
  await open(p, base(owned, { glow: 80, camps:{ meadow:{ workers:['a','b'], extra:1, basket:0, speed:0, since: t6 - 20*60000 } } }));
  await p.getByRole('button',{name:'Camp mode'}).click(); await p.waitForTimeout(500);
  await p.screenshot({path:`${S}/shots/camp-phone.png`});
  const over = await p.evaluate(() => { const w=innerWidth; return [...document.querySelectorAll('button,p')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>w+2||r.left<-2)&&!e.closest('.overflow-y-auto')}).map(e=>(e.textContent||'').slice(0,16)); });
  ok('camp fits a phone screen '+JSON.stringify(over), over.length===0);
  console.log('errors', errs); await b.close();
})();
