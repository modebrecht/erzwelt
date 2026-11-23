"use strict";
/* Premium treatment for world-map construction/status animation.
   Presentation only: choreographs existing visual states and one-shot transitions. */

(function(){
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

  Erzwelt.nachPinStatus(()=>inspectTransitions());   // direkt nach der Statusanzeige (module/karte.js)
  inspectTransitions();

  window.__erzweltPremiumAnimationTreatment={
    version:1,
    features:["construction-choreography","impact-materiality","progress-instrument","completion-transition","status-transition","active-restraint","warning-heartbeat","quiet-mode","reduced-motion"]
  };
})();
