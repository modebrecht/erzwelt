"use strict";
/* ============================================================
   BLÄTTER: Rohstoffquelle, Raffinerie, Fabrik (#blatt)

   Einziger Ort, an dem blattMine, blattRaff, blattFab, blattFuellen,
   blattZu und szeneRaff festgelegt werden. Früher lagen bis zu sieben Hüllen aus
   verschiedenen Dateien übereinander; hier stehen ihre Schritte in derselben
   Reihenfolge hintereinander. Die Teile bleiben in ihrer Datei und melden sich
   in window.__erzweltBlattTeile an:

     nachweis          logik-fixes.js        Herkunftsnachweis-Karte
     mineTexte, raffTexte, fabTexte,
     kaufPause, kaufPauseEnde   sek-b-klarheit.js   Einheiten, Kauf hält die Zeit an
     regler, reglerGezogen      belegschaft-regler.js
     kaufSperren       einfuehrung.js        Kauf in der Einführung gesperrt
     knopfText         stil.js
     drossel           performance-pass.js   schnelle Spieltage zeichnen seltener
     stillstand        stop-safety-visual.js
     kuerzen           kurztexte.js
     ordnen            blatt-ordnung.js      Reihenfolge der Karten, Änderungs-Chips
     szeneRaff         transformation-animations.js   Raffinerie als Prozess-Szene
   ============================================================ */
(function(){
  const T = window.__erzweltBlattTeile;
  const kern = {mine:blattMine, raff:blattRaff, fab:blattFab, fuellen:blattFuellen, zu:blattZu};

  /* ---------- Inhalt der drei Blätter ---------- */
  blattMine = function(id){
    let html = kern.mine(id);
    html = T.nachweis(html, id);
    html = T.mineTexte(html, id);
    html = T.regler(html);
    if (!S.minen[id]) html = T.kaufSperren(html, "mine", id);
    return T.knopfText(html);
  };
  blattRaff = function(id){
    let html = kern.raff(id);
    html = T.raffTexte(html, id);
    html = T.regler(html);
    if (!S.raff[id]) html = T.kaufSperren(html, "raff", id);
    return T.knopfText(html);
  };
  blattFab = function(land){
    let html = kern.fab(land);
    html = T.fabTexte(html, land);
    html = T.regler(html);
    if (!S.fabriken.some(f => f.land === land)) html = T.kaufSperren(html, "fab", land);
    return html;
  };

  /* Raffinerie-Szene: in der Einführung mit dem Start-Rohstoff (früher sek-b-klarheit.js) */
  szeneRaff = function(def, r){
    if (tutorialLaeuft() && def) return T.szeneRaff({...def, spezial:[START_MATERIALIEN[0]]}, r);
    return T.szeneRaff(def, r);
  };

  /* ---------- Füllen und Schliessen ---------- */
  const gedrosselt = T.drossel(kern.fuellen, (art, id) => `${art}|${id}`, () => blatt.classList.contains("auf"));
  blattFuellen = function(art, id){
    let out;
    // Solange ein Regler im Blatt gezogen wird, nicht neu zeichnen – sonst springt
    // der Griff unter dem Finger weg. Ordnen und Änderungs-Chips laufen trotzdem.
    if (!T.reglerGezogen(art, id)){
      out = gedrosselt(art, id);
      T.stillstand();
      T.kaufPause(art, id);
      T.kuerzen(document.getElementById("blattinhalt"));
    }
    T.ordnen(art, id);
    return out;
  };
  blattZu = function(){
    const out = kern.zu();
    T.kaufPauseEnde();
    return out;
  };

  window.__erzweltBlatt = {version:1};
})();
