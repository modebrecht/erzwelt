"use strict";
/* Visual separation of strike/standstill vs safety/accident.
   Presentation only: derives the stop reason from existing mine state + S.log. */
(function(){
  const style=document.createElement("style");
  style.id="erzwelt-stop-safety-visual-style";
  style.textContent=`
    /* A stopped mine must visibly stop. */
    .pin.mine-stop .knopf>svg,.pin.mine-stop .knopf>span.sym{animation:none!important;transform:none!important}
    .pin.mine-stop .staub{display:none!important;animation:none!important}
    .pin.mine-stop .knopf{box-shadow:0 0 0 3px #ffffff12,0 3px 5px rgba(0,0,0,.32)!important}
    .pin.mine-stop .pin-state-badge.status-warn{min-width:22px;height:22px;padding:0}
    .pin.mine-stop .pin-status-hint{font-weight:900}

    .pin.mine-stop-strike .knopf{border-color:#f08c2e!important;filter:saturate(.66) brightness(.94)!important}
    .pin.mine-stop-strike .bez{background:#75441f!important}
    .pin.mine-stop-strike .pin-state-badge.status-warn{background:#f08c2e!important;border-color:#ffe5bf!important;color:#fff!important}
    .pin.mine-stop-safety .knopf{border-color:#e0504a!important;filter:saturate(.48) brightness(.92)!important}
    .pin.mine-stop-safety .bez{background:#7d2f2b!important}
    .pin.mine-stop-safety .pin-state-badge.status-warn{background:#e0504a!important;border-color:#ffd8d5!important;color:#fff!important}
    .pin.mine-stop-generic .knopf{filter:saturate(.58) brightness(.93)!important}

    .pin-stop-kind{position:absolute;right:-12px;bottom:-10px;z-index:8;width:25px;height:25px;border-radius:50%;
      display:grid;place-items:center;border:2px solid #fff;box-shadow:0 2px 5px #0004;color:#fff;pointer-events:none}
    .pin-stop-kind svg{width:14px!important;height:14px!important;animation:none!important;transform:none!important}
    .pin.mine-stop-strike .pin-stop-kind{background:#f08c2e}
    .pin.mine-stop-safety .pin-stop-kind{background:#e0504a}
    .pin.mine-stop-generic .pin-stop-kind{background:#7d7466}

    .mine-stop-fx{position:absolute;inset:-11px;border-radius:50%;pointer-events:none;z-index:7;border:2px solid transparent;opacity:0}
    .mine-stop-fx.rein{animation:mineStopEnter .7s cubic-bezier(.16,.9,.25,1) both}
    .mine-resume-fx{position:absolute;inset:-12px;border-radius:50%;pointer-events:none;z-index:7;border:2px solid #73dfa9;opacity:0;
      animation:mineResume .75s cubic-bezier(.16,.9,.25,1) both}
    .pin.mine-stop-strike .mine-stop-fx{border-color:#f08c2e}
    .pin.mine-stop-safety .mine-stop-fx{border-color:#e0504a}
    @keyframes mineStopEnter{0%{opacity:0;transform:scale(.72)}32%{opacity:.9}100%{opacity:0;transform:scale(1.34)}}
    @keyframes mineResume{0%{opacity:0;transform:scale(.7)}28%{opacity:.95}100%{opacity:0;transform:scale(1.38)}}

    /* Mine detail: make the two causal chains visibly separate. */
    .sicherheitskarte{position:relative;overflow:hidden;border-color:#decaa8!important}
    .sicherheitskarte::before{content:"";position:absolute;inset:0 auto 0 0;width:5px;background:var(--warn);border-radius:inherit 0 0 inherit}
    .sicherheitskarte.sicher::before{background:var(--gruen)}
    .sicherheitskopf{display:flex;align-items:center;gap:10px;margin-bottom:7px}
    .sicherheits-symbol{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;background:#f08c2e18;color:#b85f17;border:1px solid #f08c2e3b}
    .sicherheitskarte.sicher .sicherheits-symbol{background:#2fbe7e14;color:#207e57;border-color:#2fbe7e38}
    .sicherheits-symbol svg{width:22px;height:22px}
    .sicherheitskopf h3{margin:0!important}
    .sicherheitskopf small{display:block;color:var(--grau);font-size:var(--f0);font-weight:700;line-height:1.25}

    .mine-ursachen{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0 10px}
    .mine-ursache{padding:8px 9px;border-radius:12px;border:1px solid #dfd3bd;background:#fffaf0;font-size:var(--f0);font-weight:800;line-height:1.3}
    .mine-ursache b{display:block;font-size:var(--f0);margin:0 0 2px}
    .mine-ursache.lohn{border-left:4px solid #6fb8e0}
    .mine-ursache.sicherheit{border-left:4px solid #f08c2e}
    .mine-ursache span{color:var(--grau);font-weight:700}

    .mine-stillstand-card{position:relative;overflow:hidden}
    .mine-stillstand-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#7d7466}
    .mine-stillstand-card.streik::before{background:#f08c2e}
    .mine-stillstand-card.sicherheit::before{background:#e0504a}
    .mine-stillstand-head{display:flex;align-items:center;gap:9px;margin-bottom:6px}
    .mine-stillstand-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#f3eee4;color:#615849;flex:none}
    .mine-stillstand-card.streik .mine-stillstand-icon{background:#f08c2e18;color:#b85f17}
    .mine-stillstand-card.sicherheit .mine-stillstand-icon{background:#e0504a15;color:#bb3731}
    .mine-stillstand-icon svg{width:19px;height:19px}
    .mine-stillstand-card h3{margin:0!important}
    .mine-stillstand-card small{display:block;color:var(--grau);font-size:var(--f0);font-weight:700}

    body[data-anim="1"] .mine-stop-fx,body[data-anim="1"] .mine-resume-fx{animation-duration:.9s!important}
    @media(max-width:520px){.mine-ursachen{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){
      .mine-stop-fx,.mine-resume-fx{display:none!important;animation:none!important}
    }
  `;
  document.head.appendChild(style);

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

  if(typeof blattMine==="function"){
    const original=blattMine;
    blattMine=function(id){
      let html=original(id);
      if(typeof tutorialLaeuft==="function"&&tutorialLaeuft())return html;
      const def=MINEN.find(x=>x.id===id),m=S.minen?.[id];
      if(!def||!m)return html;

      const sicher=!!m.sicherheit;
      html=html.replace(/<div class="karte">\s*<h3>Sicherheit<\/h3>/,
        `<div class="karte sicherheitskarte ${sicher?"sicher":"offen"}"><div class="sicherheitskopf"><span class="sicherheits-symbol">${sicher?safeShieldSvg():shieldSvg()}</span><div><h3>Sicherheit</h3><small>${sicher?"Sicherheitsmassnahmen verbessert":"Sicherheitsmassnahmen nicht verbessert"}</small></div></div>`);

      const relations=`<div class="mine-ursachen" aria-label="Getrennte Zusammenhänge"><div class="mine-ursache lohn"><b>Lohn → Zufriedenheit → Streik</b><span>Lohn beeinflusst die Zufriedenheit.</span></div><div class="mine-ursache sicherheit"><b>Sicherheit → Unfallrisiko</b><span>Sicherheitsmassnahmen beeinflussen das Unfallrisiko.</span></div></div>`;
      if(!html.includes("Getrennte Zusammenhänge")){
        const satisfaction=/<div class="karte">\s*<h3>Zufriedenheit<\/h3>/;
        if(satisfaction.test(html))html=html.replace(satisfaction,relations+`<div class="karte"><h3>Zufriedenheit</h3>`);
        else html+=relations;
      }

      const stop=stopCard(def,m);
      if(stop)html=stop+html;
      return html;
    };
  }

  if(typeof zeichnen==="function"){
    const original=zeichnen;
    zeichnen=function(){const out=original();decorateWorld();return out;};
  }
  decorateWorld();

  window.__erzweltStopSafetyVisual={version:1,features:["strike-vs-safety","real-stop-visual","mine-detail-causal-separation","resume-feedback"]};
})();
