"use strict";
/* Performance/smoothness pass.
   Goal: keep the same game rules and visuals while avoiding repeated DOM rebuilds
   on fast simulation ticks. */

(function(){
  const style=document.createElement("style");
  style.id="erzwelt-performance-style";
  style.textContent=`
    #welt{will-change:transform}
    .pin{filter:none!important}
    .pin:active{filter:none!important}
    .pin .knopf{box-shadow:0 3px 5px rgba(0,0,0,.32)}
    .pin .bez{box-shadow:0 2px 4px rgba(0,0,0,.28)}
    .pin.foerdert .knopf>svg,.pin.foerdert .knopf>span.sym,.pin.wink .knopf,
    .didaktik-truck,.didaktik-ship{will-change:transform}
    .pin .staub{will-change:transform,opacity}
    #didaktik-transport-legende{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:#0b3648f2!important}
  `;
  document.head.appendChild(style);

  const sortedEntries=o=>Object.keys(o||{}).sort().map(k=>[k,o[k]]);
  const minePinState=()=>sortedEntries(S.minen).map(([id,m])=>[
    id,m.arbeiter,m.stufe,m.ausbau||0,m.stillBis>S.tag?1:0,m.zufriedenheit<35?1:0,!!m.sicherheit,!!m.nachweis
  ]);
  const raffPinState=()=>sortedEntries(S.raff).map(([id,r])=>[id,r.arbeiter,r.ausbau||0]);
  const fabPinState=()=>S.fabriken.map(f=>[f.produkt,f.land,f.arbeiter,f.restbau]);
  const routeState=()=>JSON.stringify([
    tutorialLaeuft()?S.tutorial:-1,
    Object.keys(S.minen).sort(),Object.keys(S.raff).sort(),
    S.fabriken.map(f=>[f.produkt,f.land,f.restbau])
  ]);

  if(typeof beispielKette==="function"){
    const original=beispielKette;
    let key="",value=null;
    beispielKette=function(){
      const next=routeState();
      if(next===key)return value;
      key=next; value=original();
      return value;
    };
  }

  if(typeof lieferwegZeichnen==="function"){
    const original=lieferwegZeichnen;
    let key="";
    lieferwegZeichnen=function(){
      const next=routeState()+"|"+aktiveSeite+"|"+(offenesBlatt?`${offenesBlatt.art}:${offenesBlatt.id}`:"-");
      if(next===key)return;
      key=next;
      return original();
    };
  }

  if(typeof pinsZeichnen==="function"){
    const original=pinsZeichnen;
    let key="";
    pinsZeichnen=function(){
      const next=JSON.stringify([
        S.tutorial,S.kasse,minePinState(),raffPinState(),fabPinState(),
        ebenen.mine?1:0,ebenen.raff?1:0,ebenen.fab?1:0
      ]);
      if(next===key)return;
      key=next;
      return original();
    };
  }

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

  if(typeof questZeichnen==="function"){
    const original=questZeichnen;
    let key="";
    questZeichnen=function(){
      const t=tutorialSchritt();
      const w=t?null:naechsterSchritt();
      const next=JSON.stringify([
        aktiveSeite,!!offenesBlatt,
        t?[S.tutorial,t.id,t.titel,t.text]:w
      ]);
      if(next===key)return;
      key=next;
      return original();
    };
  }

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

  // "Ruhig" keeps the route readable but avoids the full decorative animation load.
  if(typeof addFlowDot==="function"){
    const original=addFlowDot;
    let lastPath="",count=0;
    addFlowDot=function(parent,path,...rest){
      if(path!==lastPath){lastPath=path;count=0;}
      count++;
      if(OPT.anim===1&&count>1)return;
      return original(parent,path,...rest);
    };
  }
  if(typeof addNodePulse==="function"){
    const original=addNodePulse;
    addNodePulse=function(parent,p,color){
      if(OPT.anim!==1)return original(parent,p,color);
      const g=svgEl("g",{transform:`translate(${p[0]} ${p[1]})`});
      g.appendChild(svgEl("circle",{r:7,fill:"none",stroke:color,"stroke-width":1.6,opacity:.35}));
      g.appendChild(svgEl("circle",{r:3.2,fill:color,stroke:"#fffaf0","stroke-width":1.5}));
      parent.appendChild(g);
    };
  }

  function rewriteRohstoffText(node){
    if(!node)return;
    const scan=el=>{
      if(el.nodeType===Node.TEXT_NODE){
        const text=el.nodeValue||"";
        if(/\+\d+ Erz$/.test(text.trim()))el.nodeValue=text.replace(/ Erz$/, " Rohstoff");
        return;
      }
      if(el.nodeType!==Node.ELEMENT_NODE)return;
      for(const child of el.childNodes)scan(child);
    };
    scan(node);
  }
  const observedRoots=[document.getElementById("toasts"),document.getElementById("seite"),document.getElementById("blattinhalt")].filter(Boolean);
  const textObserver=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)rewriteRohstoffText(node);
  });
  observedRoots.forEach(root=>{rewriteRohstoffText(root);textObserver.observe(root,{childList:true,subtree:true});});

  // The older didactic layer performs a full descendant scan after every draw only to
  // rewrite "+N Erz" labels. MutationObserver above handles the same correction on
  // actual DOM changes, so suppress that exact synchronous scan during draw.
  const drawWithPerf=zeichnen;
  zeichnen=function(){
    const nativeQsa=document.querySelectorAll;
    document.querySelectorAll=function(selector){
      if(selector==="#toasts .toast, #seite, #blattinhalt")return [];
      return nativeQsa.call(this,selector);
    };
    try{return drawWithPerf();}
    finally{document.querySelectorAll=nativeQsa;}
  };

  window.__erzweltPerf={
    version:2,
    note:"Memoized map UI; fast-tick panels capped near 2 Hz; full-tree didactic scan replaced by mutation tracking; quiet transport uses fewer SVG animations."
  };
})();
