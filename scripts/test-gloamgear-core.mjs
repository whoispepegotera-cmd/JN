import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const html=await readFile('gloamgear/index.html','utf8');
let source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
source=source.replace('function render(){','function render(){return;');
source=source.replace('load();})();','globalThis.qa={fresh,sanitizeSave,stats,damage,skill,spawn,enemyAttack,tickEffects,addEffect,stopped,rewind,claimQuest,load,save,bossPhases,setState(raw){s=sanitizeSave(raw);if(!s)throw Error("Invalid fixture");paused=false;modal="";cd=[0,0,0,0];spawn();},get state(){return s;},get enemy(){return e;}};})();');
const data=new Map(),timers=[],fakeMath=Object.create(Math);fakeMath.random=()=>.25;
const context=vm.createContext({console,Math:fakeMath,Date,JSON,crypto:{randomUUID},performance:{now:()=>0},setTimeout:fn=>{timers.push(fn);return timers.length;},requestAnimationFrame:()=>0,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},window:{addEventListener(){}},document:{hidden:false,addEventListener(){},querySelector:q=>q==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],createElement:()=>({style:{},remove(){}}),body:{appendChild(){}}}});
new vm.Script(source).runInContext(context,{timeout:5000});const game=context.qa;assert.ok(game);
let tests=0;function test(name,fn){fn();tests++;console.log('PASS '+name);}
function start(patch={}){const s=game.fresh();Object.assign(s,patch);game.setState(s);timers.length=0;return game.state;}
test('rejects corrupt saves and unsafe item names',()=>{assert.equal(game.sanitizeSave({}),null);const s=game.fresh();s.stage=751;assert.equal(game.sanitizeSave(s),null);s.stage=1;s.inv=[{name:'<img src=x onerror=alert(1)>',slot:'Weapon',rar:1,pow:5}];assert.equal(game.sanitizeSave(s).inv.length,0);});
test('all 750 stages produce finite bounded encounters',()=>{for(let stage=1;stage<=750;stage++){start({stage,high:stage,runHigh:stage});assert.ok(Number.isFinite(game.enemy.hp)&&game.enemy.hp>0&&game.enemy.hp<1e8);}});
test('the six talent branches change actual derived stats',()=>{start();const before=JSON.stringify(game.stats());for(let branch=0;branch<6;branch++){const s=game.fresh();s.nodes[branch*20]=true;game.setState(s);assert.notEqual(JSON.stringify(game.stats()),before);}});
test('all twelve masteries have an effective modifier',()=>{start();const before=JSON.stringify(game.stats());for(let mastery=0;mastery<12;mastery++){const s=game.fresh();s.mastery[mastery]=100;game.setState(s);assert.notEqual(JSON.stringify(game.stats()),before,'Mastery '+mastery);}});
test('one defeated enemy awards once and persists next stage immediately',()=>{start({level:50});for(let i=0;i<8;i++)game.damage(1e6,true);assert.equal(game.state.stats.kills,1);assert.equal(game.state.stage,2);assert.equal(game.state.inv.length,1);assert.ok(game.enemy.rewarded);assert.equal(JSON.parse(data.get('gloamgear_browser_local_v1')).stage,2);});
test('a delayed enemy strike cannot damage its replacement encounter',()=>{start();const hp=game.state.hp;game.enemyAttack();assert.equal(timers.length,1);game.spawn();timers[0]();assert.equal(game.state.hp,hp);});
test('skills apply bleed, burn, stun, shield, freeze, summons and regeneration',()=>{for(let i=0;i<4;i++){start({level:30});game.enemy.hp=game.enemy.max=1e9;game.skill(i);assert.equal(game.state.stats.skills,1);const effects=game.enemy.effects.map(x=>x.kind);assert.ok(effects.includes(['bleed','burn','stun','freeze'][i]));if(i===2)assert.ok(game.state.shield>0);if(i===3){assert.ok(effects.includes('summon'));assert.ok(game.state.effects.some(x=>x.kind==='regeneration'));}}});
test('damage over time ticks and freeze stops the actor',()=>{start();game.enemy.hp=game.enemy.max=10000;game.addEffect(game.enemy,'poison',25,4);game.addEffect(game.enemy,'freeze',0,2);assert.ok(game.stopped(game.enemy));game.tickEffects(1);assert.equal(game.enemy.hp,9975);});
test('mission rewards are claimable only once',()=>{const s=start();s.stats.kills=10;game.claimQuest(0);assert.equal(game.state.gold,50);game.claimQuest(0);assert.equal(game.state.gold,50);});
test('prestige uses current-run progress and cannot be reclaimed after reset',()=>{start({stage:150,high:150,runHigh:150,runBosses:3,level:30});assert.equal(game.rewind(),true);const reward=game.state.frag;assert.ok(reward>0);assert.equal(game.state.runHigh,1);assert.equal(game.rewind(),false);assert.equal(game.state.frag,reward);});
test('backup recovery preserves a valid older local save',()=>{const s=game.fresh();s.gold=800;data.set('gloamgear_browser_local_v1','{broken');data.set('gloamgear_browser_local_v1.backup',JSON.stringify(s));game.load();assert.equal(game.state.gold,800);});
console.log('LOCAL_CORE_TESTS='+tests);
