"use strict";
/* ============================================================
   WISSEN: Lupe und nächster Schritt

   Einziger Ort, an dem lupeFuellen und naechsterSchritt festgelegt werden.
   Früher lagen je vier Fassungen übereinander; hier stehen ihre Schritte in
   derselben Reihenfolge hintereinander. Die Teile bleiben in ihrer Datei und
   melden sich in window.__erzweltWissenTeile an:

     lupeVor, lupeVoraussetzung, hinweis   didactic-should.js
     questSchritt          knowledge-quest-flow.js  Aufgabe der Wissens-Quest
     engpassSchritt, modellRegeln   sek-b-klarheit.js
     lupeEinfuehrung       einfuehrung.js   Verbesserungen erst nach der Einführung
   ============================================================ */
(function(){
  const T = window.__erzweltWissenTeile;
  const kernLupe = lupeFuellen;

  lupeFuellen = function(segId){
    T.lupeVor(segId);
    kernLupe(segId);
    T.lupeVoraussetzung(segId);
    T.modellRegeln?.(segId);
    T.lupeEinfuehrung();
  };

  /* Reihenfolge: Engpass (ohne Wissens-Quest) → Wissens-Quest → allgemeiner Hinweis */
  naechsterSchritt = function(){
    return T.engpassSchritt() || T.questSchritt() || T.hinweis();
  };

  window.__erzweltWissen = {version:1};
})();
