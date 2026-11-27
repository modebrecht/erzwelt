// Wirtschaftssimulation für die Produktentwicklung (AP1).
//
// Läuft mit der echten Spiel-Logik im Browser (tagVor, Preise, Nachfrage,
// Saison, Ruf, Lager, Löhne, Monatsende). Pro Szenario zwei Läufe mit
// demselben Zufall: A ohne Forschung, B mit Forschung. Gemessen wird der
// Gewinn (Einnahmen − Ausgaben) am Ende der Etappe (Tag 720) und der Tag,
// an dem B wieder vor A liegt.
//
// Vereinfachungen (für beide Läufe gleich):
// - Eine Fabrik pro Szenario, voll besetzt. Rohstoffe kommen pro Tag direkt
//   ins Materiallager (Minen und Raffinerien ausgeblendet; ihre Kosten sind
//   für A und B gleich und fallen bei der Differenz heraus).
// - Ereignisse aus (sie öffnen Dialoge), Speichern aus.
// - Marktbewegungen laufen mit festem Zufall.
//
// Aufruf: python3 -m http.server 4173 & node tests/sim/produktentwicklung.mjs [--md docs/produktentwicklung-simulation.md]
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:4173/index.html');
await page.waitForFunction(() => window.__erzweltProduktentwicklung);

