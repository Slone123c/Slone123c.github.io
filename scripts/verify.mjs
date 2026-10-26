import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.VERIFY_URL || 'http://localhost:4321/';
const browser = await chromium.launch({headless:true});
const results=[];
await mkdir('evidence',{recursive:true});
try {
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  for(const route of ['', 'about/', 'blog/', 'blog/hello/', 'blog/algorithm/', 'explore/algorithm/']){
   const response=await page.goto(new URL(route,origin).href);
   assert.equal(response.status(),200,route);
   await page.locator('h1').waitFor();
   if(route==='blog/hello/'){
    await page.locator('.mermaid svg').waitFor();
    assert.equal(await page.locator('astro-island[component-url]').count(),0,'ordinary Markdown must not hydrate React');
    assert.ok(await page.locator('article img').evaluate(img=>img.complete&&img.naturalWidth>0));
   }
   if(route==='blog/algorithm/'||route==='explore/algorithm/'){
    const app=page.getByRole('region',{name:'正弦波交互实验'});
    await app.scrollIntoViewIfNeeded();
    await page.locator('astro-island[ssr]').waitFor({state:'detached'});
    const wave=page.locator('[data-wave]');
    const initial=await wave.getAttribute('points');
    await page.getByRole('slider',{name:'振幅',exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await wave.getAttribute('points'),initial);
    const changed=await wave.getAttribute('points');
    await page.getByRole('slider',{name:'频率',exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await wave.getAttribute('points'),changed);
    await page.getByRole('button',{name:'播放',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('[role="status"]').textContent==='播放中');
    const before=await wave.getAttribute('points');
    await page.waitForFunction(points=>document.querySelector('[data-wave]').getAttribute('points')!==points,before);
    await page.getByRole('button',{name:'暂停',exact:true}).click();
    const paused=await wave.getAttribute('points');
    await page.waitForTimeout(150);
    assert.equal(await wave.getAttribute('points'),paused);
    await page.getByRole('button',{name:'重置',exact:true}).click();
    assert.equal(await page.getByRole('slider',{name:'振幅',exact:true}).inputValue(),'60');
    const reset=(await wave.getAttribute('points')).split(/[ ,]/).map(Number);
    const expected=initial.split(/[ ,]/).map(Number);
    assert.ok(reset.every((n,i)=>Math.abs(n-expected[i])<1e-9),'reset restores initial wave');
    if(route==='explore/algorithm/'){
     assert.equal((await page.reload()).status(),200);
     await page.getByRole('button',{name:'播放',exact:true}).waitFor();
    }
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow ${route}`);
   results.push({viewport:viewport.width,route:route||'/',result:'pass'});
   if(['','blog/hello/','explore/algorithm/'].includes(route))await page.screenshot({path:`evidence/${viewport.width}-${route.replaceAll('/','-')||'home'}.png`,fullPage:true});
  }
  assert.deepEqual(errors,[],`browser errors at ${viewport.width}`);
  await context.close();
 }
 await writeFile('evidence/results.json',JSON.stringify({origin,at:new Date().toISOString(),results},null,2));
 console.log(JSON.stringify({origin,checks:results.length,result:'pass'}));
}finally{await browser.close();}
