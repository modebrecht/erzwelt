"use strict";
/* ============================================================
   REITER: Markt, Team, Ziel, Wissen (#seite)

   Einziger Ort, an dem seiteMarkt, seiteTeam, seiteZiel, seiteWissen und
   seiteFuellen festgelegt werden. Früher lagen bis zu fünf Hüllen aus
   verschiedenen Dateien übereinander; hier stehen ihre Schritte in derselben
   Reihenfolge hintereinander. Die Teile bleiben in ihrer Datei und melden sich
   in window.__erzweltSeitenTeile an:

     markt                   didactic-ui.js        Markt-Reiter (ersetzt den Kern)
     marktTexte, teamTexte   sek-b-klarheit.js
     regler, teamKosten      belegschaft-regler.js
     teamVor, teamEinfuehrung   einfuehrung.js     Team in der Einführung
     knopfText, wissenPause  stil.js
     zielZertifikat, formularOffen   abschluss-zertifikat.js
     zielEtappe              logik-fixes.js        Ziel pro Schwierigkeit, Nachweise
     zielPositiv             ziel-positiv.js
     drossel                 performance-pass.js
     kuerzen                 kurztexte.js
   ============================================================ */
(function(){
  const T = window.__erzweltSeitenTeile;
  const kern = {team:seiteTeam, ziel:seiteZiel, wissen:seiteWissen, fuellen:seiteFuellen};

  seiteMarkt = function(){
    let html = T.markt();
    html = T.marktTexte(html);
    html = T.regler(html);
    return T.knopfText(html);
  };
  seiteTeam = function(){
    T.teamVor();
    let html = kern.team();
    html = T.teamTexte(html);
    html = T.teamKosten(html);
    html = T.teamEinfuehrung(html);
    return T.knopfText(html);
  };
  seiteZiel = function(){
    let html = kern.ziel();
    html = T.zielZertifikat(html);
    html = T.zielEtappe(html);
    return T.zielPositiv(html);
  };
  seiteWissen = function(){
    return T.wissenPause(kern.wissen.apply(this, arguments));
  };

  const gedrosselt = T.drossel(kern.fuellen, name => String(name));
  seiteFuellen = function(name){
    let out;
    // Ein laufender Spieltag darf das offene Zertifikat-Formular nicht ersetzen
    if (!T.formularOffen(name)) out = gedrosselt(name);
    T.kuerzen();
    return out;
  };

  window.__erzweltSeiten = {version:1};
})();
