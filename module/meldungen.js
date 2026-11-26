"use strict";
/* ============================================================
   MELDUNGEN, DIALOGE, TEMPO UND TÖNE

   Einziger Ort, an dem notiz, toastsErneuern, dialogZeigen, tempoSetzen
   und einstFuellen festgelegt werden. Früher lagen je drei bis vier
   Fassungen übereinander; hier stehen ihre Schritte in derselben Reihenfolge
   hintereinander. Die Teile bleiben in ihrer Datei und melden sich in
   window.__erzweltMeldungenTeile an:

     ohneEmoji             stil.js
     monatsBilanz          premium-spielgefuehl.js  Monatsabschluss als kleine Bilanz
     tutorialText          tutorial-enhance.js
     verlaufBereit, verlaufNeu, verlaufZu   notification-history.js
     meldungOrte           map-focus-navigation.js  Meldungen mit Ort antippbar
     dialogZertifikat      abschluss-zertifikat.js
     dialogSpielstand, einstSpielstand   spielstaende.js
     tempoVor              sek-b-klarheit.js        Kaufpause endet
     toene                 erfolg-feier.js          Regler «Töne», «Vibration»
   Dazu das Ort-Ziel der Aufgabenkarte (__erzweltQuestTeile.ortZiel) und der
   Lieferfluss der Karte (__erzweltKarteTeile.lieferfluss).
   ============================================================ */
(function(){
  const T = window.__erzweltMeldungenTeile;
  const Q = window.__erzweltQuestTeile;
  const K = window.__erzweltKarteTeile;
  const kern = {notiz, toasts:toastsErneuern, dialog:dialogZeigen, tempo:tempoSetzen, einst:einstFuellen};

  /* ---------- Meldungen ---------- */
  notiz = function(text, art){
    text = T.ohneEmoji(text);
    text = T.monatsBilanz(text);
    text = T.tutorialText(text);
    return kern.notiz.call(this, text, art);
  };
  toastsErneuern = function(){
    T.verlaufBereit();
    kern.toasts();
    T.verlaufNeu();
    T.meldungOrte();
    Q.ortZiel();
  };

  /* ---------- Dialoge ---------- */
  dialogZeigen = function(e){
    const spielstand = S;
    T.verlaufZu();   // Pflicht-Ereignisse nie hinter dem Meldungsverlauf
    kern.dialog(e);
    T.dialogZertifikat();
    T.dialogSpielstand(e, spielstand);
  };

  /* ---------- Tempo ---------- */
  tempoSetzen = function(v){
    T.tempoVor();
    const out = kern.tempo(v);
    K.lieferfluss();
    return out;
  };

  /* ---------- Einstellungen: Töne, Spielstand ---------- */
  einstFuellen = function(){
    kern.einst.apply(this, arguments);
    T.toene();
    T.einstSpielstand();
  };

  window.__erzweltMeldungen = {version:1};
})();
