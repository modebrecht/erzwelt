"use strict";
/* Bewegungseinstellungen gelten auch für die SVG-Lieferpunkte auf der Karte. */
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
    }
    /* #welt behält will-change:transform auch ohne Animationen: es bewegt nichts,
       lässt aber Verschieben und Zoomen auf der Grafikkarte laufen statt die ganze
       Karte bei jedem Schritt neu zu zeichnen (rund dreimal schneller). */
    body[data-anim="0"] *,body[data-anim="0"] *::before,body[data-anim="0"] *::after{
      animation:none!important;
      transition:none!important;
    }
    /* Premium presentation rules intentionally use !important. Give the final
       in-game motion gate an ID-scoped specificity advantage so Animationen = aus
       wins over every motion rule inside the game, plus body-level tutorial/toast UI. */
    body[data-anim="0"] #spiel *,body[data-anim="0"] #spiel *::before,body[data-anim="0"] #spiel *::after,
    body[data-anim="0"] #tutorial-lernfeedback,
    body[data-anim="0"] #toasts,body[data-anim="0"] #toasts *,body[data-anim="0"] #toasts *::before,body[data-anim="0"] #toasts *::after,
    body[data-anim="0"] #toast-history-control,body[data-anim="0"] #toast-history-backdrop,body[data-anim="0"] #toast-history-panel{
      animation:none!important;
      transition:none!important;
    }
  `;
  document.head.appendChild(style);

  const media=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const motionOff=()=>!!media?.matches||document.body?.dataset.anim==="0";
  let previousOff=motionOff();

  function syncMotion(){
    const off = motionOff();
    if (off === previousOff) return;
    previousOff = off;
    zeichnen();
  }

  media?.addEventListener("change", syncMotion);

  // The in-game animation setting is reflected on body[data-anim]. Observe only
  // that attribute so changing 0 <-> 1/2 immediately updates SVG motion too.
  if(document.body&&typeof MutationObserver!=="undefined"){
    const bodyObserver=new MutationObserver(syncMotion);
    bodyObserver.observe(document.body,{attributes:true,attributeFilter:["data-anim"]});
  }


  window.__erzweltReducedMotionFinal={version:4,mode:"os-or-game-setting",smil:true};
})();
