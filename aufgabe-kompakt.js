"use strict";
/* ============================================================
   AUFGABE KOMPAKT

   Auf dem Handy bekommt die Karte mehr Platz. Nur Darstellung:
   - Tutorial-Aufgabe: ohne «Zusammenhang» (kommt als Rückmeldung nach
     dem Schritt) und ohne Phasen-Text; «Ziel zeigen» niedriger.
   - «Wissen freigeschaltet» heisst im Kopf «Neues Wissen»; Text ganz (die Karte
     ist minimiert und geht nur auf Wunsch auf), Engpass als einzeiliger Hinweis (Antippen führt hin).
   - Auf Markt, Team und Ziel ist «Wissen freigeschaltet» eine schmale
     Zeile mit «Ansehen» (sek-b-klarheit.js: questGehoertZuSeite).
   - Meldungen werden einzeln am Kartenrand gezeigt.
   ============================================================ */
(function(){
  const VERSION = 1;
  const style = document.createElement("style");
  style.id = "erzwelt-aufgabe-kompakt-style";
  style.textContent = `
    #quest:not(.breit) #q-titel{font-size:var(--f0)}
    /* Aufgeklappt nie höher als der Platz bis zur Leiste unten: sonst scrollen */
    #quest:not(.kompakt){max-height:calc(100dvh - var(--hudh) - var(--dockh) - 24px);overflow-y:auto;overscroll-behavior:contain}

    @media (max-width:819px){
      #quest{padding:8px 11px 10px}
      #quest .kopf{white-space:nowrap;min-width:0;letter-spacing:.03em}
      #quest .kopf #q-art{overflow:hidden;text-overflow:ellipsis;min-width:0}
      #quest b#q-titel{margin:3px 0 1px}
      #quest.kompakt #q-titel{font-size:var(--f0);white-space:normal}

      /* Tutorial auf der Karte */
      #quest:not(.breit) .tutorial-zusammenhang{display:none!important}
      #quest:not(.breit) .phase-zeile{margin-top:7px}
      #quest:not(.breit) .phase-zeile .tutorial-phase-name{display:none}
      #quest .objective-guide-action{min-height:36px;margin-top:8px;padding-top:4px;padding-bottom:4px;font-size:var(--f0)}

      /* Wissen freigeschaltet */
      #quest .wissen-quest-action{min-height:36px;margin-top:7px;padding-top:5px;padding-bottom:5px}
      #quest .engpass-kasten{margin-top:7px;padding:6px 26px 6px 9px;position:relative}
      #quest .engpass-kasten b{font-size:var(--f0)!important;margin:0!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #quest .engpass-kasten span{display:none}
      #quest .engpass-kasten::after{content:"";position:absolute;right:11px;top:50%;width:7px;height:7px;
        border:solid currentColor;border-width:2px 2px 0 0;transform:translate(0,-50%) rotate(45deg)}

      /* Auf anderen Reitern bleibt die ganze Breite für den Titel frei. */
      #quest.kompakt.wissen-bereit{padding-right:11px!important}
      #quest.kompakt.wissen-bereit > button.wissen-quest-action:not(#_){display:block!important;
        min-height:32px;padding:3px 12px;font-size:var(--f0)}
      #quest.kompakt.wissen-bereit .quest-map-cue{display:none!important}
      #quest.kompakt.wissen-bereit::after{content:none}

    }
  `;
  document.head.appendChild(style);

  /* Kopfzeile «Neues Wissen» statt «Wissen freigeschaltet»: module/quest.js */
  window.__erzweltAufgabeKompakt = {version: VERSION};
})();
