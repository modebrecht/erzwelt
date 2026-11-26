"use strict";
/* ============================================================
   ZIEL POSITIV

   Der Ziel-Reiter beginnt mit dem, was das Geschäft jeden Monat bringt,
   statt mit einem tiefroten Etappengewinn direkt nach den Investitionen:
   - Hauptzahl: laufendes Geschäft im letzten Monat (Einnahmen minus Löhne
     und Betrieb), mit Trend und kleinem Verlauf der letzten Monate.
   - Prognose: Reicht dieses Tempo bis zum Etappenziel? Sonst ein konkreter
     Hinweis, was hilft.
   - Investitionen werden als Aufbau erklärt, nicht als Verlust.
   Nur Anzeige; der Monatsverlauf wird im Spielstand mitgeschrieben
   (S.monatsVerlauf, letzte 6 Monate).
   ============================================================ */
(function(){
  const VERSION = 1;

  const plusMinus = v => (v >= 0 ? "+" : "−") + chf(Math.abs(Math.round(v))).replace(/^CHF\s*/, textVon("zielpositiv.chf"));

  function balken(v){
    if (!v || v.length < 2) return "";
    const max = Math.max(1, ...v.map(x => Math.abs(x.wert)));
    return `<div class="ziel-verlauf" aria-label="Laufendes Geschäft der letzten Monate">${v.map((x, i) => {
      const h = Math.max(6, Math.round(Math.abs(x.wert) / max * 100));
      return `<span class="${x.wert >= 0 ? "plus" : "minus"} ${i === v.length - 1 ? "jetzt" : ""}" style="--h:${h}%" title="${plusMinus(x.wert)}"></span>`;
    }).join("")}</div>`;
  }

  function prognose(laufend){
    const api = window.__erzweltLogikFixes;
    const ziel = api && typeof api.zielGewinn === "function" ? api.zielGewinn() : ZIEL_GEWINN;
    const gewinn = etappenGewinn();
    const fehlt = ziel - gewinn;
    const restMonate = Math.max(0, Math.floor((etappenEnde() - S.tag + 1) / 30));
    if (fehlt <= 0) return textVon("zielpositiv.gewinnziel-erreicht-fuer-die", {p1:(ZIEL_RUF)});
    if (laufend === null) return `<div class="ziel-prognose">Bis zum Ziel fehlen noch <b>${chf(fehlt)}</b>. Nach dem ersten Monat siehst du hier, ob dein Tempo reicht.</div>`;
    if (laufend <= 0) return textVon("zielpositiv.bis-zum-ziel-fehlen", {p1:(chf(fehlt))});
    const monate = Math.ceil(fehlt / laufend);
    if (monate <= restMonate) return textVon("zielpositiv.bei-diesem-tempo-erreichst", {p1:(monate), p2:(monate === 1 ? "Monat" : "Monaten"), p3:(restMonate)});
    const ende = Math.round(fehlt - laufend * restMonate);
    return `<div class="ziel-prognose">Bei diesem Tempo fehlen am Ende rund <b>${chf(ende)}</b>. Mehr Gewinn bringt ein Ausbau der Kette oder ein zweites Produkt.</div>`;
  }

  function heldKarte(){
    const mb = S.monatsBilanz;
    const laufend = mb && mb.letzt !== null && mb.letzt !== undefined ? Math.round(mb.letzt) : null;
    const v = S.monatsVerlauf || [];
    const vor = v.length >= 2 ? v[v.length - 2].wert : null;
    const trend = laufend === null || vor === null ? "" : laufend > vor ? "▲" : laufend < vor ? "▼" : "►";
    const imMonat = (S.tag - 1) % 30;                 // Abrechnung an Tag 31, 61, …
    const naechster = S.tag + (imMonat === 0 ? 30 : 30 - imMonat);
    const zahl = laufend === null
      ? textVon("zielpositiv.noch-offen-erste-monatsabrechnung", {p1:(naechster)})
      : textVon("zielpositiv.einnahmen-minus-loehne-und", {p1:(laufend >= 0 ? "plus" : "minus"), p2:(plusMinus(laufend)), p3:(trend ? ` <i class="ziel-trend">${trend}</i>` : "")});
    return textVon("zielpositiv.laufendes-geschaeft-pro-monat", {p1:(zahl), p2:(balken(v)), p3:(prognose(laufend))});
  }

  /* (Reihenfolge: module/seiten.js) */
  (window.__erzweltSeitenTeile ||= {}).zielPositiv = function(html){
    // Held direkt unter Titel und Untertitel
    html = html.replace(/(<div class="unter">[\s\S]*?<\/div>)/, `$1${heldKarte()}`);
    // Investitionen als Aufbau erklären
    html = html.replace(/<span>Etappengewinn<\/span>/, textVon("zielpositiv.etappengewinn-mit-investitionen"));
    html = html.replace(textVon("zielpositiv.investitionen-standorte-ausbau-leute"),
      textVon("zielpositiv.investitionen-sind-dein-aufbau"));
    return html;
  };

  const style = document.createElement("style");
  style.id = "erzwelt-ziel-positiv-style";
  style.textContent = `
    .ziel-held{background:linear-gradient(160deg,#fffdf6,#eef7f1);border:2px solid #cfe6d8}
    .ziel-held > small{display:block;font-size:var(--f0);font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--grau)}
    .ziel-held-zahl{display:block;font-family:"Baloo 2",sans-serif;font-size:clamp(30px,9vw,40px);line-height:1.1;margin:2px 0 0;font-variant-numeric:tabular-nums}
    .ziel-held-zahl.plus{color:#1f7a4f}
    .ziel-held-zahl.minus{color:var(--alarm)}
    .ziel-held-zahl.leer{color:var(--grau);font-size:var(--f4)}
    .ziel-held-zahl .ziel-trend{font-style:normal;font-size:.55em;vertical-align:middle}
    .ziel-held > span{display:block;color:var(--grau);font-size:var(--f0);font-weight:700}
    .ziel-verlauf{display:flex;align-items:flex-end;gap:5px;height:42px;margin:10px 0 2px}
    .ziel-verlauf span{flex:1;height:var(--h);border-radius:5px 5px 2px 2px;background:#9fd3b6}
    .ziel-verlauf span.minus{background:#f0a9a4}
    .ziel-verlauf span.jetzt.plus{background:#2fa36b}
    .ziel-verlauf span.jetzt.minus{background:var(--alarm)}
    .ziel-prognose{margin-top:10px;padding:8px 10px;border-radius:10px;background:#fff;color:var(--tinte,#2b2116);font-size:var(--f0);font-weight:600;line-height:1.35}
    .ziel-prognose.gut{background:#e3f4ea;color:#1d5d40}
    .ziel-prognose.warn{background:#fff1e0;color:#6b4206}
    .ziel-klein{color:var(--grau);font-weight:700;font-size:11px}
  `;
  document.head.appendChild(style);

  seitenStand = "";
  window.__erzweltZielPositiv = {version: VERSION};
})();
