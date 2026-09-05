"use strict";
/* Final accessibility gate for OS-level reduced-motion preference.
   Covers the legacy core as well as later presentation patches. */
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
  window.__erzweltReducedMotionFinal={version:1,mode:"os-preference"};
})();
