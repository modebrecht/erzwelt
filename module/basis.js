/* Erzwelt · module/basis.js – Hook-Punkte für andere Module
   ---------------------------------------------------------------
   Lädt als erste Datei nach dem Kern und umhüllt `zeichnen` genau einmal.
   Andere Module erweitern `zeichnen` nicht mehr durch eigenes Umhüllen,
   sondern melden sich hier an:

     Erzwelt.vorZeichnen(fn)   fn läuft vor dem Kern-`zeichnen`
     Erzwelt.nachZeichnen(fn)  fn läuft nach dem Kern-`zeichnen`

   Reihenfolge (bildet die frühere Verschachtelung nach, in der die zuletzt
   geladene Hülle die äusserste war):
     - vor-Hooks laufen in UMGEKEHRTER Anmeldereihenfolge (zuletzt angemeldet zuerst),
     - nach-Hooks laufen IN Anmeldereihenfolge (zuerst angemeldet zuerst).
   Wirft ein Hook, bricht der Aufruf ab wie früher bei der Hülle (kein try/catch).
   Der Rückgabewert des Kern-`zeichnen` wird durchgereicht.
   Hooks mit `() => name()` anmelden, wenn `name` später noch ersetzt werden kann.

     Erzwelt.nachAufgabe(fn)   fn läuft am Ende jedes `questZeichnen` (module/aufgabe.js),
                               in Anmeldereihenfolge. Für Beobachter, die nichts an der
                               Aufgabenkarte ändern (z. B. Erfolg feiern). */
"use strict";
(function(){
  const vor = [], nach = [], aufgabe = [];
  const kern = zeichnen;
  zeichnen = function(){
    for (let i = vor.length - 1; i >= 0; i--) vor[i]();
    const out = kern.apply(this, arguments);
    for (let i = 0; i < nach.length; i++) nach[i]();
    return out;
  };
  window.Erzwelt = Object.freeze({
    vorZeichnen(fn){ vor.push(fn); },
    nachZeichnen(fn){ nach.push(fn); },
    nachAufgabe(fn){ aufgabe.push(fn); },
    /* nur für module/aufgabe.js */
    aufgabeGezeichnet(){ for (let i = 0; i < aufgabe.length; i++) aufgabe[i](); }
  });
})();
