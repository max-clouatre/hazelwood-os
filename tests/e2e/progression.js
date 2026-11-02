// Ported from the first-session scratch tests; see tests/README.md
const { chromium } = require('playwright');
const { OUT: S, BASE } = require('../lib');
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const ok = (label, v) => console.log((v ? 'PASS ' : 'FAIL ') + label);
(async () => {
  const b = await chromium.launch(); const errs=[];
  const mkCtx = async (vp) => { const ctx = await b.newContext({ viewport:vp, hasTouch:true }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PAGEERR '+e.message)); p.on('console', m => m.type()==='error' && errs.push('CONSOLE '+m.text()));
    await p.addInitScript(() => { const r = Math.random; window.__forceRand = null; Math.random = () => (window.__forceRand ?? r()); });
    return [ctx,p]; };
  const berries = async (p) => parseInt((await p.locator('button[aria-label="How to get more berries"]').first().innerText()).replace(/\D+/g,' ').trim().split(' ')[0]);

  // ============ A/B: fresh start, onboarding, berry guide, bush ============
  let [ctx,p] = await mkCtx({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  await p.getByText('Drakey',{exact:true}).click(); await p.waitForTimeout(300);
  await p.locator('input').fill('Cinder'); await p.getByText('Welcome home!').click(); await p.waitForTimeout(500);
  ok('how-to-play guide appears after first friend', await p.getByText('How to play Hazelwild').isVisible());
  ok('guide explains berries', await p.getByText(/Tap the 🍓 any time/).isVisible());
  await p.getByText("Let's go!").click(); await p.waitForTimeout(300);
  ok('hub shows 3 daily goals', (await p.locator('text=/^0\\/\\d · \\+\\d+/').count()) === 3);
  const b0 = await berries(p); console.log('  starting berries', b0);
  await p.locator('button[aria-label="How to get more berries"]').first().click(); await p.waitForTimeout(300);
  await p.screenshot({path:`${S}/shots/n-guide.png`});
  ok('berry guide lists ways to earn', (await p.getByText('How to get more berries').isVisible()) && (await p.getByText('Wishing Tree').first().isVisible()) && (await p.getByText(/Berry Bushes/).isVisible()));
  await p.getByRole('button',{name:'Get +5'}).click(); await p.waitForTimeout(200);
  await p.getByRole('button',{name:'Close'}).click(); await p.waitForTimeout(200);
  ok('wishing tree from guide adds 5', (await berries(p)) === b0 + 5);
  await p.getByText('Sunny Meadow').click(); await p.waitForTimeout(300);
  const b1 = await berries(p);
  await p.getByRole('button',{name:/Berry Bush/}).click(); await p.waitForTimeout(250);
  ok('berry bush gives +2', (await berries(p)) === b1 + 2);
  ok('bush now regrowing', await p.getByText(/regrowing/).first().isVisible());
  await p.getByRole('button',{name:/Berry Bush/}).click(); await p.waitForTimeout(200);
  ok('second tap does not give berries', (await berries(p)) === b1 + 2);
  await p.screenshot({path:`${S}/shots/n-explore.png`});
  await ctx.close();

  // ============ D/E/F/G/H: seeded scenarios ============
  const mk = (id,sp,xp,extra={}) => ({ id, sp, name: sp[0].toUpperCase()+sp.slice(1), shiny:false, seed:21, pers:'gentle', xp, got:'x', pet:{day:'',n:0}, foods:[0,0], ...extra });
  const base = (owned, extra={}) => ({ wilds: { started:true, tipSeen:true, owned, seen:{}, berries:60, fromStars:0, eggs:[], day:'', visitorDone:false, treeDone:false, duelDay:'', favs:{}, legend:false, seq:50, duelWins:0, goals:{day:'',list:[]}, badges:[], newBadge:null, bushAt:{}, ...extra } });
  [ctx,p] = await mkCtx({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base([ mk('a','mossling',12), mk('b','mossling',38,{foods:[0,1]}), mk('c','bramblit',0) ]));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  const dismissBadge = async () => { for (let i=0;i<4;i++) { if (await p.getByText('New badge!').isVisible().catch(()=>false)) { await p.getByText('tap to keep playing').click(); await p.waitForTimeout(250); } else break; } };
  const openFriend = async (nameRe) => { await p.locator('button',{hasText:'Friends'}).last().click(); await p.waitForTimeout(250); await p.locator('button',{hasText:nameRe}).first().click(); await p.waitForTimeout(250); };
  const feedFood = async (food) => { await p.getByRole('button',{name:/Feed/}).click(); await p.getByRole('button',{name:new RegExp(food)}).click(); await p.waitForTimeout(350); };
  // Friends list is newest-first: c(bramblit), b, a. Open creature 'a' = the first mossling (xp 12)
  await p.locator('button',{hasText:'Friends'}).last().click(); await p.waitForTimeout(250);
  const mossButtons = p.locator('button',{hasText:/^Mousey/});
  // second mossling in list order is 'a'
  await mossButtons.first().click(); await p.waitForTimeout(300);
  ok('detail shows food-path explanation', await p.getByText(/Day foods/).isVisible());
  await p.screenshot({path:`${S}/shots/n-detail.png`});
  await feedFood('Honey Drop');           // fav +5 => 17 -> stage 2
  ok('evolution overlay (form 2)', await p.getByText(/evolved!/).first().isVisible());
  await p.screenshot({path:`${S}/shots/n-evolve.png`});
  await p.waitForTimeout(4400);
  for (let i=0;i<5;i++) { await feedFood('Honey Drop'); if (await p.getByText(/evolved!/).first().isVisible().catch(()=>false)) break; }
  ok('evolution overlay (final form) names Sunlit', await p.getByText(/Sunlit Grove Mouse/).first().isVisible());
  ok('flags NEW form on first Sunlit', await p.getByText(/New form discovered/).isVisible());
  await p.screenshot({path:`${S}/shots/n-sunlit.png`});
  await p.waitForTimeout(4400);
  await p.getByText('◀ Friends').click(); await p.waitForTimeout(200);
  // creature 'b' (xp 38, night foods) -> cookie => 40 => Moonlit
  await p.locator('button',{hasText:/^Leaf Mouse/}).first().click(); await p.waitForTimeout(300);
  await feedFood('Moon Cookie');
  ok('moonlit final form', await p.getByText(/Moonlit Grove Mouse/).first().isVisible());
  await p.screenshot({path:`${S}/shots/n-moonlit.png`});
  await p.waitForTimeout(4400);
  await dismissBadge();
  ok('Mossling Master badge earned (all 4 forms)', (await p.evaluate(()=>JSON.parse(localStorage.getItem('hwos:v1')).wilds.badges)).includes('master:mossling'));
  await p.getByText('◀ Friends').click(); await p.waitForTimeout(200); await p.getByText('◀ Back').click(); await p.waitForTimeout(200);
  // Dex shows families
  await p.locator('button',{hasText:/^📖Dex/}).click(); await p.waitForTimeout(300);
  ok('dex grouped by family', (await p.getByText(/Sproutkin Family/).isVisible()) && (await p.getByText(/Tidefolk Family/).isVisible()));
  await p.screenshot({path:`${S}/shots/n-dex.png`});
  await p.getByText('Mousey').first().click(); await p.waitForTimeout(250);
  await p.screenshot({path:`${S}/shots/n-dexinfo.png`});
  await p.mouse.click(10,300); await p.getByText('◀ Back').click(); await p.waitForTimeout(200);
  // Habitat
  await p.locator('button',{hasText:/Home$/}).last().click(); await p.waitForTimeout(500);
  await p.screenshot({path:`${S}/shots/n-habitat.png`});
  await p.locator('button',{hasText:/Mousey|Leaf Mouse|Bunny|Grove/}).first().click({force:true}); await p.waitForTimeout(250);
  ok('habitat creature reacts to petting', await p.locator('span.anim-pop').first().isVisible().catch(()=>false));
  await p.getByText('◀ Back').click(); await p.waitForTimeout(200);
  // Goals: complete 'feed' (we fed 7 times) if it was one of today's goals, else just check progress text exists
  const goalsState = await p.evaluate(()=>JSON.parse(localStorage.getItem('hwos:v1')).wilds.goals.list.map(g=>[g.kind,g.have,g.target]));
  console.log('  goals now:', JSON.stringify(goalsState));
  await ctx.close();

  // ============ family badge by hatching the last member ============
  [ctx,p] = await mkCtx({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base([ mk('a','mossling',0), mk('c','bramblit',0), mk('g','froggy',0), mk('h','fawny',0), mk('i','pandy',0) ], { eggs:[{id:'e1',need:5,have:5}] }));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  const before = await berries(p);
  await p.locator('button',{hasText:'Eggs'}).last().click(); await p.waitForTimeout(300);
  await p.evaluate(()=>{window.__forceRand=0;});
  await p.getByText('Ready! Tap to hatch!').click(); await p.waitForTimeout(1900);
  await p.evaluate(()=>{window.__forceRand=null;});
  await p.getByText('Welcome home!').click(); await p.waitForTimeout(600);
  ok('family badge celebration (Sproutkin)', (await p.getByText('New badge!').isVisible()) && (await p.getByText('Sproutkin Family').isVisible()));
  await p.screenshot({path:`${S}/shots/n-badge.png`});
  await p.getByText('tap to keep playing').click(); await p.waitForTimeout(300);
  await p.getByText('◀ Back').click(); await p.waitForTimeout(200);
  ok('badge gave +20 berries', (await berries(p)) === before + 20);
  await ctx.close();

  // ============ goals claim ============
  [ctx,p] = await mkCtx({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  const today = await p.evaluate(()=>new Date().toDateString());
  await p.evaluate(([s,t])=>{ s.wilds.day=t; s.wilds.goals={day:t,list:[{id:'feed',kind:'feed',target:3,have:3,reward:6,claimed:false},{id:'pet',kind:'pet',target:3,have:1,reward:4,claimed:false},{id:'explore',kind:'explore',target:8,have:0,reward:5,claimed:false}]}; localStorage.setItem('hwos:v1', JSON.stringify(s)); }, [base([mk('a','mossling',0)]), today]);
  await p.reload(); await p.waitForTimeout(500);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  const bb = await berries(p);
  await p.getByRole('button',{name:/Claim \+6/}).click(); await p.waitForTimeout(250);
  ok('goal claim pays +6', (await berries(p)) === bb + 6);
  ok('claimed goal marked done', await p.locator('text=✅').first().isVisible());
  await ctx.close();

  // ============ phone layout across Hazelwild ============
  [ctx,p] = await mkCtx({width:390,height:844});
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base([ mk('a','mossling',20), mk('b','embit',45,{branch:'sun'}), mk('c','twinklet',0) ], { eggs:[{id:'e1',need:5,have:5}] }));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  const hOver = async (label) => { const o = await p.evaluate(() => { const w=innerWidth; return [...document.querySelectorAll('button,p,input')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>w+2||r.left<-2)&&!e.closest('.overflow-y-auto,.overflow-auto')}).map(e=>(e.textContent||'').slice(0,18)); }); console.log(o.length?'FAIL':'PASS', 'phone', label, o.length? JSON.stringify(o):''); };
  await hOver('hub');
  for (const [re,label] of [[/Friends$/,'friends'],[/Home$/,'habitat'],[/Dex$/,'dex'],[/Eggs/,'eggs'],[/Duel$/,'duel']]) { await p.locator('button',{hasText:re}).last().click(); await p.waitForTimeout(350); await p.screenshot({path:`${S}/shots/n-ph-${label}.png`}); await hOver(label); await p.getByText('◀ Back').first().click(); await p.waitForTimeout(200); }
  await p.locator('button',{hasText:'Meadow'}).first().click(); await p.waitForTimeout(300); await hOver('explore');
  console.log('errors', errs);
  await b.close();
})();
