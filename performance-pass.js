"use strict";
/* Performance/smoothness pass.
   Goal: keep the same game rules and visuals while avoiding repeated DOM rebuilds
   on fast simulation ticks. */

(function(){
  // Both didactic migrations are called from hot render paths. Once the current
  // state already has the required schema, skip the repeated object walk/reset.
  if(typeof didaktikMigration==="function"){
    const original=didaktikMigration;
    didaktikMigration=function(){
      const complete=!!S
        && S.didaktikVersion===DIDAKTIK_VERSION
        && S.preisMod && typeof S.preisMod==="object" && Object.keys(S.preisMod).length===0
        && Object.values(S.minen||{}).every(m=>m.sicherheit!==undefined&&m.nachweis!==undefined);
      if(complete)return;
      return original();
    };
  }
  if(typeof shouldMigration==="function"){
    const original=shouldMigration;
    shouldMigration=function(){
      const complete=!!S
        && S.shouldDidaktikVersion===SHOULD_DIDAKTIK_VERSION
        && S.wissenGesehen && typeof S.wissenGesehen==="object";
      if(complete)return;
      return original();
    };
  }

  // localStorage is synchronous. At max simulation speed the core can request a save
  // around seven times per second; coalesce those writes while still flushing on exit.
  if(typeof speichern==="function"){
    const original=speichern;
    const SAVE_INTERVAL=600;
    let dirty=false,timer=0,lastWrite=-1e9;
    const flushSave=()=>{
      if(timer){clearTimeout(timer);timer=0;}
      if(!dirty)return;
      dirty=false;lastWrite=performance.now();
      return original();
    };
    speichern=function(){
      dirty=true;
      const rest=SAVE_INTERVAL-(performance.now()-lastWrite);
      if(rest<=0)return flushSave();
      if(!timer)timer=setTimeout(flushSave,rest);
    };
    window.addEventListener("pagehide",flushSave);
    window.addEventListener("beforeunload",flushSave);
    document.addEventListener("visibilitychange",()=>{if(document.hidden)flushSave();});
  }

  // Karte (Pins, Kamera, Lieferweg, Transportweg): Caches jetzt direkt in module/karte.js.

  if(typeof dockZeichnen==="function"){
    const original=dockZeichnen;
    let key="";
    dockZeichnen=function(){
      const next=aktiveSeite+"|"+freieArbeiter();
      if(next===key)return;
      key=next;
      return original();
    };
  }

  // Aufgabenkarte: gleicher Cache jetzt direkt in module/aufgabe.js (Grundkarte).

  if(typeof hinweiseSetzen==="function"){
    const original=hinweiseSetzen;
    let key="";
    hinweiseSetzen=function(){
      const next=(tutorialSchritt()?.ziel?.()||"-")+"|"+aktiveSeite;
      if(next===key)return;
      key=next;
      return original();
    };
  }

  function throttleTickRender(original,identity){
    let lastIdentity="",lastTag=-1,lastPaint=0;
    return function(...args){
      const id=identity(...args);
      const now=performance.now();
      const sameIdentity=id===lastIdentity;
      const isNewSimulationTick=S.tag!==lastTag;
      // At very high simulation speeds, numeric panels do not need to rebuild at 7–8 Hz.
      // User actions on the same game day still render immediately.
      if(sameIdentity&&isNewSimulationTick&&now-lastPaint<480){
        lastTag=S.tag;
        return;
      }
      lastIdentity=id; lastTag=S.tag; lastPaint=now;
      return original.apply(this,args);
    };
  }

  if(typeof blattFuellen==="function"){
    const original=blattFuellen;
    blattFuellen=throttleTickRender(original,(art,id)=>`${art}|${id}`);
  }
  if(typeof seiteFuellen==="function"){
    const original=seiteFuellen;
    seiteFuellen=throttleTickRender(original,name=>String(name));
  }

  window.__erzweltPerf={
    version:5,
    note:"Memoized map UI/migrations; rAF-batched pan/zoom; synchronous saves coalesced; fast-tick panels capped near 2 Hz; quiet-mode continuous effects reduced."
  };
})();
