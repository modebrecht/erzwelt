"use strict";
/* Handy-Layout: oben zwei Reihen Bedienung, darunter das Spiel.
   1. «Verlauf» sitzt in der oberen Leiste (2. Reihe links, neben Tempo und
      Einstellungen) statt auf der Karte.
   2. Meldungen docken links unten am Rand über der Leiste an, statt mitten über der
      Karte oder unter dem Aufgabenkasten zu schweben.
   3. Die Kartenebenen stecken in einem Filter-Knopf über + und − (module/karte.js).
   4. Aufgabe auf allen Seiten rechts (wie auf der Karte).
   5. Aufgabenkasten auf der Karte kürzer: Phase als schmale Leiste mit Text
      in einer Zeile (statt Kästchen 1–4 plus «Phase 1/4»), Zusammenhang ohne
      Kasten, und nur ein Weg zum Ziel: «Ziel zeigen». Die Zeile baut
      module/aufgabe.js, das Aussehen steht in module/stil.js.
   Nur Darstellung: keine Änderung an Spielstand oder Wirtschaft. */
(function(){
  const VERSION = 1;

  /* ---------- 1. Verlauf in die obere Leiste ---------- */
  function verlaufInHud(){
    const v = document.getElementById("toast-history-control");
    const hud = document.getElementById("hud");
    const rechts = hud?.querySelector(".hudrechts");
    if (!v || !hud || !rechts) return false;
    if (v.parentElement !== hud){
      hud.insertBefore(v, rechts);
      if (typeof masseMessen === "function") masseMessen();
      if (typeof questHoeheMessen === "function") questHoeheMessen();
    }
    return true;
  }
  if (!verlaufInHud()){
    const spiel = document.getElementById("spiel") || document.body;
    const mo = new MutationObserver(() => { if (verlaufInHud()) mo.disconnect(); });
    mo.observe(spiel, {childList:true});
  }

  /* ---------- 2. Meldungen: Höhe/Breite nicht mehr per Inline-Stil versetzen ---------- */
  const toasts = document.getElementById("toasts");
  if (toasts){
    const aufraeumen = () => {
      if (toasts.style.getPropertyValue("top")) toasts.style.removeProperty("top");
      if (toasts.style.getPropertyValue("width")) toasts.style.removeProperty("width");
    };
    new MutationObserver(aufraeumen).observe(toasts, {attributes:true, attributeFilter:["style"]});
    aufraeumen();
  }

  /* ---------- 3. Filter-Knopf: module/karte.js ---------- */

  window.__erzweltHandyLayout = {version:VERSION};
})();
