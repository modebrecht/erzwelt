"use strict";
/* Beispiel einer Lieferkette auf der Weltkarte. */

const RESSOURCEN_ANIMATIONSFAKTOR = 2.5;
const transportBewegungReduziert = matchMedia("(prefers-reduced-motion: reduce)");
let transportRouteCache = "";

const transportMobileStyle = document.createElement("style");
transportMobileStyle.textContent = `@media(max-width:560px){
  #didaktik-transport-legende{display:none!important}
}`;
document.head.append(transportMobileStyle);

function svgEl(tag, attrs){
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, wert] of Object.entries(attrs)) el.setAttribute(key, String(wert));
  return el;
}

function lieferkurve(a, b, bogen){
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const laenge = Math.max(1, Math.hypot(dx, dy));
  const offset = Math.min(40, laenge * bogen);
  const cx = (a[0] + b[0]) / 2 - dy / laenge * offset;
  const cy = (a[1] + b[1]) / 2 + dx / laenge * offset;
  const pfad = `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  return {pfad, laenge};
}

function liefersymbol(art, farbe){
  const attrs = {fill:farbe, stroke:"#fffaf0", "stroke-width":1.2};
  if (art === "punkt") return svgEl("circle", {...attrs, class:"lieferpunkt", r:3.6});
  const symbol = svgEl("g", {class:"lieferfahrzeug"});
  const pfad = art === "schiff"
    ? "M-7 -3.4H2Q5 -3.3 8 0Q5 3.3 2 3.4H-7Z"
    : "M8 0Q7-1.3 5-1.3H1.9L-1.9-6H-4L-2.4-1.3H-5L-7-3.2H-8L-7 0L-8 3.2H-7L-5 1.3H-2.4L-4 6H-1.9L1.9 1.3H5Q7 1.3 8 0Z";
  symbol.append(svgEl("path", {...attrs, d:pfad, "stroke-linejoin":"round"}));
  if (art === "schiff"){
    symbol.append(svgEl("rect", {x:-4.7, y:-1.85, width:5.7, height:3.7, rx:.55, fill:"#143b51"}));
  }
  return symbol;
}

function liefersymbolZeichnen(el, pfad, sekunden, farbe){
  const dauer = (sekunden * RESSOURCEN_ANIMATIONSFAKTOR).toFixed(2) + "s";
  const art = OPT.lieferanzeige;
  const symbol = liefersymbol(art, farbe);
  symbol.setAttribute("data-lieferanzeige", art);
  symbol.setAttribute("aria-hidden", "true");
  symbol.setAttribute("opacity", "0");
  symbol.append(
    svgEl("animateMotion", {path:pfad, dur:dauer, repeatCount:"indefinite", rotate:"auto"}),
    svgEl("animate", {attributeName:"opacity", values:"0;1;1;0", keyTimes:"0;.08;.88;1", dur:dauer, repeatCount:"indefinite"})
  );
  el.append(symbol);
}

function beispielLinieZeichnen(el, von, nach, farbe, punktfarbe, dauer, reduziert){
  const {pfad} = lieferkurve(px(von), px(nach), .08);
  el.append(
    svgEl("path", {d:pfad, fill:"none", stroke:"#fff3c7", "stroke-width":7, "stroke-linecap":"round", opacity:.16}),
    svgEl("path", {class:"lieferlinie", d:pfad, fill:"none", stroke:farbe, "stroke-width":3, "stroke-linecap":"round", "stroke-dasharray":"8 8", opacity:.82})
  );
  if (!reduziert) liefersymbolZeichnen(el, pfad, dauer, punktfarbe);
}

function ensureTransportLegend(sichtbar){
  let legend = document.getElementById("didaktik-transport-legende");
  if (!legend){
    legend = document.createElement("div");
    legend.id = "didaktik-transport-legende";
    legend.style.cssText = "position:absolute;right:10px;bottom:calc(var(--dockh) + 10px);z-index:12;background:#0b3648e8;color:white;border:1px solid #ffffff30;border-radius:13px;padding:7px 9px;font-size:var(--f0);font-weight:800;line-height:1.25;pointer-events:none";
    legend.innerHTML = "<b>Beispiel-Lieferweg</b><br>Rohstoffquelle → Raffinerie → Fabrik";
    document.getElementById("sicht")?.append(legend);
  }
  legend.hidden = !sichtbar;
}

function lieferwegTransportZeichnen(){
  const svg = document.querySelector("svg.weltkarte");
  if (!svg) return;
  const route = beispielKette();
  const sichtbar = !!route && aktiveSeite === "karte" && !offenesBlatt && !tutorialLaeuft();
  ensureTransportLegend(sichtbar);
  const vorhanden = svg.querySelector("#didaktik-transport");
  if (!sichtbar){
    vorhanden?.remove();
    transportRouteCache = "";
    return;
  }
  const reduziert = OPT.anim === 0 || transportBewegungReduziert.matches;
  const {mineId, raffId, fabId} = route;
  const schluessel = [mineId, raffId, fabId, reduziert, OPT.lieferanzeige].join("|");
  if (schluessel === transportRouteCache && vorhanden) return;
  transportRouteCache = schluessel;
  vorhanden?.remove();

  const gruppe = svgEl("g", {id:"didaktik-transport", "pointer-events":"none"});
  beispielLinieZeichnen(gruppe, mineId, raffId, "#f08c2e", "#ffd17a", 6.4, reduziert);
  beispielLinieZeichnen(gruppe, raffId, fabId, "#6fb8e0", "#d7f0ff", 8.8, reduziert);
  svg.append(gruppe);
}

const originalZeichnenTransport = zeichnen;
zeichnen = function(){
  originalZeichnenTransport();
  lieferwegTransportZeichnen();
};
lieferwegTransportZeichnen();
