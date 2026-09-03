"use strict";
/* Sichtbare, illustrative Transportkette auf der Weltkarte.
   Keine Kosten, keine Lieferzeiten, kein zusätzliches Gameplay. */

function transportSvgIcon(kind, x, y, size){
  const ns="http://www.w3.org/2000/svg";
  const g=document.createElementNS(ns,"g");
  g.setAttribute("transform",`translate(${x} ${y})`);
  g.setAttribute("class","didaktik-transport-icon");
  g.setAttribute("aria-hidden","true");

  const bg=document.createElementNS(ns,"circle");
  bg.setAttribute("r",String(size*.64));
  bg.setAttribute("fill","#fffaf0");
  bg.setAttribute("stroke","#b5703c");
  bg.setAttribute("stroke-width","2");
  g.appendChild(bg);

  const t=document.createElementNS(ns,"text");
  t.setAttribute("text-anchor","middle");
  t.setAttribute("dominant-baseline","central");
  t.setAttribute("font-size",String(size));
  t.setAttribute("font-family","system-ui, sans-serif");
  t.textContent=kind==="ship"?"🚢":"🚚";
  g.appendChild(t);
  return g;
}

function punktZwischen(a,b,t){
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
}

function pathD(a,b){
  return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

function animiereTransport(g, kind, a, b, dauer, delay){
  const ns="http://www.w3.org/2000/svg";
  const icon=transportSvgIcon(kind,0,0,18);
  icon.setAttribute("opacity",".98");
  const motion=document.createElementNS(ns,"animateMotion");
  motion.setAttribute("path",pathD(a,b));
  motion.setAttribute("dur",dauer+"s");
  motion.setAttribute("begin",delay+"s");
  motion.setAttribute("repeatCount","indefinite");
  icon.appendChild(motion);
  g.appendChild(icon);
}

function lieferwegTransportZeichnen(){
  const svg=document.querySelector("svg.weltkarte");
  if(!svg)return;
  svg.querySelector("#didaktik-transport")?.remove();

  const r=typeof beispielKette==="function"?beispielKette():null;
  const sichtbar=!!r&&aktiveSeite==="karte"&&!offenesBlatt&&!tutorialLaeuft();

  let legend=document.getElementById("didaktik-transport-legende");
  if(!legend){
    legend=document.createElement("div");
    legend.id="didaktik-transport-legende";
    legend.style.cssText="position:absolute;right:10px;bottom:calc(var(--dockh) + 10px);z-index:12;background:#0b3648e8;color:white;border:1px solid #ffffff30;border-radius:13px;padding:7px 9px;box-shadow:0 3px 12px #0003;font-size:var(--f0);font-weight:800;line-height:1.25;pointer-events:none;max-width:190px";
    document.getElementById("sicht")?.appendChild(legend);
  }
  legend.hidden=!sichtbar;
  if(!sichtbar)return;

  const ns="http://www.w3.org/2000/svg";
  const g=document.createElementNS(ns,"g");
  g.id="didaktik-transport";
  g.setAttribute("pointer-events","none");

  const mine=px(r.mineId);
  const raff=px(r.raffId);
  const fab=px(r.fabId);

  /* Symbolischer Umschlagpunkt: keine Behauptung über einen konkreten Hafen.
     Dadurch wird die intermodale Idee sichtbar, ohne ein Transportsystem zu simulieren. */
  const umschlag=punktZwischen(raff,fab,.78);

  const glow=(a,b)=>{
    const p=document.createElementNS(ns,"path");
    p.setAttribute("d",pathD(a,b));
    p.setAttribute("fill","none");
    p.setAttribute("stroke","#fff3c7");
    p.setAttribute("stroke-width","8");
    p.setAttribute("stroke-linecap","round");
    p.setAttribute("opacity",".28");
    g.appendChild(p);
  };
  glow(mine,raff);
  glow(raff,fab);

  if(OPT.anim!==0){
    animiereTransport(g,"truck",mine,raff,6.2,0);
    animiereTransport(g,"ship",raff,umschlag,8.4,.8);
    animiereTransport(g,"truck",umschlag,fab,3.6,2.0);
  }else{
    const pTruck1=punktZwischen(mine,raff,.5);
    const pShip=punktZwischen(raff,umschlag,.5);
    const pTruck2=punktZwischen(umschlag,fab,.5);
    g.appendChild(transportSvgIcon("truck",pTruck1[0],pTruck1[1],18));
    g.appendChild(transportSvgIcon("ship",pShip[0],pShip[1],18));
    g.appendChild(transportSvgIcon("truck",pTruck2[0],pTruck2[1],18));
  }

  svg.appendChild(g);

  legend.innerHTML="<b>🚚 → 🚢 → 🚚</b><br><span style='font-weight:600;opacity:.86'>symbolische Transportkette · keine Transportkosten oder Lieferzeiten</span>";

  const note=document.getElementById("didaktik-route-note");
  if(note&&!note.hidden){
    const mineDef=MINEN.find(x=>x.id===r.mineId);
    const raffDef=RAFF_ORTE.find(x=>x.id===r.raffId);
    if(mineDef&&raffDef){
      note.innerHTML=note.innerHTML
        .replace("<b>Beispielweg auf der Karte</b>","<b>Sichtbare Lieferkette</b>")
        .replace(
          `${mineDef.ort} → ${raffDef.ort} → ${LAND[r.fabrik.land].name}`,
          `🚚 ${mineDef.ort} → 🚢 ${raffDef.ort} → 🚚 ${LAND[r.fabrik.land].name}`
        );
    }
  }
}

const originalZeichnenTransport=zeichnen;
zeichnen=function(){
  originalZeichnenTransport();
  lieferwegTransportZeichnen();
};

lieferwegTransportZeichnen();
