"use strict";
/* Premium treatment for world-map construction/status animation.
   Presentation only: choreographs existing visual states and one-shot transitions. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-premium-animation-treatment-style";
  style.textContent=`
    /* --- Shared material feel --- */
    .pin .knopf{backface-visibility:hidden;transform:translateZ(0)}
    .pin-state-badge,.pin-build-tool,.pin-status-hint{backface-visibility:hidden}

    /* --- Construction: staged pulse + contact + settle --- */
    .pin.bau-status .knopf{
      animation:premiumBuildBody 2.2s cubic-bezier(.22,.8,.28,1) infinite;
    }
    @keyframes premiumBuildBody{
      0%,37%,68%,100%{transform:translateY(0) scale(1)}
      50%{transform:translateY(.7px) scale(.985)}
      58%{transform:translateY(-.6px) scale(1.015)}
    }
    .pin.bau-status .pin-build-tool{
      animation:premiumToolBody 2.2s cubic-bezier(.18,.82,.25,1) infinite!important;
    }
    .pin.bau-status .pin-build-tool svg{
      animation:premiumHammer 2.2s cubic-bezier(.18,.82,.25,1) infinite!important;
    }
    @keyframes premiumToolBody{
      0%,35%,67%,100%{transform:translate(0,0) scale(1)}
      49%{transform:translate(.8px,1px) scale(.95)}
      57%{transform:translate(-.4px,-.7px) scale(1.035)}
    }
    @keyframes premiumHammer{
      0%,18%{transform:translate(-1px,1px) rotate(-34deg)}
      38%{transform:translate(-1px,-1px) rotate(-43deg)}
      51%{transform:translate(1px,1px) rotate(24deg) scale(1.04)}
      57%{transform:translate(0,0) rotate(11deg) scale(.98)}
      70%,100%{transform:translate(-1px,1px) rotate(-31deg) scale(1)}
    }

    /* richer impact without extra DOM */
    .pin.bau-status .pin-build-tool::before{
      background:
        radial-gradient(circle at 18% 68%,#fff7c9 0 1.1px,transparent 1.5px),
        radial-gradient(circle at 42% 31%,#f5b73d 0 1.5px,transparent 1.9px),
        radial-gradient(circle at 66% 66%,#fff0a4 0 1.15px,transparent 1.55px),
        radial-gradient(circle at 86% 40%,#d9971a 0 1px,transparent 1.35px);
      filter:drop-shadow(0 0 2px #f5b73d66);
      animation:premiumImpactSpark 2.2s ease-out infinite!important;
    }
    .pin.bau-status .pin-build-tool::after{
      animation:premiumImpactDust 2.2s ease-out infinite!important;
    }
    @keyframes premiumImpactSpark{
      0%,48%{opacity:0;transform:scale(.2) rotate(-10deg)}
      52%{opacity:1;transform:scale(1.08) rotate(3deg)}
      63%,100%{opacity:0;transform:translate(-5px,-6px) scale(1.5) rotate(13deg)}
    }
    @keyframes premiumImpactDust{
      0%,49%{opacity:0;transform:translateY(2px) scale(.3)}
      55%{opacity:.68;transform:translateY(0) scale(.95)}
      74%,100%{opacity:0;transform:translate(-4px,-6px) scale(1.65)}
    }

    /* progress feels instrument-like instead of decorative */
    .pin.bau-status .pin-status-ring .ring-bg{stroke:#ffffff28;stroke-width:4.2}
    .pin.bau-status .pin-status-ring .ring-fg{
      stroke-width:4.8;
      filter:drop-shadow(0 0 2px #f5b73d55);
      transition:stroke-dasharray .62s cubic-bezier(.16,.84,.26,1),opacity .25s ease;
      animation:premiumRingGlow 3.2s ease-in-out infinite!important;
    }
    @keyframes premiumRingGlow{0%,100%{opacity:.82}50%{opacity:1}}

    /* badges have depth and restrained entrance */
    .pin-state-badge{box-shadow:0 1px 0 #fff8 inset,0 3px 7px #0004}
    .pin.bau-status .pin-state-badge.status-bau{
      background:linear-gradient(#ffd96d,#f5b73d);
      border-color:#fff4c6;
      text-shadow:0 1px #fff6;
    }
    .pin.inaktiv-status .pin-state-badge.status-inaktiv{
      background:linear-gradient(#f5f0e6,#ddd2be);
      border-color:#fffaf1;
    }
    .pin.world-warn-status .pin-state-badge.status-warn{
      background:linear-gradient(#f06c65,#d94741);
      border-color:#ffe0dd;
    }

    /* active pins feel alive, but calmer than building */
    .pin.aktiv-status .knopf{
      animation:premiumActiveBreath 4.8s ease-in-out infinite;
    }
    @keyframes premiumActiveBreath{
      0%,100%{box-shadow:0 0 0 2px #2fbe7e22,0 3px 5px rgba(0,0,0,.32)}
      50%{box-shadow:0 0 0 3px #2fbe7e38,0 3px 5px rgba(0,0,0,.32)}
    }
    .pin.aktiv-status .pin-state-badge.status-aktiv{
      box-shadow:0 0 0 2px #fff,0 2px 5px #0003,0 0 7px #2fbe7e55;
      animation:premiumActiveDot 3.4s ease-in-out infinite!important;
    }
    @keyframes premiumActiveDot{0%,100%{transform:scale(.94);opacity:.9}50%{transform:scale(1.08);opacity:1}}

    /* inactive = visually settled, not disabled-looking */
    .pin.inaktiv-status .knopf{
      filter:saturate(.72) brightness(.96)!important;
      opacity:.94!important;
      animation:premiumInactiveSettle .44s cubic-bezier(.2,1.15,.35,1) both;
    }
    @keyframes premiumInactiveSettle{
      from{transform:translateY(-1px) scale(1.025)}
      to{transform:translateY(0) scale(1)}
    }

    /* warning: deliberate heartbeat rather than frantic pulsing */
    .pin.world-warn-status .knopf{
      animation:premiumWarningBeat 2.35s ease-in-out infinite!important;
    }
    @keyframes premiumWarningBeat{
      0%,100%{transform:scale(1)}
      42%{transform:scale(1.025)}
      50%{transform:scale(1.065)}
      61%{transform:scale(1)}
    }

    /* one-shot transition overlays */
    .premium-pin-fx{position:absolute;inset:-18px;z-index:7;pointer-events:none;border-radius:50%;overflow:visible}
    .premium-pin-fx::before,.premium-pin-fx::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none}
    .premium-pin-fx.complete::before{
      border:2px solid #7ce3ae;opacity:0;
      animation:premiumCompleteRing .82s cubic-bezier(.18,.8,.25,1) both;
    }
    .premium-pin-fx.complete::after{
      inset:12px;background:radial-gradient(circle,#effff6 0 18%,#6edfa655 38%,transparent 70%);
      opacity:0;animation:premiumCompleteFlash .7s ease-out both;
    }
    @keyframes premiumCompleteRing{
      0%{opacity:0;transform:scale(.55)}
      28%{opacity:.95}
      100%{opacity:0;transform:scale(1.45)}
    }
    @keyframes premiumCompleteFlash{
      0%{opacity:0;transform:scale(.5)}
      24%{opacity:1;transform:scale(1)}
      100%{opacity:0;transform:scale(1.35)}
    }
    .pin.premium-complete .knopf{animation:premiumCompleteSettle .72s cubic-bezier(.16,1.3,.3,1) both!important}
    @keyframes premiumCompleteSettle{
      0%{transform:scale(.96)}
      42%{transform:scale(1.13)}
      70%{transform:scale(.985)}
      100%{transform:scale(1)}
    }

    .premium-pin-fx.change::before{
      inset:5px;border:1.5px solid #ffffffb8;opacity:0;
      animation:premiumStateSweep .48s ease-out both;
    }
    @keyframes premiumStateSweep{
      0%{opacity:0;transform:scale(.75)}
      35%{opacity:.75}
      100%{opacity:0;transform:scale(1.18)}
    }

    /* freshly opened instant-build locations: staged materialisation */
    .pin.neu-status .knopf{
      animation:premiumNewSite .82s cubic-bezier(.16,1.32,.3,1) both!important;
    }
    .pin.neu-status .pin-build-tool{animation-duration:2.15s!important}
    @keyframes premiumNewSite{
      0%{opacity:.2;transform:translateY(8px) scale(.7)}
      52%{opacity:1;transform:translateY(-2px) scale(1.09)}
      74%{transform:translateY(.5px) scale(.985)}
      100%{transform:translateY(0) scale(1)}
    }

    /* quiet mode preserves hierarchy, removes secondary continuous polish */
    body[data-anim="1"] .pin.bau-status .knopf,
    body[data-anim="1"] .pin.bau-status .pin-build-tool,
    body[data-anim="1"] .pin.bau-status .pin-build-tool svg,
    body[data-anim="1"] .pin.bau-status .pin-build-tool::before,
    body[data-anim="1"] .pin.bau-status .pin-build-tool::after{animation-duration:3s!important}
    body[data-anim="1"] .pin.bau-status .pin-status-ring .ring-fg,
    body[data-anim="1"] .pin.aktiv-status .knopf,
    body[data-anim="1"] .pin.aktiv-status .pin-state-badge.status-aktiv{animation:none!important}

    @media(prefers-reduced-motion:reduce){
      .pin.bau-status .knopf,.pin.bau-status .pin-build-tool,.pin.bau-status .pin-build-tool svg,
      .pin.bau-status .pin-build-tool::before,.pin.bau-status .pin-build-tool::after,
      .pin.bau-status .pin-status-ring .ring-fg,.pin.aktiv-status .knopf,
      .pin.aktiv-status .pin-state-badge.status-aktiv,.pin.inaktiv-status .knopf,
      .pin.world-warn-status .knopf,.premium-pin-fx::before,.premium-pin-fx::after,
      .pin.premium-complete .knopf,.pin.neu-status .knopf{animation:none!important;transition:none!important}
      .premium-pin-fx{display:none!important}
    }
  `;
  document.head.appendChild(style);

  const previous=new Map();
  const timers=new WeakMap();

  function pinId(pin){return `${pin.dataset.pin||"?"}:${pin.dataset.id||"?"}`;}
  function parseState(pin){
    try{return JSON.parse(pin.dataset.worldStateKey||"null");}catch{return null;}
  }
  function fx(pin,type){
    if(!pin||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
    pin.querySelector(".premium-pin-fx")?.remove();
    const el=document.createElement("span");el.className=`premium-pin-fx ${type}`;
    pin.querySelector(".knopf")?.appendChild(el);
    if(type==="complete")pin.classList.add("premium-complete");
    const old=timers.get(pin);if(old)clearTimeout(old);
    timers.set(pin,setTimeout(()=>{el.remove();pin.classList.remove("premium-complete");timers.delete(pin);},type==="complete"?900:560));
  }
  function inspectTransitions(){
    document.querySelectorAll("#welt .pin[data-pin][data-id]").forEach(pin=>{
      const id=pinId(pin),state=parseState(pin);if(!state)return;
      const prev=previous.get(id);
      if(prev){
        if(prev.kind==="bau"&&state.kind!=="bau")fx(pin,"complete");
        else if(prev.kind!==state.kind)fx(pin,"change");
      }
      previous.set(id,state);
    });
  }

  if(typeof zeichnen==="function"){
    const originalZeichnen=zeichnen;
    zeichnen=function(){const out=originalZeichnen();inspectTransitions();return out;};
  }
  inspectTransitions();

  window.__erzweltPremiumAnimationTreatment={
    version:1,
    features:["construction-choreography","impact-materiality","progress-instrument","completion-transition","status-transition","active-restraint","warning-heartbeat","quiet-mode","reduced-motion"]
  };
})();
