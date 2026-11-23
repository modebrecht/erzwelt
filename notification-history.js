"use strict";
/* Premium notification treatment + readable history.
   Presentation only: reuses S.log, does not change game rules or log persistence. */
(function(){
  const clockSvg=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 1-6.36 2.64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3.5 3.5v5h5M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function plainText(html){
    const d=document.createElement("div");
    d.innerHTML=String(html??"");
    return (d.textContent||d.innerText||"").replace(/\s+/g," ").trim();
  }

  function ensureUi(){
    let button=document.getElementById("toast-history-control");
    if(!button){
      button=document.createElement("button");
      button.id="toast-history-control";
      button.type="button";
      button.setAttribute("aria-haspopup","dialog");
      button.setAttribute("aria-controls","toast-history-panel");
      button.innerHTML=`${clockSvg}<span>Verlauf</span><span class="toast-history-count">0</span>`;
      document.getElementById("spiel")?.appendChild(button);
      button.addEventListener("click",openHistory);
    }

    if(!document.getElementById("toast-history-backdrop")){
      const backdrop=document.createElement("div");
      backdrop.id="toast-history-backdrop";
      backdrop.addEventListener("click",closeHistory);
      document.body.appendChild(backdrop);
    }

    let panel=document.getElementById("toast-history-panel");
    if(!panel){
      panel=document.createElement("section");
      panel.id="toast-history-panel";
      panel.setAttribute("role","dialog");
      panel.setAttribute("aria-modal","true");
      panel.setAttribute("aria-labelledby","toast-history-title");
      panel.innerHTML=`<div class="toast-history-head"><span class="hist-icon">${clockSvg}</span><div><h2 id="toast-history-title">Meldungsverlauf</h2><small id="toast-history-subtitle">Vergangene Meldungen</small></div><button id="toast-history-close" type="button" aria-label="Verlauf schliessen">×</button></div><div id="toast-history-list"></div>`;
      document.body.appendChild(panel);
      panel.querySelector("#toast-history-close")?.addEventListener("click",closeHistory);
    }
    updateControl();
  }

  function updateControl(){
    const button=document.getElementById("toast-history-control");
    if(!button)return;
    const count=Math.min(60,S?.log?.length||0);
    const badge=button.querySelector(".toast-history-count");
    if(badge)badge.textContent=String(count);
    button.disabled=count===0;
    button.setAttribute("aria-label",count?`Meldungsverlauf öffnen, ${count} Meldungen`:"Meldungsverlauf, noch keine Meldungen");
  }

  function renderHistory(){
    const list=document.getElementById("toast-history-list");
    const subtitle=document.getElementById("toast-history-subtitle");
    if(!list)return;
    const entries=(S?.log||[]).slice(0,60);
    if(subtitle)subtitle.textContent=entries.length===1?"1 vergangene Meldung":`${entries.length} vergangene Meldungen`;
    list.replaceChildren();
    if(!entries.length){
      const empty=document.createElement("div");empty.className="toast-history-empty";empty.textContent="Noch keine Meldungen vorhanden.";list.appendChild(empty);return;
    }
    for(const entry of entries){
      const item=document.createElement("article");
      item.className=`toast-history-item ${entry.art||""}`.trim();
      const meta=document.createElement("div");meta.className="toast-history-meta";
      const tag=document.createElement("span");tag.textContent=`Tag ${entry.tag??"–"}`;
      const type=document.createElement("span");
      type.textContent=entry.art==="alarm"?"Warnung":entry.art==="warn"?"Hinweis":entry.art==="gut"?"Erfolg":"Meldung";
      meta.append(tag,type);
      const msg=document.createElement("div");msg.className="toast-history-message";msg.textContent=plainText(entry.text);
      item.append(meta,msg);list.appendChild(item);
    }
  }

  function openHistory(){
    renderHistory();
    document.body.classList.add("toast-history-open");
    document.getElementById("toast-history-close")?.focus({preventScroll:true});
  }
  function closeHistory(){
    if(!document.body.classList.contains("toast-history-open"))return;
    document.body.classList.remove("toast-history-open");
    document.getElementById("toast-history-control")?.focus({preventScroll:true});
  }
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeHistory();});

  // Pflicht-Ereignisse dürfen nie hinter dem Verlauf liegen. Die Simulation läuft
  // beim Lesen weiter; sobald ein Ereignisdialog erscheint, wird der Verlauf geschlossen.
  if(typeof dialogZeigen==="function"){
    const priorDialogZeigen=dialogZeigen;
    dialogZeigen=function(...args){
      closeHistory();
      return priorDialogZeigen.apply(this,args);
    };
  }

  // Preserve the original toast semantics: newest unseen messages, max two visible,
  // but use a slower premium exit and keep history accessible through S.log.
  if(typeof toastsErneuern==="function"){
    toastsErneuern=function(){
      ensureUi();
      const neu=S.log.filter(e=>!gezeigt.has(e.tag+e.text)).slice(0,2).reverse();
      for(const e of neu){
        gezeigt.add(e.tag+e.text);
        const d=document.createElement("div");
        d.className="toast "+(e.art||"");
        d.innerHTML=e.text;
        document.getElementById("toasts")?.appendChild(d);
        setTimeout(()=>{
          d.classList.add("toast-aus");
          setTimeout(()=>d.remove(),760);
        },4700);
      }
      const root=document.getElementById("toasts");
      while(root&&root.children.length>2)root.firstChild.remove();
      updateControl();
      if(document.body.classList.contains("toast-history-open"))renderHistory();
    };
  }

  ensureUi();
  window.__erzweltNotificationHistory={version:2,maxEntries:60,source:"S.log"};
})();
