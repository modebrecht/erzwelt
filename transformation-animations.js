"use strict";
/* Sichtbare Prozessanimationen für die drei zentralen Umwandlungen:
   Rohstoff -> Material, Materialien -> Produkt, Produkt -> Geld.
   Reine Darstellung; keine Änderungen an Spielregeln oder Berechnungen. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-process-animation-style";
  style.textContent=`
    .prozessszene{
      --prozess-farbe:#5b8f7a;
      position:relative;overflow:hidden;margin:10px 0 12px;padding:10px 10px 8px;
      min-height:150px;border-radius:18px;background:linear-gradient(180deg,#fffdf7,#f3ead8);
      border:1px solid #dfd1b8;box-shadow:inset 0 1px 0 #fff;
    }
    .prozess-kopf{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;
      color:var(--grau);font-size:var(--f0);font-weight:800;text-align:center;margin-bottom:5px}
    .prozess-kopf b{color:var(--tinte);font-size:var(--f1)}
    .prozess-kopf span:first-child{text-align:left}.prozess-kopf span:last-child{text-align:right}
    .prozessbahn{position:relative;height:82px;display:grid;grid-template-columns:1fr 72px 1fr;align-items:center;gap:5px}
    .prozesslinie{position:absolute;left:12%;right:12%;top:50%;height:4px;transform:translateY(-50%);
      border-radius:99px;background:repeating-linear-gradient(90deg,#c9b99d 0 10px,#eee3cf 10px 18px);opacity:.8}
    .prozessszene.aktiv .prozesslinie{animation:prozessBand 1.15s linear infinite}
    @keyframes prozessBand{to{background-position:18px 0}}
    .prozess-roh,.prozess-ausgang{position:relative;z-index:2;height:62px;display:flex;align-items:center;justify-content:center}
    .rohbrocken{position:absolute;width:18px;height:16px;border-radius:50% 42% 55% 35%;background:var(--prozess-farbe);
      border:2px solid #fff;box-shadow:0 2px 3px #0002;opacity:.9}
    .rohbrocken:nth-child(1){transform:translate(-20px,-11px) rotate(-14deg)}
    .rohbrocken:nth-child(2){transform:translate(2px,8px) rotate(11deg);width:15px;height:14px}
    .rohbrocken:nth-child(3){transform:translate(20px,-6px) rotate(24deg);width:13px;height:12px}
    .prozessszene.aktiv .rohbrocken:nth-child(1){animation:rohRein 2.4s ease-in infinite}
    .prozessszene.aktiv .rohbrocken:nth-child(2){animation:rohRein 2.4s .55s ease-in infinite}
    .prozessszene.aktiv .rohbrocken:nth-child(3){animation:rohRein 2.4s 1.1s ease-in infinite}
    @keyframes rohRein{0%,12%{opacity:0;transform:translate(-34px,-9px) scale(.8)}25%{opacity:1}72%{opacity:1}88%,100%{opacity:0;transform:translate(52px,0) scale(.55)}}
    .prozess-reaktor{position:relative;z-index:3;width:66px;height:70px;display:grid;place-items:center}
    .prozess-reaktor svg{width:62px;height:62px;overflow:visible}
    .prozess-zahn{transform-origin:32px 31px}
    .prozessszene.aktiv .prozess-zahn{animation:prozessDreh 2.8s linear infinite}
    @keyframes prozessDreh{to{transform:rotate(360deg)}}
    .prozess-fluessig{transform-origin:32px 43px}
    .prozessszene.aktiv .prozess-fluessig{animation:prozessPuls 1.25s ease-in-out infinite}
    @keyframes prozessPuls{0%,100%{transform:scaleY(.88);opacity:.72}50%{transform:scaleY(1.08);opacity:1}}
    .materialblock{position:relative;width:44px;height:29px;border-radius:7px;background:linear-gradient(145deg,#fff8,#0001),var(--prozess-farbe);
      border:2px solid #fff;box-shadow:0 3px 5px #0002;display:grid;place-items:center;color:#fff;font-weight:900;font-family:"Baloo 2",sans-serif}
    .materialblock::after{content:"";position:absolute;inset:4px;border:1px solid #ffffff70;border-radius:4px}
    .prozessszene.aktiv .materialblock{animation:materialRaus 2.4s .88s ease-out infinite}
    @keyframes materialRaus{0%,25%{opacity:0;transform:translateX(-42px) scale(.55)}42%{opacity:1}68%{transform:translateX(0) scale(1)}88%,100%{opacity:0;transform:translateX(30px) scale(.92)}}
    .prozess-status{display:flex;justify-content:center;align-items:center;gap:7px;min-height:23px;margin-top:2px;
      color:var(--grau);font-size:var(--f0);font-weight:700;text-align:center}
    .prozess-status i{width:8px;height:8px;border-radius:50%;background:#a99a80}
    .prozessszene.aktiv .prozess-status i{background:var(--gruen);box-shadow:0 0 0 4px #2fbe7e1c}

    .fabrik-prozess{--prozess-farbe:#b5703c}
    .fabrik-prozess .prozessbahn{grid-template-columns:1fr 82px 1fr}
    .rezeptchips{position:relative;z-index:2;height:68px;display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;max-width:105px;margin:auto}
    .rezeptchip{width:26px;height:26px;border-radius:8px;background:var(--chip);border:2px solid #fff;color:#fff;
      display:grid;place-items:center;font-size:11px;font-family:"Baloo 2",sans-serif;font-weight:900;box-shadow:0 2px 4px #0002}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(1){animation:chipRein 2.6s ease-in infinite}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(2){animation:chipRein 2.6s .38s ease-in infinite}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(3){animation:chipRein 2.6s .76s ease-in infinite}
    .fabrik-prozess.aktiv .rezeptchip:nth-child(4){animation:chipRein 2.6s 1.14s ease-in infinite}
    @keyframes chipRein{0%,12%{opacity:0;transform:translateX(-25px) scale(.75)}24%{opacity:1}68%{opacity:1}84%,100%{opacity:0;transform:translateX(58px) scale(.55)}}
    .fabrikmaschine{position:relative;z-index:3;width:78px;height:70px;display:grid;place-items:center}
    .fabrikmaschine svg{width:76px;height:64px;overflow:visible}
    .fabrikrad{transform-origin:center}
    .fabrik-prozess.aktiv .fabrikrad{animation:prozessDreh 2.1s linear infinite}
    .fabriklicht{opacity:.35}
    .fabrik-prozess.aktiv .fabriklicht{animation:fabrikBlink 1.1s steps(2,end) infinite}
    @keyframes fabrikBlink{50%{opacity:1}}
    .produktkarton{position:relative;width:48px;height:40px;border-radius:5px;background:#d6aa67;border:2px solid #fff;
      box-shadow:0 3px 5px #0002;color:#5b3b17;display:grid;place-items:center;font-size:10px;font-weight:900;text-align:center;line-height:1.05;padding:3px}
    .produktkarton::before{content:"";position:absolute;top:6px;left:0;right:0;border-top:2px solid #a7793e66}
    .fabrik-prozess.aktiv .produktkarton{animation:produktRaus 2.6s 1.12s ease-out infinite}
    @keyframes produktRaus{0%,22%{opacity:0;transform:translateX(-48px) scale(.6)}40%{opacity:1}70%{transform:translateX(0) scale(1)}90%,100%{opacity:0;transform:translateX(34px) scale(.94)}}
    .fabrik-prozess.im-bau .prozesslinie,.fabrik-prozess.im-bau .rezeptchips,.fabrik-prozess.im-bau .produktkarton{opacity:.28}

    body[data-anim="1"] .rohbrocken:nth-child(3),body[data-anim="1"] .rezeptchip:nth-child(n+4){display:none}
    body[data-anim="0"] .prozessszene .prozesslinie{background:#ddd0b7}

    #verkauf-visual-layer{position:fixed;inset:0;z-index:120;pointer-events:none;overflow:hidden}
    .verkauf-paket{position:absolute;width:50px;height:42px;border-radius:7px;background:#d5a968;border:2px solid #fff;
      box-shadow:0 4px 12px #0004;display:grid;place-items:center;color:#5b3b17;font-family:"Baloo 2",sans-serif;font-weight:900;font-size:11px;text-align:center;line-height:1.05}
    .verkauf-paket::after{content:"";position:absolute;left:5px;right:5px;top:8px;border-top:2px solid #9b6d3466}
    .verkauf-geld{position:fixed;z-index:121;pointer-events:none;padding:5px 9px;border-radius:999px;background:#2fbe7e;color:#073b27;
      border:2px solid #fff;font-family:"Baloo 2",sans-serif;font-weight:900;font-size:var(--f1);box-shadow:0 3px 9px #0003;white-space:nowrap}
    .pille.kasse.verkauf-puls{animation:kassenPuls .48s cubic-bezier(.2,1.7,.4,1)}
    @keyframes kassenPuls{0%{transform:scale(1)}45%{transform:scale(1.16)}100%{transform:scale(1)}}
    .verkauf-kette-mini{display:flex;align-items:center;justify-content:center;gap:7px;margin:8px 0 10px;padding:7px 10px;
      border-radius:12px;background:#eef7f1;color:#335246;font-size:var(--f0);font-weight:800}
    .verkauf-kette-mini b{color:#1f7754}
  `;
  document.head.appendChild(style);

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

  if(typeof zeichnen==="function"){
    const originalZeichnen=zeichnen;
    zeichnen=function(){
      const out=originalZeichnen();
      updateTransformationScenes();
      return out;
    };
  }

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

  if(typeof seiteMarkt==="function"){
    const originalSeiteMarkt=seiteMarkt;
    seiteMarkt=function(){
      const html=originalSeiteMarkt();
      if(html.includes("verkauf-kette-mini"))return html;
      return html.replace(/(<div class="karte"[^>]*>\s*<h3>Verkauf<\/h3>)/,
        `<div class="verkauf-kette-mini"><span>Produkt</span><b>→</b><span>Verkauf</span><b>→</b><span>Geld</span></div>$1`);
    };
  }

  updateTransformationScenes();
  window.__erzweltProcessAnimations={version:1,features:["raffination","fertigung","verkauf"]};
})();
