"use strict";
/* Qualitäts-Pass für die sichtbaren Prozessanimationen.
   Präzisiert Zustände und Übergaben, ohne Spielregeln oder Berechnungen zu verändern. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-process-enhance-style";
  style.textContent=`
    .prozessszene{min-height:174px;padding:10px 10px 9px}
    .prozess-kopf{margin-bottom:3px}
    .prozess-meta{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:6px;align-items:center;
      min-height:34px;margin:0 2px 4px;font-size:var(--f0);color:var(--grau)}
    .prozess-meta-seite{min-width:0;display:flex;flex-direction:column;gap:1px}
    .prozess-meta-seite:last-child{text-align:right;align-items:flex-end}
    .prozess-meta-seite b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tinte);font-size:var(--f0)}
    .prozess-meta-seite small{font-size:10px;line-height:1.15;font-weight:700;color:var(--grau)}
    .prozess-meta-pfeil{width:30px;height:20px;display:grid;place-items:center;border-radius:999px;background:#e8deca;color:#78684e;
      font-family:"Baloo 2",sans-serif;font-weight:900;transition:background .2s,color .2s,transform .2s}
    .prozessszene.aktiv .prozess-meta-pfeil{background:#dff3e8;color:#23734f}
    .prozessszene.prozess-takt .prozess-meta-pfeil{transform:scale(1.14)}

    .prozessbahn{height:78px}
    .prozesslinie{height:3px;opacity:.62}
    .prozessszene.aktiv .prozesslinie{animation:prozessBand 3.2s linear infinite}
    .prozessszene.aktiv .prozess-reaktor::after,.prozessszene.aktiv .fabrikmaschine::after{
      content:"";position:absolute;inset:8px;border:2px solid color-mix(in srgb,var(--prozess-farbe) 65%,white);border-radius:50%;opacity:0;pointer-events:none;
      animation:prozessImpuls 3.2s ease-in-out infinite}
    .prozessszene.aktiv .fabrikmaschine::after{inset:9px 10px;border-radius:14px}
    @keyframes prozessImpuls{0%,25%,68%,100%{opacity:0;transform:scale(.78)}38%{opacity:.75;transform:scale(1)}55%{opacity:.18;transform:scale(1.18)}}

    .prozessszene.aktiv .rohbrocken:nth-child(1){animation:rohReinKlar 3.2s 0s ease-in-out infinite}
    .prozessszene.aktiv .rohbrocken:nth-child(2){animation:rohReinKlar 3.2s .18s ease-in-out infinite}
    .prozessszene.aktiv .rohbrocken:nth-child(3){animation:rohReinKlar 3.2s .36s ease-in-out infinite}
    @keyframes rohReinKlar{
      0%,8%{opacity:0;transform:translate(-42px,-7px) scale(.72)}
      17%{opacity:1}
      33%{opacity:1;transform:translate(-5px,0) scale(1)}
      46%,100%{opacity:0;transform:translate(53px,0) scale(.48)}
    }
    .prozessszene.aktiv .prozess-zahn{animation:prozessDrehKlar 3.2s ease-in-out infinite}
    @keyframes prozessDrehKlar{0%,24%{transform:rotate(0)}58%{transform:rotate(300deg)}70%,100%{transform:rotate(320deg)}}
    .prozessszene.aktiv .prozess-fluessig{animation:prozessFluessigKlar 3.2s ease-in-out infinite}
    @keyframes prozessFluessigKlar{0%,24%,72%,100%{transform:scaleY(.86);opacity:.62}44%{transform:scaleY(1.1);opacity:1}}
    .prozessszene.aktiv .materialblock{animation:materialRausKlar 3.2s ease-out infinite}
    @keyframes materialRausKlar{
      0%,46%{opacity:0;transform:translateX(-38px) scale(.55)}
      57%{opacity:1}
      72%{opacity:1;transform:translateX(0) scale(1)}
      90%,100%{opacity:0;transform:translateX(34px) scale(.9)}
    }

    .fabrik-prozess.aktiv .rezeptchip:nth-child(1){animation:chipReinKlar 3.4s 0s ease-in-out infinite}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(2){animation:chipReinKlar 3.4s .16s ease-in-out infinite}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(3){animation:chipReinKlar 3.4s .32s ease-in-out infinite}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(4){animation:chipReinKlar 3.4s .48s ease-in-out infinite}
    @keyframes chipReinKlar{
      0%,8%{opacity:0;transform:translateX(-32px) scale(.7)}
      18%{opacity:1}
      34%{opacity:1;transform:translateX(-2px) scale(1)}
      47%,100%{opacity:0;transform:translateX(58px) scale(.5)}
    }
    .fabrik-prozess.aktiv .fabrikrad{animation:fabrikRadKlar 3.4s ease-in-out infinite}
    @keyframes fabrikRadKlar{0%,27%{transform:rotate(0)}60%{transform:rotate(320deg)}72%,100%{transform:rotate(340deg)}}
    .fabrik-prozess.aktiv .fabriklicht{animation:fabrikBlinkKlar 3.4s linear infinite}
    @keyframes fabrikBlinkKlar{0%,28%,63%,100%{opacity:.28}36%,44%,52%{opacity:1}}
    .fabrik-prozess.aktiv .produktkarton{animation:produktRausKlar 3.4s ease-out infinite}
    @keyframes produktRausKlar{
      0%,48%{opacity:0;transform:translateX(-45px) scale(.55)}
      59%{opacity:1}
      75%{opacity:1;transform:translateX(0) scale(1)}
      92%,100%{opacity:0;transform:translateX(36px) scale(.92)}
    }

    .prozess-materialliste{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin:2px 0 1px}
    .prozess-materialliste span{padding:2px 6px;border-radius:999px;background:#eee6d8;color:#5f5548;font-size:10px;font-weight:800;white-space:nowrap}
    .prozess-materialliste span.ok{background:#e0f2e8;color:#266b4c}
    .prozess-materialliste span.fehlt{background:#fae4e1;color:#9a342f;box-shadow:inset 0 0 0 1px #e9aaa4}
    .prozessszene.wartet .prozesslinie{opacity:.28}
    .prozessszene.wartet .prozess-reaktor,.prozessszene.wartet .fabrikmaschine{opacity:.72}
    .prozessszene.wartet .prozess-status i{background:var(--warn)}

    .prozessszene.prozess-takt .prozess-reaktor svg,.prozessszene.prozess-takt .fabrikmaschine svg{animation:prozessTakt .42s cubic-bezier(.2,1.5,.4,1)}
    @keyframes prozessTakt{0%{transform:scale(1)}45%{transform:scale(1.07)}100%{transform:scale(1)}}

    .verkauf-paket{will-change:transform,opacity}
    .verkauf-paket::before{content:"Verkauf";position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%);
      padding:1px 5px;border-radius:999px;background:#fff8e9;color:#76511f;border:1px solid #d9bd91;font-size:9px;line-height:1.2}
    .verkauf-geld{will-change:transform,opacity}
    .pille.kasse.verkauf-puls{animation:kassenPulsNeu .5s cubic-bezier(.2,1.55,.4,1)}
    @keyframes kassenPulsNeu{0%{transform:scale(1)}42%{transform:scale(1.11)}70%{transform:scale(.98)}100%{transform:scale(1)}}

    body[data-anim="1"] .prozessszene.aktiv .prozesslinie{animation-duration:4s}
    body[data-anim="1"] .prozessszene.aktiv .prozess-reaktor::after,
    body[data-anim="1"] .prozessszene.aktiv .fabrikmaschine::after{display:none}
    body[data-anim="1"] .prozess-materialliste span{font-size:9.5px}

    @media (prefers-reduced-motion: reduce){
      .prozessszene *,.prozessszene *::before,.prozessszene *::after{animation:none!important;transition:none!important}
      .prozessszene.aktiv .materialblock,.prozessszene.aktiv .produktkarton,.prozessszene.aktiv .rezeptchip,.prozessszene.aktiv .rohbrocken{opacity:1!important;transform:none!important}
    }
  `;
  document.head.appendChild(style);

  function esc(text){
    return String(text??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }

  function raffMaterial(def){
    const keys=Object.keys(MATERIAL).filter(k=>(S.erz[k]||0)>.5);
    if(keys.length){
      keys.sort((a,b)=>{
        const as=(def.spezial||[]).includes(a)?1:0,bs=(def.spezial||[]).includes(b)?1:0;
        return bs-as || (S.erz[b]||0)-(S.erz[a]||0);
      });
      return keys[0];
    }
    return (def.spezial||[])[0]||Object.keys(MATERIAL)[0];
  }

  function ensureMeta(scene){
    let meta=scene.querySelector(":scope > .prozess-meta");
    if(meta)return meta;
    meta=document.createElement("div");
    meta.className="prozess-meta";
    meta.innerHTML='<div class="prozess-meta-seite prozess-meta-ein"></div><div class="prozess-meta-pfeil">→</div><div class="prozess-meta-seite prozess-meta-aus"></div>';
    const kopf=scene.querySelector(":scope > .prozess-kopf");
    if(kopf)kopf.insertAdjacentElement("afterend",meta);
    return meta;
  }

  function setHtml(el,html,key){
    if(!el)return;
    if(el.dataset.key===key)return;
    el.dataset.key=key;el.innerHTML=html;
  }

  function markTick(scene){
    if(!scene.classList.contains("aktiv"))return;
    if(scene.dataset.enhanceTag===String(S.tag))return;
    scene.dataset.enhanceTag=String(S.tag);
    const now=performance.now();
    const last=Number(scene.dataset.enhancePulse||0);
    if(now-last<520)return;
    scene.dataset.enhancePulse=String(now);
    scene.classList.remove("prozess-takt");
    void scene.offsetWidth;
    scene.classList.add("prozess-takt");
    clearTimeout(scene._prozessTaktTimer);
    scene._prozessTaktTimer=setTimeout(()=>scene.classList.remove("prozess-takt"),460);
  }

  function enhanceRaff(scene){
    const def=RAFF_ORTE.find(x=>x.id===scene.dataset.id);if(!def)return;
    const r=S.raff[def.id],k=raffMaterial(def),mat=MATERIAL[k];if(!mat)return;
    const meta=ensureMeta(scene),raw=mat.rohstoff||"Rohstoff";
    const ein=meta.querySelector(".prozess-meta-ein"),aus=meta.querySelector(".prozess-meta-aus");
    const rawLager=Math.max(0,Math.round(S.erz[k]||0)),matLager=Math.max(0,Math.round(S.mat[k]||0));
    setHtml(ein,`<b>${esc(raw)}</b><small>${rawLager} im Rohstofflager</small>`,`${raw}|${rawLager}`);
    setHtml(aus,`<b>${esc(mat.name)}</b><small>${matLager} im Materiallager</small>`,`${mat.name}|${matLager}`);
    const active=!!r&&r.arbeiter>0&&(S.erz[k]||0)>.5;
    scene.classList.toggle("wartet",!!r&&!active);
    scene.setAttribute("aria-label",active?`${raw} wird zu ${mat.name} raffiniert`:`Raffination pausiert: ${raw} zu ${mat.name}`);
    markTick(scene);
  }

  function ensureMaterialList(scene){
    let list=scene.querySelector(":scope > .prozess-materialliste");
    if(list)return list;
    list=document.createElement("div");list.className="prozess-materialliste";
    const status=scene.querySelector(":scope > .prozess-status");
    if(status)status.insertAdjacentElement("beforebegin",list);
    return list;
  }

  function enhanceFab(scene){
    const f=S.fabriken[Number(scene.dataset.index)],def=f&&PRODUKT[f.produkt];if(!f||!def)return;
    const meta=ensureMeta(scene),keys=Object.keys(def.rezept||{});
    const ein=meta.querySelector(".prozess-meta-ein"),aus=meta.querySelector(".prozess-meta-aus");
    const names=keys.map(k=>MATERIAL[k]?.name||k),warehouse=Math.max(0,Math.round(S.ware[f.produkt]||0));
    setHtml(ein,`<b>${esc(names.join(" + "))}</b><small>${keys.length} Material${keys.length===1?"":"ien"}</small>`,names.join("|"));
    setHtml(aus,`<b>${esc(def.name)}</b><small>${warehouse} Stück im Lager</small>`,`f|${def.name}|${warehouse}`);

    const list=ensureMaterialList(scene);
    const chips=keys.map(k=>{
      const need=def.rezept[k]||0,have=S.mat[k]||0,missing=have<need;
      return `<span class="${missing?"fehlt":"ok"}">${esc(MATERIAL[k]?.name||k)} ${Math.floor(have)}/${need}</span>`;
    }).join("");
    setHtml(list,chips,keys.map(k=>`${k}:${Math.floor(S.mat[k]||0)}/${def.rezept[k]||0}`).join("|"));

    const missing=keys.filter(k=>(S.mat[k]||0)<(def.rezept[k]||0));
    const active=f.restbau<=0&&f.arbeiter>0&&!missing.length;
    scene.classList.toggle("wartet",f.restbau<=0&&!active);
    const st=scene.querySelector(".prozess-status-text");
    let text;
    if(f.restbau>0)text=`Im Bau · noch ${f.restbau} Tage`;
    else if(f.arbeiter<=0)text="Kein Personal zugewiesen";
    else if(missing.length)text="Fehlt: "+missing.map(k=>MATERIAL[k]?.name||k).join(", ");
    else text=`Produktion läuft · ${def.name}`;
    if(st&&st.textContent!==text)st.textContent=text;
    scene.setAttribute("aria-label",active?`${names.join(", ")} werden zu ${def.name} verarbeitet`:`Fertigung pausiert: ${text}`);
    markTick(scene);
  }

  function enhanceScenes(){
    document.querySelectorAll(".raff-prozess[data-id]").forEach(enhanceRaff);
    document.querySelectorAll(".fabrik-prozess[data-index]").forEach(enhanceFab);
  }

  if(typeof zeichnen==="function"){
    const original=zeichnen;
    zeichnen=function(){const out=original();enhanceScenes();return out;};
  }

  const observer=new MutationObserver(records=>{
    for(const rec of records)for(const node of rec.addedNodes){
      if(!(node instanceof HTMLElement))continue;
      if(node.classList.contains("verkauf-paket"))node.setAttribute("aria-hidden","true");
      if(node.classList.contains("verkauf-geld"))node.setAttribute("aria-hidden","true");
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});

  enhanceScenes();
  window.__erzweltProcessEnhance={version:1,features:["phasen","zustandsklarheit","fehlmaterial","verkaufsfeedback"]};
})();
