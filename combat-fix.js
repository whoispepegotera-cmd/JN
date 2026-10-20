(()=>{
'use strict';
const ASSET_VERSION='20261020-final-visible-2';
const state={
 mara:`./assets/runtime/mara_combat.webp?v=${ASSET_VERSION}`,
 hound:`./assets/runtime/hound.webp?v=${ASSET_VERSION}`,
 boss:`./assets/runtime/boss.webp?v=${ASSET_VERSION}`
};
const css=document.createElement('style');
css.textContent=`
.view .actor{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
.cv-stage{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:hidden}
.cv-mara,.cv-enemy{position:absolute;bottom:5%;transform-origin:50% 100%;will-change:transform,filter;display:flex!important;opacity:1!important;visibility:visible!important;align-items:flex-end;justify-content:center}
.cv-mara{left:2%;width:40%;height:82%;animation:cvIdle 1.35s ease-in-out infinite}
.cv-enemy{right:2%;width:38%;height:74%;animation:cvEnemyIdle 1.55s ease-in-out infinite}
.cv-enemy.cv-boss{right:0;width:45%;height:88%}
.cv-img{display:block!important;opacity:1!important;visibility:visible!important;max-width:100%;max-height:100%;width:auto!important;height:auto!important;object-fit:contain;filter:drop-shadow(0 16px 13px #000d) drop-shadow(0 0 8px #e7a13e88)}
.cv-enemy .cv-img{transform:scaleX(-1);filter:drop-shadow(0 16px 13px #000e) drop-shadow(0 0 8px #c9313188)}
.cv-slash{position:absolute;left:56%;bottom:34%;width:46%;height:27%;border:9px solid transparent;border-top-color:#ffd36e;border-right-color:#ff5b36;border-radius:50%;opacity:0;filter:drop-shadow(0 0 12px #ff6b31)}
.cv-mara.cv-atk{animation:cvStrike .44s cubic-bezier(.18,.82,.2,1)}
.cv-mara.cv-atk .cv-slash{animation:cvSlash .34s ease-out}
.cv-mara.cv-skill{animation:cvSkill .58s cubic-bezier(.2,.8,.2,1)}
.cv-mara.cv-hurt{animation:cvMaraHurt .24s ease-out}
.cv-enemy.cv-hit{animation:cvEnemyHit .24s ease-out}
.cv-enemy.cv-atk{animation:cvEnemyStrike .48s ease-out}
.cv-enemy.cv-dead{animation:cvEnemyDead .55s ease-in forwards!important}
@keyframes cvIdle{50%{transform:translateY(-7px) rotate(.45deg)}}
@keyframes cvEnemyIdle{50%{transform:translateY(-8px) rotate(-.35deg)}}
@keyframes cvStrike{0%{transform:translateX(0)}35%{transform:translateX(102%) translateY(-5px) scale(1.06)}60%{transform:translateX(116%) scale(.98)}100%{transform:translateX(0)}}
@keyframes cvSlash{0%{opacity:0;transform:rotate(-18deg) scale(.45)}35%{opacity:1}100%{opacity:0;transform:rotate(35deg) scale(1.65)}}
@keyframes cvSkill{0%{transform:translateX(0)}35%{transform:translateX(82%) scale(1.1)}58%{transform:translateX(119%) scale(1.15)}100%{transform:translateX(0)}}
@keyframes cvEnemyHit{25%{transform:translateX(18px) rotate(4deg);filter:brightness(2.2)}70%{transform:translateX(-7px)}}
@keyframes cvEnemyStrike{0%{transform:translateX(0)}45%{transform:translateX(-100%) scale(1.06)}75%{transform:translateX(-88%)}100%{transform:translateX(0)}}
@keyframes cvMaraHurt{35%{transform:translateX(-18px);filter:brightness(2)}}
@keyframes cvEnemyDead{to{opacity:0;transform:translateY(58px) rotate(-11deg) scale(.64);filter:grayscale(1)}}
@media(max-width:920px){.cv-mara{left:0;width:43%}.cv-enemy{right:0;width:41%}.cv-enemy.cv-boss{width:49%}}
@media(max-width:680px){.cv-mara{left:-3%;width:51%;height:75%}.cv-enemy{right:-3%;width:49%;height:69%}.cv-enemy.cv-boss{width:57%;height:82%}}
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
 if(!oldEl.dataset.cvwatch){
  oldEl.dataset.cvwatch='1';
  new MutationObserver(run).observe(oldEl,{attributes:true,attributeFilter:['class']});
 }
}
function install(){
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
 const isBoss=oldE.classList.contains('boss');
 if(!mi.dataset.loaded){mi.src=state.mara;mi.dataset.loaded='1'}
 const wanted=isBoss?state.boss:state.hound;
 if(ei.dataset.src!==wanted){ei.src=wanted;ei.dataset.src=wanted}
 mi.onerror=()=>{mi.style.background='#a22';mi.alt='MARA';console.error('Mara sprite failed',mi.src)};
 ei.onerror=()=>{ei.style.background='#622';ei.alt='ENEMY';console.error('Enemy sprite failed',ei.src)};
 syncClasses(oldM,mw,'mara');syncClasses(oldE,ew,'enemy');
}
install();
new MutationObserver(install).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
setInterval(install,350);
})();
