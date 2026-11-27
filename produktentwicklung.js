"use strict";
/* ============================================================
   PRODUKTENTWICKLUNG (Forschung im Wissen-Reiter)

   Freiwillig, nur auf Mittel und Schwer, erst nach der Einführung.
   Kein Gebäude, kein Kartensymbol, keine neue Pflichtaufgabe.

   - Pro Produkt Stufe 1–3. Preisfaktor 1.00 / 1.05 / 1.10 gegenüber dem
     Original (nicht zusammengesetzt). Wirkt nur auf den Verkaufspreis dieses
     Produkts, zusätzlich zu Lager, Dollar, Verbesserungen und Schwierigkeit.
   - Drei Forscher zur Wahl, je Projekt genau einer:
       Junior      CHF 2'850 pro Monat, 30 Spieltage
       Spezialistin CHF 4'500 pro Monat, 25 Spieltage
       Experte     CHF 6'500 pro Monat, 20 Spieltage
   - Projektgebühr einmal beim Start, gemessen am Umsatz einer vollen Fabrik
     dieses Produkts (Preis × Stück pro Tag, höchstens die Grundnachfrage):
     Stufe 2 = 6 Tagesumsätze (≈ 4 Monate Mehrerlös bei vollem Absatz),
     Stufe 3 = 12 Tagesumsätze, auf CHF 1'000 gerundet. So lohnt sich
     Forschung früh, spät eher nicht (Messung: docs/produktentwicklung.md).
   - Lohn nur an Forschungstagen: Monatslohn / 30 pro Spieltag, direkt aus
     der Kasse (S.kasse, S.ausgegeben). Nach dem letzten Tag kein Lohn mehr.
   - Ein Projekt zugleich. Kein Abbruch, keine Rückerstattung.

   Ablauf eines Spieltags (didactic-should.js, tagVor): Abbau → Raffination →
   Produktion → Verkauf → Monatsende → Forschungstag → Markt → Ereignisse →
   Etappenende → Speichern. Der Forschungstag bezahlt den Lohn dieses Tages
   und zählt einen Tag. Ist das Projekt fertig, gilt die neue Stufe ab dem
   Verkauf des nächsten Tages. Pause, Menü, Hintergrund: kein Spieltag,
   also auch kein Forschungstag.

   Zustand pro Spielstand: S.produktForschung = {
     stufen:{kabel:2, …},
     aktiv:null | {produkt, ziel, forscher, start, tage, dauer, lohnMonat, gebuehr, lohnBezahlt}
   }  (Prüfung beim Laden/Import: spielstaende-daten.js → pruefen())
   ============================================================ */
