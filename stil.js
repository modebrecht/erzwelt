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
  const linie = inhalt => `<svg class="stil-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inhalt}</svg>`;
  const IKON = {
    warnung: linie('<path d="M12 3.6 2.9 19.4h18.2z"/><path d="M12 9.6v4.4M12 16.9v.1"/>'),
    pause:   linie('<path d="M9 6.5v11M15 6.5v11" stroke-width="2.6"/>'),
    schloss: linie('<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>'),
    laster:  linie('<path d="M2.6 6.6h10.9v9H2.6z"/><path d="M13.5 9.4h4.1l3 3.3v2.9h-7.1"/><circle cx="6.8" cy="17.3" r="1.8"/><circle cx="17" cy="17.3" r="1.8"/>')
  };
  /* Schwierigkeit: 1–3 gefüllte Erzbrocken */
  // Unregelmässige Brocken mit einer Bruchkante, damit sie nach Erz aussehen und nicht nach Waben.
  const BROCKEN = [
    {d:"M2.8 18.2 4.9 14.3 8.6 13.4 11.6 15.1 11.9 18.6 9.4 20.9 5 20.6Z", kante:"M4.9 14.3 7.6 17.2 11.9 18.6M7.6 17.2 5 20.6"},
    {d:"M12.6 17.4 14.1 13.6 17.6 12.4 21 14.2 21.4 17.9 19 20.5 15.2 20.4Z", kante:"M17.6 12.4 17.9 16.6 21.4 17.9M17.9 16.6 15.2 20.4"},
    {d:"M7.2 9.4 8.9 5.6 12.8 4.3 16.3 6.1 16.9 9.6 14.6 12.4 10.3 12.5Z", kante:"M8.9 5.6 12.4 8.6 16.9 9.6M12.4 8.6 10.3 12.5"}
  ];
  const stufe = n => `<svg class="stil-stufe" viewBox="0 0 24 24" aria-hidden="true">${BROCKEN.map((b, i) => i < n
    ? `<path d="${b.d}" fill="#f5b73d" stroke="#9a680b" stroke-width="1.4" stroke-linejoin="round"/><path d="${b.kante}" fill="none" stroke="#c48d1c" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="${b.d}" fill="none" stroke="#c9b994" stroke-width="1.4" stroke-linejoin="round" stroke-dasharray="2 1.6"/>`).join("")}</svg>`;
  const STUFE = {einfach: 1, mittel: 2, schwer: 3};
  for (const [id, n] of Object.entries(STUFE)) if (SCHWIERIGKEIT[id]) SCHWIERIGKEIT[id].icon = stufe(n);

  /* ---------- Emojis ersetzen ---------- */
  const EMOJI_STUFE = /^\s*(?:🌱|⚙️|⚙|🔥)\s*/;
  const vorherNotiz = notiz;
  notiz = function(text, art){
    if (typeof text === "string") text = text.replace(EMOJI_STUFE, "");
    return vorherNotiz.call(this, text, art);
  };

  const vorherSchwierigkeit = schwierigkeitZeigen;
  schwierigkeitZeigen = function(){
    const out = vorherSchwierigkeit.apply(this, arguments);
    const ids = ["einfach", "mittel", "schwer"];
    document.querySelectorAll("#d-wahlen .wahl.schwierigkeit").forEach((b, i) => {
      const ic = b.querySelector(".schwierigkeitsicon");
      if (ic && ids[i]) ic.innerHTML = stufe(STUFE[ids[i]]);
      const sp = b.querySelector(".sperre");
      if (sp) sp.innerHTML = sp.innerHTML.replace("🔒", IKON.schloss);
    });
    return out;
  };
  if (!$("#schleier").hidden && $("#d-titel").textContent === "Wähle die Schwierigkeit") schwierigkeitZeigen();

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
