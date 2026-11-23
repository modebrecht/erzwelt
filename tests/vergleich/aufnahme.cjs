// Prüfstand: nimmt das gebaute index.html in festen Szenarien auf.
// Pro Zustand: sichtbarer Text, Klassen von Aufgabe/Pins/Knöpfen, Spielstand S, Screenshot.
// Fester Zufall, keine Animationen, Spieltage werden direkt (tagVor) weitergeschaltet.
//
//   node tests/vergleich/aufnahme.cjs <ausgabe-ordner>
//   python3 tests/vergleich/vergleich.py <referenz-ordner> <neu-ordner>
//
// Lokal: NODE_PATH muss Playwright finden (require('playwright')).
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const AUS = path.resolve(process.argv[2] || "artifacts/vergleich");
const SEITE = "file://" + path.resolve(__dirname, "../../index.html");
fs.mkdirSync(AUS, { recursive: true });

const INIT = ({ speicher }) => {
  // Fester Zufall (mulberry32)
  let a = 0x2f6b1d3;
  Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  if (!sessionStorage.getItem("vergleich-init")) {
    sessionStorage.setItem("vergleich-init", "1");
    localStorage.clear();
    localStorage.setItem("erzwelt_opt", JSON.stringify({ schrift: 106, tempo: 100, anim: 0 }));
    if (speicher) localStorage.setItem("erzwelt_v2", JSON.stringify(speicher));
  }
};

