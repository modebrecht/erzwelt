"use strict";
/* Visual separation of strike/standstill vs safety/accident.
   Presentation only: derives the stop reason from existing mine state + S.log. */
(function(){
  const priorStop=new Map();
  const fxTimers=new WeakMap();

  const shieldSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6z" fill="currentColor" opacity=".18"/><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6zM12 7v5m0 3.3v.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const pauseSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>`;
  const stopSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7 17 10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const safeShieldSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6z" fill="currentColor" opacity=".14"/><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function textOf(html){
    const d=document.createElement("div");d.innerHTML=String(html||"");
    return (d.textContent||"").replace(/\s+/g," ").trim();
  }

  function latestCause(def,m){
    const ort=String(def?.ort||"").toLowerCase();
    const dialogTitle=(document.getElementById("d-titel")?.textContent||"").toLowerCase();
    const dialogArt=(document.getElementById("d-art")?.textContent||"").toLowerCase();
    if(typeof modalOffen!=="undefined"&&modalOffen&&(!ort||dialogTitle.includes(ort))){
      if(dialogArt.includes("unfall")||dialogTitle.includes("unfall"))return "sicherheit";
      if(dialogArt.includes("protest")||dialogTitle.includes("streik"))return "streik";
    }
    for(const e of (S?.log||[])){
      const t=textOf(e.text).toLowerCase();
      if(ort&&!t.includes(ort))continue;
      if(/sicherheit|sicherheits|notreparatur|unfall|entschäd/.test(t))return "sicherheit";
      if(/streik|einigung|prämie|lohn/.test(t))return "streik";
    }
    if((m?.zufriedenheit??100)<32)return "streik";
    return "stillstand";
  }

  function restText(m){
    if(!m||m.stillBis<=S.tag)return "";
    const rest=Math.max(0,Math.round(m.stillBis-S.tag));
    if(rest>300)return "Entscheidung offen";
    return `${rest} ${rest===1?"Tag":"Tage"}`;
  }

  function removeDecor(pin){
    pin.classList.remove("mine-stop","mine-stop-strike","mine-stop-safety","mine-stop-generic");
    pin.querySelector(".pin-stop-kind")?.remove();
  }

  function emit(pin,type){
    if(!pin||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
    pin.querySelector(".mine-stop-fx,.mine-resume-fx")?.remove();
    const el=document.createElement("span");
    el.className=type==="resume"?"mine-resume-fx":"mine-stop-fx rein";
    pin.querySelector(".knopf")?.appendChild(el);
    const old=fxTimers.get(pin);if(old)clearTimeout(old);
    fxTimers.set(pin,setTimeout(()=>{el.remove();fxTimers.delete(pin);},900));
  }

  function decorateMine(def){
    const m=S?.minen?.[def.id];
    const pin=document.querySelector(`#welt .pin[data-pin="mine"][data-id="${def.id}"]`);
    if(!m||!pin)return;
    const stopped=m.stillBis>S.tag;
    const before=priorStop.get(def.id)||false;
    if(!stopped){
      if(before)emit(pin,"resume");
      removeDecor(pin);priorStop.set(def.id,false);return;
    }

    const cause=latestCause(def,m),rest=restText(m);
    removeDecor(pin);
    pin.classList.add("mine-stop",cause==="streik"?"mine-stop-strike":cause==="sicherheit"?"mine-stop-safety":"mine-stop-generic");
    const badge=pin.querySelector(".pin-state-badge.status-warn");
    if(badge){badge.textContent=cause==="streik"?"II":cause==="sicherheit"?"!":"II";}
    const hint=pin.querySelector(".pin-status-hint");
    const label=cause==="streik"?`Streik${rest?" · "+rest:""}`:cause==="sicherheit"?`Sicherheitsstopp${rest?" · "+rest:""}`:`Stillstand${rest?" · "+rest:""}`;
    if(hint)hint.textContent=label;
    let kind=pin.querySelector(".pin-stop-kind");
    if(!kind){kind=document.createElement("span");kind.className="pin-stop-kind";pin.querySelector(".knopf")?.appendChild(kind);}
    kind.innerHTML=cause==="sicherheit"?shieldSvg():cause==="streik"?pauseSvg():stopSvg();
    const base=pin.dataset.baseAria||pin.getAttribute("aria-label")||"Rohstoffquelle";
    pin.setAttribute("aria-label",`${base.split(". Förderung gestoppt")[0]}. ${label}. Förderung gestoppt.`);
    if(!before)emit(pin,"stop");
    priorStop.set(def.id,true);
  }

  function decorateWorld(){
    if(typeof MINEN==="undefined"||typeof S==="undefined")return;
    for(const def of MINEN)if(S.minen?.[def.id])decorateMine(def);
  }

  function stopCard(def,m){
    if(!m||m.stillBis<=S.tag)return "";
    const cause=latestCause(def,m),rest=restText(m);
    const title=cause==="streik"?"Streik / Stillstand":cause==="sicherheit"?"Sicherheitsstopp":"Stillstand";
    const body=cause==="streik"
      ?"Die Förderung steht wegen der Lohn- und Zufriedenheitssituation still. Sicherheitsmassnahmen sind davon getrennt."
      :cause==="sicherheit"
        ?"Die Förderung steht wegen eines Sicherheitsereignisses still. Der Lohn ist nicht die Ursache des Unfallrisikos."
        :"Die Förderung steht vorübergehend still.";
    const icon=cause==="sicherheit"?shieldSvg():cause==="streik"?pauseSvg():stopSvg();
    return `<div class="karte mine-stillstand-card ${cause}"><div class="mine-stillstand-head"><span class="mine-stillstand-icon">${icon}</span><div><h3>${title}</h3><small>Förderung gestoppt${rest?" · "+rest:""}</small></div></div><div class="ort">${body}</div></div>`;
  }

  function decorateMineDetail(){
    const root=document.getElementById("blattinhalt");
    if(!root||typeof offenesBlatt==="undefined"||offenesBlatt?.art!=="mine")return;
    if(typeof tutorialLaeuft==="function"&&tutorialLaeuft())return;
    const def=MINEN.find(x=>x.id===offenesBlatt.id),m=S.minen?.[offenesBlatt.id];
    if(!def||!m)return;

    const safety=root.querySelector(".sicherheitskarte");
    if(safety){
      const sicher=!!m.sicherheit;
      safety.classList.toggle("sicher",sicher);
      safety.classList.toggle("offen",!sicher);
      if(!safety.querySelector(".sicherheitskopf")){
        const h3=safety.querySelector("h3");
        const head=document.createElement("div");
        head.className="sicherheitskopf";
        head.innerHTML=`<span class="sicherheits-symbol">${sicher?safeShieldSvg():shieldSvg()}</span><div><h3>Sicherheit</h3><small>${sicher?"Sicherheitsmassnahmen verbessert":"Sicherheitsmassnahmen nicht verbessert"}</small></div>`;
        if(h3)h3.replaceWith(head);else safety.prepend(head);
      }
    }

    let relations=root.querySelector(".mine-ursachen");
    if(!relations){
      const satisfaction=root.querySelector(".zufriedenheitskarte");
      relations=document.createElement("div");
      relations.className="mine-ursachen";
      relations.setAttribute("aria-label","Getrennte Zusammenhänge");
      relations.innerHTML='<div class="mine-ursache lohn"><b>Lohn → Zufriedenheit → Streik</b><span>Lohn beeinflusst die Zufriedenheit.</span></div><div class="mine-ursache sicherheit"><b>Sicherheit → Unfallrisiko</b><span>Sicherheitsmassnahmen beeinflussen das Unfallrisiko.</span></div>';
      if(satisfaction)satisfaction.before(relations);else root.appendChild(relations);
    }

    root.querySelector(".mine-stillstand-card")?.remove();
    const stop=stopCard(def,m);
    if(stop){
      const holder=document.createElement("div");
      holder.innerHTML=stop;
      if(holder.firstElementChild)root.prepend(holder.firstElementChild);
    }
  }

  if(typeof blattFuellen==="function"){
    const originalBlattFuellen=blattFuellen;
    blattFuellen=function(...args){
      const out=originalBlattFuellen.apply(this,args);
      decorateMineDetail();
      return out;
    };
  }

  Erzwelt.nachZeichnen(()=>{decorateWorld();decorateMineDetail();});
  decorateWorld();

  window.__erzweltStopSafetyVisual={version:1,features:["strike-vs-safety","real-stop-visual","mine-detail-causal-separation","resume-feedback"]};
})();
