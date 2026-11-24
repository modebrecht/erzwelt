"use strict";
/* ============================================================
   FEINSCHLIFF – sichtbare Kleinigkeiten (nur Darstellung)

   1. Verkauf: Der kurz eingeblendete Betrag steht an Stelle des Wortes
      «Kasse», statt darüber, und ohne «CHF», damit er ins Feld passt.
   2. «Schritt abgeschlossen» erscheint auf der Karte unten über der Leiste
      (dort, wo Meldungen stehen), nicht über Kopfzeile und Aufgabe.
   3. Fabrik-Szene: ganzer Produktname im Karton («Ladekabel») und
      Materialnamen im Kopf auf zwei Zeilen statt abgeschnitten.
   4. Rezept: Fehlendes Material rot markiert mit «fehlt» statt grau
      durchgestrichen.
   ============================================================ */
(function(){
  const VERSION = 1;
  const style = document.createElement("style");
  style.id = "erzwelt-feinschliff-style";
  style.textContent = `
    /* 1. Betrag ersetzt das Wort «Kasse», solange er sichtbar ist */
    .pille.kasse > div:has(.kasse-plus) > small{visibility:hidden}
    .pille.kasse .kasse-plus{background:none!important;padding:0!important;top:1px!important}

    /* 2. Rückmeldung auf der Karte unterhalb der normalen Meldungen */
    body:not(.fensterauf) #tutorial-lernfeedback{top:auto!important;bottom:calc(var(--dockh) + 12px)}

    /* 3. Produktname nicht abschneiden */
    .produktkarton{width:auto!important;min-width:48px;padding:3px 7px!important;font-size:9.5px!important;white-space:nowrap}
    .prozess-meta-seite b{white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.2}

    /* 4. Fehlendes Material deutlich, aber lesbar */
    .stueck span.fehlt{opacity:1!important;text-decoration:none!important;background:#fae4e1!important;color:#9a342f!important;
      box-shadow:inset 0 0 0 1.5px #e39a93}
    .stueck span.fehlt::after{content:" · fehlt";font-weight:700;font-size:.85em}
  `;
  document.head.appendChild(style);

  /* 1. «+CHF 2'845» → «+2'845» (das Feld heisst schon «Kasse») */
  const kasse = document.querySelector(".pille.kasse");
  if (kasse && typeof MutationObserver === "function"){
    new MutationObserver(liste => {
      for (const m of liste) for (const n of m.addedNodes){
        if (n.nodeType === 1 && n.classList.contains("kasse-plus")) n.textContent = n.textContent.replace(/CHF\s*/g, "");
      }
    }).observe(kasse, {childList:true, subtree:true});
  }
  window.__erzweltFeinschliff = {version: VERSION};
})();
