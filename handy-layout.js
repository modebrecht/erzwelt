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
      Kasten, und nur ein Weg zum Ziel: «Ziel zeigen».
   Nur Darstellung: keine Änderung an Spielstand oder Wirtschaft. */
(function(){
  const VERSION = 1;
  const style = document.createElement("style");
  style.id = "erzwelt-handy-layout-style";
  style.textContent = `
    /* 1. Verlauf in der oberen Leiste */
    #hud #toast-history-control{position:static!important;height:40px;padding:0 11px 0 9px;border-radius:13px;
      border:2px solid #ffffff2e;box-shadow:0 3px 0 #00000030;font-size:var(--f1);pointer-events:auto}

    /* 2. Meldungen links unten */
    html body #toasts#toasts#toasts{top:auto!important;bottom:calc(var(--dockh) + 12px)!important;left:0!important;
      width:min(calc(100% - 66px),430px)!important}

    /* 3. Filter-Knopf und Ebenen-Auswahl */
    #zoom #filterknopf{position:relative;display:grid;place-items:center}
    #zoom #filterknopf svg{width:20px;height:20px}
    #zoom #filterknopf[aria-expanded="true"]{background:var(--gold);color:#4a3000;border-color:#fff6}
    #filterknopf .filter-punkt{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;
      background:var(--gold);border:2px solid #0b3648}
    #filterknopf .filter-punkt[hidden]{display:none}
    #ebenen{left:auto!important;right:62px;bottom:calc(var(--dockh) + 12px);max-width:none!important;
      flex-direction:column;flex-wrap:nowrap!important;gap:4px!important;padding:10px;border-radius:16px;
      background:var(--papier);box-shadow:0 10px 28px #0006;z-index:45;
      opacity:0;pointer-events:none;transform:translateX(8px) scale(.97);transform-origin:right bottom;
      transition:opacity .16s ease,transform .18s ease}
    body.filter-offen #ebenen{opacity:1;pointer-events:auto;transform:none}
    body.filter-offen #toasts{opacity:0;pointer-events:none}
    body.fensterauf #ebenen{opacity:0!important;pointer-events:none!important}
    #ebenen .filter-titel{margin:0 2px 4px;font-size:var(--f0);font-weight:800;color:var(--grau);
      text-transform:uppercase;letter-spacing:.05em}
    #ebenen button{background:#fff8ea!important;color:var(--tinte)!important;border:2px solid #eadfc8!important;
      border-radius:12px!important;padding:8px 12px 8px 10px!important;font-size:var(--f1)!important;
      justify-content:flex-start;min-width:190px;opacity:1!important}
    #ebenen button i{width:14px!important;height:14px!important;border-radius:4px!important}
    #ebenen button::after{content:"";margin-left:auto;width:20px;height:20px;border-radius:6px;flex:none;
      border:2px solid #cdbf9f;background:#fff center/14px no-repeat}
    #ebenen button[aria-pressed="true"]::after{border-color:#2f8a5f;background-color:#3aa56f;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='%23fff' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
    #ebenen button[aria-pressed="false"]{color:var(--grau)!important}

    /* Gleicher Abstand: Leiste 1 → Leiste 2 → Aufgabe (je 7px) */
    #quest:not(.breit){top:calc(var(--hudh) - 1px)}
    #spiel #quest:not(.breit){right:var(--aufgabe-rechts);width:var(--aufgabe-breite)}
    #quest #q-titel,#quest #q-text{overflow-wrap:anywhere}

    /* Aufgabe auch auf Markt, Team, Ziel und Wissen rechts – wie auf der Karte */
    @media (max-width:819px){
      #spiel #quest.breit{left:auto;right:var(--aufgabe-rechts);width:var(--aufgabe-breite)}
    }

    /* 4. Aufgabenkasten kürzer */
    #quest .phase-zeile{display:flex;align-items:center;gap:8px;margin:8px 0 0}
    #quest .phase-zeile[hidden]{display:none}
    #quest .phase-zeile .tutorial-phase-name{margin:0;text-align:left;white-space:nowrap;font-size:10.5px}
    #quest .phase-zeile .tutorial-kette{flex:1;min-width:0;margin:0;gap:3px}
    #quest .phase-zeile .tutorial-phase{height:7px;padding:0!important;border:0;border-radius:99px;box-shadow:none!important}
    #quest .phase-zeile .tutorial-phase b,#quest .phase-zeile .tutorial-phase span{display:none}
    #quest .phase-zeile .tutorial-phase.erledigt{background:var(--gruen)}
    #quest .phase-zeile .tutorial-phase.aktiv{background:var(--gold)}
    #quest .tutorial-zusammenhang{background:none;padding:0;margin-top:5px;border-radius:0}
    #quest .objective-guide-action{margin-top:9px;padding-top:6px;padding-bottom:6px}
    #quest:not(.kompakt):has(.objective-guide-action) .quest-map-cue{display:none}
    #quest.map-link:not(.kompakt):has(.objective-guide-action){padding-right:12px!important}
  `;
  document.head.appendChild(style);

  const hud = document.getElementById("hud");
  const tempo = document.getElementById("h-tempo");
  const einstellungen = document.getElementById("einstauf");
  const spiel = document.getElementById("spiel");
  function aufgabeAusrichten(){
    if (tempo.hidden) return;
    const rechts = einstellungen.getBoundingClientRect().right;
    spiel.style.setProperty("--aufgabe-rechts", `${spiel.getBoundingClientRect().right - rechts}px`);
    spiel.style.setProperty("--aufgabe-breite", `${rechts - tempo.getBoundingClientRect().left}px`);
    questHoeheMessen();
  }
  aufgabeAusrichten();
  const aufgabenLayout = new ResizeObserver(aufgabeAusrichten);
  for (const element of [hud, tempo, einstellungen]) aufgabenLayout.observe(element);

  /* ---------- 1. Verlauf in die obere Leiste ---------- */
  function verlaufInHud(){
    const v = document.getElementById("toast-history-control");
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

  /* ---------- 4. Aufgabenkasten: Phase in einer Zeile ---------- */
  function phaseZeile(){
    const q = document.getElementById("quest");
    if (!q) return;
    const kette = q.querySelector(".tutorial-kette");
    const name = q.querySelector(".tutorial-phase-name");
    if (!kette || !name) return;
    let zeile = kette.parentElement.classList.contains("phase-zeile") ? kette.parentElement : null;
    if (!zeile){
      zeile = document.createElement("div");
      zeile.className = "phase-zeile";
      kette.before(zeile);
      zeile.append(name, kette);
    }
    zeile.hidden = !!kette.hidden;
  }
  if (typeof questZeichnen === "function"){
    const vorherQuest = questZeichnen;
    questZeichnen = function(){
      const out = vorherQuest.apply(this, arguments);
      phaseZeile();
      if (typeof questHoeheMessen === "function") questHoeheMessen();
      return out;
    };
    questZeichnen();
  }

  window.__erzweltHandyLayout = {version:VERSION};
})();
