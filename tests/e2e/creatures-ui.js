// Ported from the first-session scratch tests; see tests/README.md
const { chromium } = require('playwright');
const { OUT: S, BASE } = require('../lib');
const ok = (label, v) => console.log((v ? 'PASS ' : 'FAIL ') + label);
(async () => {
  const b = await chromium.launch(); const errs=[];
  const ctxFor = async (vp) => { const ctx = await b.newContext({ viewport:vp, hasTouch:true }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PAGEERR '+e.message)); p.on('console', m => m.type()==='error' && errs.push('CONSOLE '+m.text()));
    // behave like an old tablet Chrome: using Array.prototype.at would throw
    await p.addInitScript(() => { Object.defineProperty(Array.prototype, 'at', { value() { throw new Error('Array.at was called!'); }, writable:false, configurable:false }); });
    return [ctx,p]; };
  const mk = (id,sp,xp,extra={}) => ({ id, sp, name: sp, shiny:false, seed:21+id.length, pers:'gentle', xp, got:'x', pet:{day:'',n:0}, foods:[2,1], ...extra });
  const base = (owned, extra={}) => ({ wilds: { started:true, tipSeen:true, owned, seen:{}, berries:40, fromStars:0, eggs:[], day:'', visitorDone:false, treeDone:false, duelDay:'', favs:{}, legend:false, seq:50, duelWins:0, goals:{day:'',list:[]}, badges:[], newBadge:null, bushAt:{}, ...extra } });

  // ===== 1. tap feedback appears next to the bush =====
  let [ctx,p] = await ctxFor({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(500);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(400);
  ok('starter names are plain animals', (await p.getByText('Mousey',{exact:true}).isVisible()) && (await p.getByText('Fishy',{exact:true}).isVisible()) && (await p.getByText('Drakey',{exact:true}).isVisible()));
  await p.getByText('Drakey',{exact:true}).click(); await p.waitForTimeout(300);
  await p.getByText('Welcome home!').click(); await p.waitForTimeout(400); await p.getByText("Let's go!").click();
  await p.getByText('Sunny Meadow').click(); await p.waitForTimeout(400);
  let near = 0, tried = 0, seenKinds = new Set();
  for (let i=0;i<14 && tried<10;i++) {
    if (await p.getByText('Throw!').isVisible().catch(()=>false)) { await p.getByRole('button',{name:'Run'}).click(); await p.waitForTimeout(600); continue; }
    const bush = p.getByLabel('Rustling bush').first();
    const bb = await bush.boundingBox(); if (!bb) { await p.waitForTimeout(300); continue; }
    const cx = bb.x+bb.width/2, cy = bb.y+bb.height/2;
    await bush.click(); tried++; await p.waitForTimeout(250);
    const popup = p.locator('div.pointer-events-none.absolute.z-30').last();
    if (await popup.isVisible().catch(()=>false)) {
      const pb = await popup.boundingBox(); const txt = (await popup.innerText()).replace(/\n/g,' ');
      const d = Math.hypot((pb.x+pb.width/2)-cx, (pb.y+pb.height/2)-cy);
      seenKinds.add(txt.replace(/\d+/g,'N').slice(0,16));
      if (d < 130) near++;
      if (tried===1) await p.screenshot({path:`${S}/shots/f-pop.png`});
    }
    await p.waitForTimeout(900);
  }
  console.log('  taps:', tried, 'popups near the tapped bush:', near, '| kinds seen:', [...seenKinds].join(' | '));
  ok('every tap shows a message right at the bush', tried>0 && near === tried);
  await ctx.close();

  // ===== 2. seeded: renamed friends, variants, info screens, Friends under old-browser trap =====
  [ctx,p] = await ctxFor({width:960,height:600});
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  const owned = [ mk('a','mossling',0,{name:'Mossling'}), mk('b','fernfox',20,{name:'Fernail'}), mk('c','hushowl',45,{branch:'moon',variant:'shadow',name:'Hootie'}), mk('d','stellacorn',0,{shiny:true,variant:'golden',name:'Sparkle'}), mk('e','narwy',14,{variant:'storm',name:'Narwy'}), mk('f','bandit',0,{variant:'autumn',name:'Bandit'}) ];
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base(owned));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(500);
  await p.locator('button',{hasText:'Friends'}).last().click(); await p.waitForTimeout(500);
  ok('Friends screen opens (old-browser trap on)', await p.getByText(/My Friends/).isVisible());
  ok('old default names became plain animal names', (await p.getByText('Mousey',{exact:true}).count()) > 0 && (await p.getByText('Mossling',{exact:true}).count()) === 0 && (await p.getByText('Foxy',{exact:false}).count() + await p.getByText('Fern Fox',{exact:false}).count()) > 0);
  await p.screenshot({path:`${S}/shots/f-friends.png`});
  await p.getByText('Hootie').first().click(); await p.waitForTimeout(400);
  await p.screenshot({path:`${S}/shots/f-detail.png`});
  ok('creature page has clear sections', (await p.getByText('Favorite food').isVisible()) && (await p.getByText('Growing up').isVisible()) && (await p.getByText('Shadow').first().isVisible()));
  await p.getByText('◀ Friends').click(); await p.getByText('◀ Back').click(); await p.waitForTimeout(300);
  await p.locator('button',{hasText:/^📖Dex/}).click(); await p.waitForTimeout(400);
  ok('wilddex counts 38 species', await p.getByText(/Wilddex \d+\/38/).isVisible());
  await p.screenshot({path:`${S}/shots/f-dex.png`});
  await p.getByText('Star Foal').first().click(); await p.waitForTimeout(300);
  await p.screenshot({path:`${S}/shots/f-dexcard.png`});
  ok('species card shows lives in / loves / special colors', (await p.getByText('Lives in').isVisible()) && (await p.getByText('Special colors found').isVisible()) && (await p.getByText('Golden').first().isVisible()));
  await ctx.close();

  // ===== 3. phone layout of new screens =====
  [ctx,p] = await ctxFor({width:390,height:844});
  await p.goto(BASE + '/'); await p.waitForTimeout(400);
  await p.evaluate((s)=>localStorage.setItem('hwos:v1', JSON.stringify(s)), base(owned));
  await p.reload(); await p.waitForTimeout(600);
  await p.getByText('Hazel',{exact:true}).click(); await p.getByText('Hazelwild').first().click(); await p.waitForTimeout(500);
  const hOver = async (label) => { const o = await p.evaluate(() => { const w=innerWidth; return [...document.querySelectorAll('button,p,input')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>w+2||r.left<-2)&&!e.closest('.overflow-y-auto,.overflow-auto')}).map(e=>(e.textContent||'').slice(0,18)); }); console.log(o.length?'FAIL':'PASS', 'phone', label, o.length? JSON.stringify(o):''); };
  await p.locator('button',{hasText:'Friends'}).last().click(); await p.waitForTimeout(400); await hOver('friends');
  await p.getByText('Hootie').first().click(); await p.waitForTimeout(400); await hOver('creature page'); await p.screenshot({path:`${S}/shots/f-ph-detail.png`});
  await p.getByText('◀ Friends').click(); await p.getByText('◀ Back').click(); await p.waitForTimeout(300);
  await p.locator('button',{hasText:/^📖Dex/}).click(); await p.waitForTimeout(400); await hOver('dex');
  await p.getByText('Star Foal').first().click(); await p.waitForTimeout(900); await hOver('species card'); await p.screenshot({path:`${S}/shots/f-ph-dexcard.png`});
  console.log('errors', errs);
  await b.close();
})();
