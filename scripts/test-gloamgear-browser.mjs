import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(resolve(process.env.QA_MODULE_DIR,'node_modules/playwright/index.mjs')).href);
const root=resolve('.'),mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+'/'))throw Error('Invalid path');if(url.pathname.endsWith('/'))path=resolve(path,'index.html');const bytes=await readFile(path);res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(8080,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});await mkdir('qa-results',{recursive:true});
const KEY='gloamgear_browser_local_v1',origin='http://127.0.0.1:8080/gloamgear/';
function fresh(){return {version:1,level:1,xp:0,gold:0,gleam:0,stage:1,high:1,runHigh:1,runBosses:0,hp:198,en:100,shield:0,effects:[],inv:[],eq:{},nodes:Array(120).fill(false),mastery:Array(12).fill(0),prestige:0,frag:0,ach:Array(100).fill(false),quests:Array(30).fill(false),auto:true,paused:false,autoSkills:true,stats:{kills:0,bosses:0,loot:0,deaths:0,crits:0,skills:0,offline:0},time:Date.now()};}
let errors=[],failures=[],checks=[];
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
context.on('page',page=>{page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url()+':'+r.status());});});
const page=await context.newPage();await page.addInitScript(key=>{const pending=sessionStorage.getItem(key+'.qaSeed');if(pending!==null){localStorage.setItem(key,pending);sessionStorage.removeItem(key+'.qaSeed');}},KEY);const snapshot=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
async function until(fn,description,ms=45000){const end=Date.now()+ms;while(Date.now()<end){if(await fn())return;await page.waitForTimeout(150);}throw Error('Timed out: '+description);}
async function nav(label){await page.locator('[data-m="'+label+'"]:visible').first().click();await page.locator('.modal').waitFor();}
async function close(){const button=page.locator('.close');if(await button.count())await button.click();}
async function seedNext(raw){await page.evaluate(({key,raw})=>sessionStorage.setItem(key+'.qaSeed',raw),{key:KEY,raw});}async function fixture(state){await seedNext(JSON.stringify(state));await page.reload();await page.locator('.app').waitFor();}
try{
 await page.goto(origin);await page.locator('.app').waitFor();
 await until(()=>page.locator('.combat-art').evaluateAll(imgs=>imgs.length===2&&imgs.every(img=>img.complete&&img.naturalWidth>0)),'combat art');
 await until(async()=>(await snapshot()).stats.kills>=1,'first real kill and loot');checks.push('actual combat/loot');
 await until(async()=>(await snapshot()).level>=2,'level up');
 await page.locator('#pause').click();await nav('Inventario');await page.locator('[data-equip]').first().click();let state=await snapshot();assert.equal(Object.keys(state.eq).length,1);checks.push('equip');await close();
 await nav('Árbol');await page.locator('[data-node="0"]').click();state=await snapshot();assert.equal(state.nodes[0],true);checks.push('talent');await close();
 const equipment=state.eq,gold=state.gold;await page.reload();assert.deepEqual((await snapshot()).eq,equipment);assert.equal((await snapshot()).gold,gold);checks.push('reload persistence');
 await seedNext('{broken');await page.reload();assert.equal(Object.keys((await snapshot()).eq).length,1);checks.push('backup recovery');
 const boss=fresh();Object.assign(boss,{stage:50,high:50,runHigh:50,level:50,hp:5000,auto:false,autoSkills:false});await fixture(boss);await page.getByRole('button',{name:'Última vuelta',exact:true}).click();await until(async()=>{if((await snapshot()).stats.bosses>=1)return true;for(const name of ['Framecutter','Ignición','Escarcha','Última vuelta'])await page.getByRole('button',{name,exact:true}).click();return (await snapshot()).stats.bosses>=1;},'real boss defeat');assert.equal((await snapshot()).stage,51);checks.push('boss');
 const prestige=fresh();Object.assign(prestige,{stage:150,high:150,runHigh:150,runBosses:3,level:50,paused:true});await fixture(prestige);await nav('Prestigio');await page.locator('#prestige').click();assert.equal((await snapshot()).prestige,1);const fragments=(await snapshot()).frag;await nav('Prestigio');assert.ok(await page.locator('#prestige').isDisabled());assert.equal((await snapshot()).frag,fragments);await close();checks.push('prestige one-time reward');
 const offline=fresh();offline.time=Date.now()-60000;await fixture(offline);await page.locator('#pause').click();const offlineGold=(await snapshot()).gold;assert.ok(offlineGold>0);await page.reload();assert.equal((await snapshot()).gold,offlineGold);checks.push('local offline persistence');
 const layout=fresh();layout.paused=true;layout.gold=2000;await fixture(layout);
 for(const [width,height]of [[1920,1080],[1366,768],[768,1024],[390,844],[360,800]]){
  await page.setViewportSize({width,height});
  for(const label of ['Inventario','Personaje','Árbol','Maestrías','Misiones','Logros','Codex','Prestigio']){await nav(label);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow at '+width);await close();}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Battle overflow');await page.screenshot({path:'qa-results/battle-'+width+'.png',fullPage:true});
 }
 checks.push('all panels across five viewports');
 await page.setViewportSize({width:480,height:380});const preview=await page.locator('.view').screenshot({type:'jpeg',quality:20});console.log('GLOAMGEAR_PREVIEW_JPEG='+preview.toString('base64'));
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 const report={checks,uncaughtErrors:errors,httpFailures:failures,localOnly:true,canonical:false};
 await writeFile('qa-results/report.json',JSON.stringify(report,null,2));console.log('BROWSER_QA='+JSON.stringify(report));
} catch(e){await page.screenshot({path:'qa-results/failure.png',fullPage:true});console.error({errors,failures,body:(await page.locator('body').innerText()).slice(0,5000)});throw e;}
finally{await browser.close();await new Promise(r=>server.close(r));}
