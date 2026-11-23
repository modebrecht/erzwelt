"use strict";
/* Qualitäts-Pass für die sichtbaren Prozessanimationen.
   Präzisiert Zustände und Übergaben, ohne Spielregeln oder Berechnungen zu verändern. */

(function(){
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
    requestAnimationFrame(()=>{
      if(!scene.isConnected)return;
      scene.classList.add("prozess-takt");
      clearTimeout(scene._prozessTaktTimer);
      scene._prozessTaktTimer=setTimeout(()=>scene.classList.remove("prozess-takt"),460);
    });
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

  Erzwelt.nachZeichnen(()=>enhanceScenes());

  enhanceScenes();
  window.__erzweltProcessEnhance={version:1,features:["phasen","zustandsklarheit","fehlmaterial","verkaufsfeedback"]};
})();
