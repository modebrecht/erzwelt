"use strict";
/* ============================================================
   STIL – ein Stil für das ganze Spiel

   Erzwelt behält seine Identität (Tiefsee-Karte, Papier-Blätter,
   Baloo 2 für Zahlen und Titel, Nunito für Text). Vereinheitlicht wird,
   was durch viele Patches auseinandergelaufen ist:

   Farbrollen
     Gold   #f5b73d  Tun: kaufen, bauen, einstellen, verkaufen, ausbauen.
                     Eine Hauptaktion pro Blatt.
     Grün   #2fbe7e  Wissen und Erfolg (Ansehen, Gewinn), nie für Käufe.
     Papier #ffffff + Linie #e3d7bf  Zweitaktionen: Ziel zeigen, Zum Team,
                     − / +, Neue Runde, Entlassen.
     Rot    #e0504a  Schliessen und Warnungen.
   Knöpfe
     Gross: Radius 18, 4 px Kante in dunklerem Ton. Klein: Radius 12, 3 px Kante.
   Beschriftungen
     Normale Gross-/Kleinschreibung, keine gesperrten Grossbuchstaben.
     Knopftexte als Verb: «22 Personen einstellen», «Selbst verkaufen».
   Symbole
     Nur gezeichnete Linien-Symbole im Stil der übrigen Ikonen; keine
     Emojis. Schwierigkeit als 1–3 Erzbrocken.
   Elementsymbole
     In Baloo 2 sehen I und l gleich aus: «Al» las sich wie «AI». Das kleine
     l in «Al» wird gezeichnet: senkrecht nach unten, unten ein runder Bogen
     nach rechts oben (wie in der Schulschrift).
     Das Symbol bleibt chemisch korrekt «Al».

   Das CSS dazu steht in module/stil.js (Abschnitt «aus stil.js»).
   ============================================================ */
(function(){
  const VERSION = 1;
  /* Linien-Symbole und Schwierigkeits-Brocken: module/basis.js (Erzwelt.ikon, Erzwelt.stufe) */
  const IKON = Erzwelt.ikon, stufe = Erzwelt.stufe;
  const STUFE = {einfach: 1, mittel: 2, schwer: 3};
  for (const [id, n] of Object.entries(STUFE)) if (SCHWIERIGKEIT[id]) SCHWIERIGKEIT[id].icon = stufe(n);

  /* Schwierigkeitswahl mit Brocken und Schloss statt Emojis: direkt in
     module/einfuehrung.js (Dialog und Meldung «Schwierigkeit … gewählt»). */

  /* Pause-Symbol im Wissen und Knopftexte der Seiten («Selbst verkaufen»,
     «22 Personen einstellen»): direkt in module/seiten.js; Blätter
     («Verdoppeln · »): module/blaetter.js. Der Kern schreibt den Einstell-Knopf
     beim Ziehen des Reglers «Wie viele?» neu – dort die Schreibweise anpassen. */
  const knopfText = html => html.replace(/STELLE (\d+) PERSONEN EIN/g, "$1 Personen einstellen");
  document.addEventListener("input", e => {
    if (!e.target.closest || !e.target.closest('[data-regler="anstell"]')) return;
    const k = document.querySelector('[data-tun="anstellen"]');
    if (k && /STELLE \d+ PERSONEN EIN/.test(k.innerHTML)) k.innerHTML = knopfText(k.innerHTML);
  });

  /* ---------- «Al» lesbar: kleines l mit Bogen ---------- */
  const AL = /\bAl\b/;
  // Das l als gezeichnetes Zeichen: steht auf der Grundlinie, unabhängig von der Schrift.
  const AL_HTML = 'A<span class="al-l"><span class="al-sr">l</span><svg viewBox="0 0 34 72" aria-hidden="true"><path d="M8 6V55Q8 66 18 65Q25 64 28.5 57" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  function alMarkieren(wurzel){
    if (!wurzel) return;
    const pruefen = t => {
      const el = t.parentElement;
      return el && !el.closest("svg,script,style,textarea,input,.al-text") && AL.test(t.nodeValue);
    };
    const knoten = [];
    if (wurzel.nodeType === 3){ if (pruefen(wurzel)) knoten.push(wurzel); }
    else if (wurzel.nodeType === 1){
      const w = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT);
      for (let t = w.nextNode(); t; t = w.nextNode()) if (pruefen(t)) knoten.push(t);
    }
    for (const t of knoten){
      // Ganzer Text in EIN Element, damit «Al 1» in Chips (flex) nicht zerfällt.
      const huelle = document.createElement("span");
      huelle.className = "al-text";
      t.nodeValue.split(/\bAl\b/).forEach((teil, i) => {
        if (i) huelle.insertAdjacentHTML("beforeend", AL_HTML);
        if (teil) huelle.append(teil);
      });
      t.replaceWith(huelle);
    }
  }
  if (typeof MutationObserver === "function"){
    new MutationObserver(liste => {
      for (const m of liste){
        if (m.type === "characterData") alMarkieren(m.target);
        else m.addedNodes.forEach(alMarkieren);
      }
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  alMarkieren(document.body);

  window.__erzweltStil = {version: VERSION, ikon: IKON, stufe};
  blattStand = ""; seitenStand = "";
  if (typeof zeichnen === "function") zeichnen();
})();
