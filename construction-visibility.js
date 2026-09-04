"use strict";
/* World-map construction/status visibility.
   Pure presentation: uses existing build/staff/material state and does not add build time. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-construction-visibility-style";
  style.textContent=`
    .pin .knopf{overflow:visible}
    .pin-status-ring{position:absolute!important;inset:-8px auto auto -8px;width:58px!important;height:58px!important;
      overflow:visible;pointer-events:none;z-index:-1;transform:rotate(-90deg)}
    .pin-status-ring .ring-bg{fill:none;stroke:#ffffff38;stroke-width:4}
    .pin-status-ring .ring-fg{fill:none;stroke:var(--pin-status,#f5b73d);stroke-width:4;stroke-linecap:round;
      transition:stroke-dasharray .28s ease}
    .pin-state-badge{position:absolute;left:-13px;top:-10px;z-index:5;min-width:24px;height:20px;padding:0 5px;
      display:grid;place-items:center;border-radius:999px;background:#fff;color:#4f4437;border:2px solid #fff;
      box-shadow:0 2px 5px #0004;font-family:"Baloo 2",sans-serif;font-weight:900;font-size:9.5px;line-height:1;white-space:nowrap}
    .pin-state-badge.status-bau{background:#f5b73d;color:#533600}
    .pin-state-badge.status-warn{background:#e0504a;color:#fff}
    .pin-state-badge.status-inaktiv{background:#ece5d6;color:#5f5547}
    .pin-state-badge.status-aktiv{left:-9px;top:-7px;min-width:13px;width:13px;height:13px;padding:0;background:#2fbe7e;border-width:2px;color:transparent}
    .pin-build-tool{position:absolute;right:-12px;bottom:-9px;z-index:6;width:25px;height:25px;border-radius:50%;
      display:grid;place-items:center;background:#fff8e8;border:2px solid #f5b73d;box-shadow:0 2px 5px #0004;color:#7a5208;pointer-events:none}
    .pin-build-tool svg{width:15px!important;height:15px!important;transform-origin:70% 75%}
    .pin.bau-status .pin-build-tool svg,.pin.neu-status .pin-build-tool svg{animation:pinHammer 1.12s ease-in-out infinite}
    @keyframes pinHammer{0%,100%{transform:rotate(-20deg)}45%{transform:rotate(18deg)}62%{transform:rotate(10deg)}}
    .pin.bau-status .knopf{box-shadow:0 0 0 3px #f5b73d30,0 3px 5px rgba(0,0,0,.32)}
    .pin.bau-status .bez{background:#795713}
    .pin.inaktiv-status .knopf{filter:saturate(.62);opacity:.9}
    .pin.aktiv-status .knopf{box-shadow:0 0 0 2px #2fbe7e2e,0 3px 5px rgba(0,0,0,.32)}
    .pin.neu-status .knopf{box-shadow:0 0 0 3px #f5b73d38,0 3px 5px rgba(0,0,0,.32)}
    .pin.neu-status .pin-state-badge{background:#fff2c8;color:#674708}
    .pin-status-hint{position:absolute;left:50%;top:calc(100% + 31px);transform:translateX(-50%);z-index:0;
      padding:1px 6px;border-radius:999px;background:#0b3648e8;color:#fff;font-size:9px;font-weight:800;
      font-family:"Baloo 2",sans-serif;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px #0003}
    #welt.weit .pin-status-hint{display:none}
    body[data-anim="1"] .pin.bau-status .pin-build-tool svg,body[data-anim="1"] .pin.neu-status .pin-build-tool svg{animation-duration:1.55s}
    @media(prefers-reduced-motion:reduce){
      .pin .pin-build-tool svg{animation:none!important}
      .pin-status-ring .ring-fg{transition:none!important}
    }
  `;
  document.head.appendChild(style);

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

  if(typeof zeichnen==="function"){
    const originalZeichnen=zeichnen;
    zeichnen=function(){const out=originalZeichnen();updateWorldStates();return out;};
  }

  updateWorldStates();
  window.__erzweltWorldStatus={version:1,realConstruction:["fabrik"],instantSetup:["mine","raffinerie"]};
})();
