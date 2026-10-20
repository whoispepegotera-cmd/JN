(()=>{
'use strict';
const PREFIX='data:image/webp;base64,';
const load=async p=>PREFIX+(await (await fetch(p+'?v=3',{cache:'no-store'})).text()).trim();
const state={mara:null,hound:null,boss:null};
const css=document.createElement('style');
css.textContent=`
.view .actor{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
.cv-stage{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:hidden}
.cv-mara,.cv-enemy{position:absolute;bottom:6%;transform-origin:50% 100%;will-change:transform,filter;display:flex;align-items:flex-end;justify-content:center}
.cv-mara{left:4%;width:36%;height:78%;animation:cvIdle 1.35s ease-in-out infinite}
.cv-enemy{right:4%;width:33%;height:70%;animation:cvEnemyIdle 1.55s ease-in-out infinite}
.cv-enemy.cv-boss{right:1%;width:41%;height:84%}
.cv-img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 16px 13px #000d) drop-shadow(0 0 7px #e7a13e66)}
.cv-enemy .cv-img{transform:scaleX(-1);filter:drop-shadow(0 16px 13px #000e) drop-shadow(0 0 7px #c9313166)}
.cv-slash{position:absolute;left:58%;bottom:34%;width:42%;height:25%;border:8px solid transparent;border-top-color:#ffd36e;border-right-color:#ff5b36;border-radius:50%;opacity:0;filter:drop-shadow(0 0 10px #ff6b31)}
.cv-mara.cv-atk{animation:cvStrike .44s cubic-bezier(.18,.82,.2,1)}
.cv-mara.cv-atk .cv-slash{animation:cvSlash .34s ease-out}
.cv-mara.cv-skill{animation:cvSkill .58s cubic-bezier(.2,.8,.2,1)}
.cv-mara.cv-hurt{animation:cvMaraHurt .24s ease-out}
.cv-enemy.cv-hit{animation:cvEnemyHit .24s ease-out}
.cv-enemy.cv-atk{animation:cvEnemyStrike .48s ease-out}
.cv-enemy.cv-dead{animation:cvEnemyDead .55s ease-in forwards!important}
@keyframes cvIdle{50%{transform:translateY(-7px) rotate(.45deg)}}
@keyframes cvEnemyIdle{50%{transform:translateY(-8px) rotate(-.35deg)}}
@keyframes cvStrike{0%{transform:translateX(0)}35%{transform:translateX(112%) translateY(-5px) scale(1.06)}60%{transform:translateX(126%) scale(.98)}100%{transform:translateX(0)}}
@keyframes cvSlash{0%{opacity:0;transform:rotate(-18deg) scale(.45)}35%{opacity:1}100%{opacity:0;transform:rotate(35deg) scale(1.65)}}
@keyframes cvSkill{0%{transform:translateX(0)}35%{transform:translateX(90%) scale(1.1)}58%{transform:translateX(132%) scale(1.15)}100%{transform:translateX(0)}}
@keyframes cvEnemyHit{25%{transform:translateX(18px) rotate(4deg);filter:brightness(2.2)}70%{transform:translateX(-7px)}}
@keyframes cvEnemyStrike{0%{transform:translateX(0)}45%{transform:translateX(-105%) scale(1.06)}75%{transform:translateX(-92%)}100%{transform:translateX(0)}}
@keyframes cvMaraHurt{35%{transform:translateX(-18px);filter:brightness(2)}}
@keyframes cvEnemyDead{to{opacity:0;transform:translateY(58px) rotate(-11deg) scale(.64);filter:grayscale(1)}}
@media(max-width:920px){.cv-mara{left:1%;width:40%}.cv-enemy{right:1%;width:38%}.cv-enemy.cv-boss{width:46%}}
@media(max-width:680px){.cv-mara{left:-2%;width:48%;height:72%}.cv-enemy{right:-2%;width:46%;height:66%}.cv-enemy.cv-boss{width:54%;height:79%}}
`;
document.head.appendChild(css);
function syncClasses(oldEl,newEl,type){
 const run=()=>{
  if(type==='mara'){
   newEl.classList.toggle('cv-atk',oldEl.classList.contains('atk'));
   newEl.classList.toggle('cv-skill',oldEl.classList.contains('skill'));
   newEl.classList.toggle('cv-hurt',oldEl.classList.contains('hurt'));
  }else{
   newEl.classList.toggle('cv-atk',oldEl.classList.contains('atk'));
   newEl.classList.toggle('cv-hit',oldEl.classList.contains('hit'));
   newEl.classList.toggle('cv-dead',oldEl.classList.contains('dead'));
   newEl.classList.toggle('cv-boss',oldEl.classList.contains('boss'));
  }
 };
 run();
 if(!oldEl.dataset.cvwatch){oldEl.dataset.cvwatch='1';new MutationObserver(run).observe(oldEl,{attributes:true,attributeFilter:['class']})}
}
function install(){
 if(!state.mara||!state.hound||!state.boss)return;
 const view=document.querySelector('.view'); if(!view)return;
 const oldM=view.querySelector('.mara'),oldE=view.querySelector('.foe'); if(!oldM||!oldE)return;
 let layer=view.querySelector('.cv-stage');
 if(!layer){
  layer=document.createElement('div');layer.className='cv-stage';
  layer.innerHTML='<div class="cv-mara"><img class="cv-img cv-mara-img" alt="Mara Vell"><i class="cv-slash"></i></div><div class="cv-enemy"><img class="cv-img cv-enemy-img" alt="Enemy"></div>';
  view.appendChild(layer);
 }
 const mw=layer.querySelector('.cv-mara'),ew=layer.querySelector('.cv-enemy');
 const mi=layer.querySelector('.cv-mara-img'),ei=layer.querySelector('.cv-enemy-img');
 if(mi.src!==state.mara)mi.src=state.mara;
 const isBoss=oldE.classList.contains('boss'); const src=isBoss?state.boss:state.hound;
 if(ei.src!==src)ei.src=src;
 syncClasses(oldM,mw,'mara');syncClasses(oldE,ew,'enemy');
}
Promise.all([
 load('./assets/runtime/mara_combat.b64'),
 load('./assets/runtime/hound.b64'),
 load('./assets/runtime/boss.b64')
]).then(([m,h,b])=>{state.mara=m;state.hound=h;state.boss=b;install();new MutationObserver(install).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});setInterval(install,500)}).catch(err=>{console.error('Gloamgear combat visual loader failed',err)});
})();
