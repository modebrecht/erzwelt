"use strict";
/* World-map construction/status visibility.
   Pure presentation: uses existing build/staff/material state and does not add build time. */

(function(){
  const C=2*Math.PI*21;
  const buildTotals=new WeakMap();
  const RECENT_MS=1800;

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function toolSvg(){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.2 8.9 2l3.2 3.1-2 2 8.2 8.2-3 3-8.2-8.2-2.1 2L2 9z" fill="currentColor"/><path d="m13.8 16.8 1.8-1.8 4.2 4.2-1.8 1.8z" fill="currentColor" opacity=".58"/></svg>`;}
  function ringSvg(progress){
    const p=clamp(Number(progress)||0,0,1),dash=(C*p).toFixed(1);
    return `<svg class="pin-status-ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="ring-bg" cx="24" cy="24" r="21"/><circle class="ring-fg" cx="24" cy="24" r="21" stroke-dasharray="${dash} ${C.toFixed(1)}"/></svg>`;
  }

  function recent(id){
    if(typeof frischePins==="undefined"||!frischePins?.get)return false;
    return Date.now()-(frischePins.get(id)||0)<RECENT_MS;
  }

  function baseAria(pin){
    if(!pin.dataset.baseAria)pin.dataset.baseAria=pin.getAttribute("aria-label")||"Standort";
    return pin.dataset.baseAria;
  }

  function clearState(pin){
    pin.classList.remove("bau-status","neu-status","inaktiv-status","aktiv-status","world-warn-status");
    pin.style.removeProperty("--pin-status");
    pin.querySelectorAll(".pin-status-ring,.pin-state-badge,.pin-build-tool,.pin-status-hint").forEach(el=>el.remove());
  }

  function applyState(pin,state){
    if(!pin)return;
    const key=JSON.stringify(state);
    if(pin.dataset.worldStateKey===key&&pin.querySelector(".pin-state-badge,.pin-status-ring,.pin-build-tool"))return;
    pin.dataset.worldStateKey=key;
    clearState(pin);
    const base=baseAria(pin);

    if(state.kind==="bau"){
      pin.classList.add("bau-status");pin.style.setProperty("--pin-status","#f5b73d");
      pin.querySelector(".knopf")?.insertAdjacentHTML("beforeend",ringSvg(state.progress));
      pin.querySelector(".knopf")?.insertAdjacentHTML("beforeend",`<span class="pin-state-badge status-bau">${state.count>1?state.count+"× · ":""}${state.rest} T</span><span class="pin-build-tool">${toolSvg()}</span>`);
      pin.insertAdjacentHTML("beforeend",`<span class="pin-status-hint">Im Bau</span>`);
      pin.setAttribute("aria-label",`${base}. Im Bau, noch ${state.rest} ${state.rest===1?"Tag":"Tage"}${state.count>1?`, ${state.count} Bauprojekte`:""}.`);
      return;
    }
    if(state.kind==="neu"){
      pin.classList.add("neu-status");
      pin.querySelector(".knopf")?.insertAdjacentHTML("beforeend",`<span class="pin-state-badge">Neu</span><span class="pin-build-tool">${toolSvg()}</span>`);
      pin.insertAdjacentHTML("beforeend",`<span class="pin-status-hint">Neu eröffnet</span>`);
      pin.setAttribute("aria-label",`${base}. Neu eröffnet.`);return;
    }
    if(state.kind==="warn"){
      pin.classList.add("world-warn-status");pin.style.setProperty("--pin-status","#e0504a");
      pin.querySelector(".knopf")?.insertAdjacentHTML("beforeend",`<span class="pin-state-badge status-warn">!</span>`);
      pin.insertAdjacentHTML("beforeend",`<span class="pin-status-hint">${state.label}</span>`);
      pin.setAttribute("aria-label",`${base}. ${state.label}.`);return;
    }
    if(state.kind==="inaktiv"){
      pin.classList.add("inaktiv-status");
      pin.querySelector(".knopf")?.insertAdjacentHTML("beforeend",`<span class="pin-state-badge status-inaktiv">${state.badge}</span>`);
      pin.insertAdjacentHTML("beforeend",`<span class="pin-status-hint">${state.label}</span>`);
      pin.setAttribute("aria-label",`${base}. ${state.label}.`);return;
    }
    if(state.kind==="aktiv"){
      pin.classList.add("aktiv-status");
      pin.querySelector(".knopf")?.insertAdjacentHTML("beforeend",`<span class="pin-state-badge status-aktiv">aktiv</span>`);
      pin.setAttribute("aria-label",`${base}. Aktiv.`);return;
    }
    pin.setAttribute("aria-label",base);
  }

  function factoryTotal(f){
    if(buildTotals.has(f))return buildTotals.get(f);
    const def=PRODUKT[f.produkt];
    let estimate=Math.max(3,Math.round((def?.bauzeit||f.restbau||3)*(typeof perkMult==="function"?perkMult("bauzeit"):1)));
    estimate=Math.max(f.restbau||0,estimate);
    buildTotals.set(f,estimate);return estimate;
  }

  function factoryCanRun(f){
    if(!f||f.restbau>0||f.arbeiter<=0)return false;
    const def=PRODUKT[f.produkt];
    return Object.keys(def?.rezept||{}).every(k=>(S.mat[k]||0)>=(def.rezept[k]||0));
  }

  function updateMine(def){
    const m=S.minen[def.id];if(!m)return;
    const pin=welt.querySelector(`.pin[data-pin="mine"][data-id="${def.id}"]`);if(!pin)return;
    if(recent(def.id))return applyState(pin,{kind:"neu"});
    if(m.stillBis>S.tag)return applyState(pin,{kind:"warn",label:"Förderung gestoppt"});
    if(m.arbeiter<=0)return applyState(pin,{kind:"inaktiv",badge:"0 P",label:"Kein Personal"});
    return applyState(pin,{kind:"aktiv"});
  }

  function updateRaff(def){
    const r=S.raff[def.id];if(!r)return;
    const pin=welt.querySelector(`.pin[data-pin="raff"][data-id="${def.id}"]`);if(!pin)return;
    if(recent(def.id))return applyState(pin,{kind:"neu"});
    if(r.arbeiter<=0)return applyState(pin,{kind:"inaktiv",badge:"0 P",label:"Kein Personal"});
    const raw=Object.values(S.erz||{}).some(v=>v>.5);
    if(!raw)return applyState(pin,{kind:"inaktiv",badge:"0 R",label:"Kein Rohstoff"});
    return applyState(pin,{kind:"aktiv"});
  }

  function updateFactoryLand(land){
    const list=S.fabriken.filter(f=>f.land===land);if(!list.length)return;
    const pin=welt.querySelector(`.pin[data-pin="fab"][data-id="${land}"]`);if(!pin)return;
    const building=list.filter(f=>f.restbau>0);
    if(building.length){
      const nearest=building.slice().sort((a,b)=>a.restbau-b.restbau)[0];
      const total=factoryTotal(nearest),progress=1-clamp(nearest.restbau/Math.max(1,total),0,1);
      return applyState(pin,{kind:"bau",rest:nearest.restbau,count:building.length,progress:Number(progress.toFixed(3))});
    }
    const built=list.filter(f=>f.restbau<=0);
    if(!built.length)return;
    if(built.some(factoryCanRun))return applyState(pin,{kind:"aktiv"});
    if(built.every(f=>f.arbeiter<=0))return applyState(pin,{kind:"inaktiv",badge:"0 P",label:"Kein Personal"});
    return applyState(pin,{kind:"inaktiv",badge:"0 M",label:"Material fehlt"});
  }

  function updateWorldStates(){
    if(typeof welt==="undefined"||!welt)return;
    for(const def of MINEN)if(S.minen[def.id])updateMine(def);
    for(const def of RAFF_ORTE)if(S.raff[def.id])updateRaff(def);
    for(const land of FAB_ORTE)if(S.fabriken.some(f=>f.land===land))updateFactoryLand(land);
  }

  if(typeof pinFeiern==="function"){
    const originalPinFeiern=pinFeiern;
    pinFeiern=function(id){
      const out=originalPinFeiern(id);
      if(String(id).startsWith("f_")){
        const land=String(id).slice(2);
        S.fabriken.filter(f=>f.land===land&&f.restbau>0).forEach(f=>{if(!buildTotals.has(f))buildTotals.set(f,f.restbau);});
      }
      setTimeout(updateWorldStates,40);
      setTimeout(updateWorldStates,RECENT_MS+80);
      return out;
    };
  }

  Erzwelt.nachZeichnen(()=>updateWorldStates());

  updateWorldStates();
  window.__erzweltWorldStatus={version:1,realConstruction:["fabrik"],instantSetup:["mine","raffinerie"]};
})();
