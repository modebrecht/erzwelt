"use strict";
/* ============================================================
   EINFÜHRUNG: Schwierigkeitswahl und Tutorial-Schritte

   Einziger Ort, an dem schwierigkeitZeigen und tutorialPruefen festgelegt
   werden. Früher lagen je drei bis vier Fassungen übereinander; hier stehen
   ihre Schritte in derselben Reihenfolge hintereinander. Die Teile bleiben in
   ihrer Datei und melden sich in window.__erzweltEinfuehrungTeile an:

     schwierigkeitWahl     sek-b-klarheit.js   Dialog (ersetzt den Kern)
     stufenIkonen          stil.js             Stufen-Symbole statt Emojis
     spielstandAktionen    spielstaende.js     «Speichern & zum Hauptmenü», Export
     migrieren             einfuehrung.js      ältere Spielstände übernehmen
     lernRueckmeldung      tutorial-enhance.js «Schritt abgeschlossen»
     feiern                erfolg-feier.js     Ton, Vibration, Funken

   Die Einführung selbst (Schritte, Sperren, Zielort) bleibt in einfuehrung.js.
   ============================================================ */
(function(){
  const T = window.__erzweltEinfuehrungTeile;
  const kernPruefen = tutorialPruefen;

  schwierigkeitZeigen = function(){
    T.schwierigkeitWahl();
    T.stufenIkonen();
    T.spielstandAktionen();
  };

  tutorialPruefen = function(){
    T.migrieren();
    const davor = S.tutorial, schritt = TUTORIAL[davor];
    const out = kernPruefen.apply(this, arguments);
    T.lernRueckmeldung(davor, schritt);
    if (S.tutorial > davor) T.feiern(S.tutorial >= TUTORIAL.length);
    return out;
  };

  window.__erzweltEinfuehrungModul = {version:1};
})();
