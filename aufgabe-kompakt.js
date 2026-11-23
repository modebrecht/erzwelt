"use strict";
/* ============================================================
   AUFGABE KOMPAKT

   Auf dem Handy bekommt die Karte mehr Platz. Nur Darstellung:
   - Tutorial-Aufgabe: ohne «Zusammenhang» (kommt als Rückmeldung nach
     dem Schritt) und ohne Phasen-Text; «Ziel zeigen» niedriger.
   - «Wissen freigeschaltet» heisst im Kopf «Neues Wissen»; Text höchstens zwei
     Zeilen, Engpass als einzeiliger Hinweis (Antippen führt hin).
   - Auf Markt, Team und Ziel ist «Wissen freigeschaltet» eine schmale
     Zeile mit «Ansehen» (sek-b-klarheit.js: questGehoertZuSeite).
   - Meldungen unten: auf dem Handy nur die neueste, damit die Karte frei bleibt.
   ============================================================ */
(function(){
  const VERSION = 1;

  /* Kopfzeile kurz halten: «Wissen freigeschaltet» passt nicht auf eine Zeile */
  if (typeof questZeichnen === "function"){
    const vorher = questZeichnen;
    questZeichnen = function(){
      const out = vorher.apply(this, arguments);
      const art = document.getElementById("q-art");
      if (art && art.textContent === "Wissen freigeschaltet") art.textContent = "Neues Wissen";
      return out;
    };
  }
  if (typeof questZeichnen === "function") questZeichnen();
  window.__erzweltAufgabeKompakt = {version: VERSION};
})();
