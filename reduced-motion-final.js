"use strict";
/* Final accessibility gate for OS-level reduced-motion preference.
   Covers the legacy core as well as later presentation patches, including SVG SMIL. */
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
  `;
  document.head.appendChild(style);

  const media=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  function syncSmil(){
    if(!media?.matches)return;
    // CSS reduced-motion does not control SVG SMIL. Transport graphics use
    // animate/animateMotion/animateTransform, so remove those animation nodes
    // from the currently rendered illustrative route. The transport layer
    // redraws itself when the media preference changes, restoring motion when
    // reduced motion is disabled again.
    document.querySelectorAll("#didaktik-transport animate,#didaktik-transport animateMotion,#didaktik-transport animateTransform").forEach(el=>el.remove());
  }

  syncSmil();
  media?.addEventListener?.("change",()=>requestAnimationFrame(syncSmil));

  // The route can also be redrawn because game context changes while reduced
  // motion remains active. Observe only that SVG map subtree and strip SMIL
  // from a newly inserted transport group without creating another render loop.
  const map=document.querySelector("svg.weltkarte");
  if(map&&typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(records=>{
      if(!media?.matches)return;
      if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.id==="didaktik-transport"||n.querySelector?.("#didaktik-transport")))))syncSmil();
    });
    observer.observe(map,{childList:true,subtree:false});
  }

  window.__erzweltReducedMotionFinal={version:2,mode:"os-preference",smil:true};
})();
