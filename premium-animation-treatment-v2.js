"use strict";
/* Premium animation treatment v2.
   Event-driven presentation polish only: no gameplay, economy, save or balance changes. */

(function(){
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
  Erzwelt.nachZeichnen(()=>inspect());
  inspect();
  window.__erzweltPremiumAnimationTreatmentV2={version:1,features:["build-day-tick","construction-finale","machine-beat","output-glint","sale-materiality","transport-depth","tutorial-completion-line","quiet-mode","reduced-motion"]};
})();
