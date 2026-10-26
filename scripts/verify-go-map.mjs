import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.VERIFY_URL||'http://localhost:4321/';
const browser=await chromium.launch();
const results=[];
await mkdir('evidence/go-map',{recursive:true});
try{
 for(const width of [1440,640,390]){
  const height=width===390?844:900;
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  assert.equal((await page.goto(new URL('explore/go-map/',origin).href)).status(),200);
  await page.locator('[data-enhanced]').waitFor();
  const initial=await page.locator('.map-experience').evaluate(e=>getComputedStyle(e).backgroundColor);
  const go=async(index)=>{
   await page.locator(`#map-step-${index}`).evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:'instant'}));
   await page.waitForFunction(i=>Number(getComputedStyle(document.querySelectorAll('.map-scene')[i]).opacity)>.98,index);
   const world=await page.locator('.map-world').boundingBox();
   assert.ok(Math.abs(world.y)<2,'stage remains fixed to viewport');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
  };
  for(let i=0;i<10;i++){
   await go(i);
   if([0,1,3,5,7,8].includes(i))await page.screenshot({path:`evidence/go-map/${width}-step-${i}.png`});
   if(i===1)assert.notEqual(await page.locator('.map-experience').evaluate(e=>getComputedStyle(e).backgroundColor),initial);
   if(i===7){
    await page.getByRole('button',{name:'查找 nobody',exact:true}).click();
    assert.ok((await page.locator('.map-query-controls [role="status"]').innerText()).includes('0, false'));
    assert.ok((await page.locator('.map-scene').nth(7).textContent()).includes('0, false'));
    await page.getByRole('button',{name:'查找 alice',exact:true}).click();
   }
   if(i===8){
    const slider=page.getByRole('slider');await slider.focus();await page.keyboard.press('End');
    assert.equal(await slider.inputValue(),'6');
    assert.ok((await page.locator('.map-index-control [role="status"]').innerText()).includes('9 次 map 查找'));
    assert.equal(await page.locator('.map-scene').nth(8).locator('[data-index-items] .map-box').count(),6);
   }
  }
  await go(3);await go(0);
  assert.equal(await page.locator('.map-experience').evaluate(e=>getComputedStyle(e).backgroundColor),initial,'background reverses');
  await go(5);await page.reload();await page.locator('[data-enhanced]').waitFor();
  await page.waitForFunction(()=>Number(getComputedStyle(document.querySelectorAll('.map-scene')[5]).opacity)>.98);
  await page.goto(new URL('blog/go-map-storage/',origin).href);
  assert.equal(await page.locator('article img').count(),9);
  for(const image of await page.locator('article img').all()){
   await image.scrollIntoViewIfNeeded();
   await image.evaluate(img=>img.decode());
   assert.ok(await image.evaluate(img=>img.complete&&img.naturalWidth>0));
  }
  assert.equal(await page.getByRole('link',{name:'滚动进入 Go map 内部 ↗'}).getAttribute('href'),'/explore/go-map/');
  assert.deepEqual(errors,[]);
  results.push({width,height,scrollScenes:10,reverse:true,refresh:true,lookup:true,indexer:true,sourceImages:9,errors:0});
  await context.close();
 }
 for(const mode of ['reduced','no-js']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',javaScriptEnabled:mode!=='no-js'});
  const page=await context.newPage();await page.goto(new URL('explore/go-map/',origin).href);
  assert.equal(await page.locator('.map-still:visible').count(),10);
  assert.ok(await page.locator('.map-world').isHidden());
  await page.screenshot({path:`evidence/go-map/${mode}.png`,fullPage:true});
  results.push({mode,staticFrames:10});await context.close();
 }
 await writeFile('evidence/go-map/results.json',JSON.stringify({origin,results},null,2));
 console.log(JSON.stringify({origin,results}));
}finally{await browser.close();}
