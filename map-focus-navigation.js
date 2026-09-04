"use strict";
/* Context navigation for notifications and quest/tutorial cards.
   View/navigation only: no economy, progression or save-state changes. */
(function(){
  const style=document.createElement("style");
  style.id="erzwelt-map-focus-navigation-style";
  style.textContent=`
    #welt.map-focus-moving{transition:transform .58s cubic-bezier(.2,.82,.22,1)!important}
    .map-focus-ring{position:absolute;inset:-10px;border-radius:50%;z-index:20;pointer-events:none;
      border:3px solid #fff3b0;box-shadow:0 0 0 2px #f5b73dcc,0 0 18px #f5b73d99;
      animation:mapFocusRing .92s cubic-bezier(.16,.9,.25,1) both}
    .pin.werk .map-focus-ring{border-radius:17px}
    @keyframes mapFocusRing{0%{opacity:0;transform:scale(.55)}28%{opacity:1}72%{opacity:.95;transform:scale(1.18)}100%{opacity:0;transform:scale(1.42)}}
    .map-focus-suggestion{position:absolute;left:50%;top:-38px;z-index:22;transform:translateX(-50%);
      padding:3px 8px;border-radius:999px;background:#f5b73d;color:#503300;border:2px solid #fff7d7;
      box-shadow:0 3px 8px #0004;font-family:"Baloo 2",sans-serif;font-size:10px;font-weight:900;white-space:nowrap;
      animation:mapSuggestion .32s cubic-bezier(.18,1.15,.3,1) both;pointer-events:none}
    @keyframes mapSuggestion{0%{opacity:0;transform:translate(-50%,6px) scale(.88)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}

    #toasts .toast.map-link{pointer-events:auto;cursor:pointer;padding-right:39px!important}
    #toasts .toast.map-link:hover::after{background-color:#ffffff18}
    .toast-map-cue{position:absolute;right:9px;top:50%;transform:translateY(-50%);z-index:3;width:25px;height:25px;
      border-radius:50%;display:grid;place-items:center;background:#ffffff12;border:1px solid #ffffff2e;color:#fff;pointer-events:none}
    .toast-map-cue svg{width:14px;height:14px}

    #quest.map-link{cursor:pointer;padding-right:43px!important;transition:transform .18s ease,box-shadow .18s ease}
    #quest.map-link:active{transform:scale(.992)}
    .quest-map-cue{position:absolute;right:10px;top:9px;width:27px;height:27px;border-radius:9px;display:grid;place-items:center;
      background:#0b364810;color:#315468;border:1px solid #0b364820;pointer-events:none}
    .quest-map-cue svg{width:16px;height:16px}
    #quest.map-link:hover .quest-map-cue{background:#f5b73d24;color:#835b0b;border-color:#f5b73d55}

    @media(prefers-reduced-motion:reduce){
      #welt.map-focus-moving{transition:none!important}
      .map-focus-ring,.map-focus-suggestion{animation:none!important}
      .map-focus-ring{opacity:1!important}
    }
  `;
  document.head.appendChild(style);

  const locateSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor"/><circle cx="12" cy="12" r="7.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const norm=s=>String(s||"").toLocaleLowerCase("de-CH").replace(/\s+/g," ").trim();
  const esc=s=>window.CSS?.escape?CSS.escape(String(s)):String(s).replace(/["\\]/g,"\\$&");

  function target(kind,id,suggestion=false){return {kind,id:String(id),suggestion:!!suggestion};}
  function pinFor(t){return document.querySelector(`#welt .pin[data-pin="${esc(t.kind)}"][data-id="${esc(t.id)}"]`);}
  function fromPin(pin,suggestion=false){return pin?.dataset?.pin&&pin?.dataset?.id?target(pin.dataset.pin,pin.dataset.id,suggestion):null;}

  function locationFromText(raw){
    const text=norm(raw);if(!text)return null;
    if(typeof MINEN!=="undefined"){
      const hit=MINEN.find(d=>d?.ort&&text.includes(norm(d.ort)));
      if(hit)return target("mine",hit.id);
    }
    if(typeof RAFF_ORTE!=="undefined"){
      const hit=RAFF_ORTE.find(d=>d?.ort&&text.includes(norm(d.ort)));
      if(hit)return target("raff",hit.id);
    }
    if(typeof FAB_ORTE!=="undefined"&&typeof LAND!=="undefined"&&/(fabrik|fertigung|produktion|produziert|bau)/.test(text)){
      const land=FAB_ORTE.find(id=>LAND[id]?.name&&text.includes(norm(LAND[id].name)));
      if(land)return target("fab",land);
    }
    return null;
  }

  function ensureLayer(kind){
    if(typeof ebenen==="undefined"||!ebenen||!(kind in ebenen)||ebenen[kind])return;
    ebenen[kind]=true;
    if(typeof zeichnen==="function")zeichnen();
  }

  function showFocus(pin,suggestion){
    if(!pin)return;
    pin.querySelectorAll(".map-focus-ring,.map-focus-suggestion").forEach(e=>e.remove());
    const ring=document.createElement("span");ring.className="map-focus-ring";
    pin.querySelector(".knopf")?.appendChild(ring);
    setTimeout(()=>ring.remove(),1050);
    if(suggestion){
      const label=document.createElement("span");label.className="map-focus-suggestion";label.textContent="Vorschlag";
      pin.appendChild(label);setTimeout(()=>label.remove(),2400);
    }
  }

  function cameraTo(t){
    ensureLayer(t.kind);
    if(typeof seiteWechseln==="function"&&typeof aktiveSeite!=="undefined"&&aktiveSeite!=="karte")seiteWechseln("karte");
    else if(typeof blattZu==="function"&&typeof offenesBlatt!=="undefined"&&offenesBlatt)blattZu();

    const run=()=>{
      const pin=pinFor(t);if(!pin||typeof sicht==="undefined"||typeof welt==="undefined"||typeof ansicht==="undefined")return false;
      const px=pin.offsetLeft+pin.offsetWidth/2;
      const py=pin.offsetTop+Math.min(28,pin.offsetHeight/2);
      const minZoom=Math.max(sicht.clientWidth/(typeof KARTE_B!=="undefined"?KARTE_B:1000),.95);
      const zoom=Math.max(minZoom,1.72);
      const hud=document.getElementById("hud")?.offsetHeight||56;
      const dock=document.getElementById("dock")?.offsetHeight||86;
      const usableTop=hud+8,usableBottom=Math.max(usableTop+80,sicht.clientHeight-dock-8);
      const cy=usableTop+(usableBottom-usableTop)*.48;
      ansicht.z=zoom;
      ansicht.x=sicht.clientWidth*.5-px*zoom;
      ansicht.y=cy-py*zoom;
      welt.classList.add("map-focus-moving");
      if(typeof ansichtAnwenden==="function")ansichtAnwenden();
      setTimeout(()=>welt.classList.remove("map-focus-moving"),650);
      showFocus(pin,t.suggestion);
      return true;
    };
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!run())setTimeout(run,80);}));
  }

  function freeTarget(kind){
    if(kind==="mine"&&typeof MINEN!=="undefined"&&typeof S!=="undefined"){
      const d=MINEN.find(x=>!S.minen?.[x.id]);if(d)return target("mine",d.id,true);
    }
    if(kind==="raff"&&typeof RAFF_ORTE!=="undefined"&&typeof S!=="undefined"){
      const d=RAFF_ORTE.find(x=>!S.raff?.[x.id]);if(d)return target("raff",d.id,true);
    }
    if(kind==="fab"&&typeof FAB_ORTE!=="undefined"&&typeof S!=="undefined"){
      const id=FAB_ORTE.find(x=>!S.fabriken?.some(f=>f.land===x));if(id)return target("fab",id,true);
    }
    return null;
  }

  function existingTarget(kind){
    if(kind==="mine"&&typeof S!=="undefined"){
      const id=Object.keys(S.minen||{}).find(id=>S.minen[id].stillBis>S.tag||S.minen[id].arbeiter<=0)||Object.keys(S.minen||{})[0];
      if(id)return target("mine",id);
    }
    if(kind==="raff"&&typeof S!=="undefined"){
      const id=Object.keys(S.raff||{}).find(id=>S.raff[id].arbeiter<=0)||Object.keys(S.raff||{})[0];
      if(id)return target("raff",id);
    }
    if(kind==="fab"&&typeof S!=="undefined"){
      const f=(S.fabriken||[]).find(f=>f.restbau>0||f.arbeiter<=0)||(S.fabriken||[])[0];
      if(f)return target("fab",f.land);
    }
    return null;
  }

  function highlightedTarget(){
    const pin=document.querySelector("#welt .pin.wink:not(.blass)")||document.querySelector("#welt .pin.wink");
    return fromPin(pin);
  }

  function dockAction(){
    const b=document.querySelector("#dock button.wink");
    return b?.dataset?.seite?{type:"dock",seite:b.dataset.seite}:null;
  }

  function questAction(){
    const direct=highlightedTarget();if(direct)return {type:"map",target:direct};
    const dock=dockAction();if(dock)return dock;
    const q=document.getElementById("quest");
    const text=norm(q?.textContent);
    const loc=locationFromText(text);if(loc)return {type:"map",target:loc};

    if(/verkauf|markt/.test(text))return {type:"dock",seite:"markt"};
    if(/einstellen|team|weitere personen|personal einstellen/.test(text)&&!/zuweisen|besetzen/.test(text))return {type:"dock",seite:"team"};

    if(/rohstoffquelle|mine|förder/.test(text)){
      const wantsNew=/eröff|öffne|sichere|keine rohstoffquelle|noch keine/.test(text);
      const t=wantsNew?freeTarget("mine"):(existingTarget("mine")||freeTarget("mine"));
      if(t)return {type:"map",target:t};
    }
    if(/raffiner/.test(text)){
      const wantsNew=/bau|keine raffiner|noch keine/.test(text);
      const t=wantsNew?freeTarget("raff"):(existingTarget("raff")||freeTarget("raff"));
      if(t)return {type:"map",target:t};
    }
    if(/fabrik|fertigung|material fehlt|produktion/.test(text)){
      const wantsNew=/bau|keine fabrik|noch keine/.test(text);
      const t=wantsNew?freeTarget("fab"):(existingTarget("fab")||freeTarget("fab"));
      if(t)return {type:"map",target:t};
    }
    if(/personal|zuweisen|besetzen/.test(text)){
      const p=[...document.querySelectorAll("#welt .pin.inaktiv-status")].find(pin=>pin.querySelector(".pin-state-badge")?.textContent?.includes("0 P"));
      const t=fromPin(p);if(t)return {type:"map",target:t};
      return {type:"dock",seite:"team"};
    }
    return null;
  }

  function perform(action){
    if(!action)return false;
    if(action.type==="map"&&action.target){cameraTo(action.target);return true;}
    if(action.type==="dock"&&action.seite){
      if(typeof seiteWechseln==="function")seiteWechseln(action.seite);
      else document.querySelector(`#dock button[data-seite="${esc(action.seite)}"]`)?.click();
      return true;
    }
    return false;
  }

  function decorateQuest(){
    const q=document.getElementById("quest");if(!q||q.hidden)return;
    const action=questAction();
    q.classList.toggle("map-link",!!action);
    q.dataset.contextAction=action?"1":"";
    let cue=q.querySelector(".quest-map-cue");
    if(action&&!cue){cue=document.createElement("span");cue.className="quest-map-cue";cue.innerHTML=locateSvg();q.appendChild(cue);}
    if(!action&&cue)cue.remove();
    if(action)q.setAttribute("aria-label",`${q.textContent.trim()} · Ziel anzeigen`);
  }

  const quest=document.getElementById("quest");
  if(quest&&!quest.dataset.mapFocusBound){
    quest.dataset.mapFocusBound="1";
    quest.addEventListener("click",e=>{
      if(e.target.closest("button,a,input,select,textarea"))return;
      const action=questAction();if(!action)return;
      e.preventDefault();perform(action);
    });
  }

  function decorateToasts(){
    const logs=typeof S!=="undefined"?(S.log||[]):[];
    for(const d of document.querySelectorAll("#toasts .toast:not([data-map-focus-ready])")){
      d.dataset.mapFocusReady="1";
      const plain=(d.textContent||"").replace(/\s+/g," ").trim();
      const entry=logs.find(e=>norm((()=>{const x=document.createElement("div");x.innerHTML=String(e.text||"");return x.textContent||"";})())===norm(plain));
      const t=locationFromText(entry?.text||plain);
      if(!t)continue;
      d.classList.add("map-link");
      d.dataset.focusKind=t.kind;d.dataset.focusId=t.id;
      const cue=document.createElement("span");cue.className="toast-map-cue";cue.innerHTML=locateSvg();d.appendChild(cue);
      d.setAttribute("role","button");d.tabIndex=0;
      d.setAttribute("aria-label",`${plain}. Standort auf Karte anzeigen`);
      const go=()=>cameraTo(target(d.dataset.focusKind,d.dataset.focusId));
      d.addEventListener("click",go);
      d.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
    }
  }

  if(typeof toastsErneuern==="function"){
    const priorToasts=toastsErneuern;
    toastsErneuern=function(){const out=priorToasts();decorateToasts();decorateQuest();return out;};
  }
  if(typeof questZeichnen==="function"){
    const priorQuest=questZeichnen;
    questZeichnen=function(){const out=priorQuest();decorateQuest();return out;};
  }
  if(typeof hinweiseSetzen==="function"){
    const priorHints=hinweiseSetzen;
    hinweiseSetzen=function(){const out=priorHints();decorateQuest();return out;};
  }

  decorateToasts();decorateQuest();
  window.__erzweltMapFocusNavigation={version:1,features:["clickable-location-notifications","quest-context-focus","suggested-purchase-location","smooth-camera-focus"]};
})();
