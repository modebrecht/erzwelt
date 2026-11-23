"use strict";
/* Handy-Layout: oben zwei Reihen Bedienung, darunter das Spiel.
   1. «Verlauf» sitzt in der oberen Leiste (2. Reihe links, neben Tempo und
      Einstellungen) statt auf der Karte.
   2. Meldungen docken links unten am Rand über der Leiste an, statt mitten über der
      Karte oder unter dem Aufgabenkasten zu schweben.
   3. Die Kartenebenen (Rohstoffquellen, Werke, Fabriken) stecken in einem
      Filter-Knopf über + und −.
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

  /* ---------- 3. Filter-Knopf ---------- */
  const filterSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6.2 7.4V18l-3.6 2v-7.6Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
  const zoom = document.getElementById("zoom");
  const ebenenEl = document.getElementById("ebenen");
  let filterKnopf = null;
  function filterPunkt(){
    if (!filterKnopf || typeof ebenen === "undefined" || !ebenen) return;
    const aus = Object.values(ebenen).some(v => !v);
    filterKnopf.querySelector(".filter-punkt").hidden = !aus;
    filterKnopf.setAttribute("aria-label", aus ? "Karte filtern (nicht alle Orte sichtbar)" : "Karte filtern");
  }
  function filterZu(){
    document.body.classList.remove("filter-offen");
    filterKnopf?.setAttribute("aria-expanded", "false");
  }
  if (zoom && ebenenEl){
    if (!ebenenEl.querySelector(".filter-titel")){
      const titel = document.createElement("p");
      titel.className = "filter-titel";
      titel.textContent = "Auf der Karte zeigen";
      ebenenEl.prepend(titel);
    }
    filterKnopf = document.createElement("button");
    filterKnopf.type = "button";
    filterKnopf.id = "filterknopf";
    filterKnopf.setAttribute("aria-expanded", "false");
    filterKnopf.setAttribute("aria-controls", "ebenen");
    filterKnopf.innerHTML = `${filterSvg}<span class="filter-punkt" hidden></span>`;
    zoom.prepend(filterKnopf);
    filterKnopf.addEventListener("click", ev => {
      ev.stopPropagation();
      const offen = document.body.classList.toggle("filter-offen");
      filterKnopf.setAttribute("aria-expanded", String(offen));
    });
    document.addEventListener("click", ev => {
      if (ev.target.closest("[data-ebene]")) { setTimeout(filterPunkt, 0); return; }
      if (!document.body.classList.contains("filter-offen")) return;
      if (ev.target.closest("#ebenen, #filterknopf")) return;
      filterZu();
    });
    if (typeof pinsZeichnen === "function"){
      const vorherPins = pinsZeichnen;
      pinsZeichnen = function(){ const out = vorherPins.apply(this, arguments); filterPunkt(); return out; };
    }
    filterPunkt();
  }

  window.__erzweltHandyLayout = {version:VERSION};
})();
