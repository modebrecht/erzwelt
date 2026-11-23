"use strict";
/* Sichtbare Prozessanimationen für die drei zentralen Umwandlungen:
   Rohstoff -> Material, Materialien -> Produkt, Produkt -> Geld.
   Reine Darstellung; keine Änderungen an Spielregeln oder Berechnungen. */

(function(){
  function esc(text){
    return String(text??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }

  function reaktorSvg(){
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="27" fill="#e8eee8" stroke="#5b8f7a" stroke-width="3"/>
      <g class="prozess-zahn" fill="none" stroke="#436f5e" stroke-width="4" stroke-linecap="round">
        <circle cx="32" cy="31" r="13" stroke-dasharray="8 5"/><circle cx="32" cy="31" r="5"/>
      </g>
      <path class="prozess-fluessig" d="M18 40q14 5 28 0v9q0 6-6 6H24q-6 0-6-6z" fill="var(--prozess-farbe)" opacity=".8"/>
      <path d="M22 8v9M42 8v9M18 17h28" stroke="#436f5e" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  function fabrikSvg(){
    return `<svg viewBox="0 0 82 68" aria-hidden="true">
      <path d="M8 59V27l18 10V27l18 10V18l28 14v27z" fill="#c98b58" stroke="#8d5a34" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="15" y="45" width="11" height="14" rx="2" fill="#f8e7c7"/><rect x="51" y="39" width="12" height="20" rx="2" fill="#f8e7c7"/>
      <g class="fabrikrad" transform="translate(39 48)"><circle r="10" fill="#fff3d9" stroke="#7b664d" stroke-width="2"/><path d="M0-7V7M-7 0H7M-5-5 5 5M5-5-5 5" stroke="#7b664d" stroke-width="2"/></g>
      <circle class="fabriklicht" cx="65" cy="26" r="4" fill="#2fbe7e"/>
      <path d="M60 18V8h8v14" fill="#8d5a34"/>
    </svg>`;
  }

  szeneRaff=function(def,r){
    const first=(def.spezial||[])[0]||Object.keys(MATERIAL)[0];
    const mat=MATERIAL[first]||{};
    return `<div class="szene prozessszene raff-prozess" data-szene="prozess-raff-${esc(def.id)}" data-prozess="raff" data-id="${esc(def.id)}">
      <div class="prozess-kopf"><span>Rohstoff</span><b>Raffination</b><span>Material</span></div>
      <div class="prozessbahn"><div class="prozesslinie"></div>
        <div class="prozess-roh"><span class="rohbrocken"></span><span class="rohbrocken"></span><span class="rohbrocken"></span></div>
        <div class="prozess-reaktor">${reaktorSvg()}</div>
        <div class="prozess-ausgang"><div class="materialblock"><span class="prozess-mat-sym">${esc(mat.sym||"")}</span></div></div>
      </div>
      <div class="prozess-status"><i></i><span class="prozess-status-text">Rohstoff → Material</span></div>
      <div class="schweber"></div>
    </div>`;
  };

  szeneFabrik=function(f,def){
    const idx=Math.max(0,S.fabriken.indexOf(f));
    const keys=Object.keys(def.rezept||{}).slice(0,4);
    const chips=keys.map(k=>`<span class="rezeptchip" style="--chip:${MATERIAL[k]?.farbe||"#8c8c8c"}">${esc(MATERIAL[k]?.sym||k)}</span>`).join("");
    return `<div class="szene prozessszene fabrik-prozess ${f.restbau>0?"im-bau":""}" data-szene="prozess-fab-${idx}" data-prozess="fab" data-index="${idx}" data-product="${esc(f.produkt)}">
      <div class="prozess-kopf"><span>Materialien</span><b>Fertigung</b><span>Produkt</span></div>
      <div class="prozessbahn"><div class="prozesslinie"></div>
        <div class="rezeptchips">${chips}</div>
        <div class="fabrikmaschine">${fabrikSvg()}</div>
        <div class="prozess-ausgang"><div class="produktkarton">${esc(def.name)}</div></div>
      </div>
      <div class="prozess-status"><i></i><span class="prozess-status-text">Materialien → ${esc(def.name)}</span></div>
      <div class="schweber"></div>
    </div>`;
  };

  function bestesRaffMaterial(def){
    const keys=Object.keys(MATERIAL).filter(k=>(S.erz[k]||0)>.5);
    if(keys.length){
      keys.sort((a,b)=>{
        const aSpec=(def.spezial||[]).includes(a)?1:0,bSpec=(def.spezial||[]).includes(b)?1:0;
        return bSpec-aSpec || (S.erz[b]||0)-(S.erz[a]||0);
      });
      return keys[0];
    }
    return (def.spezial||[])[0]||Object.keys(MATERIAL)[0];
  }

  function factoryCanRun(f){
    if(!f||f.restbau>0||f.arbeiter<=0)return false;
    const def=PRODUKT[f.produkt];
    return Object.keys(def.rezept||{}).every(k=>(S.mat[k]||0)>=def.rezept[k]);
  }

  function updateTransformationScenes(){
    document.querySelectorAll(".raff-prozess[data-id]").forEach(scene=>{
      const def=RAFF_ORTE.find(x=>x.id===scene.dataset.id);
      if(!def)return;
      const r=S.raff[def.id];
      const k=bestesRaffMaterial(def),mat=MATERIAL[k];
      const active=!!r&&r.arbeiter>0&&(S.erz[k]||0)>.5;
      scene.classList.toggle("aktiv",active);
      scene.style.setProperty("--prozess-farbe",mat?.farbe||"#5b8f7a");
      const sym=scene.querySelector(".prozess-mat-sym");if(sym&&sym.textContent!==String(mat?.sym||""))sym.textContent=mat?.sym||"";
      const status=!r?"Vorschau: Rohstoff → Material":r.arbeiter<=0?"Kein Personal zugewiesen":(S.erz[k]||0)<=.5?"Kein Rohstoff im Lager":`${mat?.rohstoff||"Rohstoff"} → ${mat?.name||"Material"}`;
      const st=scene.querySelector(".prozess-status-text");if(st&&st.textContent!==status)st.textContent=status;
    });
    document.querySelectorAll(".fabrik-prozess[data-index]").forEach(scene=>{
      const f=S.fabriken[Number(scene.dataset.index)],def=f&&PRODUKT[f.produkt];
      if(!f||!def)return;
      const active=factoryCanRun(f);
      scene.classList.toggle("aktiv",active);
      scene.classList.toggle("im-bau",f.restbau>0);
      const status=f.restbau>0?`Im Bau · noch ${f.restbau} Tage`:f.arbeiter<=0?"Kein Personal zugewiesen":active?`Materialien → ${def.name}`:"Mindestens ein Material fehlt";
      const st=scene.querySelector(".prozess-status-text");if(st&&st.textContent!==status)st.textContent=status;
    });
  }

  Erzwelt.nachZeichnen(()=>updateTransformationScenes());

  let pendingSale={stueck:0,erloes:0,products:new Set()};
  let saleTimer=0,lastSaleVisual=-1e9;
  const reduced=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function saleOrigin(){
    const manual=aktiveSeite==="markt"?document.querySelector("[data-tun='handverkauf']"):null;
    return manual||document.querySelector("#dock [data-seite='markt']")||document.querySelector("#dock");
  }
  function saleTarget(){return document.querySelector(".pille.kasse")||document.getElementById("h-kasse");}

  function cashLabel(erloes,target,staticOnly){
    if(!target)return;
    const r=target.getBoundingClientRect();
    const d=document.createElement("div");d.className="verkauf-geld";d.textContent="+"+chf(erloes);
    d.style.left=(r.left+r.width/2)+"px";d.style.top=(r.bottom+5)+"px";d.style.transform="translateX(-50%)";
    document.body.appendChild(d);
    if(staticOnly||!d.animate){setTimeout(()=>d.remove(),650);return;}
    d.animate([{opacity:0,transform:"translate(-50%,8px) scale(.85)"},{opacity:1,offset:.18,transform:"translate(-50%,0) scale(1.05)"},{opacity:1,offset:.72},{opacity:0,transform:"translate(-50%,-22px) scale(.96)"}],{duration:1100,easing:"ease-out"}).finished.finally(()=>d.remove());
  }

  function flushSaleVisual(){
    saleTimer=0;
    if(!pendingSale.stueck||!pendingSale.erloes)return;
    const data=pendingSale;pendingSale={stueck:0,erloes:0,products:new Set()};lastSaleVisual=performance.now();
    const target=saleTarget();if(!target)return;
    if(OPT.anim===0||reduced()){
      cashLabel(data.erloes,target,true);return;
    }
    const origin=saleOrigin(),or=origin?.getBoundingClientRect(),tr=target.getBoundingClientRect();
    if(!or){cashLabel(data.erloes,target,false);return;}
    let layer=document.getElementById("verkauf-visual-layer");
    if(!layer){layer=document.createElement("div");layer.id="verkauf-visual-layer";document.body.appendChild(layer);}
    const pack=document.createElement("div");pack.className="verkauf-paket";
    pack.textContent=data.products.size===1?[...data.products][0]:`${data.stueck} Stück`;
    const sx=or.left+or.width/2-25,sy=or.top+or.height/2-21,ex=tr.left+tr.width/2-25,ey=tr.top+tr.height/2-21;
    pack.style.left=sx+"px";pack.style.top=sy+"px";layer.appendChild(pack);
    const dx=ex-sx,dy=ey-sy;
    const anim=pack.animate([
      {transform:"translate(0,0) scale(.78)",opacity:0},
      {transform:"translate(0,0) scale(1)",opacity:1,offset:.16},
      {transform:`translate(${dx*.52}px,${dy*.38-32}px) rotate(-4deg)`,opacity:1,offset:.56},
      {transform:`translate(${dx}px,${dy}px) scale(.5) rotate(5deg)`,opacity:.2}
    ],{duration:850,easing:"cubic-bezier(.22,.8,.25,1)"});
    anim.finished.finally(()=>pack.remove());
    setTimeout(()=>{
      target.classList.remove("verkauf-puls");void target.offsetWidth;target.classList.add("verkauf-puls");
      setTimeout(()=>target.classList.remove("verkauf-puls"),520);
      cashLabel(data.erloes,target,false);
    },700);
  }

  function queueSaleVisual(stueck,erloes,names){
    if(stueck<=0||erloes<=0)return;
    pendingSale.stueck+=stueck;pendingSale.erloes+=erloes;for(const n of names)pendingSale.products.add(n);
    const minGap=OPT.anim===2?620:820;
    const rest=Math.max(80,minGap-(performance.now()-lastSaleVisual));
    if(!saleTimer)saleTimer=setTimeout(flushSaleVisual,rest);
  }

  if(typeof wareVerkaufen==="function"){
    const originalWareVerkaufen=wareVerkaufen;
    wareVerkaufen=function(max){
      const before={};for(const p in PRODUKT)before[p]=S.ware[p]||0;
      const out=originalWareVerkaufen(max);
      if(out&&out.stueck>0&&out.erloes>0){
        const names=[];
        for(const p in PRODUKT)if(before[p]-(S.ware[p]||0)>0)names.push(PRODUKT[p].name);
        queueSaleVisual(out.stueck,out.erloes,names);
      }
      return out;
    };
  }



  updateTransformationScenes();
  window.__erzweltProcessAnimations={version:1,features:["raffination","fertigung","verkauf"]};
})();