const ZUSTAND = () => {
  const sichtbar = el => { const r = el.getBoundingClientRect(); const c = getComputedStyle(el); return r.width > 0 && r.height > 0 && c.visibility !== "hidden" && c.display !== "none"; };
  const text = sel => { const el = document.querySelector(sel); return el && sichtbar(el) ? el.innerText.replace(/[ \t]+/g, " ").trim() : null; };
  const knoepfe = wurzel => wurzel ? [...wurzel.querySelectorAll("button, input[type=range]")].filter(sichtbar).map(b =>
    [b.tagName === "INPUT" ? `regler ${b.min}-${b.max}=${b.value}` : b.innerText.replace(/\s+/g, " ").trim(), b.disabled ? "aus" : "an", b.dataset.tun || ""]) : [];
  const q = document.getElementById("quest");
  const s = JSON.parse(JSON.stringify(S));
  delete s.leistungsdaten;
  return {
    hud: text("#hud"),
    quest: q && sichtbar(q) ? { klassen: [...q.classList].sort(), text: q.innerText.replace(/\s+/g, " ").trim() } : null,
    blatt: text("#blatt.auf #blattinhalt"),
    blattKnoepfe: knoepfe(document.querySelector("#blatt.auf #blattinhalt")),
    seite: text("#seite"),
    seiteKnoepfe: knoepfe(document.getElementById("seite")),
    dialog: text("#schleier .dialog") || text("#einstieg") || text("#lupe") || text("#einst"),
    dock: [...document.querySelectorAll("#dock button")].map(b => [b.dataset.seite || "", b.classList.contains("wink")]),
    pins: [...document.querySelectorAll("#welt .pin")].map(p => [p.dataset.pin, p.dataset.id, ["zu", "wink", "blass", "foerdert", "alarm"].filter(k => p.classList.contains(k)).join(" "), (p.querySelector(".crew") || {}).textContent || ""]),
    tutorial: typeof tutorialSchritt === "function" && tutorialSchritt() ? tutorialSchritt().id : null,
    S: s
  };
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const fehler = [];
  const ergebnis = {};
  let nr = 0;

  async function neueSeite(speicher) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await ctx.addInitScript(INIT, { speicher: speicher || null });
    const p = await ctx.newPage();
    p.on("pageerror", e => fehler.push(String(e)));
    await p.goto(SEITE, { waitUntil: "load" });
    await p.waitForFunction(() => typeof S !== "undefined" && typeof zeichnen === "function");
    await p.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}#toasts,#tutorial-lernfeedback,#funken,#muenz-ebene{visibility:hidden!important}" });
    // Die Spieluhr bleibt immer stehen: nur tag() schaltet Tage weiter.
    await p.evaluate(() => { const echt = tempoSetzen; tempoSetzen = () => echt(0); echt(0); });
    await p.waitForTimeout(150);
    return p;
  }
  async function aufnahme(p, name) {
    await p.waitForTimeout(200);
    const z = await p.evaluate(ZUSTAND);
    const datei = String(++nr).padStart(2, "0") + "-" + name;
    ergebnis[datei] = z;
    await p.screenshot({ path: path.join(AUS, datei + ".png") });
  }
  const tag = (p, n) => p.evaluate(n => {
    for (let i = 0; i < n; i++) {
      if (modalOffen) { modalOffen = false; document.getElementById("schleier").hidden = true; }
      tagVor(); tutorialPruefen();
    }
    zeichnen();
  }, n);
  const pinKlick = (p, art, id) => p.evaluate(([art, id]) => { blattZu(); if (aktiveSeite !== "karte") seiteWechseln("karte"); zeichnen(); document.querySelector(`#welt .pin[data-pin="${art}"][data-id="${id}"]`).click(); }, [art, id]);
  const zielKlick = p => p.evaluate(() => { blattZu(); if (aktiveSeite !== "karte") seiteWechseln("karte"); zeichnen(); const pin = document.querySelector("#welt .pin.wink"); if (!pin) throw new Error("kein Ziel-Pin"); pin.click(); });
  const knopf = (p, sel) => p.evaluate(sel => { const b = [...document.querySelectorAll(sel)].find(x => !x.disabled); if (!b) throw new Error("Knopf fehlt: " + sel); b.click(); }, sel);
  const regler = async (p, sel, wert) => { await p.locator(sel).first().fill(String(wert)); await p.waitForTimeout(120); };
  const seite = (p, name) => p.evaluate(n => { blattZu(); seiteWechseln(n); }, name);

  // ---------- Neue Runde und ganze Einführung ----------
  let p = await neueSeite();
  await aufnahme(p, "einstieg");
  await knopf(p, "#einstieg .es-los");
  await aufnahme(p, "schwierigkeit");
  await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][0].click());
  await aufnahme(p, "karte-start");

  await pinKlick(p, "mine", "boke"); await aufnahme(p, "gesperrte-quelle");
  await zielKlick(p); await aufnahme(p, "kupfer-kaufblatt");
  await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); await aufnahme(p, "kupfer-gekauft");
  await regler(p, "#blattinhalt .besetzung-regler", 15); await aufnahme(p, "kupfer-besetzt");
  await seite(p, "team"); await aufnahme(p, "team-einfuehrung");
  for (const [k, n] of [["alu", 5], ["zinn", 10]]) {
    await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); await aufnahme(p, k + "-gekauft");
    await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", n); await aufnahme(p, k + "-besetzt");
  }
  await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="raff-bau"]'); await aufnahme(p, "raffinerie-gebaut");
  await regler(p, "#blattinhalt .besetzung-regler", 5); await aufnahme(p, "raffinerie-besetzt");
  await zielKlick(p); await aufnahme(p, "fabrik-kaufblatt");
  await knopf(p, '#blattinhalt [data-tun="fab-bau"]'); await aufnahme(p, "fabrik-im-bau");
  for (let i = 0; i < 20 && await p.evaluate(() => S.fabriken[0].restbau > 0); i++) await tag(p, 1);
  await p.evaluate(() => { blattZu(); zeichnen(); }); await aufnahme(p, "fabrik-fertig-karte");
  await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5); await aufnahme(p, "fabrik-besetzt");
  for (let i = 0; i < 20 && await p.evaluate(() => !(S.ware.kabel > 0)); i++) await tag(p, 1);
  await seite(p, "markt"); await aufnahme(p, "markt-verkaufen");
  await knopf(p, '#seite [data-tun="handverkauf"]'); await aufnahme(p, "selbst-verkauft");
  await regler(p, "#seite .besetzung-regler", 4); await aufnahme(p, "einfuehrung-fertig");

  // ---------- Nach der Einführung ----------
  for (const s of ["markt", "team", "ziel", "wissen"]) { await seite(p, s); await aufnahme(p, "seite-" + s); }
  await p.evaluate(() => document.querySelector(".segkarte").click()); await aufnahme(p, "lupe");
  await p.evaluate(() => { document.querySelector('[data-schliessen="lupe"]')?.click(); seiteWechseln("karte"); });
  for (const [art, id] of [["mine", "katanga"], ["raff", "r_china"], ["fab", "china"], ["mine", "obuasi"], ["raff", "r_malay"], ["fab", "vietnam"]]) {
    await pinKlick(p, art, id); await aufnahme(p, `blatt-${art}-${id}`);
  }
  await p.evaluate(() => { blattZu(); zeichnen(); });
  await tag(p, 60);
  await aufnahme(p, "karte-60-tage");
  await seite(p, "ziel"); await aufnahme(p, "ziel-60-tage");
  await p.evaluate(() => { seiteWechseln("karte"); document.querySelector('#hud [data-tun="einst"], [data-tun="einst"]')?.click(); });
  await aufnahme(p, "einstellungen");
  await p.close();

  // ---------- Alter Spielstand mitten im alten Tutorial ----------
  const mine = n => ({ arbeiter: n, stufe: 1, zufriedenheit: 55, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0 });
  p = await neueSeite({ tag: 30, kasse: 900000, tutorial: 4, schwierigkeit: "einfach", arbeiterGesamt: 40,
    minen: { katanga: mine(40), boke: mine(0), bangka: mine(0) }, raff: {}, fabriken: [] });
  await aufnahme(p, "alter-spielstand");
  await p.close();

  // ---------- Blätter: weitere Zustände ----------
  // Zustand direkt setzen und das Blatt neu zeichnen. Jedes Szenario beginnt
  // beim gemerkten Grundzustand (S aus der Momentaufnahme).
  const merken = p => p.evaluate(() => { window.__vergleichGrund = JSON.stringify(S); });
  const blattSzene = async (p, name, art, id, setzen) => {
    await p.evaluate(([art, id, setzen]) => {
      S = JSON.parse(window.__vergleichGrund);
      if (setzen) (0, eval)("(" + setzen + ")")();
      blattZu(); blattStand = ""; seitenStand = "";
      if (aktiveSeite !== "karte") seiteWechseln("karte");
      blattFuellen(art, id); zeichnen();
    }, [art, id, setzen ? String(setzen) : null]);
    await aufnahme(p, name);
  };

  // Einführung: gesperrte Orte
  p = await neueSeite();
  await knopf(p, "#einstieg .es-los");
  await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][0].click());
  await merken(p);
  await blattSzene(p, "einf-raff-gesperrt", "raff", "r_malay");
  await blattSzene(p, "einf-fab-gesperrt", "fab", "vietnam");
  await blattSzene(p, "einf-quelle-gold", "mine", "obuasi");
  // Einführung beim Raffinerie-Schritt: alle drei Quellen offen und besetzt
  await p.evaluate(() => {
    const m = n => ({ arbeiter: n, stufe: 1, zufriedenheit: 60, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0 });
    S.minen = { katanga: m(15), boke: m(5), bangka: m(10) };
    S.arbeiterGesamt = 30; S.kasse = 400000;
    tutorialPruefen(); zeichnen();
  });
  await merken(p);
  await blattSzene(p, "einf-raff-nicht-ziel", "raff", "r_chile");
  await blattSzene(p, "einf-quelle-zu-viele", "mine", "katanga", () => { S.minen.katanga.arbeiter = 20; S.arbeiterGesamt = 35; });
  // Einführung beim Fabrik-Schritt
  await p.evaluate(() => { S = JSON.parse(window.__vergleichGrund); S.raff = { r_china: { arbeiter: 5, ausbau: 0 } }; S.arbeiterGesamt = 35; tutorialPruefen(); zeichnen(); });
  await merken(p);
  await blattSzene(p, "einf-fab-nicht-ziel", "fab", "mexiko");
  await blattSzene(p, "einf-raff-zu-viele", "raff", "r_china", () => { S.raff.r_china.arbeiter = 8; S.arbeiterGesamt = 38; });
  await p.close();

  // Nach der Einführung: eigene Kette, alles besetzt
  const quelle = (n, mehr) => Object.assign({ arbeiter: n, stufe: 1, zufriedenheit: 70, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0 }, mehr || {});
  p = await neueSeite({ tag: 100, kasse: 2000000, tutorial: 12, einfuehrung: 3, schwierigkeit: "einfach", startTeam: 0,
    arbeiterGesamt: 60, verkaeufer: 4, verkauftSelber: true, etappe: 1,
    minen: { katanga: quelle(15), boke: quelle(5), bangka: quelle(10) },
    raff: { r_china: { arbeiter: 5, ausbau: 0 } },
    fabriken: [{ produkt: "kabel", land: "china", arbeiter: 5, restbau: 0 }],
    erz: { kupfer: 40, alu: 20, zinn: 20 }, mat: { kupfer: 60, alu: 30, zinn: 30 }, ware: { kabel: 12 } });
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
  await merken(p);
  await blattSzene(p, "quelle-streik", "mine", "katanga", () => { const m = S.minen.katanga; m.stillBis = S.tag + 6; m.zufriedenheit = 18; });
  await blattSzene(p, "quelle-stillstand-lang", "mine", "katanga", () => { S.minen.katanga.stillBis = S.tag + 1200; });
  await blattSzene(p, "quelle-sicher-geprueft", "mine", "katanga", () => { S.minen.katanga.sicherheit = true; S.minen.katanga.nachweis = true; });
  await blattSzene(p, "quelle-ausbau-3", "mine", "katanga", () => { S.minen.katanga.ausbau = 3; });
  await blattSzene(p, "quelle-ausbau-9", "mine", "katanga", () => { S.minen.katanga.ausbau = 9; });
  await blattSzene(p, "quelle-lohn-knapp", "mine", "boke", () => { S.minen.boke.stufe = 0; S.minen.boke.zufriedenheit = 30; });
  await blattSzene(p, "quelle-lohn-fair", "mine", "bangka", () => { S.minen.bangka.stufe = 2; S.minen.bangka.zufriedenheit = 88; });
  await blattSzene(p, "quelle-zufriedenheit-tief", "mine", "boke", () => { S.minen.boke.zufriedenheit = 7; });
  await blattSzene(p, "quelle-wenig-geld", "mine", "katanga", () => { S.kasse = 1000; });
  await blattSzene(p, "quelle-niemand-frei-kein-geld", "mine", "boke", () => { S.arbeiterGesamt -= freieArbeiter(); S.kasse = 900; });
  await blattSzene(p, "quelle-niemand-frei-geld", "mine", "boke", () => { S.arbeiterGesamt -= freieArbeiter(); });
  await blattSzene(p, "quelle-kaufen-wenig-geld", "mine", "obuasi", () => { S.kasse = 1000; });
  await blattSzene(p, "raff-viel-rohstoff", "raff", "r_china", () => { S.erz = { kupfer: 900, alu: 420, zinn: 300 }; });
  await blattSzene(p, "raff-ausbau-9", "raff", "r_china", () => { S.raff.r_china.ausbau = 9; });
  await blattSzene(p, "raff-mehr-personal", "raff", "r_china", () => { S.raff.r_china.arbeiter = 26; S.arbeiterGesamt += 21; });
  await blattSzene(p, "raff-kaufen-wenig-geld", "raff", "r_de", () => { S.kasse = 1000; });
  await blattSzene(p, "fab-im-bau", "fab", "china", () => { S.fabriken[0].restbau = 5; });
  await blattSzene(p, "fab-ohne-personal", "fab", "china", () => { S.fabriken[0].arbeiter = 0; S.arbeiterGesamt -= 5; });
  await blattSzene(p, "fab-zinn-fehlt", "fab", "china", () => { S.mat.zinn = 0; });
  await blattSzene(p, "fab-zweite-linie", "fab", "china", () => { S.fabriken.push({ produkt: "board", land: "china", arbeiter: 3, restbau: 0 }); S.arbeiterGesamt += 3; });
  await blattSzene(p, "fab-produktwahl", "fab", "mexiko");
  await blattSzene(p, "fab-produktwahl-wenig-geld", "fab", "deutschland", () => { S.kasse = 100000; });
  // Regler ziehen, ohne loszulassen: nur «input», die Kacheln rechnen mit
  await blattSzene(p, "quelle-regler-ziehen-mehr", "mine", "katanga");
  await p.evaluate(() => { const r = document.querySelector("#blattinhalt .besetzung-regler"); r.value = 40; r.dispatchEvent(new Event("input", { bubbles: true })); });
  await aufnahme(p, "quelle-regler-ziehen-mehr-gezogen");
  await p.evaluate(() => { const r = document.querySelector("#blattinhalt .besetzung-regler"); r.value = 9; r.dispatchEvent(new Event("input", { bubbles: true })); });
  await aufnahme(p, "quelle-regler-ziehen-weniger");
  await p.close();

  fs.writeFileSync(path.join(AUS, "zustaende.json"), JSON.stringify({ fehler, ergebnis }, null, 1));
  await browser.close();
  console.log(`${Object.keys(ergebnis).length} Zustände aufgenommen nach ${AUS}` + (fehler.length ? ` · ${fehler.length} Seitenfehler` : ""));
  if (fehler.length) { console.log(fehler.join("\n")); process.exitCode = 1; }
})().catch(e => { console.error("FEHLER", e); process.exit(1); });
