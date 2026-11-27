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

  /* Bilder für die Forscherwahl: Avataaars von Pablo Stanley (frei für private und
     kommerzielle Nutzung), erzeugt mit DiceBear (MIT); Hinweis in SOURCES.md.
     Einstellungen: Junior = kurze Locken, Kapuzenpulli · Spezialistin = lange Haare,
     Brille, Blazer · Experte = graue Haare und Bart, Brille, Sakko. */
  const BILD = {"junior": "<svg class=\"pe-bild\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 280 280\" fill=\"none\" shape-rendering=\"auto\"><metadata xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\"><rdf:RDF><rdf:Description><dc:title>Avataaars</dc:title><dc:creator>Pablo Stanley</dc:creator><dc:source xsi:type=\"dcterms:URI\">https://avataaars.com/</dc:source><dcterms:license xsi:type=\"dcterms:URI\">https://avataaars.com/</dcterms:license><dc:rights>Remix of „Avataaars” (https://avataaars.com/) by „Pablo Stanley”, licensed under „Free for personal and commercial use” (https://avataaars.com/)</dc:rights></rdf:Description></rdf:RDF></metadata><mask id=\"pe-junior-maske\"><rect width=\"280\" height=\"280\" rx=\"0\" ry=\"0\" x=\"0\" y=\"0\" fill=\"#fff\" /></mask><g mask=\"url(#pe-junior-maske)\"><g transform=\"translate(8)\"><circle cx=\"132\" cy=\"160\" r=\"120\" fill=\"#efe5d0\"/><mask id=\"pe-junior-kreis\" style=\"mask-type:luminance\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"264\" height=\"280\"><path d=\"M264 0H0v160h12c0 66.27 53.73 120 120 120 66.27 0 120-53.73 120-120h12V0Z\" fill=\"#fff\"/></mask><g mask=\"url(#pe-junior-kreis)\"><path d=\"M132 36a56 56 0 0 0-56 56v6.17A12 12 0 0 0 66 110v14a12 12 0 0 0 10.3 11.88 56.04 56.04 0 0 0 31.7 44.73v18.4h-4a72 72 0 0 0-72 72v9h200v-9a72 72 0 0 0-72-72h-4v-18.39a56.04 56.04 0 0 0 31.7-44.73A12 12 0 0 0 198 124v-14a12 12 0 0 0-10-11.83V92a56 56 0 0 0-56-56Z\" fill=\"#d08b5b\"/><path d=\"M108 180.61v8a55.79 55.79 0 0 0 24 5.39c8.59 0 16.73-1.93 24-5.39v-8a55.79 55.79 0 0 1-24 5.39 55.79 55.79 0 0 1-24-5.39Z\" fill=\"#000\" fill-opacity=\".1\"/><g transform=\"translate(0 170)\"><path d=\"M108 14.7c-15.52 3.68-27.1 10.83-30.77 19.44A72.02 72.02 0 0 0 32 101v9h200v-9a72.02 72.02 0 0 0-45.23-66.86C183.1 25.53 171.52 18.38 156 14.7V32a24 24 0 1 1-48 0V14.7Z\" fill=\"#5199e4\"/><path d=\"M102 63.34a67.1 67.1 0 0 1-7-2.82V110h7V63.34ZM162 63.34a67.04 67.04 0 0 0 7-2.82V98.5a3.5 3.5 0 1 1-7 0V63.34Z\" fill=\"#F4F4F4\"/><path d=\"M187.62 34.49a71.79 71.79 0 0 1 10.83 5.63C197.11 55.62 167.87 68 132 68c30.93 0 56-13.43 56-30 0-1.19-.13-2.36-.38-3.51ZM76.38 34.49a16.48 16.48 0 0 0-.38 3.5c0 16.58 25.07 30 56 30-35.87 0-65.1-12.38-66.45-27.88a71.79 71.79 0 0 1 10.83-5.63Z\" fill=\"#000\" fill-opacity=\".16\"/></g><g transform=\"translate(78 134)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M35.12 15.13a19 19 0 0 0 37.77-.09c.08-.77-.77-2.04-1.85-2.04H37.1C36 13 35 14.18 35.12 15.13Z\" fill=\"#000\" fill-opacity=\".7\"/><path d=\"M70 13H39a5 5 0 0 0 5 5h21a5 5 0 0 0 5-5Z\" fill=\"#fff\"/><path d=\"M66.7 27.14A10.96 10.96 0 0 0 54 25.2a10.95 10.95 0 0 0-12.7 1.94A18.93 18.93 0 0 0 54 32c4.88 0 9.33-1.84 12.7-4.86Z\" fill=\"#FF4F6D\"/></g><g transform=\"translate(104 122)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M16 8c0 4.42 5.37 8 12 8s12-3.58 12-8\" fill=\"#000\" fill-opacity=\".16\"/></g><g transform=\"translate(76 90)\"><path d=\"M36 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM88 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z\" fill=\"#000\" fill-opacity=\".6\"/></g><g transform=\"translate(76 82)\"><path d=\"M26.55 6.15c-5.8.27-15.2 4.49-14.96 10.34.01.18.3.27.43.12 2.76-2.96 22.32-5.95 29.2-4.36.64.14 1.12-.48.72-.93-3.43-3.85-10.2-5.43-15.4-5.18ZM86.45 6.15c5.8.27 15.2 4.49 14.96 10.34-.01.18-.3.27-.43.12-2.76-2.96-22.32-5.95-29.2-4.36-.64.14-1.12-.48-.72-.93 3.43-3.85 10.2-5.43 15.4-5.18Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#000\" fill-opacity=\".6\"/></g><g transform=\"translate(-1)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M193.76 70.77a62.92 62.92 0 0 0-1.51-9.86 51.78 51.78 0 0 0-2.5-7.49c-.6-1.48-2.02-3.52-2.19-5.13-.16-1.57 1.07-3.32 1.33-5.16.24-1.79.2-3.66-.17-5.44-.83-4.03-3.6-7.77-7.85-8.82-.95-.23-2.97.06-3.64-.5-.77-.63-1.3-2.8-2-3.67-2-2.47-5.1-4.07-8.37-3.51-2.41.4-1.03.9-2.84-.51-1-.8-1.75-2-2.73-2.85a24.7 24.7 0 0 0-4.9-3.28 50.82 50.82 0 0 0-14.84-4.91c-9.28-1.52-19.2-.2-28.2 2.22a74.58 74.58 0 0 0-13.14 4.74c-1.78.87-2.81 1.58-4.67 1.81-2.93.36-5.4.34-8.18 1.58-8.54 3.82-12.39 12.69-9.06 21.17.66 1.71 1.57 3.21 2.82 4.59 1.52 1.68 2.07 1.35.76 3.28a52.78 52.78 0 0 0-4.96 9.17c-3.53 8.4-4.12 17.87-3.89 26.83.08 3.13.22 6.3.71 9.42.22 1.34.28 3.87 1.29 4.87.5.5 1.24.78 1.96.58 1.71-.47 1.13-1.73 1.17-2.9.2-5.88-.08-11.08 1.32-16.9a44.4 44.4 0 0 1 5-12.03 72.07 72.07 0 0 1 9.8-13.35c.92-.99 1.12-1.4 2.35-1.48.93-.05 2.3.59 3.2.8 2 .5 4 .98 6.03 1.3 3.74.6 7.45.65 11.22.53 7.43-.23 14.88-.75 22.09-2.62 4.78-1.24 9.02-3.47 13.6-5.1.08-.04 1.23-.85 1.43-.82.28.04 1.97 1.82 2.26 2.05 2.23 1.74 4.67 2.48 7.07 3.83 2.97 1.66.1-.72 1.73 1.36.48.6.72 1.72 1.1 2.4 1.22 2.2 2.9 4.1 4.93 5.63 1.96 1.47 4.9 2.18 5.9 4.1.76 1.47 1.02 3.48 1.64 5.06 1.63 4.13 3.78 7.99 5.93 11.88 1.73 3.14 3.62 5.89 3.81 9.47.07 1.25-1.12 8.74 1.78 6.46.43-.34 1.35-4.15 1.54-4.8.77-2.63 1.05-5.38 1.4-8.09.69-5.38.92-10.5.46-15.91Z\" fill=\"#2c1b18\"/></g><g transform=\"translate(49 72)\"></g><g transform=\"translate(62 42)\"></g></g></g></g></svg>", "spezialist": "<svg class=\"pe-bild\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 280 280\" fill=\"none\" shape-rendering=\"auto\"><metadata xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\"><rdf:RDF><rdf:Description><dc:title>Avataaars</dc:title><dc:creator>Pablo Stanley</dc:creator><dc:source xsi:type=\"dcterms:URI\">https://avataaars.com/</dc:source><dcterms:license xsi:type=\"dcterms:URI\">https://avataaars.com/</dcterms:license><dc:rights>Remix of „Avataaars” (https://avataaars.com/) by „Pablo Stanley”, licensed under „Free for personal and commercial use” (https://avataaars.com/)</dc:rights></rdf:Description></rdf:RDF></metadata><mask id=\"pe-spezialist-maske\"><rect width=\"280\" height=\"280\" rx=\"0\" ry=\"0\" x=\"0\" y=\"0\" fill=\"#fff\" /></mask><g mask=\"url(#pe-spezialist-maske)\"><g transform=\"translate(8)\"><circle cx=\"132\" cy=\"160\" r=\"120\" fill=\"#efe5d0\"/><mask id=\"pe-spezialist-kreis\" style=\"mask-type:luminance\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"264\" height=\"280\"><path d=\"M264 0H0v160h12c0 66.27 53.73 120 120 120 66.27 0 120-53.73 120-120h12V0Z\" fill=\"#fff\"/></mask><g mask=\"url(#pe-spezialist-kreis)\"><path d=\"M132 36a56 56 0 0 0-56 56v6.17A12 12 0 0 0 66 110v14a12 12 0 0 0 10.3 11.88 56.04 56.04 0 0 0 31.7 44.73v18.4h-4a72 72 0 0 0-72 72v9h200v-9a72 72 0 0 0-72-72h-4v-18.39a56.04 56.04 0 0 0 31.7-44.73A12 12 0 0 0 198 124v-14a12 12 0 0 0-10-11.83V92a56 56 0 0 0-56-56Z\" fill=\"#edb98a\"/><path d=\"M108 180.61v8a55.79 55.79 0 0 0 24 5.39c8.59 0 16.73-1.93 24-5.39v-8a55.79 55.79 0 0 1-24 5.39 55.79 55.79 0 0 1-24-5.39Z\" fill=\"#000\" fill-opacity=\".1\"/><g transform=\"translate(0 170)\"><path d=\"M132.5 51.83c18.5 0 33.5-9.62 33.5-21.48 0-.36-.01-.7-.04-1.06A72 72 0 0 1 232 101.04V110H32v-8.95a72 72 0 0 1 67.05-71.83c-.03.37-.05.75-.05 1.13 0 11.86 15 21.48 33.5 21.48Z\" fill=\"#E6E6E6\"/><path d=\"M132.5 58.76c21.89 0 39.63-12.05 39.63-26.91 0-.6-.02-1.2-.08-1.8-2-.33-4.03-.59-6.1-.76.04.35.05.7.05 1.06 0 11.86-15 21.48-33.5 21.48S99 42.2 99 30.35c0-.38.02-.76.05-1.13-2.06.14-4.08.36-6.08.67-.07.65-.1 1.3-.1 1.96 0 14.86 17.74 26.91 39.63 26.91Z\" fill=\"#000\" fill-opacity=\".16\"/><path d=\"M100.78 29.12 101 28c-2.96.05-6 1-6 1l-.42.66A72.01 72.01 0 0 0 32 101.06V110h74s-10.7-51.56-5.24-80.8l.02-.08ZM158 110s11-53 5-82c2.96.05 6 1 6 1l.42.66a72.01 72.01 0 0 1 62.58 71.4V110h-74Z\" fill=\"#25557c\"/><path d=\"M101 28c-6 29 5 82 5 82H90L76 74l6-9-6-6 19-30s3.04-.95 6-1ZM163 28c6 29-5 82-5 82h16l14-36-6-9 6-6-19-30s-3.04-.95-6-1Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#000\" fill-opacity=\".15\"/><path d=\"m183.42 85.77.87-2.24 6.27-4.7a4 4 0 0 1 4.85.05l6.6 5.12-18.59 1.77Z\" fill=\"#E6E6E6\"/></g><g transform=\"translate(78 134)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M35.12 15.13a19 19 0 0 0 37.77-.09c.08-.77-.77-2.04-1.85-2.04H37.1C36 13 35 14.18 35.12 15.13Z\" fill=\"#000\" fill-opacity=\".7\"/><path d=\"M70 13H39a5 5 0 0 0 5 5h21a5 5 0 0 0 5-5Z\" fill=\"#fff\"/><path d=\"M66.7 27.14A10.96 10.96 0 0 0 54 25.2a10.95 10.95 0 0 0-12.7 1.94A18.93 18.93 0 0 0 54 32c4.88 0 9.33-1.84 12.7-4.86Z\" fill=\"#FF4F6D\"/></g><g transform=\"translate(104 122)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M16 8c0 4.42 5.37 8 12 8s12-3.58 12-8\" fill=\"#000\" fill-opacity=\".16\"/></g><g transform=\"translate(76 90)\"><path d=\"M36 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM88 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z\" fill=\"#000\" fill-opacity=\".6\"/></g><g transform=\"translate(76 82)\"><path d=\"M26.55 6.15c-5.8.27-15.2 4.49-14.96 10.34.01.18.3.27.43.12 2.76-2.96 22.32-5.95 29.2-4.36.64.14 1.12-.48.72-.93-3.43-3.85-10.2-5.43-15.4-5.18ZM86.45 6.15c5.8.27 15.2 4.49 14.96 10.34-.01.18-.3.27-.43.12-2.76-2.96-22.32-5.95-29.2-4.36-.64.14-1.12-.48-.72-.93 3.43-3.85 10.2-5.43 15.4-5.18Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#000\" fill-opacity=\".6\"/></g><g transform=\"translate(-1)\"><path d=\"M67 113c10.86-22.7 34.67-31.6 55.44-39.36 13.32-4.97 25.39-9.48 32-16.86 2.22 2.02 4.75 4.05 7.41 6.2C172.06 71.16 184.21 80.91 189 98v.17a12 12 0 0 1 9.81 9.72V86.04c0-1.3-.05-2.57-.15-3.84 4.54-17-3.1-37.78-12.66-47.2-9.48-8.82-22.3-12.32-30.95-8.48C143.45 8.98 109.9 13.24 90 28c-13.22 9.8-24.79 25.72-27.84 45.75A46.18 46.18 0 0 0 61 84.05v88.5c-.2 31.5-7.4 82.49-21 90.45 62.36 16.8 71.93-38.15 69-82v-.39a56.03 56.03 0 0 1-31.8-45.74A12 12 0 0 1 67 123v-10ZM157 180.61a56.03 56.03 0 0 0 31.8-45.74 12 12 0 0 0 10.01-9.76v1.36A100 100 0 0 0 209.78 172l26.95 52.71a37.79 37.79 0 0 1-3.94 40.76A72 72 0 0 0 161 199h-4v-18.39Z\" fill=\"#724133\"/><path d=\"M67 113c10.86-22.7 34.67-31.6 55.44-39.36 13.32-4.97 25.39-9.48 32-16.86 2.22 2.02 4.75 4.05 7.41 6.2 10.19 8.17 22.3 17.89 27.11 34.9-4.57-14.04-15.75-21.22-25.6-27.55-3.21-2.06-6.28-4.03-8.93-6.12-6.6 6.4-18.67 10.32-32 14.64C101.68 85.58 77.87 93.3 67 113Z\" fill=\"#000\" fill-opacity=\".16\"/></g><g transform=\"translate(49 72)\"></g><g transform=\"translate(62 42)\"><g fill-rule=\"evenodd\" clip-rule=\"evenodd\"><path d=\"M40 96a24 24 0 0 1-22.96-31H10.5a2.5 2.5 0 0 1 0-5h8c.23 0 .45.03.66.09a24 24 0 0 1 42.26 1.06A11.36 11.36 0 0 1 70.86 56c4.01 0 7.55 2.14 9.6 5.4a24 24 0 0 1 42.38-1.31c.2-.06.43-.1.66-.1h8a2.5 2.5 0 1 1 0 5h-6.54a24 24 0 1 1-46.6 2.83c-.08-4.37-3.45-7.83-7.5-7.83-3.73 0-6.89 2.94-7.42 6.83A24 24 0 0 1 40 96Zm0-4a20 20 0 1 0 0-40 20 20 0 0 0 0 40Zm82-20a20 20 0 1 1-40 0 20 20 0 0 1 40 0Z\" fill=\"#000\" fill-opacity=\".1\"/><path d=\"M40 94a24 24 0 0 1-22.96-31H10.5a2.5 2.5 0 0 1 0-5h8c.23 0 .45.03.66.09a24 24 0 0 1 42.26 1.06A11.36 11.36 0 0 1 70.86 54c4.01 0 7.55 2.14 9.6 5.4a24 24 0 0 1 42.38-1.31c.2-.06.43-.1.66-.1h8a2.5 2.5 0 1 1 0 5h-6.54a24 24 0 1 1-46.6 2.84c-.08-4.37-3.45-7.83-7.5-7.83-3.73 0-6.89 2.94-7.42 6.83A24 24 0 0 1 40 94Zm0-4a20 20 0 1 0 0-40 20 20 0 0 0 0 40Zm82-20a20 20 0 1 1-40 0 20 20 0 0 1 40 0Z\" fill=\"#262e33\"/></g></g></g></g></g></svg>", "experte": "<svg class=\"pe-bild\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 280 280\" fill=\"none\" shape-rendering=\"auto\"><metadata xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\"><rdf:RDF><rdf:Description><dc:title>Avataaars</dc:title><dc:creator>Pablo Stanley</dc:creator><dc:source xsi:type=\"dcterms:URI\">https://avataaars.com/</dc:source><dcterms:license xsi:type=\"dcterms:URI\">https://avataaars.com/</dcterms:license><dc:rights>Remix of „Avataaars” (https://avataaars.com/) by „Pablo Stanley”, licensed under „Free for personal and commercial use” (https://avataaars.com/)</dc:rights></rdf:Description></rdf:RDF></metadata><mask id=\"pe-experte-maske\"><rect width=\"280\" height=\"280\" rx=\"0\" ry=\"0\" x=\"0\" y=\"0\" fill=\"#fff\" /></mask><g mask=\"url(#pe-experte-maske)\"><g transform=\"translate(8)\"><circle cx=\"132\" cy=\"160\" r=\"120\" fill=\"#efe5d0\"/><mask id=\"pe-experte-kreis\" style=\"mask-type:luminance\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"264\" height=\"280\"><path d=\"M264 0H0v160h12c0 66.27 53.73 120 120 120 66.27 0 120-53.73 120-120h12V0Z\" fill=\"#fff\"/></mask><g mask=\"url(#pe-experte-kreis)\"><path d=\"M132 36a56 56 0 0 0-56 56v6.17A12 12 0 0 0 66 110v14a12 12 0 0 0 10.3 11.88 56.04 56.04 0 0 0 31.7 44.73v18.4h-4a72 72 0 0 0-72 72v9h200v-9a72 72 0 0 0-72-72h-4v-18.39a56.04 56.04 0 0 0 31.7-44.73A12 12 0 0 0 198 124v-14a12 12 0 0 0-10-11.83V92a56 56 0 0 0-56-56Z\" fill=\"#ffdbb4\"/><path d=\"M108 180.61v8a55.79 55.79 0 0 0 24 5.39c8.59 0 16.73-1.93 24-5.39v-8a55.79 55.79 0 0 1-24 5.39 55.79 55.79 0 0 1-24-5.39Z\" fill=\"#000\" fill-opacity=\".1\"/><g transform=\"translate(0 170)\"><path d=\"M132 57.05c14.91 0 27-11.2 27-25 0-1.01-.06-2.01-.2-3h1.2a72 72 0 0 1 72 72V110H32v-8.95a72 72 0 0 1 72-72h1.2c-.14.99-.2 1.99-.2 3 0 13.8 12.09 25 27 25Z\" fill=\"#E6E6E6\"/><path d=\"M100.78 29.12 101 28c-2.96.05-6 1-6 1l-.42.66A72.01 72.01 0 0 0 32 101.06V110h74s-10.7-51.56-5.24-80.8l.02-.08ZM158 110s11-53 5-82c2.96.05 6 1 6 1l.42.66a72.01 72.01 0 0 1 62.58 71.4V110h-74Z\" fill=\"#3c4f5c\"/><path d=\"M101 28c-6 29 5 82 5 82H90L76 74l6-9-6-6 19-30s3.04-.95 6-1ZM163 28c6 29-5 82-5 82h16l14-36-6-9 6-6-19-30s-3.04-.95-6-1Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#000\" fill-opacity=\".15\"/><path d=\"M108 21.54c-6.77 4.6-11 11.12-11 18.35 0 7.4 4.43 14.05 11.48 18.67l5.94-4.68 4.58.33-1-3.15.08-.06c-6.1-3.15-10.08-8.3-10.08-14.12V21.54ZM156 36.88c0 5.82-3.98 10.97-10.08 14.12l.08.06-1 3.15 4.58-.33 5.94 4.68C162.57 53.94 167 47.29 167 39.89c0-7.23-4.23-13.75-11-18.35v15.34Z\" fill=\"#F2F2F2\"/><path d=\"m183.42 85.77.87-2.24 6.27-4.7a4 4 0 0 1 4.85.05l6.6 5.12-18.59 1.77Z\" fill=\"#E6E6E6\"/></g><g transform=\"translate(78 134)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M35.12 15.13a19 19 0 0 0 37.77-.09c.08-.77-.77-2.04-1.85-2.04H37.1C36 13 35 14.18 35.12 15.13Z\" fill=\"#000\" fill-opacity=\".7\"/><path d=\"M70 13H39a5 5 0 0 0 5 5h21a5 5 0 0 0 5-5Z\" fill=\"#fff\"/><path d=\"M66.7 27.14A10.96 10.96 0 0 0 54 25.2a10.95 10.95 0 0 0-12.7 1.94A18.93 18.93 0 0 0 54 32c4.88 0 9.33-1.84 12.7-4.86Z\" fill=\"#FF4F6D\"/></g><g transform=\"translate(104 122)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M16 8c0 4.42 5.37 8 12 8s12-3.58 12-8\" fill=\"#000\" fill-opacity=\".16\"/></g><g transform=\"translate(76 90)\"><path d=\"M36 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM88 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z\" fill=\"#000\" fill-opacity=\".6\"/></g><g transform=\"translate(76 82)\"><path d=\"M26.55 6.15c-5.8.27-15.2 4.49-14.96 10.34.01.18.3.27.43.12 2.76-2.96 22.32-5.95 29.2-4.36.64.14 1.12-.48.72-.93-3.43-3.85-10.2-5.43-15.4-5.18ZM86.45 6.15c5.8.27 15.2 4.49 14.96 10.34-.01.18-.3.27-.43.12-2.76-2.96-22.32-5.95-29.2-4.36-.64.14-1.12-.48-.72-.93 3.43-3.85 10.2-5.43 15.4-5.18Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"#000\" fill-opacity=\".6\"/></g><g transform=\"translate(-1)\"><path d=\"M70 97c0 4 .92 5.07 6 5 3.25-.05 3.44-6 3.65-12.59.14-4.37.29-9.03 1.35-12.41.62-4.43-1.82-3.17-3-1-3.96 4.78-8 15.34-8 21ZM196 97c0 4-.92 5.07-6 5-3.25-.05-3.44-6-3.65-12.59-.14-4.37-.29-9.03-1.35-12.41-.62-4.43 1.82-3.17 3-1 3.96 4.78 8 15.34 8 21Z\" fill=\"#e8e1e1\"/></g><g transform=\"translate(49 72)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M84.5 93.84c-11.5.38-16.64 5.88-20.5.29-2.91-4.2-1.7-11.26 1.01-15.23 3.86-5.65 9.1-2.92 14.95-3.56 1.6-.18 3.2-.62 4.54-1.34 1.36.72 2.95 1.16 4.55 1.34 5.85.64 11.09-2.09 14.94 3.56 2.72 3.97 3.93 11.03 1.03 15.23-3.87 5.6-9-.67-20.52-.29ZM140.4 26c-3.43 14.07-5 28.43-7.5 42.67-.5 2.97-1.07 5.93-1.68 8.88-.12.62-.25 2.92-.86 3.21-1.85.89-5.62-3.81-6.63-4.87-2.53-2.67-5.05-5.36-8.13-7.45a43.7 43.7 0 0 0-21.13-7.32c-3.18-.25-7.47.18-10.47 2-3-1.82-7.3-2.25-10.47-2-7.6.6-14.9 3.1-21.13 7.32-3.09 2.09-5.6 4.78-8.13 7.45-1 1.06-4.78 5.76-6.63 4.87-.61-.29-.74-2.6-.86-3.21-.6-2.95-1.17-5.91-1.7-8.88-2.47-14.24-4.05-28.6-7.47-42.67-1 0-1.87 18.75-1.98 20.5-.46 7.09-.98 14.03-.3 21.13 1.16 12.24 2.37 27.6 11.7 36.96 8.44 8.45 20.68 10.22 31.24 15.55 1.36.69 3.16 1.54 5.1 2.23 2.06 1.56 6.12 2.63 10.8 2.63 4.91 0 9.15-1.17 11.08-2.86 1.7-.65 3.27-1.39 4.48-2 10.56-5.33 22.8-7.1 31.24-15.55 9.33-9.36 10.54-24.72 11.7-36.96.68-7.1.16-14.04-.3-21.14-.1-1.74-.98-20.5-1.98-20.5Z\" fill=\"#e8e1e1\"/></g><g transform=\"translate(62 42)\"><g fill-rule=\"evenodd\" clip-rule=\"evenodd\"><path d=\"M38.5 52c-21.3 0-28.85 5.1-29.55 5.77A2.92 2.92 0 0 0 6 60.66v2.88c0 1.6 1.32 2.89 2.95 2.89 0 0 5.91 0 5.91 2.88 0 .44.07.65.19.68-.04.82-.05 1.66-.05 2.5C15 85.34 23.31 93 37.24 93H40c14.72 0 25-8.43 25-20.5 0-1.5-.04-3-.17-4.46l1.58-.77c.58-.29 1.21-.5 1.9-.64 1.85-.38 3.95-.22 5.99.28.73.18 1.26.35 1.5.45l1.38.55c-.14 1.5-.18 3.04-.18 4.6C77 85.34 85.31 93 99.24 93H102c14.72 0 25-8.43 25-20.5 0-1.54-.04-3.07-.18-4.56 1.74-1.51 6.22-1.51 6.22-1.51a2.92 2.92 0 0 0 2.96-2.89v-2.88c0-1.6-1.32-2.89-2.96-2.89-.69-.67-8.25-5.77-29.54-5.77H100.53c-1.8 0-3.44.07-4.97.2-9.54.54-14.68 2.15-19.92 4.7a17 17 0 0 1-4.56.87 17.01 17.01 0 0 1-4.81-.91l-.42-.2v-.01c-4.94-2.42-8.43-4.13-20.78-4.55a61.2 61.2 0 0 0-3.6-.1H38.5ZM19 73.5C19 64.84 19 58 38.39 58h3.22C61 58 61 64.84 61 73.5 61 82.63 52.36 89 40 89h-3.03C22.12 89 19 80.57 19 73.5Zm62 0c0-8.66 0-15.5 19.39-15.5h3.22C123 58 123 64.84 123 73.5c0 9.13-8.64 15.5-21 15.5h-3.03C84.12 89 81 80.57 81 73.5Z\" fill=\"#000\" fill-opacity=\".1\"/><path d=\"M38.5 50c-21.3 0-28.85 5.1-29.55 5.77A2.92 2.92 0 0 0 6 58.66v2.88c0 1.6 1.32 2.89 2.95 2.89 0 0 5.91 0 5.91 2.88 0 .44.07.65.19.68-.04.82-.05 1.66-.05 2.5C15 83.34 23.31 91 37.24 91H40c14.72 0 25-8.43 25-20.5 0-1.5-.04-3-.17-4.46l1.58-.77c.58-.29 1.21-.5 1.9-.64 1.85-.38 3.95-.22 5.99.28.73.18 1.26.35 1.5.45l1.38.55c-.14 1.5-.18 3.04-.18 4.6C77 83.34 85.31 91 99.24 91H102c14.72 0 25-8.43 25-20.5 0-1.54-.04-3.07-.18-4.56 1.74-1.51 6.22-1.51 6.22-1.51a2.92 2.92 0 0 0 2.96-2.89v-2.88c0-1.6-1.32-2.89-2.96-2.89-.69-.67-8.25-5.77-29.54-5.77H100.53c-1.8 0-3.44.07-4.97.2-9.54.54-14.68 2.15-19.92 4.7a17 17 0 0 1-4.56.87 17.01 17.01 0 0 1-4.81-.91l-.42-.2v-.01c-4.94-2.42-8.43-4.13-20.78-4.55a61.2 61.2 0 0 0-3.6-.1H38.5ZM19 71.5C19 62.84 19 56 38.39 56h3.22C61 56 61 62.84 61 71.5 61 80.63 52.36 87 40 87h-3.03C22.12 87 19 78.57 19 71.5Zm62 0c0-8.66 0-15.5 19.39-15.5h3.22C123 56 123 62.84 123 71.5c0 9.13-8.64 15.5-21 15.5h-3.03C84.12 87 81 78.57 81 71.5Z\" fill=\"#262e33\"/></g></g></g></g></g></svg>"};
  const silhouette = id => `<span class="pe-person">${BILD[id]}</span>`;
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
    .pe-person{width:58px;height:58px;flex:none;display:block}
    .pe-person svg{width:100%;height:100%;display:block}
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
