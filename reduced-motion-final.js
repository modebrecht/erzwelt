"use strict";
/* Final motion gate.
   Honors both OS-level reduced-motion and the in-game "Animationen = aus" setting,
   including SVG SMIL used by the illustrative transport route. */
(function(){
  const style=document.createElement("style");
  style.id="erzwelt-reduced-motion-final-style";
  style.textContent=`
    @media (prefers-reduced-motion: reduce){
      html{scroll-behavior:auto!important}
      *,*::before,*::after{
        animation-duration:.01ms!important;
        animation-delay:0ms!important;
        animation-iteration-count:1!important;
        transition-duration:.01ms!important;
        transition-delay:0ms!important;
      }
      #welt{will-change:auto!important}
      .didaktik-truck,.didaktik-ship{will-change:auto!important}
    }
    body[data-anim="0"] *,body[data-anim="0"] *::before,body[data-anim="0"] *::after{
      animation:none!important;
      transition:none!important;
    }
    /* Premium presentation rules intentionally use !important. Give the final
       in-game motion gate an ID-scoped specificity advantage so Animationen = aus
       wins over every motion rule inside the game, plus body-level tutorial/toast UI. */
    body[data-anim="0"] #spiel *,body[data-anim="0"] #spiel *::before,body[data-anim="0"] #spiel *::after,
    body[data-anim="0"] #tutorial-lernfeedback,body[data-anim="0"] #tutorial-lernfeedback::before,body[data-anim="0"] #tutorial-lernfeedback::after,
    body[data-anim="0"] #toasts,body[data-anim="0"] #toasts *,body[data-anim="0"] #toasts *::before,body[data-anim="0"] #toasts *::after,
    body[data-anim="0"] #toast-history-control,body[data-anim="0"] #toast-history-backdrop,body[data-anim="0"] #toast-history-panel{
      animation:none!important;
      transition:none!important;
    }
    body[data-anim="0"] #welt,
    body[data-anim="0"] .didaktik-truck,
    body[data-anim="0"] .didaktik-ship{will-change:auto!important}
  `;
  document.head.appendChild(style);

  const media=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const motionOff=()=>!!media?.matches||document.body?.dataset.anim==="0";
  let previousOff=motionOff();

  function stripSmil(){
    if(!motionOff())return;
    // CSS does not control SVG SMIL. Transport graphics use animate,
    // animateMotion and animateTransform, so remove those nodes whenever
    // all motion is meant to be off.
    document.querySelectorAll("#didaktik-transport animate,#didaktik-transport animateMotion,#didaktik-transport animateTransform").forEach(el=>el.remove());
  }

  function syncMotion(){
    const off=motionOff();
    if(off){
      stripSmil();
    }else if(previousOff){
      // A static route may have had its SMIL nodes removed. Force the existing
      // transport renderer to rebuild it when motion is enabled again.
      try{
        if(typeof transportRouteCache!=="undefined")transportRouteCache="";
        if(typeof lieferwegTransportZeichnen==="function")lieferwegTransportZeichnen();
      }catch(e){}
    }
    previousOff=off;
  }

  syncMotion();
  media?.addEventListener?.("change",()=>requestAnimationFrame(syncMotion));

  // The in-game animation setting is reflected on body[data-anim]. Observe only
  // that attribute so changing 0 <-> 1/2 immediately updates SVG motion too.
  if(document.body&&typeof MutationObserver!=="undefined"){
    const bodyObserver=new MutationObserver(syncMotion);
    bodyObserver.observe(document.body,{attributes:true,attributeFilter:["data-anim"]});
  }

  // The route can be redrawn because game context changes while motion remains
  // disabled. Observe only direct children of the world-map SVG and strip SMIL
  // from a newly inserted transport group. No polling or render loop is added.
  const map=document.querySelector("svg.weltkarte");
  if(map&&typeof MutationObserver!=="undefined"){
    const mapObserver=new MutationObserver(records=>{
      if(!motionOff())return;
      if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.id==="didaktik-transport"||n.querySelector?.("#didaktik-transport")))))stripSmil();
    });
    mapObserver.observe(map,{childList:true,subtree:false});
  }

  window.__erzweltReducedMotionFinal={version:4,mode:"os-or-game-setting",smil:true};
})();
