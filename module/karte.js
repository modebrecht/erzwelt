"use strict";
/* ============================================================
   KARTE UND PINS

   Einziger Ort, an dem zeichnen, pinsZeichnen, dockZeichnen,
   ansichtAnwenden, hinweiseSetzen und pinFeiern festgelegt werden. Früher
   lagen bis zu fünfzehn Hüllen übereinander; hier stehen ihre Schritte in
   derselben Reihenfolge hintereinander.

   Dieses Modul lädt als erstes nach dem Kern. Die Dateien melden ihren
   Schritt in window.__erzweltKarteTeile an der Stelle an, an der sie früher
   umhüllt haben. Ein Schritt läuft, sobald er angemeldet ist – auch wenn
   beim Laden schon gezeichnet wird, verhält sich alles wie mit den Hüllen.

     didaktikVor            didactic-ui.js
     shouldVor, lieferweg   didactic-should.js
     transport              didactic-transport.js
     pinsStand, dockStand, hinweiseStand, ansicht   performance-pass.js
     prozessSzenen          transformation-animations.js
     prozessDetails         transformation-enhance.js
     bauStatus, pinFeiernBau   construction-visibility.js
     animationen            premium-animation-treatment.js
     animationen2           premium-animation-treatment-v2.js
     stillstandWelt, stillstandBlatt   stop-safety-visual.js
     hinweiseOrtZiel        map-focus-navigation.js
     materialliste, dockHinweis, ansichtFokus   sek-b-klarheit.js
     filterPunkt            handy-layout.js
     pinsMitRohstoff, lieferfluss, lieferwegKnopf   premium-spielgefuehl.js
     einfuehrungMigrieren, zielPin   einfuehrung.js
     dock, arbeiter         karte-mitte.js
   ============================================================ */
(function(){
  const T = (window.__erzweltKarteTeile ||= {});
  const kern = {zeichnen, pins:pinsZeichnen, dock:dockZeichnen, ansicht:ansichtAnwenden,
    hinweise:hinweiseSetzen, pinFeiern};

  /* ---------- Alles zeichnen ---------- */
  zeichnen = function(){
    T.einfuehrungMigrieren?.();
    T.shouldVor?.();
    T.didaktikVor?.();
    kern.zeichnen();
    T.lieferweg?.();
    T.transport?.();
    T.prozessSzenen?.();
    T.prozessDetails?.();
    T.bauStatus?.();
    T.animationen?.();
    T.animationen2?.();
    T.stillstandWelt?.();
    T.stillstandBlatt?.();
    T.materialliste?.();
    T.dockHinweis?.();
    T.lieferfluss?.();
    T.lieferwegKnopf?.();
    T.arbeiter?.();
  };

  /* ---------- Pins: Kern nur, wenn sich Sichtbares geändert hat ---------- */
  let pinsStand = "";
  pinsZeichnen = function(){
    let out;
    const stand = T.pinsStand?.();
    if (stand === undefined || stand !== pinsStand){ pinsStand = stand; out = kern.pins(); }
    T.filterPunkt?.();
    T.pinsMitRohstoff?.();
    T.zielPin?.();
    T.arbeiter?.();
    return out;
  };
  pinFeiern = function(id){
    const out = kern.pinFeiern(id);
    T.pinFeiernBau?.(id);
    return out;
  };

  /* ---------- Hinweise: Kern nur bei neuem Stand ---------- */
  let hinweiseStand = "";
  hinweiseSetzen = function(){
    let out;
    const stand = T.hinweiseStand?.();
    if (stand === undefined || stand !== hinweiseStand){ hinweiseStand = stand; out = kern.hinweise(); }
    T.hinweiseOrtZiel?.();
    return out;
  };

  /* ---------- Leiste unten ---------- */
  let dockStand = "";
  dockZeichnen = function(){
    if (T.dock) return T.dock();
    const stand = T.dockStand?.();
    if (stand !== undefined && stand === dockStand) return;
    dockStand = stand;
    return kern.dock();
  };

  /* ---------- Kamera: Ziel-Pin unter die Aufgabenkarte ---------- */
  let fokus = null;
  const basis = () => (T.ansicht || kern.ansicht)();
  ansichtAnwenden = function(){
    if (!T.ansichtFokus) return basis();
    fokus ||= T.ansichtFokus(basis);
    return fokus();
  };

  window.__erzweltKarte = {version:1};
})();
