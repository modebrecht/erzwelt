"use strict";
/* Quality pass for the new world-map construction/status animations.
   Presentation only: no simulation state, build times or economy rules are changed. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-construction-animation-enhance-style";
  style.textContent=`
    /* ---------- Construction: coordinated motion, not generic wobble ---------- */
    .pin.bau-status .pin-build-tool,.pin.neu-status .pin-build-tool{
      transform-origin:50% 88%;will-change:transform;
      animation:bauToolRecoil 1.72s cubic-bezier(.22,.8,.3,1) infinite;
    }
    .pin.bau-status .pin-build-tool svg,.pin.neu-status .pin-build-tool svg{
      animation:bauHammerPremium 1.72s cubic-bezier(.2,.8,.25,1) infinite!important;
      transform-origin:72% 78%;will-change:transform;
    }
    @keyframes bauHammerPremium{
      0%,16%{transform:translate(-1px,1px) rotate(-31deg) scale(.98)}
      39%{transform:translate(0,-1px) rotate(-38deg) scale(1.02)}
      53%{transform:translate(1px,1px) rotate(23deg) scale(1.04)}
      58%{transform:translate(0,0) rotate(14deg) scale(.98)}
      70%,100%{transform:translate(-1px,1px) rotate(-28deg) scale(1)}
    }
    @keyframes bauToolRecoil{
      0%,48%,66%,100%{transform:translateY(0) scale(1)}
      54%{transform:translateY(1.5px) scale(.94)}
      60%{transform:translateY(-1px) scale(1.035)}
    }

    /* Impact burst is synced to hammer contact. */
    .pin.bau-status .pin-build-tool::before,.pin.neu-status .pin-build-tool::before{
      content:"";position:absolute;left:-7px;bottom:-4px;width:18px;height:12px;pointer-events:none;
      background:
        radial-gradient(circle at 35% 65%,#f5b73d 0 1.4px,transparent 1.7px),
        radial-gradient(circle at 58% 35%,#fff4bd 0 1.2px,transparent 1.5px),
        radial-gradient(circle at 78% 74%,#d9971a 0 1.1px,transparent 1.4px);
      opacity:0;transform:scale(.35) rotate(-8deg);transform-origin:70% 75%;
      animation:bauImpactSpark 1.72s ease-out infinite;
    }
    .pin.bau-status .pin-build-tool::after,.pin.neu-status .pin-build-tool::after{
      content:"";position:absolute;left:-5px;bottom:-6px;width:16px;height:8px;border-radius:50%;
      background:radial-gradient(ellipse,#d8c39b80 0 30%,transparent 72%);opacity:0;
      transform:translateY(2px) scale(.4);animation:bauImpactDust 1.72s ease-out infinite;pointer-events:none;
    }
    @keyframes bauImpactSpark{
      0%,50%{opacity:0;transform:scale(.25) rotate(-8deg)}
      54%{opacity:1;transform:scale(1) rotate(4deg)}
      63%,100%{opacity:0;transform:translate(-4px,-5px) scale(1.35) rotate(12deg)}
    }
    @keyframes bauImpactDust{
      0%,51%{opacity:0;transform:translateY(2px) scale(.35)}
      57%{opacity:.65;transform:translateY(0) scale(.9)}
      72%,100%{opacity:0;transform:translate(-3px,-5px) scale(1.45)}
    }

    /* Factory construction gets a more readable, premium progress treatment. */
    .pin.bau-status .pin-status-ring{overflow:visible}
    .pin.bau-status .pin-status-ring .ring-bg{stroke:#ffffff30;stroke-width:4.5}
    .pin.bau-status .pin-status-ring .ring-fg{
      stroke-width:4.5;stroke-linecap:round;
      transition:stroke-dasharray .55s cubic-bezier(.2,.8,.3,1);
      animation:bauRingAtmen 2.7s ease-in-out infinite;
    }
    @keyframes bauRingAtmen{
      0%,100%{opacity:.82}
      50%{opacity:1}
    }
    .pin.bau-status .knopf::before{
      content:"";position:absolute;inset:-5px;border-radius:inherit;border:1px solid #f5b73d55;
      opacity:.3;transform:scale(.96);pointer-events:none;
      animation:bauPinAtmen 2.7s ease-in-out infinite;
    }
    @keyframes bauPinAtmen{
      0%,100%{opacity:.18;transform:scale(.96)}
      50%{opacity:.58;transform:scale(1.055)}
    }

    /* Status changes settle into place instead of simply appearing. */
    .pin .pin-state-badge,.pin .pin-status-hint,.pin .pin-build-tool{
      animation-fill-mode:both;
    }
    .pin.bau-status .pin-state-badge,.pin.neu-status .pin-state-badge,
    .pin.inaktiv-status .pin-state-badge,.pin.world-warn-status .pin-state-badge{
      animation:statusBadgeIn .34s cubic-bezier(.18,1.25,.35,1) both;
    }
    @keyframes statusBadgeIn{
      from{opacity:0;transform:translateY(3px) scale(.72)}
      68%{opacity:1;transform:translateY(-1px) scale(1.06)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }
    .pin.bau-status .pin-status-hint,.pin.neu-status .pin-status-hint,
    .pin.inaktiv-status .pin-status-hint,.pin.world-warn-status .pin-status-hint{
      animation:statusHintIn .3s .06s ease-out both;
    }
    @keyframes statusHintIn{
      from{opacity:0;transform:translate(-50%,3px)}
      to{opacity:1;transform:translate(-50%,0)}
    }

    /* Active status is alive but deliberately subtle. */
    .pin.aktiv-status .pin-state-badge.status-aktiv{
      animation:aktivPunktPremium 2.25s ease-in-out infinite;
    }
    .pin.aktiv-status .pin-state-badge.status-aktiv::after{
      content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid #2fbe7e80;
      opacity:0;transform:scale(.6);animation:aktivHaloPremium 2.25s ease-out infinite;
    }
    @keyframes aktivPunktPremium{
      0%,100%{transform:scale(.94)}
      45%{transform:scale(1.08)}
    }
    @keyframes aktivHaloPremium{
      0%,20%{opacity:0;transform:scale(.6)}
      42%{opacity:.55}
      72%,100%{opacity:0;transform:scale(1.45)}
    }

    /* Warnings should be noticeable, not frantic. */
    .pin.world-warn-status .pin-state-badge.status-warn{
      animation:statusBadgeIn .34s cubic-bezier(.18,1.25,.35,1) both, warnBadgePremium 1.8s .42s ease-in-out infinite;
    }
    @keyframes warnBadgePremium{
      0%,100%{box-shadow:0 2px 5px #0004,0 0 0 0 #e0504a00}
      50%{box-shadow:0 2px 5px #0004,0 0 0 5px #e0504a25}
    }

    /* Newly opened instant-build sites: one short staged entrance, then calm. */
    .pin.neu-status .knopf{animation:neuStandortPremium .72s cubic-bezier(.18,1.35,.35,1) both}
    @keyframes neuStandortPremium{
      0%{transform:translateY(6px) scale(.78);opacity:.45}
      58%{transform:translateY(-2px) scale(1.08);opacity:1}
      100%{transform:translateY(0) scale(1);opacity:1}
    }

    /* Quiet mode keeps the same meaning with fewer continuous effects. */
    body[data-anim="1"] .pin.bau-status .pin-build-tool,
    body[data-anim="1"] .pin.neu-status .pin-build-tool,
    body[data-anim="1"] .pin.bau-status .pin-build-tool svg,
    body[data-anim="1"] .pin.neu-status .pin-build-tool svg,
    body[data-anim="1"] .pin.bau-status .pin-build-tool::before,
    body[data-anim="1"] .pin.neu-status .pin-build-tool::before,
    body[data-anim="1"] .pin.bau-status .pin-build-tool::after,
    body[data-anim="1"] .pin.neu-status .pin-build-tool::after{animation-duration:2.35s!important}
    body[data-anim="1"] .pin.aktiv-status .pin-state-badge.status-aktiv::after{display:none}
    body[data-anim="1"] .pin.bau-status .knopf::before{animation:none;opacity:.28;transform:none}

    @media(prefers-reduced-motion:reduce){
      .pin.bau-status .pin-build-tool,.pin.neu-status .pin-build-tool,
      .pin.bau-status .pin-build-tool svg,.pin.neu-status .pin-build-tool svg,
      .pin.bau-status .pin-build-tool::before,.pin.neu-status .pin-build-tool::before,
      .pin.bau-status .pin-build-tool::after,.pin.neu-status .pin-build-tool::after,
      .pin.bau-status .pin-status-ring .ring-fg,.pin.bau-status .knopf::before,
      .pin .pin-state-badge,.pin .pin-status-hint,.pin.aktiv-status .pin-state-badge.status-aktiv,
      .pin.aktiv-status .pin-state-badge.status-aktiv::after,.pin.world-warn-status .pin-state-badge.status-warn,
      .pin.neu-status .knopf{animation:none!important;transition:none!important}
    }
  `;
  document.head.appendChild(style);

  window.__erzweltConstructionAnimationEnhance={
    version:1,
    features:["hammer-impact","dust-spark","smooth-progress","status-transitions","active-halo","quiet-mode","reduced-motion"]
  };
})();