const ergebnis = await page.evaluate(() => {
  const PE = window.__erzweltProduktentwicklung;
  ereignisPruefen = () => {};
  speichern = () => {};
  const ENDE = ZIEL_TAGE;

  function zufall(saat){
    let a = saat >>> 0;
    return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // cfg: {p, stufe:"mittel"|"schwer", start, forscher, plan:[2] | [2,3], versorgung, verkauf, lager, ruf, perks:[]}
  function lauf(cfg, mitForschung){
    Math.random = zufall(20261127);
    S = neuerZustand();
    S.schwierigkeit = cfg.stufe; S.etappe = 1; S.ende = null; S.tutorial = TUTORIAL.length;
    S.kasse = 5e6; S.ruf = cfg.ruf ?? 70;
    const def = PRODUKT[cfg.p];
    const arbeiter = def.plaetze;
    S.fabriken = [{produkt:cfg.p, land:"china", arbeiter, restbau:0}];
    const produktion = Math.floor(arbeiter * def.proArbeiter);
    // Verkaufsteam: reicht für Produktion und Nachfrage, oder nur einen Teil der Produktion
    const kraft = cfg.verkauf ? cfg.verkauf * produktion : Math.max(produktion * 1.3, def.nachfrage * 1.2);
    S.verkaeufer = Math.max(1, Math.ceil(kraft / STUECK_PRO_VERKAEUFER));
    S.arbeiterGesamt = arbeiter + S.verkaeufer;
    if (cfg.lager) S.ware[cfg.p] = Math.round(def.nachfrage * cfg.lager);
    for (const id of cfg.perks || []) S.perks[id] = true;
    const start = {ein:S.eingenommen, aus:S.ausgegeben};
    const gewinn = () => (S.eingenommen - start.ein) - (S.ausgegeben - start.aus);
    const verlauf = [];
    let plan = mitForschung ? [...cfg.plan] : [];
    let fertig = [];
    while (S.tag < ENDE){
      if (plan.length && S.tag >= cfg.start && !S.produktForschung?.aktiv){
        const ziel = plan[0];
        if (PE.stufe(cfg.p) === ziel - 1){
          if (!PE.starten(cfg.p, cfg.forscher)) throw new Error("Start abgelehnt: " + PE.startenMoeglich(cfg.p, cfg.forscher));
          plan.shift();
        }
      }
      // Rohstoffe: 25 % Reserve (damit auch +12 % Fabrikausstoss genutzt werden kann), oder knapp
      for (const k in def.rezept) S.mat[k] = (S.mat[k] || 0) + produktion * def.rezept[k] * (cfg.versorgung ?? 1.25);
      const vorStufe = PE.stufe(cfg.p);
      tagVor();
      if (PE.stufe(cfg.p) !== vorStufe) fertig.push(S.tag);
      verlauf.push(gewinn());
    }
    const d = S.leistungsdaten?.produkte?.[cfg.p] || {verkauft:0};
    return {gewinn:gewinn(), verlauf, fertig, verkauftProTag:d.verkauft / ENDE, stufe:PE.stufe(cfg.p)};
  }

  function vergleich(cfg){
    const a = lauf(cfg, false), b = lauf(cfg, true);
    let zurueck = null;
    for (let i = cfg.start; i < a.verlauf.length; i++) if (b.verlauf[i] >= a.verlauf[i]){ zurueck = i + 1; break; }
    const kosten = cfg.plan.reduce((s, z) => s + PE.gebuehr(cfg.p, z) + PE.projektLohn(cfg.forscher), 0);
    return {...cfg, netto:Math.round(b.gewinn - a.gewinn), kosten:Math.round(kosten), fertig:b.fertig,
      wiederVorn:zurueck, absatz:+a.verkauftProTag.toFixed(1), basisGewinn:Math.round(a.gewinn)};
  }

  const produkte = Object.keys(PRODUKT);
  const out = {grund:[], stufe3:[], engpass:[], perks:[], stapel:null};

  // 1) Jedes Produkt, Mittel/Schwer, früh/mitte/spät, drei Forscher, Stufe 2
  for (const p of produkte) for (const stufe of ["mittel", "schwer"]) for (const start of [60, 300, 600])
    for (const forscher of ["junior", "spezialist", "experte"])
      out.grund.push(vergleich({p, stufe, start, forscher, plan:[2]}));
  // 2) Stufe 2 und 3 nacheinander, früh, Junior und Experte
  for (const p of produkte) for (const stufe of ["mittel", "schwer"]) for (const forscher of ["junior", "experte"])
    out.stufe3.push(vergleich({p, stufe, start:60, forscher, plan:[2, 3]}));
  // 3) Engpässe: Rohstoffmangel, schwaches Verkaufsteam, volles Lager, Ruf tief/hoch
  const varianten = [
    ["Rohstoffe 50 %", {versorgung:.5}], ["Verkaufsteam 40 %", {verkauf:.4}],
    ["Lager voll (20 Tage Nachfrage)", {lager:20}], ["Ruf 30", {ruf:30}], ["Ruf 85", {ruf:85}]];
  for (const p of ["kabel", "board", "konsole"]) for (const [name, v] of varianten) for (const forscher of ["junior", "experte"])
    out.engpass.push({variante:name, ...vergleich({p, stufe:"mittel", start:60, forscher, plan:[2], ...v})});
  // 4) Bestehende Verbesserungen: Wert von markt2/fab1 im selben Betrieb, und Forschung zusätzlich zu markt2
  for (const p of ["kabel", "board", "konsole"]){
    for (const perk of ["markt2", "fab1"]){
      const ohne = lauf({p, stufe:"mittel", start:60, plan:[]}, false);
      const mit = lauf({p, stufe:"mittel", start:60, plan:[], perks:[perk]}, false);
      const preis = PERK_INDEX[perk].perk.kosten;
      out.perks.push({p, perk, netto:Math.round(mit.gewinn - ohne.gewinn - preis), kosten:preis});
    }
    out.perks.push({p, perk:"Forschung Stufe 2 (Junior) zusätzlich zu markt2",
      ...(({netto, kosten}) => ({netto, kosten}))(vergleich({p, stufe:"mittel", start:60, forscher:"junior", plan:[2], perks:["markt2"]}))});
  }
  // 5) Stapeln: Preis mit markt2 und Stufe 3 = Grundpreis × 1.08 × 1.10 (nicht doppelt)
  S = neuerZustand(); S.schwierigkeit = "mittel"; S.ware = {}; S.globalMod = [];
  const roh = warenPreis("board");
  S.perks = {markt2:true};
  const mitPerk = warenPreis("board");
  S.produktForschung = {stufen:{board:3}, aktiv:null};
  const beide = warenPreis("board");
  out.stapel = {roh, mitPerk, beide, erwartet:roh * 1.08 * 1.10};
  return out;
});
await browser.close();

/* ---------- Ausgabe ---------- */
const chf = n => (n < 0 ? "−" : "") + "CHF " + Math.abs(Math.round(n)).toLocaleString("de-CH");
const NAME = {kabel:"Ladekabel", motor:"E-Bike-Motor", phone:"Smartphone", board:"Mainboard", konsole:"Konsole", tv:"Smart-TV", akku:"E-Bike-Akku"};
const zeilen = [];
zeilen.push("# Produktentwicklung – Simulation", "",
  "Erzeugt mit `node tests/sim/produktentwicklung.mjs --md docs/produktentwicklung-simulation.md` (echte Spiel-Logik, fester Zufall).",
  "Netto = Gewinn mit Forschung − Gewinn ohne Forschung am Etappenende (Tag 720), nach allen Kosten. «Wieder vorn» = erster Tag, an dem der Lauf mit Forschung den Lauf ohne eingeholt hat.",
  "Szenario: eine voll besetzte Fabrik (China), Rohstoffe mit 25 % Reserve, Verkaufsteam reicht (wo nicht anders angegeben), Ruf 70, keine Ereignisse. Rohstoffe 50 % = halbe Fabrikleistung; Verkaufsteam 40 % = Team schafft 40 % der Produktion.", "");
zeilen.push("## 1. Stufe 2 je Produkt, Schwierigkeit, Startzeitpunkt und Forscher", "",
  "| Produkt | Stufe | Start | Absatz/Tag | Junior netto | Spezialist netto | Experte netto | wieder vorn (J/S/E) |", "|---|---|---:|---:|---:|---:|---:|---|");
for (const p of Object.keys(NAME)) for (const stufe of ["mittel", "schwer"]) for (const start of [60, 300, 600]){
  const r = id => ergebnis.grund.find(e => e.p === p && e.stufe === stufe && e.start === start && e.forscher === id);
  const [j, s, e] = ["junior", "spezialist", "experte"].map(r);
  zeilen.push(`| ${NAME[p]} | ${stufe} | ${start} | ${j.absatz} | ${chf(j.netto)} | ${chf(s.netto)} | ${chf(e.netto)} | ${[j, s, e].map(x => x.wiederVorn ?? "–").join(" / ")} |`);
}
zeilen.push("", "## 2. Stufe 2 und 3 nacheinander (Start Tag 60)", "",
  "| Produkt | Stufe | Forscher | Kosten | fertig an Tag | netto |", "|---|---|---|---:|---|---:|");
for (const e of ergebnis.stufe3) zeilen.push(`| ${NAME[e.p]} | ${e.stufe} | ${e.forscher} | ${chf(e.kosten)} | ${e.fertig.join(", ")} | ${chf(e.netto)} |`);
zeilen.push("", "## 3. Engpässe (Mittel, Start Tag 60, Stufe 2)", "",
  "| Produkt | Variante | Absatz/Tag | Junior netto | Experte netto |", "|---|---|---:|---:|---:|");
for (const p of ["kabel", "board", "konsole"]) for (const [name] of [["Rohstoffe 50 %"], ["Verkaufsteam 40 %"], ["Lager voll (20 Tage Nachfrage)"], ["Ruf 30"], ["Ruf 85"]]){
  const r = id => ergebnis.engpass.find(e => e.p === p && e.variante === name && e.forscher === id);
  zeilen.push(`| ${NAME[p]} | ${name} | ${r("junior").absatz} | ${chf(r("junior").netto)} | ${chf(r("experte").netto)} |`);
}
zeilen.push("", "## 4. Vergleich mit bestehenden Verbesserungen (Mittel, ab Tag 1, eine Fabrik)", "",
  "| Produkt | Verbesserung | Preis | netto bis Tag 720 |", "|---|---|---:|---:|");
for (const e of ergebnis.perks) zeilen.push(`| ${NAME[e.p]} | ${e.perk} | ${chf(e.kosten)} | ${chf(e.netto)} |`);
const st = ergebnis.stapel;
zeilen.push("", "## 5. Stapeln mit anderen Preisfaktoren", "",
  `Mainboard: Grundpreis ${st.roh.toFixed(2)}, mit markt2 ${st.mitPerk.toFixed(2)}, mit markt2 und Stufe 3 ${st.beide.toFixed(2)} (erwartet ${st.erwartet.toFixed(2)} = Grundpreis × 1.08 × 1.10).`, "");
const md = zeilen.join("\n") + "\n";
const ziel = process.argv.indexOf("--md");
if (ziel > 0) await writeFile(process.argv[ziel + 1], md);
console.log(md);
if (Math.abs(st.beide - st.erwartet) > 1e-6) { console.error("Stapeln falsch"); process.exit(1); }
