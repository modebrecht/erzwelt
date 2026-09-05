"use strict";
/* Premium notification treatment + readable history.
   Presentation only: reuses S.log, does not change game rules or log persistence. */
(function(){
  const style=document.createElement("style");
  style.id="erzwelt-notification-history-style";
  style.textContent=`
    #toast-history-control{
      position:absolute;left:10px;top:calc(var(--hudh) + 4px);z-index:43;
      display:flex;align-items:center;gap:7px;height:30px;padding:0 10px 0 8px;
      border-radius:999px;background:#0b3648ee;color:#fff;border:1px solid #ffffff2f;
      box-shadow:0 2px 7px #0003;font-family:"Baloo 2",sans-serif;font-size:var(--f0);font-weight:800;
      transition:opacity .22s ease,transform .22s ease,background .2s ease;pointer-events:auto
    }
    #toast-history-control svg{width:15px;height:15px;opacity:.9}
    #toast-history-control .toast-history-count{min-width:18px;height:18px;padding:0 5px;border-radius:999px;
      display:grid;place-items:center;background:#ffffff20;color:#fff;font-size:10px;font-variant-numeric:tabular-nums}
    #toast-history-control:not(:disabled):active{transform:translateY(1px) scale(.98)}
    #toast-history-control:disabled{opacity:.42;cursor:default}
    body.fensterauf #toast-history-control{opacity:0;pointer-events:none}

    #toasts{top:calc(var(--hudh) + 39px)!important;width:min(48%,330px)!important;gap:7px!important}
    .toast{
      position:relative;isolation:isolate;overflow:hidden;
      background:transparent!important;color:#fff!important;border-radius:0 15px 15px 0!important;
      padding:10px 13px 10px 31px!important;border-left-width:4px!important;
      box-shadow:none!important;text-shadow:0 1px 2px #000b;
      animation:toastPremiumIn .44s cubic-bezier(.18,1.05,.3,1) both!important;
      transition:opacity .72s ease,transform .72s cubic-bezier(.2,.8,.3,1),filter .72s ease!important;
      transform-origin:left center
    }
    .toast::before{
      content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;
      background:linear-gradient(90deg,
        rgba(5,24,35,.16) 0%,
        rgba(5,24,35,.70) 15%,
        rgba(5,24,35,.90) 35%,
        rgba(5,24,35,.965) 72%,
        rgba(5,24,35,.985) 100%);
      border-radius:inherit
    }
    .toast::after{
      content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;
      background:linear-gradient(180deg,#ffffff10,transparent 38%,#00000016);
      box-shadow:inset 0 1px #ffffff1f,inset -1px 0 #ffffff15,0 5px 14px #0003
    }
    .toast.toast-aus{opacity:0!important;transform:translateX(-16px) scale(.985)!important;filter:blur(.35px)}
    @keyframes toastPremiumIn{
      0%{opacity:0;transform:translateX(-18px) scale(.975);filter:blur(1px)}
      62%{opacity:1;transform:translateX(2px) scale(1.008);filter:blur(0)}
      100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}
    }
    .toast.gut{border-left-color:var(--gruen)!important}
    .toast.warn{border-left-color:var(--warn)!important}
    .toast.alarm{border-left-color:var(--alarm)!important}

    #toast-history-backdrop{position:fixed;inset:0;z-index:88;background:#061b28a8;opacity:0;pointer-events:none;
      transition:opacity .22s ease}
    #toast-history-panel{
      position:fixed;left:10px;top:calc(env(safe-area-inset-top) + 10px);bottom:calc(var(--dockh) + 10px);z-index:89;
      width:min(430px,calc(100vw - 20px));display:flex;flex-direction:column;overflow:hidden;
      background:linear-gradient(180deg,#fffdf7,#f4ead6);color:var(--tinte);border:1px solid #ffffff;
      border-radius:20px;box-shadow:0 18px 48px #0007,0 4px 0 #0002;
      opacity:0;transform:translateX(-18px) scale(.985);pointer-events:none;
      transition:opacity .26s ease,transform .3s cubic-bezier(.18,1.05,.3,1)
    }
    body.toast-history-open #toast-history-backdrop{opacity:1;pointer-events:auto}
    body.toast-history-open #toast-history-panel{opacity:1;transform:translateX(0) scale(1);pointer-events:auto}
    body.toast-history-open #toasts,body.toast-history-open #toast-history-control{opacity:0;pointer-events:none}
    .toast-history-head{display:flex;align-items:center;gap:10px;padding:13px 13px 11px 15px;
      background:linear-gradient(135deg,#0b3648,#154e66);color:#fff;border-bottom:1px solid #ffffff20}
    .toast-history-head .hist-icon{width:34px;height:34px;border-radius:11px;background:#ffffff16;display:grid;place-items:center;flex:none}
    .toast-history-head .hist-icon svg{width:19px;height:19px}
    .toast-history-head h2{font-size:var(--f3);margin:0}
    .toast-history-head small{display:block;font-size:var(--f0);opacity:.72;font-weight:700;margin-top:1px}
    #toast-history-close{margin-left:auto;width:36px;height:36px;border-radius:11px;background:#ffffff13;color:#fff;
      display:grid;place-items:center;font-size:22px;line-height:1}
    #toast-history-list{overflow:auto;padding:9px 10px 16px;display:flex;flex-direction:column;gap:7px;overscroll-behavior:contain}
    .toast-history-empty{padding:28px 12px;text-align:center;color:var(--grau);font-size:var(--f1)}
    .toast-history-item{position:relative;padding:10px 11px 10px 15px;border-radius:14px;background:#fffaf0;
      border:1px solid #e4d8c1;box-shadow:0 2px 7px #4b38200d}
    .toast-history-item::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:4px;border-radius:0 5px 5px 0;background:#8c806e}
    .toast-history-item.gut::before{background:var(--gruen)}
    .toast-history-item.warn::before{background:var(--warn)}
    .toast-history-item.alarm::before{background:var(--alarm)}
    .toast-history-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;
      color:var(--grau);font-size:var(--f0);font-weight:800}
    .toast-history-message{font-size:var(--f1);font-weight:700;line-height:1.38;user-select:text;-webkit-user-select:text}

    @media(max-width:560px){
      #toasts{width:min(72%,310px)!important}
      body:has(#quest:not([hidden])) #toasts{width:min(45%,300px)!important}
      #toast-history-panel{right:10px;width:auto}
    }
    @media(prefers-reduced-motion:reduce){
      .toast,#toast-history-control,#toast-history-backdrop,#toast-history-panel{animation:none!important;transition:none!important}
      .toast.toast-aus{filter:none!important}
    }
  `;
  document.head.appendChild(style);

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
  window.__erzweltNotificationHistory={version:1,maxEntries:60,source:"S.log"};
})();
