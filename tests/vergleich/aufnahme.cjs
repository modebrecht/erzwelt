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

  fs.writeFileSync(path.join(AUS, "zustaende.json"), JSON.stringify({ fehler, ergebnis }, null, 1));
  await browser.close();
  console.log(`${Object.keys(ergebnis).length} Zustände aufgenommen nach ${AUS}` + (fehler.length ? ` · ${fehler.length} Seitenfehler` : ""));
  if (fehler.length) { console.log(fehler.join("\n")); process.exitCode = 1; }
})().catch(e => { console.error("FEHLER", e); process.exit(1); });
