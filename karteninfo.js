"use strict";

(function(){
  const zoom = document.getElementById("zoom");
  const karte = document.querySelector("#welt svg.weltkarte");
  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.id = "kartennamen-knopf";
  knopf.textContent = "Aa";
  knopf.title = textVon("karteninfo.kartennamen-strg-halten-oder");
  knopf.setAttribute("aria-label", textVon("karteninfo.kartennamen"));
  knopf.setAttribute("aria-pressed", "false");
  zoom.prepend(knopf);

  const hinweis = document.createElement("div");
  hinweis.id = "kartennamen-hinweis";
  hinweis.hidden = true;
  document.body.append(hinweis);

  const stil = document.createElement("style");
  stil.textContent = `
    #zoom #kartennamen-knopf{font-size:19px}
    #zoom #kartennamen-knopf[aria-pressed="true"],
    #zoom #kartennamen-knopf.strg{background:var(--gold);color:#4a3000;border-color:#fff6}
    #kartennamen-hinweis{position:fixed;z-index:26;pointer-events:none;
      padding:4px 9px;border:1px solid #ffffff5c;border-radius:9px;background:#0b3648;color:#fff;
      font:700 14px/1.3 "Baloo 2",system-ui,sans-serif;box-shadow:0 3px 12px #0005;
      max-width:min(280px,calc(100vw - 16px));overflow-wrap:anywhere}
    #kartennamen-hinweis[hidden],body.fensterauf #kartennamen-hinweis{display:none}
  `;
  document.head.append(stil);

  const ortstest = document.createElement("canvas").getContext("2d");
  const landflaechen = Array.from(karte.querySelectorAll("path.land"), element => new Path2D(element.getAttribute("d")));
  const pfade = new Map();
  const { laender, inseln, seen, meere } = KARTENINFO_DATEN;
  const kleineInseln = inseln.filter(([,links,oben,rechts,unten]) => rechts-links < 2 && unten-oben < 2);
  let eingeschaltet = false;
  let strgGehalten = false;
  let zeiger = null;
  let beruehrung = null;
  let bild = 0;

  function nameAn(liste, x, y, rand = 0){
    if (rand) ortstest.lineWidth = 2*rand;
    for (const [name, links, oben, rechts, unten, d] of liste){
      if (x < links-rand || x > rechts+rand || y < oben-rand || y > unten+rand) continue;
      if (!pfade.has(d)) pfade.set(d, new Path2D(d));
      const pfad = pfade.get(d);
      if (rand ? ortstest.isPointInStroke(pfad,x,y) : ortstest.isPointInPath(pfad,x,y,"evenodd")){
        return name;
      }
    }
    return "";
  }

  function kartenname(x, y, inselRand){
    if (!landflaechen.some(pfad => ortstest.isPointInPath(pfad,x,y,"evenodd"))){
      // Bei Inseln unter wenigen Bildpunkten zählt auch die sichtbare Kante.
      return nameAn(seen,x,y) || nameAn(kleineInseln,x,y,inselRand) || nameAn(meere,x,y);
    }
    const land = nameAn(laender,x,y) || nameAn(laender,x,y,.4);
    const insel = nameAn(inseln,x,y);
    return insel && land && insel !== land ? `${insel} · ${land}` : insel || land;
  }

  function zeigeName(){
    bild = 0;
    if (!zeiger || !(eingeschaltet || strgGehalten) || document.body.classList.contains("fensterauf")){
      hinweis.hidden = true;
      return;
    }
    const rect = karte.getBoundingClientRect();
    const { x, y, typ } = zeiger;
    const kartenX = (x-rect.left)*KARTE_B/rect.width;
    const kartenY = (y-rect.top)*KARTE_H/rect.height;
    const name = kartenX >= 0 && kartenX <= KARTE_B && kartenY >= 0 && kartenY <= KARTE_H
      ? kartenname(kartenX,kartenY,.65*KARTE_B/rect.width) : "";
    hinweis.hidden = !name;
    if (!name) return;
    if (hinweis.textContent !== name) hinweis.textContent = name;
    const breite = hinweis.offsetWidth;
    const links = typ === "touch" ? x-breite/2 : x+14;
    hinweis.style.left = Math.max(8,Math.min(links,window.innerWidth-breite-8))+"px";
    hinweis.style.top = Math.max(8,y-hinweis.offsetHeight-12)+"px";
  }

  function aktualisieren(){
    if (!(eingeschaltet || strgGehalten) || !zeiger){
      hinweis.hidden = true;
      return;
    }
    if (!bild) bild = requestAnimationFrame(zeigeName);
  }

  function zeigerSetzen(event){
    zeiger = {x:event.clientX,y:event.clientY,typ:event.pointerType};
    aktualisieren();
  }

  knopf.addEventListener("click", () => {
    eingeschaltet = !eingeschaltet;
    knopf.setAttribute("aria-pressed", String(eingeschaltet));
    aktualisieren();
  });

  function strgSetzen(gehalten){
    if (strgGehalten === gehalten) return;
    strgGehalten = gehalten;
    knopf.classList.toggle("strg", gehalten);
    aktualisieren();
  }

  window.addEventListener("keydown", event => {
    if (event.key === "Control") strgSetzen(true);
  });
  window.addEventListener("keyup", event => {
    if (event.key === "Control") strgSetzen(event.ctrlKey);
  });
  window.addEventListener("blur", () => {
    zeiger = null;
    beruehrung = null;
    strgSetzen(false);
    aktualisieren();
  });
  window.addEventListener("resize", aktualisieren);

  sicht.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    strgSetzen(event.ctrlKey);
    if (!event.buttons) zeigerSetzen(event);
  });
  sicht.addEventListener("pointerleave", event => {
    if (event.pointerType === "touch") return;
    zeiger = null;
    aktualisieren();
  });
  sicht.addEventListener("wheel", zeigerSetzen, {passive:true});
  sicht.addEventListener("pointerdown", event => {
    zeiger = null;
    aktualisieren();
    beruehrung = event.pointerType === "touch" && event.isPrimary && !event.target.closest(".pin")
      ? { id:event.pointerId,x:event.clientX,y:event.clientY } : null;
  });
  sicht.addEventListener("pointerup", event => {
    if (event.pointerType !== "touch" || (beruehrung?.id === event.pointerId &&
        Math.hypot(event.clientX-beruehrung.x,event.clientY-beruehrung.y) < 9)){
      zeigerSetzen(event);
    }
    beruehrung = null;
  });
  sicht.addEventListener("pointercancel", () => { beruehrung = null; });
})();
