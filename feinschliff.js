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