(function(){
  const VERSION = 1;
  const FORSCHER = {
    junior:     {lohn:2850, tage:30},
    spezialist: {lohn:4500, tage:25},
    experte:    {lohn:6500, tage:20}
  };
  const PREISFAKTOR = {1:1, 2:1.05, 3:1.10};
  const GEBUEHR_TAGE = {2:6, 3:12};
  const MAX_STUFE = 3;

  const tagesUmsatz = p => PRODUKT[p].preis * Math.min(PRODUKT[p].plaetze * PRODUKT[p].proArbeiter, PRODUKT[p].nachfrage);
  const gebuehr = (p, ziel) => Math.round(tagesUmsatz(p) * GEBUEHR_TAGE[ziel] / 1000) * 1000;
  const projektLohn = forscher => FORSCHER[forscher].lohn * FORSCHER[forscher].tage / 30;
  const stufe = p => {
    const s = S.produktForschung?.stufen?.[p];
    return Number.isInteger(s) && s >= 1 && s <= MAX_STUFE ? s : 1;
  };
  const faktor = p => PREISFAKTOR[stufe(p)];
  const aktiv = () => S.produktForschung?.aktiv || null;
  const hatFabrik = p => S.fabriken.some(f => f.produkt === p);
  const offen = () => (S.schwierigkeit === "mittel" || S.schwierigkeit === "schwer") && !tutorialLaeuft();

  /* ---------- Preis: nur das erforschte Produkt, nur der Verkaufspreis ---------- */
  const kernPreis = warenPreis;
  warenPreis = function(p){ return kernPreis(p) * faktor(p); };

  /* ---------- Absatz der letzten Tage (nur für die Schätzung, nicht gespeichert) ---------- */
  const verlauf = [];   // [{tag, verkauft:{p:n}}]
  function absatzMerken(){
    const produkte = S.leistungsdaten?.produkte || {};
    const verkauft = {};
    for (const p in PRODUKT) verkauft[p] = produkte[p]?.verkauft || 0;
    verlauf.push({tag:S.tag, verkauft});
    while (verlauf.length > 31) verlauf.shift();
  }
  function absatzProTag(p){
    if (verlauf.length >= 8){
      const a = verlauf[0], b = verlauf[verlauf.length - 1];
      return Math.max(0, (b.verkauft[p] - a.verkauft[p]) / Math.max(1, b.tag - a.tag));
    }
    const d = S.leistungsdaten;
    if (!d || !d.produkte?.[p]) return 0;
    return d.produkte[p].verkauft / Math.max(1, S.tag - (d.abTag || 1) + 1);
  }

  /* ---------- Forschungstag (aus tagVor) ---------- */
  function forschungTag(){
    absatzMerken();
    const a = aktiv();
    if (!a) return;
    const lohn = a.lohnMonat / 30;
    S.kasse -= lohn; S.ausgegeben += lohn;
    a.lohnBezahlt += lohn;
    a.tage += 1;
    if (a.tage < a.dauer) return;
    // fertig: Stufe setzen, Forscher geht, ab morgen gilt der neue Preis
    S.produktForschung.stufen[a.produkt] = a.ziel;
    S.produktForschung.aktiv = null;
    notiz(textVon("forschung.fertigMeldung", {produkt:PRODUKT[a.produkt].name, stufe:a.ziel,
      prozent:Math.round((PREISFAKTOR[a.ziel] - 1) * 100)}), "gut");
    window.__erzweltErfolgFeier?.feiern?.(false);
  }
  (window.__erzweltTagTeile ||= {}).forschung = forschungTag;

  /* ---------- Starten ---------- */
  function startenMoeglich(p, forscher){
    if (!offen()) return "zu";
    if (aktiv()) return "laeuft";
    if (!PRODUKT[p] || !FORSCHER[forscher]) return "zu";
    if (stufe(p) >= MAX_STUFE) return "max";
    if (!hatFabrik(p)) return "fabrik";
    if (S.ende || modalOffen) return "zu";
    if (S.kasse < gebuehr(p, stufe(p) + 1) + projektLohn(forscher)) return "geld";
    return "";
  }
  function starten(p, forscher){
    if (startenMoeglich(p, forscher)) return false;
    const ziel = stufe(p) + 1, g = gebuehr(p, ziel), f = FORSCHER[forscher];
    S.kasse -= g; S.ausgegeben += g;
    const daten = S.produktForschung || {stufen:{}, aktiv:null};
    daten.aktiv = {produkt:p, ziel, forscher, start:S.tag, tage:0, dauer:f.tage, lohnMonat:f.lohn, gebuehr:g, lohnBezahlt:0};
    S.produktForschung = daten;
    notiz(textVon("forschung.startMeldung", {produkt:PRODUKT[p].name, stufe:ziel, forscher:textVon("forschung.forscher." + forscher),
      tage:f.tage, gebuehr:chf(g)}), "geld");
    if (typeof speichern === "function") speichern();
    return true;
  }

  /* ---------- Prüfung beim Laden und Import ---------- */
  function pruefen(f, tag){
    const ganz = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
    if (!f || typeof f !== "object" || Array.isArray(f)) return false;
    const stufen = f.stufen;
    if (!stufen || typeof stufen !== "object" || Array.isArray(stufen)) return false;
    for (const [p, s] of Object.entries(stufen)) if (!Object.hasOwn(PRODUKT, p) || !ganz(s, 1, MAX_STUFE)) return false;
    for (const k of Object.keys(f)) if (k !== "stufen" && k !== "aktiv") return false;
    const a = f.aktiv;
    if (a === null || a === undefined) return true;
    if (typeof a !== "object" || Array.isArray(a)) return false;
    const felder = ["produkt", "ziel", "forscher", "start", "tage", "dauer", "lohnMonat", "gebuehr", "lohnBezahlt"];
    if (Object.keys(a).length !== felder.length || !felder.every(k => Object.hasOwn(a, k))) return false;
    if (!Object.hasOwn(PRODUKT, a.produkt) || !Object.hasOwn(FORSCHER, a.forscher)) return false;
    const vorher = Number.isInteger(stufen[a.produkt]) ? stufen[a.produkt] : 1;
    const def = FORSCHER[a.forscher];
    return a.ziel === vorher + 1 && a.ziel <= MAX_STUFE
      && a.dauer === def.tage && a.lohnMonat === def.lohn
      && ganz(a.start, 1, tag) && ganz(a.tage, 0, a.dauer - 1) && a.start + a.tage === tag
      && a.gebuehr === gebuehr(a.produkt, a.ziel)
      && Number.isFinite(a.lohnBezahlt) && Math.abs(a.lohnBezahlt - a.tage * def.lohn / 30) < 0.01;
  }

  /* ---------- Ansicht im Wissen-Reiter ---------- */
  const wahl = {reiter:"wissen", produkt:null, forscher:"junior"};

  /* Personen-Silhouetten für die Forscherwahl (eigene Zeichnung, 48 × 48):
     Junior mit Kapuzenpulli, Spezialistin mit Bob und Blazer,
     Experte mit Laborkittel, grauem Bart und Brille. */
  const SILHOUETTE = {
      "junior": "<path d=\"M3.2 48.5C3.5 40.4 6.8 34.4 12.4 32.5l7.4-3.4 4.2 2.6 4.2-2.6 7.4 3.4c5.6 1.9 8.9 7.9 9.2 16z\"/><path d=\"M15.6 32.4c2.2-1.9 5-2.9 8.4-2.9s6.2 1 8.4 2.9\" fill=\"none\" stroke=\"#fffaf0\" stroke-width=\"1.3\" stroke-linecap=\"round\"/><path d=\"M21.4 34.6v5.6M26.6 34.6v5.6\" stroke=\"#fffaf0\" stroke-width=\"1.1\" stroke-linecap=\"round\"/><path d=\"M20 20.5h8v10.3L24 33l-4-2.2z\"/><ellipse cx=\"16.8\" cy=\"17\" rx=\"1.4\" ry=\"2.2\"/><ellipse cx=\"31.2\" cy=\"17\" rx=\"1.4\" ry=\"2.2\"/><ellipse cx=\"24\" cy=\"16\" rx=\"7.1\" ry=\"7.9\"/><path d=\"M16.4 15.8c-1-5.8 2.2-10.4 7.6-10.4 5.6 0 8.6 4.4 7.6 10.4-.6-1.9-1.5-3.2-2.7-4-1.2 1.1-2.9 1.6-4.6 1.2-1.4.9-3.2 1.2-5 .7-1.3.4-2.3 1-2.9 2.1z\"/><path d=\"M18.6 7.4c1.2-1.4 2.8-2.2 4.6-2.4-.6.8-.9 1.6-.8 2.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/>",
      "spezialist": "<path d=\"M14.9 17.6c-.4-7.4 3.6-11.8 9.1-11.8s9.5 4.4 9.1 11.8l.9 8.8c-1.8 1.3-3.9 2-6.1 2.1v-7.1h-7.8v7.1c-2.2-.1-4.3-.8-6.1-2.1z\"/><path d=\"M3.2 48.5C3.5 40.4 6.8 34.4 12.4 32.5l7.4-3.4 4.2 2.6 4.2-2.6 7.4 3.4c5.6 1.9 8.9 7.9 9.2 16z\"/><path d=\"M18.4 31.4l5.6 7.4 5.6-7.4\" fill=\"none\" stroke=\"#fffaf0\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle cx=\"24\" cy=\"42.6\" r=\"1.1\" fill=\"#fffaf0\"/><path d=\"M20 20.5h8v10.3L24 33l-4-2.2z\"/><ellipse cx=\"24\" cy=\"16\" rx=\"7.1\" ry=\"7.9\"/><path d=\"M16.9 15.6c.4-5.2 3.2-8.4 7.4-8.4 3.2 0 5.7 1.8 6.8 4.8-2.7-.3-5.8-1.4-8-3.2-1.5 3.5-3.6 5.5-6.2 6.8z\"/>",
      "experte": "<path fill=\"#fffaf0\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M4.1 48.8C4.4 40.9 7.6 35.1 13 33.2l7-3.2 4 2.6 4-2.6 7 3.2c5.4 1.9 8.6 7.7 8.9 15.6z\"/><path d=\"M20.2 31.4L24 41.4l3.8-10-3.8 2.2z\"/><path d=\"M17.6 31.6l4.8 11M30.4 31.6l-4.8 11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"/><path d=\"M32.6 40.2h5.2\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"/><path d=\"M34.8 36.8v3.2\" stroke=\"#c2562a\" stroke-width=\"1.4\" stroke-linecap=\"round\"/><path d=\"M20 20.5h8v10.3L24 33l-4-2.2z\"/><ellipse cx=\"16.8\" cy=\"17\" rx=\"1.4\" ry=\"2.2\"/><ellipse cx=\"31.2\" cy=\"17\" rx=\"1.4\" ry=\"2.2\"/><ellipse cx=\"24\" cy=\"16\" rx=\"7.1\" ry=\"7.9\"/><path fill=\"#b3ada4\" d=\"M16.6 16.8c-.9-4.4.3-7.4 2.6-8.6-.1 2 .4 3.6 1.4 4.8-1.8.8-3.2 2-4 3.8zM31.4 16.8c.9-4.4-.3-7.4-2.6-8.6.1 2-.4 3.6-1.4 4.8 1.8.8 3.2 2 4 3.8z\"/><path fill=\"#b3ada4\" d=\"M18.4 19.8c.5 4.8 2.8 7.4 5.6 7.4s5.1-2.6 5.6-7.4c-1.5 1.3-3.4 1.9-5.6 1.9s-4.1-.6-5.6-1.9z\"/><g fill=\"none\" stroke=\"#fffaf0\" stroke-width=\"1.3\"><rect x=\"18.2\" y=\"14.4\" width=\"4.7\" height=\"3.5\" rx=\"1.5\"/><rect x=\"25.1\" y=\"14.4\" width=\"4.7\" height=\"3.5\" rx=\"1.5\"/><path d=\"M22.9 15.7h2.2\"/></g>"
  };
  const silhouette = id => `<svg class="pe-person" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${SILHOUETTE[id]}</svg>`;
  const t = (k, w) => textVon("forschung." + k, w);
  const prozent = s => Math.round((PREISFAKTOR[s] - 1) * 100);

  function reiterLeiste(){
    const knopf = (id, text) => `<button type="button" role="tab" class="pe-reiter${wahl.reiter === id ? " aktiv" : ""}"
      aria-selected="${wahl.reiter === id}" data-pe-reiter="${id}">${text}</button>`;
    return `<div class="pe-reiterleiste" role="tablist" aria-label="${t("bereiche")}">
      ${knopf("wissen", t("reiterWissen"))}${knopf("forschung", t("reiterForschung"))}</div>`;
  }

  function laufendKarte(a){
    const def = FORSCHER[a.forscher];
    return `<div class="karte pe-laeuft" role="status">
      <div class="zeile"><b>${t("laeuft")}</b><span class="pe-marke">${t("stufeKurz", {stufe:a.ziel})}</span></div>
      <p>${t("laeuftText", {produkt:PRODUKT[a.produkt].name, stufe:a.ziel, forscher:t("forscher." + a.forscher)})}</p>
      <div class="leiste" role="progressbar" aria-valuemin="0" aria-valuemax="${a.dauer}" aria-valuenow="${a.tage}"
        aria-label="${t("fortschritt")}"><i style="width:${(a.tage / a.dauer * 100).toFixed(1)}%;background:var(--gruen)"></i></div>
      <div class="zeile"><span>${t("tage", {tage:a.tage, dauer:a.dauer})}</span><span>${t("fertigAm", {tag:a.start + a.dauer})}</span></div>
      <div class="zeile"><span>${t("bisherBezahlt")}</span><b>${chf(a.gebuehr + a.lohnBezahlt)}</b></div>
      <small>${t("laeuftHilfe", {lohn:chf(def.lohn)})}</small>
    </div>`;
  }

  function produktListe(){
    return `<div class="pe-produkte" role="radiogroup" aria-label="${t("produktWaehlen")}">` + Object.keys(PRODUKT).map(p => {
      const s = stufe(p), fabrik = hatFabrik(p);
      const laeuft = aktiv()?.produkt === p;
      const hinweis = laeuft ? t("laeuftStufe", {stufe:s + 1}) : s >= MAX_STUFE ? t("hoechsteStufe")
        : !fabrik ? t("zuerstFabrik") : t("naechste", {stufe:s + 1, prozent:prozent(s + 1)});
      const gewaehlt = wahl.produkt === p;
      return `<button type="button" role="radio" class="pe-produkt${gewaehlt ? " gewaehlt" : ""}" aria-checked="${gewaehlt}"
        data-pe-produkt="${p}"${!fabrik || s >= MAX_STUFE ? ' aria-disabled="true"' : ""}>
        <span><b>${PRODUKT[p].name}</b><small>${hinweis}</small></span>
        <span class="pe-marke${s > 1 ? " gut" : ""}">${t("stufeKurz", {stufe:s})}${s > 1 ? " · +" + prozent(s) + " %" : ""}</span>
      </button>`;
    }).join("") + `</div>`;
  }

  function planKarte(p){
    const s = stufe(p), ziel = s + 1, g = gebuehr(p, ziel);
    const preisJetzt = warenPreis(p), preisDanach = preisJetzt / PREISFAKTOR[s] * PREISFAKTOR[ziel];
    const absatz = absatzProTag(p);
    const mehrMonat = absatz * 30 * (preisDanach - preisJetzt);
    const forscherKarten = Object.entries(FORSCHER).map(([id, f]) => {
      const gewaehlt = wahl.forscher === id;
      return `<button type="button" role="radio" class="pe-forscher${gewaehlt ? " gewaehlt" : ""}" aria-checked="${gewaehlt}" data-pe-forscher="${id}">
        ${silhouette(id)}<span class="pe-forscher-text">
        <b>${t("forscher." + id)}</b>
        <small>${t("forscherZeile", {lohn:chf(f.lohn), tage:f.tage})}</small>
        <small>${t("forscherProjekt", {lohn:chf(projektLohn(id))})}</small></span></button>`;
    }).join("");
    const lohn = projektLohn(wahl.forscher), gesamt = g + lohn;
    const grund = startenMoeglich(p, wahl.forscher);
    const knopfText = grund === "laeuft" ? t("laeuft") : grund === "geld" ? t("zuWenigGeld", {betrag:chf(gesamt)}) : t("starten", {betrag:chf(gesamt)});
    const rueckzahl = mehrMonat > 1 ? gesamt / mehrMonat : 0;
    return `<div class="karte pe-plan">
      <h3>${PRODUKT[p].name}: ${t("stufeKurz", {stufe:s})} → ${t("stufeKurz", {stufe:ziel})}</h3>
      <p>${t("wirkung", {prozent:prozent(ziel)})}</p>
      <div class="zeile"><span>${t("stueckpreis")}</span><b>${t("preisVonBis", {jetzt:chf(preisJetzt), danach:chf(preisDanach)})}</b></div>
      <h4>${t("forscherWaehlen")}</h4>
      <div class="pe-forscherwahl" role="radiogroup" aria-label="${t("forscherWaehlen")}">${forscherKarten}</div>
      <div class="pe-kosten">
        <div class="zeile"><span>${t("gebuehr")}</span><b>${chf(g)}</b></div>
        <div class="zeile"><span>${t("lohnProjekt", {tage:FORSCHER[wahl.forscher].tage})}</span><b>${chf(lohn)}</b></div>
        <div class="zeile pe-summe"><span>${t("gesamt")}</span><b>${chf(gesamt)}</b></div>
      </div>
      <div class="notiz">${absatz > 0
        ? t("mehrerloes", {betrag:chf(mehrMonat), stueck:absatz.toLocaleString("de-CH", {maximumFractionDigits:1})})
          + (rueckzahl ? " " + t("rueckzahlung", {monate:rueckzahl.toLocaleString("de-CH", {maximumFractionDigits:1})}) : "")
        : t("keinAbsatz")} ${t("keinGewinn")}</div>
      <button type="button" class="cta" data-pe-start="${p}" ${grund ? "disabled" : ""}>${knopfText}</button>
    </div>`;
  }

  function panel(){
    const kopf = `<div class="karte pe-kopf"><h2>${t("titel")}</h2><p>${t("einleitung")}</p></div>`;
    if (S.schwierigkeit !== "mittel" && S.schwierigkeit !== "schwer") return kopf + `<div class="karte notiz">${t("nurMittelSchwer")}</div>`;
    if (tutorialLaeuft()) return kopf + `<div class="karte notiz">${t("nachEinfuehrung")}</div>`;
    const a = aktiv();
    if (!wahl.produkt || !PRODUKT[wahl.produkt]) wahl.produkt = Object.keys(PRODUKT).find(p => hatFabrik(p) && stufe(p) < MAX_STUFE) || null;
    const plan = !a && wahl.produkt && hatFabrik(wahl.produkt) && stufe(wahl.produkt) < MAX_STUFE ? planKarte(wahl.produkt) : "";
    return kopf + (a ? laufendKarte(a) : "")
      + `<h3 class="pe-zwischentitel">${t("produkte")}</h3>` + produktListe()
      + (a ? `<div class="karte notiz">${t("einProjekt")}</div>` : plan || `<div class="karte notiz">${t("keinProdukt")}</div>`);
  }

  /* Nach seiteWissen (module/seiten.js): Reiter «Wissen & Verbesserungen» | «Produktentwicklung» */
  (window.__erzweltSeitenTeile ||= {}).produktentwicklung = function(html){
    const schnitt = html.indexOf('<div class="karte"');
    if (schnitt < 0) return html;
    const kopf = html.slice(0, schnitt), rest = html.slice(schnitt);
    return kopf + reiterLeiste() + (wahl.reiter === "forschung" ? `<div class="pe-bereich" role="tabpanel">${panel()}</div>` : rest);
  };
  function neuZeichnen(){
    if (typeof aktiveSeite !== "undefined" && aktiveSeite === "wissen" && typeof seiteFuellen === "function"){
      seitenStand = "";
      seiteFuellen("wissen");
    }
  }
  document.addEventListener("click", e => {
    const ziel = e.target.closest?.("[data-pe-reiter], [data-pe-produkt], [data-pe-forscher], [data-pe-start]");
    if (!ziel) return;
    if (ziel.dataset.peReiter){ wahl.reiter = ziel.dataset.peReiter; neuZeichnen(); document.querySelector(`[data-pe-reiter="${wahl.reiter}"]`)?.focus(); return; }
    if (ziel.dataset.peProdukt){
      if (ziel.getAttribute("aria-disabled") === "true") return;
      wahl.produkt = ziel.dataset.peProdukt; neuZeichnen(); return;
    }
    if (ziel.dataset.peForscher){ wahl.forscher = ziel.dataset.peForscher; neuZeichnen(); document.querySelector(`[data-pe-forscher="${wahl.forscher}"]`)?.focus(); return; }
    if (ziel.dataset.peStart){
      if (starten(ziel.dataset.peStart, wahl.forscher)){ neuZeichnen(); if (typeof zeichnen === "function") zeichnen(); }
    }
  });

  const stil = document.createElement("style");
  stil.id = "erzwelt-produktentwicklung-style";
  stil.textContent = `
    .pe-reiterleiste{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 12px;padding:4px;background:#e9dfc9;border-radius:14px}
    .pe-reiter{border:0;border-radius:11px;padding:10px 8px;min-height:44px;background:transparent;color:var(--tinte);
      font:800 var(--f2)/1.15 "Baloo 2",sans-serif;cursor:pointer}
    .pe-reiter.aktiv{background:#fff;box-shadow:0 2px 6px #0001}
    .pe-kopf h2{margin:0 0 4px;font:800 var(--f4)/1.15 "Baloo 2",sans-serif}
    .pe-kopf p,.pe-plan p,.pe-laeuft p{margin:4px 0;font-size:var(--f1)}
    .pe-zwischentitel{margin:14px 2px 6px;font:800 var(--f3)/1.2 "Baloo 2",sans-serif}
    .pe-produkte{display:grid;gap:6px;margin-bottom:12px}
    .pe-produkt{display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:left;width:100%;
      border:2px solid var(--linie);background:#fff;border-radius:14px;padding:9px 12px;min-height:48px;color:var(--tinte);cursor:pointer}
    .pe-produkt small{display:block;color:var(--grau);font-size:var(--f0);font-weight:700}
    .pe-produkt.gewaehlt{border-color:var(--gold);box-shadow:0 0 0 2px #f5b73d55}
    .pe-produkt[aria-disabled="true"]{opacity:.62;cursor:default}
    .pe-marke{flex:none;font-weight:800;font-size:var(--f0);padding:3px 8px;border-radius:99px;background:#efe5d0;color:var(--tinte)}
    .pe-marke.gut{background:#d8f3e6;color:#11603d}
    .pe-plan h3{margin:0 0 4px}
    .pe-plan h4{margin:12px 0 6px;font-size:var(--f2)}
    .pe-forscherwahl{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
    .pe-forscher{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 10px;text-align:left;border:2px solid var(--linie);
      background:#fff;border-radius:12px;padding:8px;min-height:44px;color:var(--tinte);cursor:pointer}
    .pe-forscher-text{display:grid;gap:2px;min-width:0}
    .pe-person{width:52px;height:52px;flex:none;border-radius:50%;background:#efe5d0;color:#5b4a36;fill:currentColor;overflow:hidden}
    .pe-forscher.gewaehlt .pe-person{background:#f8dfa0}
    @media (min-width:421px){.pe-forscher{grid-template-columns:1fr;justify-items:start}}
    .pe-forscher small{font-size:var(--f0);color:var(--grau);font-weight:700}
    .pe-forscher.gewaehlt{border-color:var(--gold);background:#fff8e6}
    .pe-kosten{margin:10px 0 6px;padding:8px 10px;background:var(--papier2);border-radius:12px}
    .pe-summe{border-top:1px solid var(--linie);margin-top:4px;padding-top:4px}
    .pe-plan .cta{width:100%;margin-top:10px}
    .pe-laeuft{border:2px solid #2fbe7e55}
    @media (max-width:420px){.pe-forscherwahl{grid-template-columns:1fr}}`;
  document.head.append(stil);

  window.__erzweltProduktentwicklung = {version:VERSION, FORSCHER, PREISFAKTOR, GEBUEHR_TAGE,
    stufe, faktor, gebuehr, projektLohn, starten, startenMoeglich, pruefen, absatzProTag, offen};
})();
