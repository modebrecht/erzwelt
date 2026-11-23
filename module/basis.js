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
                               Aufgabenkarte ändern (z. B. Erfolg feiern).

   Gemeinsame Bausteine (früher stil.js; hier, weil module/einfuehrung.js sie schon
   beim Laden für die Schwierigkeitswahl braucht):
     Erzwelt.ikon              Linien-Symbole: warnung, pause, schloss, laster
     Erzwelt.stufe(n)          Schwierigkeit als 1–3 gefüllte Erzbrocken (SVG) */
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
  const linie = inhalt => `<svg class="stil-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inhalt}</svg>`;
  const IKON = {
    warnung: linie('<path d="M12 3.6 2.9 19.4h18.2z"/><path d="M12 9.6v4.4M12 16.9v.1"/>'),
    pause:   linie('<path d="M9 6.5v11M15 6.5v11" stroke-width="2.6"/>'),
    schloss: linie('<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>'),
    laster:  linie('<path d="M2.6 6.6h10.9v9H2.6z"/><path d="M13.5 9.4h4.1l3 3.3v2.9h-7.1"/><circle cx="6.8" cy="17.3" r="1.8"/><circle cx="17" cy="17.3" r="1.8"/>')
  };
  // Unregelmässige Brocken mit einer Bruchkante, damit sie nach Erz aussehen und nicht nach Waben.
  const BROCKEN = [
    {d:"M2.8 18.2 4.9 14.3 8.6 13.4 11.6 15.1 11.9 18.6 9.4 20.9 5 20.6Z", kante:"M4.9 14.3 7.6 17.2 11.9 18.6M7.6 17.2 5 20.6"},
    {d:"M12.6 17.4 14.1 13.6 17.6 12.4 21 14.2 21.4 17.9 19 20.5 15.2 20.4Z", kante:"M17.6 12.4 17.9 16.6 21.4 17.9M17.9 16.6 15.2 20.4"},
    {d:"M7.2 9.4 8.9 5.6 12.8 4.3 16.3 6.1 16.9 9.6 14.6 12.4 10.3 12.5Z", kante:"M8.9 5.6 12.4 8.6 16.9 9.6M12.4 8.6 10.3 12.5"}
  ];
  const stufe = n => `<svg class="stil-stufe" viewBox="0 0 24 24" aria-hidden="true">${BROCKEN.map((b, i) => i < n
    ? `<path d="${b.d}" fill="#f5b73d" stroke="#9a680b" stroke-width="1.4" stroke-linejoin="round"/><path d="${b.kante}" fill="none" stroke="#c48d1c" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${b.d}" fill="none" stroke="#c9b994" stroke-width="1.4" stroke-linejoin="round" stroke-dasharray="2 1.6"/>`).join("")}</svg>`;
  window.Erzwelt = Object.freeze({
    ikon: IKON,
    stufe,
    vorZeichnen(fn){ vor.push(fn); },
    nachZeichnen(fn){ nach.push(fn); },
    nachAufgabe(fn){ aufgabe.push(fn); },
    /* nur für module/aufgabe.js */
    aufgabeGezeichnet(){ for (let i = 0; i < aufgabe.length; i++) aufgabe[i](); }
  });
})();
