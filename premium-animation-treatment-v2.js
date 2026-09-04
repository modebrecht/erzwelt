"use strict";
/* Premium animation treatment v2.
   Event-driven presentation polish only: no gameplay, economy, save or balance changes. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-premium-animation-treatment-v2-style";
  style.textContent=`
    .premium-v2-fx{position:absolute;inset:-20px;z-index:8;pointer-events:none;border-radius:50%;overflow:visible}
    .premium-v2-fx::before,.premium-v2-fx::after{content:"";position:absolute;pointer-events:none}
    .premium-v2-fx.tick::before{inset:4px;border-radius:50%;border:2px solid #ffd66f;opacity:0;animation:premiumV2TickRing .62s cubic-bezier(.16,.84,.26,1) both}
    .premium-v2-fx.tick::after{width:7px;height:7px;right:6px;top:7px;border-radius:50%;background:#fff7cc;box-shadow:-9px 5px 0 -1px #f5b73d,3px 10px 0 -2px #fff0a4;opacity:0;animation:premiumV2TickSpark .62s ease-out both}
    @keyframes premiumV2TickRing{0%{opacity:0;transform:scale(.76)}30%{opacity:.78}100%{opacity:0;transform:scale(1.18)}}
    @keyframes premiumV2TickSpark{0%,18%{opacity:0;transform:translate(0,0) scale(.5)}32%{opacity:1}100%{opacity:0;transform:translate(5px,-8px) scale(1.15)}}
    .premium-v2-fx.final::before{inset:-3px;border-radius:50%;border:2px solid #8ce6b5;opacity:0;box-shadow:0 0 14px #64d99a66;animation:premiumV2FinalRing .95s cubic-bezier(.16,.9,.25,1) both}
    .premium-v2-fx.final::after{inset:8px;border-radius:50%;background:radial-gradient(circle at 50% 50%,#ffffff 0 8%,#bdf3d555 27%,transparent 58%),conic-gradient(from 0deg,transparent 0 8%,#baf1d088 8% 10%,transparent 10% 23%,#fff7c988 23% 25%,transparent 25% 48%,#baf1d088 48% 50%,transparent 50% 73%,#fff7c988 73% 75%,transparent 75%);opacity:0;animation:premiumV2FinalFlash .86s ease-out both}
    @keyframes premiumV2FinalRing{0%{opacity:0;transform:scale(.55)}25%{opacity:1}72%{opacity:.42}100%{opacity:0;transform:scale(1.55)}}
    @keyframes premiumV2FinalFlash{0%{opacity:0;transform:scale(.58) rotate(-10deg)}22%{opacity:.95;transform:scale(1) rotate(0)}100%{opacity:0;transform:scale(1.42) rotate(12deg)}}
    .pin.premium-v2-final .knopf{animation:premiumV2FinalSettle .82s cubic-bezier(.16,1.28,.3,1) both!important}
    @keyframes premiumV2FinalSettle{0%{transform:scale(.96)}32%{transform:scale(1.14)}58%{transform:scale(.985)}78%{transform:scale(1.025)}100%{transform:scale(1)}}
    .pin.bau-status .pin-state-badge.status-bau{overflow:hidden}
    .pin.bau-status .pin-state-badge.status-bau::after{content:"";position:absolute;inset:-4px -18px;background:linear-gradient(105deg,transparent 25%,#ffffff80 48%,transparent 68%);transform:translateX(-120%);animation:premiumV2BuildBadgeGlint 4.6s ease-in-out infinite;pointer-events:none}
    @keyframes premiumV2BuildBadgeGlint{0%,70%,100%{transform:translateX(-120%)}82%{transform:translateX(120%)}}
    .pin.bau-status .pin-status-ring{filter:drop-shadow(0 2px 3px #0002)}
    .prozess-reaktor,.fabrikmaschine{isolation:isolate}
    .prozess-reaktor::after,.fabrikmaschine::after{content:"";position:absolute;inset:13px;border-radius:50%;z-index:-1;background:radial-gradient(circle,#fff8d8 0 14%,#f5b73d42 38%,transparent 72%);opacity:0;transform:scale(.7)}
    .raff-prozess.aktiv .prozess-reaktor::after{animation:premiumV2MachineBeat 2.4s .8s ease-out infinite}
    .fabrik-prozess.aktiv .fabrikmaschine::after{animation:premiumV2MachineBeat 2.6s 1.02s ease-out infinite}
    @keyframes premiumV2MachineBeat{0%,38%{opacity:0;transform:scale(.68)}47%{opacity:.78;transform:scale(1)}67%,100%{opacity:0;transform:scale(1.38)}}
    .raff-prozess.aktiv .prozess-reaktor svg{animation:premiumV2MachineSettle 2.4s .8s ease-in-out infinite}
    .fabrik-prozess.aktiv .fabrikmaschine svg{animation:premiumV2MachineSettle 2.6s 1.02s ease-in-out infinite}
    @keyframes premiumV2MachineSettle{0%,43%,70%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(.8px) scale(.985)}58%{transform:translateY(-.5px) scale(1.012)}}
    .materialblock,.produktkarton{overflow:hidden}
    .materialblock::before,.produktkarton::after{content:"";position:absolute;top:-30%;bottom:-30%;width:16px;background:linear-gradient(90deg,transparent,#ffffffb8,transparent);transform:translateX(-55px) rotate(14deg);opacity:0;pointer-events:none}
    .raff-prozess.aktiv .materialblock::before{animation:premiumV2OutputGlint 2.4s 1.1s ease-in-out infinite}
    .fabrik-prozess.aktiv .produktkarton::after{animation:premiumV2OutputGlint 2.6s 1.34s ease-in-out infinite}
    @keyframes premiumV2OutputGlint{0%,38%{opacity:0;transform:translateX(-55px) rotate(14deg)}48%{opacity:.82}67%{opacity:0;transform:translateX(58px) rotate(14deg)}100%{opacity:0}}
    .prozessszene.aktiv .prozesslinie{box-shadow:0 1px 0 #fff8,0 3px 6px #5b49311a}
    .verkauf-paket{overflow:hidden;transform-origin:50% 82%;backface-visibility:hidden}
    .verkauf-paket::before{content:"";position:absolute;inset:-12px -28px;background:linear-gradient(110deg,transparent 32%,#fff9 48%,transparent 64%);transform:translateX(-115%);animation:premiumV2ParcelGlint .85s .12s ease-out both;pointer-events:none}
    @keyframes premiumV2ParcelGlint{0%,20%{transform:translateX(-115%);opacity:0}38%{opacity:.85}100%{transform:translateX(115%);opacity:0}}
    .verkauf-geld{isolation:isolate;overflow:visible}
    .verkauf-geld::before{content:"";position:absolute;inset:-7px;border-radius:999px;z-index:-1;border:1.5px solid #64d99a88;opacity:0;animation:premiumV2MoneyHalo .92s ease-out both}
    @keyframes premiumV2MoneyHalo{0%{opacity:0;transform:scale(.65)}25%{opacity:.8}100%{opacity:0;transform:scale(1.4)}}
    #didaktik-transport .didaktik-truck{filter:drop-shadow(0 3px 2px #0003)}
    #didaktik-transport .didaktik-ship{filter:drop-shadow(0 4px 3px #0002)}
    #didaktik-transport>circle{filter:drop-shadow(0 0 3px #fff8)}
    #tutorial-lernfeedback{overflow:hidden}
    #tutorial-lernfeedback::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,#2fbe7e,#8ce6b5,#f5b73d);transform-origin:left;animation:premiumV2TutorialLine 2.72s linear both}
    @keyframes premiumV2TutorialLine{from{transform:scaleX(0);opacity:.9}78%{transform:scaleX(1);opacity:.9}to{transform:scaleX(1);opacity:0}}
    body[data-anim="1"] .pin.bau-status .pin-state-badge.status-bau::after,body[data-anim="1"] .prozess-reaktor::after,body[data-anim="1"] .fabrikmaschine::after,body[data-anim="1"] .raff-prozess.aktiv .prozess-reaktor svg,body[data-anim="1"] .fabrik-prozess.aktiv .fabrikmaschine svg,body[data-anim="1"] .materialblock::before,body[data-anim="1"] .produktkarton::after{animation:none!important}
    @media(prefers-reduced-motion:reduce){.premium-v2-fx,.pin.bau-status .pin-state-badge.status-bau::after,.prozess-reaktor::after,.fabrikmaschine::after,.raff-prozess.aktiv .prozess-reaktor svg,.fabrik-prozess.aktiv .fabrikmaschine svg,.materialblock::before,.produktkarton::after,.verkauf-paket::before,.verkauf-geld::before,#tutorial-lernfeedback::after{animation:none!important;transition:none!important}.premium-v2-fx{display:none!important}}
  `;
  document.head.appendChild(style);
  const last=new Map(),cleanup=new WeakMap();
  const idFor=pin=>`${pin.dataset.pin||"?"}:${pin.dataset.id||"?"}`;
  function stateFor(pin){try{return JSON.parse(pin.dataset.worldStateKey||"null");}catch{return null;}}
  function emit(pin,type){
    if(!pin||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
    pin.querySelector(".premium-v2-fx")?.remove();
    const fx=document.createElement("span");fx.className=`premium-v2-fx ${type}`;pin.querySelector(".knopf")?.appendChild(fx);
    if(type==="final")pin.classList.add("premium-v2-final");
    const prior=cleanup.get(pin);if(prior)clearTimeout(prior);
    cleanup.set(pin,setTimeout(()=>{fx.remove();pin.classList.remove("premium-v2-final");cleanup.delete(pin);},type==="final"?1050:700));
  }
  function inspect(){
    document.querySelectorAll("#welt .pin[data-pin][data-id]").forEach(pin=>{
      const id=idFor(pin),state=stateFor(pin);if(!state)return;
      const prev=last.get(id);
      if(prev){
        if(prev.kind==="bau"&&state.kind!=="bau")emit(pin,"final");
        else if(prev.kind==="bau"&&state.kind==="bau"&&(prev.rest!==state.rest||prev.progress!==state.progress))emit(pin,"tick");
      }
      last.set(id,state);
    });
  }
  if(typeof zeichnen==="function"){
    const original=zeichnen;
    zeichnen=function(){const out=original();inspect();return out;};
  }
  inspect();
  window.__erzweltPremiumAnimationTreatmentV2={version:1,features:["build-day-tick","construction-finale","machine-beat","output-glint","sale-materiality","transport-depth","tutorial-completion-line","quiet-mode","reduced-motion"]};
})();
