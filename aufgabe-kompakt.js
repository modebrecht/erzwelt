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
  const style = document.createElement("style");
  style.id = "erzwelt-aufgabe-kompakt-style";
  style.textContent = `
    @media (max-width:819px){
      #quest{padding:8px 11px 10px}
      #quest .kopf{white-space:nowrap;min-width:0;letter-spacing:.03em}
      #quest .kopf #q-art{overflow:hidden;text-overflow:ellipsis;min-width:0}
      #quest b#q-titel{margin:3px 0 1px}

      /* Tutorial auf der Karte */
      #quest:not(.breit) .tutorial-zusammenhang{display:none!important}
      #quest:not(.breit) .phase-zeile{margin-top:7px}
      #quest:not(.breit) .phase-zeile .tutorial-phase-name{display:none}
      #quest .objective-guide-action{min-height:36px;margin-top:8px;padding-top:4px;padding-bottom:4px;font-size:var(--f0)}

      /* Wissen freigeschaltet */
      #quest.wissen-quest #q-text{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      #quest .wissen-quest-action{min-height:36px;margin-top:7px;padding-top:5px;padding-bottom:5px}
      #quest .engpass-kasten{margin-top:7px;padding:6px 26px 6px 9px;position:relative}
      #quest .engpass-kasten b{font-size:var(--f0)!important;margin:0!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #quest .engpass-kasten span{display:none}
      #quest .engpass-kasten::after{content:"";position:absolute;right:11px;top:50%;width:7px;height:7px;
        border:solid currentColor;border-width:2px 2px 0 0;transform:translate(0,-50%) rotate(45deg)}

      /* Schmale Zeile auf anderen Reitern: «Ansehen» bleibt sichtbar */
      #quest.kompakt.wissen-bereit{padding-right:98px!important}
      #quest.kompakt.wissen-bereit > button.wissen-quest-action:not(#_){display:block!important;position:absolute;
        right:8px;top:50%;transform:translateY(-50%);width:auto;min-height:32px;margin:0;padding:3px 12px;font-size:var(--f0)}
      #quest.kompakt.wissen-bereit .quest-map-cue{display:none!important}

      /* Meldungen: nur die neueste */
      #toasts .toast:not(:last-child){display:none}
    }
  `;
  document.head.appendChild(style);

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
