"use strict";
/* Sichtbare, illustrative Transportkette auf der Weltkarte.
   Keine Kosten, keine Lieferzeiten, kein zusätzliches Gameplay. */

let transportRouteCache="";
let transportReducedCache=null;

function svgEl(tag, attrs={}){
  const el=document.createElementNS("http://www.w3.org/2000/svg",tag);
  for(const [k,v] of Object.entries(attrs)) el.setAttribute(k,String(v));
  return el;
}

function punktZwischen(a,b,t){
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
}

function kurvenPfad(a,b,bogen=.11){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.max(1,Math.hypot(dx,dy));
  const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
  const nx=-dy/len,ny=dx/len;
  const offset=Math.min(46,len*bogen);
  const cx=mx+nx*offset,cy=my+ny*offset;
  return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

function truckGraphic(){
  const g=svgEl("g",{class:"didaktik-truck"});
  const shadow=svgEl("ellipse",{cx:0,cy:8,rx:15,ry:3,fill:"#000",opacity:.16});
  g.appendChild(shadow);
  const body=svgEl("g",{transform:"translate(0 0)"});
  body.appendChild(svgEl("rect",{x:-14,y:-7,width:18,height:10,rx:2.5,fill:"#f08c2e",stroke:"#7f461b","stroke-width":1.4}));
  body.appendChild(svgEl("rect",{x:4,y:-5,width:8,height:8,rx:2,fill:"#f5b73d",stroke:"#7f461b","stroke-width":1.4}));
  body.appendChild(svgEl("path",{d:"M6 -5h4l2 4H6Z",fill:"#bfe0f0",stroke:"#7f461b","stroke-width":.8}));
  body.appendChild(svgEl("rect",{x:-12,y:-4.8,width:14,height:5.8,rx:1.2,fill:"#d96937",opacity:.95}));
  for(const x of [-9,7]){
    const wheel=svgEl("g",{transform:`translate(${x} 4)`});
    wheel.appendChild(svgEl("circle",{r:3.3,fill:"#24313a",stroke:"#fffaf0","stroke-width":1}));
    wheel.appendChild(svgEl("circle",{r:1.15,fill:"#a9b4bd"}));
    const spoke=svgEl("path",{d:"M-2.1 0H2.1M0-2.1V2.1",stroke:"#dce2e6","stroke-width":.7,"stroke-linecap":"round"});
    const spin=svgEl("animateTransform",{attributeName:"transform",type:"rotate",from:"0 0 0",to:"360 0 0",dur:".7s",repeatCount:"indefinite"});
    spoke.appendChild(spin); wheel.appendChild(spoke); body.appendChild(wheel);
  }
  const bob=svgEl("animateTransform",{attributeName:"transform",type:"translate",values:"0 0;0 -1;0 0",dur:".9s",repeatCount:"indefinite"});
  body.appendChild(bob); g.appendChild(body);
  return g;
}

function shipGraphic(){
  const g=svgEl("g",{class:"didaktik-ship"});
  g.appendChild(svgEl("ellipse",{cx:0,cy:9,rx:17,ry:3,fill:"#000",opacity:.13}));
  const boat=svgEl("g");
  boat.appendChild(svgEl("path",{d:"M-18 1H18L12 9H-12Z",fill:"#2f6f8f",stroke:"#143b51","stroke-width":1.5,"stroke-linejoin":"round"}));
  boat.appendChild(svgEl("rect",{x:-8,y:-7,width:9,height:8,rx:1.6,fill:"#f4f0e7",stroke:"#143b51","stroke-width":1.1}));
  boat.appendChild(svgEl("rect",{x:-6.2,y:-5.2,width:5.4,height:2.4,rx:.5,fill:"#9fd3eb"}));
  const colors=["#f08c2e","#d94a80","#2fbe7e","#f5b73d"];
  [-2,5].forEach((x,row)=>[-9,-3,3,9].forEach((cx,i)=>boat.appendChild(svgEl("rect",{x:cx,y:-1-row*3.4,width:5,height:2.8,rx:.45,fill:colors[(i+row)%colors.length],stroke:"#ffffff80","stroke-width":.35}))));
  boat.appendChild(svgEl("path",{d:"M-20 10q5 3 10 0t10 0t10 0t10 0",fill:"none",stroke:"#ffffff","stroke-width":1.4,opacity:.72,"stroke-linecap":"round"}));
  const bob=svgEl("animateTransform",{attributeName:"transform",type:"translate",values:"0 -1.2;0 1.2;0 -1.2",dur:"1.8s",repeatCount:"indefinite"});
  boat.appendChild(bob); g.appendChild(boat);
  return g;
}

function vehicleGraphic(kind){ return kind==="ship"?shipGraphic():truckGraphic(); }

function addMotion(parent,kind,path,dur,begin){
  const icon=vehicleGraphic(kind);
  icon.setAttribute("opacity",".98");
  const motion=svgEl("animateMotion",{path,dur:`${dur}s`,begin:`${begin}s`,repeatCount:"indefinite",rotate:"auto",calcMode:"spline",keyTimes:"0;0.08;0.92;1",keyPoints:"0;0.03;0.97;1",keySplines:"0.22 0.61 0.36 1;0.2 0.8 0.2 1;0.22 0.61 0.36 1"});
  icon.appendChild(motion);
  const fade=svgEl("animate",{attributeName:"opacity",values:"0;1;1;0",keyTimes:"0;0.08;0.9;1",dur:`${dur}s`,begin:`${begin}s`,repeatCount:"indefinite"});
  icon.appendChild(fade);
  parent.appendChild(icon);
}

function addFlowDot(parent,path,dur,begin,color,size=3.2){
  const c=svgEl("circle",{r:size,fill:color,opacity:.9});
  c.appendChild(svgEl("animateMotion",{path,dur:`${dur}s`,begin:`${begin}s`,repeatCount:"indefinite",rotate:"auto"}));
  c.appendChild(svgEl("animate",{attributeName:"opacity",values:"0;.9;.9;0",keyTimes:"0;.1;.88;1",dur:`${dur}s`,begin:`${begin}s`,repeatCount:"indefinite"}));
  parent.appendChild(c);
}

function addRoute(parent,path,color,width=4){
  const glow=svgEl("path",{d:path,fill:"none",stroke:"#fff3c7","stroke-width":10,"stroke-linecap":"round",opacity:.20});
  parent.appendChild(glow);
  const base=svgEl("path",{d:path,fill:"none",stroke:color,"stroke-width":width,"stroke-linecap":"round","stroke-dasharray":"12 10",opacity:.78});
  const dash=svgEl("animate",{attributeName:"stroke-dashoffset",from:"0",to:"-44",dur:"2.4s",repeatCount:"indefinite"});
  base.appendChild(dash); parent.appendChild(base);
}

function addNodePulse(parent,p,color){
  const g=svgEl("g",{transform:`translate(${p[0]} ${p[1]})`});
  const ring=svgEl("circle",{r:8,fill:"none",stroke:color,"stroke-width":2,opacity:.52});
  ring.appendChild(svgEl("animate",{attributeName:"r",values:"7;13;7",dur:"2.2s",repeatCount:"indefinite"}));
  ring.appendChild(svgEl("animate",{attributeName:"opacity",values:".6;.05;.6",dur:"2.2s",repeatCount:"indefinite"}));
  g.appendChild(ring); g.appendChild(svgEl("circle",{r:3.2,fill:color,stroke:"#fffaf0","stroke-width":1.5}));
  parent.appendChild(g);
}

function staticVehicle(parent,kind,a,b,t){
  const p=punktZwischen(a,b,t),icon=vehicleGraphic(kind);
  icon.setAttribute("transform",`translate(${p[0]} ${p[1]})`);
  parent.appendChild(icon);
}

function transportRouteKey(r,reduced){
  if(!r)return"none";
  return [r.mineId,r.raffId,r.fabId,r.mat,reduced?1:0,OPT.anim].join("|");
}

function ensureTransportLegend(sichtbar){
  let legend=document.getElementById("didaktik-transport-legende");
  if(!legend){
    legend=document.createElement("div");
    legend.id="didaktik-transport-legende";
    legend.style.cssText="position:absolute;right:10px;bottom:calc(var(--dockh) + 10px);z-index:12;background:#0b3648e8;color:white;border:1px solid #ffffff30;border-radius:13px;padding:7px 9px;box-shadow:0 3px 12px #0003;font-size:var(--f0);font-weight:800;line-height:1.25;pointer-events:none;max-width:205px;backdrop-filter:blur(6px)";
    document.getElementById("sicht")?.appendChild(legend);
  }
  legend.hidden=!sichtbar;
  if(sichtbar) legend.innerHTML="<b>Transportfluss</b><br><span style='font-weight:700'>LKW → Schiff → LKW</span><br><span style='font-weight:600;opacity:.78'>rein visuell · keine Transportkosten oder Lieferzeiten</span>";
  return legend;
}

function updateRouteNote(r){
  const note=document.getElementById("didaktik-route-note");
  if(!note||note.hidden||!r)return;
  const mineDef=MINEN.find(x=>x.id===r.mineId),raffDef=RAFF_ORTE.find(x=>x.id===r.raffId);
  if(!mineDef||!raffDef)return;
  note.innerHTML=note.innerHTML
    .replace("<b>Beispielweg auf der Karte</b>","<b>Sichtbare Lieferkette</b>")
    .replace(`${mineDef.ort} → ${raffDef.ort} → ${LAND[r.fabrik.land].name}`,`LKW ${mineDef.ort} → Schiff ${raffDef.ort} → LKW ${LAND[r.fabrik.land].name}`);
}

function lieferwegTransportZeichnen(){
  const svg=document.querySelector("svg.weltkarte");
  if(!svg)return;
  const r=typeof beispielKette==="function"?beispielKette():null;
  const sichtbar=!!r&&aktiveSeite==="karte"&&!offenesBlatt&&!tutorialLaeuft();
  ensureTransportLegend(sichtbar);
  if(!sichtbar){
    svg.querySelector("#didaktik-transport")?.remove();
    transportRouteCache="";
    return;
  }

  const reduced=OPT.anim===0||window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const key=transportRouteKey(r,reduced);
  updateRouteNote(r);
  if(key===transportRouteCache&&svg.querySelector("#didaktik-transport"))return;
  transportRouteCache=key;
  transportReducedCache=reduced;
  svg.querySelector("#didaktik-transport")?.remove();

  const g=svgEl("g",{id:"didaktik-transport","pointer-events":"none"});
  const mine=px(r.mineId),raff=px(r.raffId),fab=px(r.fabId);
  const umschlag=punktZwischen(raff,fab,.76);
  const p1=kurvenPfad(mine,raff,.08),p2=kurvenPfad(raff,umschlag,.14),p3=kurvenPfad(umschlag,fab,-.08);

  addRoute(g,p1,"#f08c2e",4.2);
  addRoute(g,p2,"#6fb8e0",4.5);
  addRoute(g,p3,"#f08c2e",4.2);
  addNodePulse(g,mine,"#f08c2e");
  addNodePulse(g,raff,"#5b8f7a");
  addNodePulse(g,fab,"#b5703c");

  if(reduced){
    staticVehicle(g,"truck",mine,raff,.52);
    staticVehicle(g,"ship",raff,umschlag,.52);
    staticVehicle(g,"truck",umschlag,fab,.52);
  }else{
    addMotion(g,"truck",p1,7.2,0);
    addMotion(g,"ship",p2,10.4,1.15);
    addMotion(g,"truck",p3,4.6,2.35);
    [0,1.35,2.7].forEach(d=>addFlowDot(g,p1,6.4,d,"#ffd17a",2.7));
    [0.5,2.3,4.1].forEach(d=>addFlowDot(g,p2,8.8,d,"#d7f0ff",3.0));
    [0.4,1.7].forEach(d=>addFlowDot(g,p3,4.1,d,"#ffd17a",2.7));
  }

  svg.appendChild(g);
}

const originalZeichnenTransport=zeichnen;
zeichnen=function(){
  originalZeichnenTransport();
  lieferwegTransportZeichnen();
};

window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change",()=>{
  transportRouteCache="";
  lieferwegTransportZeichnen();
});

lieferwegTransportZeichnen();
