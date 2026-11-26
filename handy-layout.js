"use strict";
/* Handy-Layout: kompakte Bedienleiste über dem Spiel.
   1. Kasse, Tag, «Verlauf», Tempo und Einstellungen stehen oben in einer Reihe.
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
  const VERSION = 2;
  const style = document.createElement("style");
  style.id = "erzwelt-handy-layout-style";
  style.textContent = `
    /* 1. Getrennte Kasse und Tag; Verlauf nach verfügbarem Platz */
    #hud{flex-wrap:nowrap}
    #hud .hudwerte,#hud .pille.kasse,#hud .pille.kasse > div{min-width:0}
    #hud .pille.tag,#hud .hudrechts{flex:none}
    #hud #h-kasse{white-space:normal;overflow-wrap:anywhere}
    #hud #toast-history-control{position:relative;height:40px;padding:0 11px 0 9px;border-radius:13px;
      border:2px solid #ffffff2e;box-shadow:0 3px 0 #00000030;font-size:var(--f1);flex:none;white-space:nowrap}
    #hud #toast-history-control:not(.mit-text){width:40px;padding:0;display:grid;place-items:center}
    #hud #toast-history-control:not(.mit-text) svg{width:18px;height:18px}
    #hud #toast-history-control:not(.mit-text) .toast-history-label{display:none}
    #hud #toast-history-control:not(.mit-text) .toast-history-count{position:absolute;top:-4px;right:-3px;min-width:14px;height:14px;padding:0 3px;
      background:#f5b73d;color:#4a3000;font-size:9px}
    #hud #toast-history-control:disabled .toast-history-count{display:none}
    @media (max-width:540px){
      #hud{gap:4px;padding-left:max(6px,env(safe-area-inset-left));padding-right:max(6px,env(safe-area-inset-right))}
      #hud .hudwerte{gap:4px}
      #hud .pille{min-height:40px;padding:3px 6px;gap:4px;border-radius:13px}
      #hud .pille.kasse i{width:20px;height:20px}
      #hud .pille.kasse i svg{width:13px;height:13px}
      #hud .pille.tag i{display:none}
      #hud .pille b{display:block;font-size:var(--f1);line-height:1.05}
      #hud .pille small{margin-bottom:1px}
      #hud .tempo,#hud .hudrechts{gap:3px}
      #hud .tempo button,#hud #einstauf{padding-inline:5px}
    }
    @media (max-width:360px){
      #hud .hudwerte{gap:3px}
      #hud .pille{padding-inline:4px;gap:3px}
      #hud .pille b{font-size:var(--f0)}
      #hud .pille.kasse i{width:18px;height:18px}
      #hud .tempo button,#hud #einstauf{min-width:32px;padding-inline:3px}
      #hud #toast-history-control:not(.mit-text){width:34px}
    }

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

    /* Abstand zwischen Bedienleiste und Aufgabe: 7px. */
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
  const hudwerte = hud.querySelector(".hudwerte");
  const hudrechts = hud.querySelector(".hudrechts");
  const verlauf = document.getElementById("toast-history-control");
  function verlaufAnpassen(){
    if (!verlauf || !hudwerte || !hudrechts) return;
    // First measure the compact layout; only add text when it fits.
    verlauf.classList.remove("mit-text");
    const werteBreite = hudwerte.getBoundingClientRect().width;
    const rechtsBreite = hudrechts.getBoundingClientRect().width;
    const css = getComputedStyle(hud);
    const platz = hud.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
    const abstand = 2 * (parseFloat(css.columnGap) || 0);
    verlauf.classList.add("mit-text");
    const voll = verlauf.getBoundingClientRect().width;
    if (Math.ceil(werteBreite + rechtsBreite + voll + abstand) > Math.floor(platz)){
      verlauf.classList.remove("mit-text");
    }
  }
  function aufgabeAusrichten(){
    verlaufAnpassen();
    masseMessen();
    if (tempo.hidden) return;
    const rechts = einstellungen.getBoundingClientRect().right;
    spiel.style.setProperty("--aufgabe-rechts", `${spiel.getBoundingClientRect().right - rechts}px`);
    spiel.style.setProperty("--aufgabe-breite", `${rechts - tempo.getBoundingClientRect().left}px`);
    questHoeheMessen();
  }
  aufgabeAusrichten();
  const aufgabenLayout = new ResizeObserver(aufgabeAusrichten);
  for (const element of [hud, tempo, einstellungen, hudwerte, hudrechts, verlauf]){
    if (element) aufgabenLayout.observe(element);
  }
  document.fonts?.ready.then(aufgabeAusrichten);

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
    filterKnopf.setAttribute("aria-label", aus ? textVon("handylayout.karte-filtern-nicht-alle") : textVon("handylayout.karte-filtern"));
  }
  function filterZu(){
    document.body.classList.remove("filter-offen");
    filterKnopf?.setAttribute("aria-expanded", "false");
  }
  if (zoom && ebenenEl){
    if (!ebenenEl.querySelector(".filter-titel")){
      const titel = document.createElement("p");
      titel.className = "filter-titel";
      titel.textContent = textVon("handylayout.auf-der-karte-zeigen");
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
    /* Nach jedem pinsZeichnen (module/karte.js) */
    (window.__erzweltKarteTeile ||= {}).filterPunkt = filterPunkt;
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
  /* Nach jedem Zeichnen der Aufgabenkarte (module/quest.js) */
  (window.__erzweltQuestTeile ||= {}).phaseZeile = phaseZeile;

  window.__erzweltHandyLayout = {version:VERSION};
})();
