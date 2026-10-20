(()=>{
  'use strict';
  const style=document.createElement('style');
  style.textContent=`
    .view .actor{display:block!important;opacity:1!important;visibility:visible!important;z-index:6!important;pointer-events:none}
    .view .mara{left:4%!important;width:31%!important;height:76%!important}
    .view .foe{right:4%!important;width:32%!important;height:76%!important}
    .view .foe.elite{width:35%!important;height:80%!important}
    .view .foe.boss{width:41%!important;height:88%!important;right:1%!important}
    .view .actor .sheet{display:block!important;opacity:1!important;visibility:visible!important;background-image:url('./assets/sprites.webp')!important;background-repeat:no-repeat!important;background-size:500% 500%!important;background-color:transparent!important}
    .view .mara .body,.view .foe .body{min-width:100%!important;min-height:0!important;aspect-ratio:1/1!important}
    .view .mara .weapon{display:block!important;opacity:1!important;visibility:visible!important;z-index:8!important}
    .view .ground{z-index:2}.view #fx{z-index:9}.view .tele{z-index:8}.view .flash{z-index:12}.view .ehud,.view .phud{z-index:15}
    .view:after{content:'';position:absolute;left:0;right:0;bottom:7%;height:4px;background:radial-gradient(ellipse at center,#ffb44455,transparent 70%);filter:blur(4px);z-index:3;pointer-events:none}
    @media(max-width:680px){.view .mara{width:39%!important;left:1%!important}.view .foe{width:40%!important;right:1%!important}.view .foe.boss{width:48%!important}}
  `;
  document.head.appendChild(style);

  function fixSheet(el){
    if(!(el instanceof HTMLElement)) return;
    const cs=getComputedStyle(el);
    const x=parseFloat(cs.getPropertyValue('--x'))||0;
    const y=parseFloat(cs.getPropertyValue('--y'))||0;
    el.style.backgroundPosition=`${x*25}% ${y*25}%`;
    el.style.backgroundSize='500% 500%';
    el.style.backgroundRepeat='no-repeat';
    el.style.backgroundImage="url('./assets/sprites.webp')";
  }
  function fixAll(root=document){
    root.querySelectorAll?.('.sheet').forEach(fixSheet);
    root.querySelectorAll?.('.actor').forEach(a=>{
      a.style.display='block';a.style.visibility='visible';a.style.opacity='1';
    });
  }
  fixAll();
  const mo=new MutationObserver(muts=>{
    for(const m of muts){
      for(const n of m.addedNodes){
        if(n.nodeType===1){
          if(n.matches?.('.sheet')) fixSheet(n);
          fixAll(n);
        }
      }
    }
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  setInterval(fixAll,1200);
})();
