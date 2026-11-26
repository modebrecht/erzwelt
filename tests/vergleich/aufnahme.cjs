// Prüfstand: nimmt das gebaute index.html in festen Szenarien auf.
// Pro Zustand: sichtbarer Text, Klassen von Aufgabe/Pins/Knöpfen, Spielstand S, Screenshot.
// Fester Zufall, keine Animationen, Spieltage werden direkt (tagVor) weitergeschaltet.
//
//   node tests/vergleich/aufnahme.cjs <ausgabe-ordner>
//   python3 tests/vergleich/vergleich.py <referenz-ordner> <neu-ordner>
//
// Das Skript startet selbst einen kleinen Webserver für das Repo (wie
// `python3 -m http.server`), damit das Bilder-Intro sein Bündel laden kann.
// Lokal: Playwright muss per require('playwright') auffindbar sein (NODE_PATH).
//
// Ablauf wie im Spiel: Hauptmenü → Speicherplatz → Bilder-Intro → Schwierigkeit.
// Szenarien mit festem Spielstand schreiben ihn in Speicherplatz 1 und setzen das
// Spiel über «Spiel fortsetzen» fort.
"use strict";
const path = require("path");
const fs = require("fs");
const http = require("http");
const { chromium } = require("playwright");

const AUS = path.resolve(process.argv[2] || "artifacts/vergleich");
const WURZEL = path.resolve(__dirname, "../..");
fs.mkdirSync(AUS, { recursive: true });
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".css": "text/css" };
const server = http.createServer((req, res) => {
  const datei = path.join(WURZEL, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!datei.startsWith(WURZEL) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPEN[path.extname(datei)] || "application/octet-stream" });
  fs.createReadStream(datei).pipe(res);
});
let SEITE;

const INIT = ({ speicher, opt, alles }) => {
  // Fester Zufall (mulberry32)
  let a = 0x2f6b1d3;
  Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  // Uhrzeit-Anzeigen fest (Hauptmenü «Zuletzt gespeichert …», Datum im Zertifikat);
  // Date.now bleibt echt, weil das Spiel damit Zeitabstände misst.
  Date.prototype.toLocaleString = () => "20.11.2026, 10:00";
  Date.prototype.toLocaleDateString = () => "20.11.2026";
  if (!sessionStorage.getItem("vergleich-init")) {
    sessionStorage.setItem("vergleich-init", "1");
    localStorage.clear();
    if (alles) for (const k in alles) localStorage.setItem(k, alles[k]);
    else {
      localStorage.setItem("erzwelt_opt", JSON.stringify(opt || { schrift: 106, tempo: 100, anim: 0 }));
      // Alter Spielstand (vor den Speicherplätzen): wird beim Start übernommen
      if (speicher) localStorage.setItem("erzwelt_v2", JSON.stringify(speicher));
    }
  }
};
// Fester Spielstand in Speicherplatz 1 (Speicherzeit fest), danach neu laden.
const SLOT = teil => {
  const state = spielzustandAufbauen(teil);
  localStorage.setItem("erzwelt_slot_v1_1", JSON.stringify({ name: "Spielstand 1", savedAt: "2026-11-20T09:00:00.000Z", state, version: 1 }));
};
// Pflichtfelder, ohne die ein alter Spielstand nicht übernommen wird
const ALT = teil => Object.assign({ ruf: 50, ausgegeben: 0, eingenommen: 0, log: [], erz: {}, mat: {}, ware: {} }, teil);

// Rückmeldung nach einem Einführungsschritt (#tutorial-lernfeedback) mitschreiben, auch
// wenn sie unsichtbar ist oder schon wieder entfernt wurde: jede neue Fassung zählt.
// Erst nach dem Laden einrichten (index.html schreibt das Dokument per document.write neu).
const RUECKMELDUNG = () => {
  window.__vergleichRueckmeldungen = [];
  const merke = el => window.__vergleichRueckmeldungen.push(el.textContent.replace(/\s+/g, " ").trim());
  const beobachteFeedback = el => new MutationObserver(() => merke(el)).observe(el, { childList: true });
  const schon = document.getElementById("tutorial-lernfeedback");
  if (schon) { merke(schon); beobachteFeedback(schon); }
  new MutationObserver(liste => {
    for (const m of liste) for (const n of m.addedNodes) if (n.id === "tutorial-lernfeedback") { merke(n); beobachteFeedback(n); }
  }).observe(document.body, { childList: true });
};

const ZUSTAND = () => {
  const sichtbar = el => { const r = el.getBoundingClientRect(); const c = getComputedStyle(el); return r.width > 0 && r.height > 0 && c.visibility !== "hidden" && c.display !== "none"; };
  const text = sel => { const el = document.querySelector(sel); return el && sichtbar(el) ? el.innerText.replace(/[ \t]+/g, " ").trim() : null; };
  const knoepfe = wurzel => wurzel ? [...wurzel.querySelectorAll("button, input[type=range]")].filter(sichtbar).map(b =>
    [b.tagName === "INPUT" ? `regler ${b.min}-${b.max}=${b.value}` : b.innerText.replace(/\s+/g, " ").trim(), b.disabled ? "aus" : "an", b.dataset.tun || ""]) : [];
  // Markup mit Attributen in fester (alphabetischer) Reihenfolge: Die Reihenfolge, in
  // der Attribute zuerst gesetzt wurden, ist kein sichtbares Verhalten.
  const markup = n => {
    if (n.nodeType === 3) return n.textContent.replace(/\s+/g, " ");
    if (n.nodeType !== 1) return "";
    const tag = n.tagName.toLowerCase();
    const attr = [...n.attributes].map(a => [a.name, a.value]).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => ` ${k}="${v.replace(/\s+/g, " ")}"`).join("");
    return `<${tag}${attr}>${[...n.childNodes].map(markup).join("").replace(/> </g, "><")}</${tag}>`;
  };
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
    dialog: text("#schleier .dialog") || text("#bilder-intro") || text("#lupe") || text("#einst"),
    menue: text("#spielmenue"),
    menueKnoepfe: knoepfe(document.getElementById("spielmenue")),
    dock: [...document.querySelectorAll("#dock button")].map(b => [b.dataset.seite || "", b.classList.contains("wink")]),
    pins: [...document.querySelectorAll("#welt .pin")].map(p => [p.dataset.pin, p.dataset.id, ["zu", "wink", "blass", "foerdert", "alarm"].filter(k => p.classList.contains(k)).join(" "), (p.querySelector(".crew") || {}).textContent || ""]),
    tutorial: typeof tutorialSchritt === "function" && tutorialSchritt() ? tutorialSchritt().id : null,
    S: s,
    // Aufgabenkarte (ab Schritt 6): ganzes Markup, Rückmeldungen seit der letzten Aufnahme,
    // Fokus-/Hinweisringe, Kamera und gemessene Höhe.
    questHtml: q ? markup(q) : null,
    rueckmeldungen: (window.__vergleichRueckmeldungen || []).splice(0),
    fokus: {
      pins: [...document.querySelectorAll("#welt .pin")].filter(p => p.querySelector(".map-focus-ring,.map-focus-suggestion"))
        .map(p => [p.dataset.pin, p.dataset.id, p.querySelector(".map-focus-ring") ? "ring" : "", p.querySelector(".map-focus-suggestion") ? "vorschlag" : ""].join(" ").trim()),
      dock: [...document.querySelectorAll("#dock button")].filter(b => b.querySelector(".map-focus-ring")).map(b => b.dataset.seite),
      body: ["ziel-fokus", "dock-hinweis", "fensterauf"].filter(k => document.body.classList.contains(k))
    },
    kamera: typeof ansicht !== "undefined" ? [ansicht.x, ansicht.y, ansicht.z].map(v => Math.round(v * 100) / 100) : null,
    questh: document.documentElement.style.getPropertyValue("--questh"),
    toastsStil: (document.getElementById("toasts") || { getAttribute: () => null }).getAttribute("style") || "",
    ort: [typeof aktiveSeite !== "undefined" ? aktiveSeite : null, typeof offenesBlatt !== "undefined" && offenesBlatt ? offenesBlatt.art + ":" + offenesBlatt.id : null]
  };
};

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  SEITE = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch({ headless: true });
  const fehler = [];
  const ergebnis = {};
  let nr = 0;

  const STIL = "*,*::before,*::after{animation:none!important;transition:none!important}#toasts,#tutorial-lernfeedback,#funken,#muenz-ebene{visibility:hidden!important}" +
    ".kasse-plus,.pin.neu-status .pin-state-badge,.pin.neu-status .pin-build-tool,.pin.neu-status .pin-status-hint{display:none!important}" +
    ".pille.kasse > div:has(.kasse-plus) > small{visibility:visible!important}";
  // Seite öffnen und fürs Aufnehmen einrichten. Mit Spielstand: in Speicherplatz 1 legen,
  // neu laden und fortsetzen. Ohne: das Hauptmenü bleibt offen (weiter mit neueRunde).
  async function oeffnen(ctx, mehr) {
    const p = await ctx.newPage();
    p.on("pageerror", e => fehler.push(String(e)));
    p.on("dialog", d => d.accept());
    await p.goto(SEITE, { waitUntil: "load" });
    await p.waitForFunction(() => typeof S !== "undefined" && typeof zeichnen === "function" && document.getElementById("spielmenue-titel"));
    if (mehr.slot) {
      await p.evaluate(SLOT, mehr.slot);
      await p.reload({ waitUntil: "load" });
      await p.waitForFunction(() => typeof S !== "undefined" && document.getElementById("spielmenue-titel"));
    }
    await p.evaluate(RUECKMELDUNG);
    if (mehr.feier) await p.evaluate(FEIER);
    // Ausgeblendet wie Meldungen: Anzeigen, die nur eine feste Zeit stehen (Verkaufsbetrag in
    // der Kasse 1,55 s, «Neu eröffnet» am Pin 1,8 s) – sonst entscheidet die Laufzeit des
    // Codes, ob eine Aufnahme sie noch erwischt.
    await p.addStyleTag({ content: STIL });
    // Die Spieluhr bleibt immer stehen: nur tag() schaltet Tage weiter.
    await p.evaluate(() => { const echt = tempoSetzen; tempoSetzen = () => echt(0); echt(0); });
    if (mehr.fortsetzen !== false && await p.evaluate(() => !!document.getElementById("spielmenue-weiter"))) {
      await p.evaluate(() => document.getElementById("spielmenue-weiter").click());
      await p.waitForFunction(() => spielAktiv);
    }
    await p.waitForTimeout(150);
    return p;
  }
  async function neueSeite(speicher, mehr) {
    mehr = mehr || {};
    const ctx = await browser.newContext({ viewport: mehr.viewport || { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: mehr.bewegung || "reduce" });
    // Neuere Spielstände direkt in den Speicherplatz, ältere (mehr.alt) über die Übernahme
    await ctx.addInitScript(INIT, { speicher: mehr.alt ? speicher : null, opt: mehr.opt || null });
    return oeffnen(ctx, Object.assign({}, mehr, { slot: !mehr.alt && speicher ? speicher : null }));
  }
  async function aufnahme(p, name, nurQuest) {
    await p.waitForTimeout(200);
    const z = await p.evaluate(ZUSTAND);
    const datei = String(++nr).padStart(2, "0") + "-" + name;
    ergebnis[datei] = z;
    // nurQuest: mit Animationen läuft die Welt weiter, verglichen wird dann nur die Aufgabenkarte
    if (nurQuest) await p.screenshot({ path: path.join(AUS, datei + ".png"), clip: await p.evaluate(() => {
      const r = document.getElementById("quest").getBoundingClientRect();
      return { x: Math.max(0, r.x - 4), y: Math.max(0, r.y - 4), width: Math.max(8, r.width + 8), height: Math.max(8, r.height + 8) };
    }) });
    else await p.screenshot({ path: path.join(AUS, datei + ".png") });
    // Fokusring und Zielfokus verschwinden sonst nach Zeitablauf (1–2,6 s): für feste
    // Folgezustände nach der Aufnahme sofort entfernen.
    await p.evaluate(() => {
      document.querySelectorAll(".map-focus-ring,.map-focus-suggestion").forEach(e => e.remove());
      document.body.classList.remove("ziel-fokus");
      if (typeof welt !== "undefined") welt.classList.remove("map-focus-moving");
    });
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

  // Hauptmenü → «Neues Spiel» → Speicherplatz 1 (frei oder überschreiben). Danach steht
  // das Bilder-Intro (erstes Bild geladen) oder schon die Schwierigkeitswahl.
  const zumIntro = async p => {
    await p.evaluate(() => document.getElementById("spielmenue-neu")?.click());
    await p.evaluate(() => document.querySelector('#spielmenue [data-slot-id="1"] button').click());
    await p.waitForFunction(() => spielAktiv && (document.getElementById("bilder-intro").open ? !document.querySelector("#bilder-intro .intro-weiter").disabled : !document.getElementById("schleier").hidden));
  };
  const introSchliessen = async p => {
    if (await p.evaluate(() => document.getElementById("bilder-intro").open)) {
      await p.keyboard.press("Escape");
      await p.waitForFunction(() => !document.getElementById("bilder-intro").open);
    }
  };
  const neueRunde = async p => {
    await zumIntro(p); await introSchliessen(p);
    await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][0].click());
  };

  // ---------- Neue Runde und ganze Einführung ----------
  let p = await neueSeite();
  await aufnahme(p, "menue-start");
  await p.evaluate(() => document.getElementById("spielmenue-neu").click());
  await aufnahme(p, "menue-neu");
  await zumIntro(p);
  await aufnahme(p, "intro-bild-1");
  await introSchliessen(p);
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
  p = await neueSeite(ALT({ tag: 30, kasse: 900000, tutorial: 4, schwierigkeit: "einfach", arbeiterGesamt: 40,
    minen: { katanga: mine(40), boke: mine(0), bangka: mine(0) }, raff: {}, fabriken: [] }), { alt: true, fortsetzen: false });
  await aufnahme(p, "alter-spielstand-menue");
  await p.evaluate(() => document.getElementById("spielmenue-weiter").click());
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
  await neueRunde(p);
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

  // ---------- Seiten: weitere Zustände ----------
  // Wie bei den Blättern: Grundzustand merken, pro Szenario setzen, Seite neu öffnen.
  const seiteSzene = async (p, name, s, setzen) => {
    await p.evaluate(([s, setzen]) => {
      S = JSON.parse(window.__vergleichGrund);
      if (setzen) (0, eval)("(" + setzen + ")")();
      blattZu(); blattStand = ""; seitenStand = "";
      seiteWechseln(s); zeichnen();
    }, [s, setzen ? String(setzen) : null]);
    await aufnahme(p, name);
  };
  const ziehen = (p, sel, wert) => p.evaluate(([sel, wert]) => {
    const r = document.querySelector(sel); r.value = wert; r.dispatchEvent(new Event("input", { bubbles: true }));
  }, [sel, wert]);

  // Einführung: Team-Reiter mit Bedarfsliste
  p = await neueSeite();
  await neueRunde(p);
  await p.evaluate(() => {
    const m = n => ({ arbeiter: n, stufe: 1, zufriedenheit: 60, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0 });
    S.minen = { katanga: m(15), boke: m(2), bangka: m(0) };
    S.arbeiterGesamt = 17; S.kasse = 600000;
    tutorialPruefen(); zeichnen();
  });
  await merken(p);
  await seiteSzene(p, "seite-team-einf-bedarf", "team");
  await seiteSzene(p, "seite-markt-einf", "markt");
  await seiteSzene(p, "seite-ziel-einf", "ziel");
  await p.close();

  // Nach der Einführung: eigene Kette, Ware im Lager
  p = await neueSeite({ tag: 100, kasse: 2000000, tutorial: 12, einfuehrung: 3, schwierigkeit: "einfach", startTeam: 0,
    arbeiterGesamt: 60, verkaeufer: 4, verkauftSelber: true, etappe: 1,
    minen: { katanga: quelle(15), boke: quelle(5), bangka: quelle(10) },
    raff: { r_china: { arbeiter: 5, ausbau: 0 } },
    fabriken: [{ produkt: "kabel", land: "china", arbeiter: 5, restbau: 0 }],
    erz: { kupfer: 40, alu: 20, zinn: 20 }, mat: { kupfer: 60, alu: 30, zinn: 30 }, ware: { kabel: 12 } });
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
  await merken(p);
  // Markt
  await seiteSzene(p, "markt-selbst-verkaufen", "markt");
  await seiteSzene(p, "markt-heute-verkauft", "markt", () => { S.handverkaufTag = S.tag; });
  await seiteSzene(p, "markt-nichts-zu-verkaufen", "markt", () => { S.ware = {}; });
  await seiteSzene(p, "markt-niemand-frei", "markt", () => { S.arbeiterGesamt -= freieArbeiter(); });
  await seiteSzene(p, "markt-niemand-frei-kein-geld", "markt", () => { S.arbeiterGesamt -= freieArbeiter(); S.kasse = 500; });
  await seiteSzene(p, "markt-einfluesse", "markt", () => {
    S.globalMod = [{ art: "dollar", wert: 1.12, bis: S.tag + 20 }, { art: "hafen", wert: 0.65, bis: S.tag + 4 }, { art: "dollar", wert: 0.9, bis: S.tag - 1 }];
  });
  await seiteSzene(p, "markt-mehrere-produkte", "markt", () => {
    S.fabriken.push({ produkt: "phone", land: "vietnam", arbeiter: 4, restbau: 0 }, { produkt: "board", land: "china", arbeiter: 3, restbau: 0 });
    S.arbeiterGesamt += 7; S.ware = { kabel: 12, phone: 30, board: 5 }; S.minen.escondida = { arbeiter: 8, stufe: 1, zufriedenheit: 70, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0 }; S.arbeiterGesamt += 8;
  });
  await seiteSzene(p, "markt-volle-kapazitaet", "markt", () => { S.arbeiterGesamt += VERKAUF_PLAETZE - S.verkaeufer; S.verkaeufer = VERKAUF_PLAETZE; S.ware = { kabel: 900 }; });
  await seiteSzene(p, "markt-ohne-verkaufsteam", "markt", () => { S.verkaeufer = 0; S.ware = { kabel: 300 }; });
  await seiteSzene(p, "markt-regler", "markt");
  await ziehen(p, "#seite .besetzung-regler", 12); await aufnahme(p, "markt-regler-gezogen-mehr");
  await ziehen(p, "#seite .besetzung-regler", 1); await aufnahme(p, "markt-regler-gezogen-weniger");
  await p.evaluate(() => { reglerAktiv = false; });
  // Team
  await seiteSzene(p, "team-untaetig", "team");
  await seiteSzene(p, "team-regler", "team");
  await ziehen(p, '#seite [data-regler="anstell"]', 25); await aufnahme(p, "team-regler-25");
  await p.evaluate(() => { reglerAktiv = false; });
  await seiteSzene(p, "team-nach-regler-25", "team");
  await seiteSzene(p, "team-zu-wenig-geld", "team", () => { S.kasse = 20000; });
  await ziehen(p, '#seite [data-regler="anstell"]', 5); await aufnahme(p, "team-zu-wenig-geld-regler-5");
  await p.evaluate(() => { reglerAktiv = false; anstellMenge = 7; });
  await seiteSzene(p, "team-menge-ungerade", "team");
  await seiteSzene(p, "team-niemand-frei", "team", () => { S.arbeiterGesamt -= freieArbeiter(); });
  await seiteSzene(p, "team-entlassen-moeglich", "team", () => { S.arbeiterGesamt += 3; });
  await seiteSzene(p, "team-niemand-eingeteilt", "team", () => {
    for (const id in S.minen) S.minen[id].arbeiter = 0; S.raff.r_china.arbeiter = 0; S.fabriken[0].arbeiter = 0; S.verkaeufer = 0;
  });
  // Ziel
  await seiteSzene(p, "ziel-vor-abrechnung", "ziel", () => { delete S.monatsBilanz; delete S.monatsVerlauf; });
  await seiteSzene(p, "ziel-ein-monat", "ziel", () => {
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: 84000 }; S.monatsVerlauf = [{ tag: 91, wert: 84000, ein: S.eingenommen }];
  });
  await seiteSzene(p, "ziel-trend-hoch", "ziel", () => {
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: 150000 };
    S.monatsVerlauf = [{ tag: 31, wert: -40000, ein: 1 }, { tag: 61, wert: 30000, ein: 2 }, { tag: 91, wert: 150000, ein: S.eingenommen }];
  });
  await seiteSzene(p, "ziel-trend-runter", "ziel", () => {
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: -25000 };
    S.monatsVerlauf = [{ tag: 31, wert: 60000, ein: 1 }, { tag: 61, wert: 20000, ein: 2 }, { tag: 91, wert: -25000, ein: S.eingenommen }];
  });
  await seiteSzene(p, "ziel-trend-gleich", "ziel", () => {
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: 50000 };
    S.monatsVerlauf = [{ tag: 61, wert: 50000, ein: 2 }, { tag: 91, wert: 50000, ein: S.eingenommen }];
  });
  await seiteSzene(p, "ziel-laufend-negativ", "ziel", () => {
    S.eingenommen = (S.etappeStartEingenommen || 0) + 10000; S.ausgegeben = (S.etappeStartAusgegeben || 0) + 900000;
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: -60000 };
  });
  await seiteSzene(p, "ziel-erreicht", "ziel", () => {
    S.eingenommen = (S.etappeStartEingenommen || 0) + 3000000; S.ruf = 75;
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: 220000 };
  });
  await seiteSzene(p, "ziel-prognose-reicht", "ziel", () => {
    S.eingenommen = (S.etappeStartEingenommen || 0) + 900000; S.ausgegeben = (S.etappeStartAusgegeben || 0) + 700000;
    S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: 120000 };
  });
  await seiteSzene(p, "ziel-prognose-reicht-nicht", "ziel", () => {
    S.schwierigkeit = "mittel"; S.monatsBilanz = { ein: S.eingenommen, aus: S.ausgegeben, letzt: 9000 };
  });
  await seiteSzene(p, "ziel-perks", "ziel", () => { S.perks = { kette1: true, geo1: true, markt1: true }; });
  await seiteSzene(p, "ziel-nachweise-teils", "ziel", () => { S.minen.katanga.nachweis = true; });
  await seiteSzene(p, "ziel-nachweise-alle", "ziel", () => { for (const id in S.minen) S.minen[id].nachweis = true; });
  await seiteSzene(p, "ziel-transparenzbericht", "ziel", () => { S.perks = { ruf1: true }; });
  await seiteSzene(p, "ziel-zertifiziert", "ziel", () => { S.perks = { ruf1: true, ruf2: true }; });
  await seiteSzene(p, "ziel-etappe-2", "ziel", () => {
    S.etappe = 2; S.tag = 800; S.etappeStartEingenommen = S.eingenommen; S.etappeStartAusgegeben = S.ausgegeben; delete S.investStartWert;
  });
  await seiteSzene(p, "ziel-runde-beendet", "ziel", () => {
    S.ende = { grund: "etappe", etappe: 1, gewinn: etappenGewinn(), ruf: Math.round(S.ruf), geschafft: false };
    S.zertifikatProfil = { vorname: "Mia" };
  });
  await seiteSzene(p, "ziel-schwer", "ziel", () => { S.schwierigkeit = "schwer"; S.ruf = 35; });
  // Wissen
  await seiteSzene(p, "wissen-ohne-perks", "wissen");
  await seiteSzene(p, "wissen-mit-perks", "wissen", () => { S.perks = { kette1: true, geo1: true, ruf1: true }; });
  await seiteSzene(p, "wissen-bereich-voll", "wissen", () => { S.perks = { markt1: true, markt2: true, leute1: true }; });
  await p.close();

  // ---------- Aufgabenkarte (ab Schritt 6) ----------
  // Fehlt das Element (z. B. «Ziel zeigen» gibt es in diesem Zustand nicht), wird das als
  // Teil der Aufnahme vermerkt statt abzubrechen: auch das muss gleich bleiben.
  const nichtDa = [];
  const klick = async (p, sel) => { if (!(await p.evaluate(sel => { const el = document.querySelector(sel); if (el) el.click(); return !!el; }, sel))) nichtDa.push(nr + " " + sel); };
  const hat = (p, sel) => p.evaluate(sel => !!document.querySelector(sel), sel);
  const aufKarte = p => p.evaluate(() => { blattZu(); if (aktiveSeite !== "karte") seiteWechseln("karte"); zeichnen(); });
  const tageBis = async (p, bedingung) => { for (let i = 0; i < 25 && !(await p.evaluate(bedingung)); i++) await tag(p, 1); };

  // Einführung: jede Aufgabe auf der Karte, «Ziel zeigen», auf einem anderen Reiter
  // (kompakte Zeile), Antippen der Zeile, Rückmeldung nach dem Schritt.
  p = await neueSeite();
  await neueRunde(p);
  const AKTION = {
    "kupfer-auf": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); },
    "kupfer-crew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 15); },
    "alu-auf": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); },
    "alu-crew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5); },
    "zinn-auf": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); },
    "zinn-crew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 10); },
    "raff": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="raff-bau"]'); },
    "raffcrew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5); },
    "fab": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="fab-bau"]'); },
    "fab-crew": async () => {
      await tageBis(p, () => S.fabriken[0].restbau <= 0);
      await aufKarte(p); await aufnahme(p, "a-fab-crew-fabrik-fertig");
      await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5);
    },
    "verkauf": async () => {
      await tageBis(p, () => S.ware.kabel > 0);
      await seite(p, "markt"); await aufnahme(p, "a-verkauf-ware-da");
      await knopf(p, '#seite [data-tun="handverkauf"]');
    },
    "verkaeufer": async () => { await seite(p, "markt"); await regler(p, "#seite .besetzung-regler", 4); }
  };
  for (let i = 0; i < 14; i++) {
    const id = await p.evaluate(() => tutorialSchritt() ? tutorialSchritt().id : null);
    if (!id) break;
    await aufKarte(p); await aufnahme(p, `a-${id}-karte`);
    await seite(p, "ziel"); await aufnahme(p, `a-${id}-reiter-ziel`);
    if (["verkauf", "verkaeufer"].includes(id) || i % 3 === 0) { await klick(p, "#quest"); await aufnahme(p, `a-${id}-zeile-antippen`); }
    if (["verkauf", "verkaeufer", "kupfer-crew"].includes(id)) { await seite(p, ["kupfer-crew"].includes(id) ? "team" : "markt"); await aufnahme(p, `a-${id}-reiter-eigen`); }
    await aufKarte(p);
    if (await hat(p, "#quest .objective-guide-action")) { await klick(p, "#quest .objective-guide-action"); await aufnahme(p, `a-${id}-ziel-zeigen`); }
    await aufKarte(p);
    await AKTION[id]();
    await aufnahme(p, `a-${id}-erledigt`);
  }
  await aufKarte(p); await aufnahme(p, "a-fertig-karte");
  await p.close();

  // Wissens-Quests: bereit («Neues Wissen», «Ansehen»), laufend mit Punkten,
  // abgeschlossen, mit und ohne Engpass, «Ziel zeigen», Engpass antippen, ohne Aufgabe.
  const kette = mehr => Object.assign({ tag: 100, kasse: 2000000, tutorial: 12, einfuehrung: 3, schwierigkeit: "einfach", startTeam: 0,
    arbeiterGesamt: 60, verkaeufer: 4, verkauftSelber: true, etappe: 1,
    minen: { katanga: quelle(15), boke: quelle(5), bangka: quelle(10) },
    raff: { r_china: { arbeiter: 5, ausbau: 0 } },
    fabriken: [{ produkt: "kabel", land: "china", arbeiter: 5, restbau: 0 }],
    erz: { kupfer: 40, alu: 20, zinn: 20 }, mat: { kupfer: 60, alu: 30, zinn: 30 }, ware: { kabel: 12 } }, mehr || {});
  const flow = (ids, mehr) => Object.assign({ version: 4, flags: {}, collected: Object.fromEntries(ids.map(i => [i, true])),
    fields: Object.fromEntries(ids.flatMap(i => ({ basis: ["kette", "chemie", "fabrik"], lohn: ["leute"], markt: ["markt"], geologie: ["geologie"], ruf: ["ruf"], modell: ["modell"] })[i]).map(f => [f, true])),
    geologieBesucht: [] }, mehr || {});
  const szene = async (p, name, s, setzen) => {
    await p.evaluate(([s, setzen]) => {
      S = JSON.parse(window.__vergleichGrund);
      if (setzen) (0, eval)("(" + setzen + ")")();
      blattZu(); blattStand = ""; seitenStand = "";
      seiteWechseln(s); zeichnen();
    }, [s, setzen ? String(setzen) : null]);
    await aufnahme(p, name);
  };
  const flowCode = (ids, mehr) => `S.wissenQuestFlow = ${JSON.stringify(flow(ids, mehr))};`;
  const flowSetzen = (ids, mehr, dazu) => `() => { ${flowCode(ids, mehr)} ${dazu || ""} }`;
  p = await neueSeite(kette());
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
  await merken(p);
  await szene(p, "w-basis-bereit-karte", "karte");
  await szene(p, "w-basis-bereit-markt", "markt");
  await szene(p, "w-basis-bereit-wissen", "wissen");
  await szene(p, "w-basis-bereit-ziel", "ziel");
  await klick(p, "#quest .wissen-quest-action"); await aufnahme(p, "w-basis-ansehen");
  await p.evaluate(() => { document.querySelector('[data-schliessen="lupe"]')?.click(); });
  await aufKarte(p); await aufnahme(p, "w-lohn-laufend-karte");
  await klick(p, "#quest .objective-guide-action"); await aufnahme(p, "w-lohn-ziel-zeigen");
  await seite(p, "team"); await aufnahme(p, "w-lohn-reiter-team");
  await klick(p, "#quest"); await aufnahme(p, "w-lohn-zeile-antippen");
  await aufKarte(p);
  await pinKlick(p, "mine", "boke"); await knopf(p, '#blattinhalt [data-tun="lohn"][aria-pressed="false"]'); await aufnahme(p, "w-lohn-geaendert");
  await aufKarte(p); await aufnahme(p, "w-lohn-bereit-karte");
  await seite(p, "markt"); await aufnahme(p, "w-lohn-bereit-markt");
  await klick(p, "#quest .wissen-quest-action"); await aufnahme(p, "w-lohn-ansehen");
  await p.evaluate(() => { document.querySelector('[data-schliessen="lupe"]')?.click(); });
  await szene(p, "w-markt-laufend-karte", "karte", flowSetzen(["basis", "lohn"]));
  await szene(p, "w-markt-laufend-ziel", "ziel", flowSetzen(["basis", "lohn"]));
  await klick(p, "#quest"); await aufnahme(p, "w-markt-zeile-antippen");
  await szene(p, "w-geologie-laufend-karte", "karte", flowSetzen(["basis", "lohn", "markt"], { geologieBesucht: ["katanga"] }));
  await klick(p, "#quest .objective-guide-action"); await aufnahme(p, "w-geologie-ziel-zeigen");
  await aufKarte(p); await aufnahme(p, "w-geologie-danach-karte");
  await szene(p, "w-ruf-laufend-karte", "karte", flowSetzen(["basis", "lohn", "markt", "geologie"]));
  await szene(p, "w-ruf-laufend-markt", "markt", flowSetzen(["basis", "lohn", "markt", "geologie"]));
  await klick(p, "#quest"); await aufnahme(p, "w-ruf-zeile-aufgeklappt");
  await klick(p, "#quest"); await aufnahme(p, "w-ruf-zeile-nochmals");
  await seite(p, "team"); await aufnahme(p, "w-ruf-anderer-reiter");
  await aufKarte(p); await klick(p, "#quest .objective-guide-action"); await aufnahme(p, "w-ruf-ziel-zeigen");
  await aufKarte(p); await aufnahme(p, "w-ruf-bereit-karte");
  await szene(p, "w-ruf-laufend-wissen", "wissen", flowSetzen(["basis", "lohn", "markt", "geologie"]));
  await szene(p, "w-modell-bereit-karte", "karte", flowSetzen(["basis", "lohn", "markt", "geologie", "ruf"]));
  await szene(p, "w-modell-bereit-team", "team", flowSetzen(["basis", "lohn", "markt", "geologie", "ruf"]));
  // Engpass während einer Wissens-Quest
  await szene(p, "w-lohn-engpass-karte", "karte", flowSetzen(["basis"], null, "S.mat.zinn = 0;"));
  await szene(p, "w-lohn-engpass-markt", "markt", flowSetzen(["basis"], null, "S.mat.zinn = 0;"));
  await szene(p, "w-lohn-engpass-karte-2", "karte", flowSetzen(["basis"], null, "S.mat.zinn = 0;"));
  await klick(p, "#quest .engpass-kasten"); await aufnahme(p, "w-engpass-antippen");
  await szene(p, "w-ruf-engpass-quelle-fehlt", "karte", flowSetzen(["basis", "lohn", "markt", "geologie"], null, "delete S.minen.bangka; S.mat.zinn = 0; S.arbeiterGesamt -= 10;"));
  await klick(p, "#quest .engpass-kasten"); await aufnahme(p, "w-engpass-quelle-antippen");
  await szene(p, "w-bereit-engpass-karte", "karte", `() => { S.mat.zinn = 0; }`);
  // Alle Wissens-Quests abgeschlossen
  await szene(p, "w-alle-hinweis-karte", "karte", flowSetzen(["basis", "lohn", "markt", "geologie", "ruf", "modell"]));
  await szene(p, "w-alle-hinweis-ziel", "ziel", flowSetzen(["basis", "lohn", "markt", "geologie", "ruf", "modell"]));
  await szene(p, "w-alle-engpass-karte", "karte", flowSetzen(["basis", "lohn", "markt", "geologie", "ruf", "modell"], null, "S.mat.zinn = 0;"));
  await szene(p, "w-alle-engpass-team", "team", flowSetzen(["basis", "lohn", "markt", "geologie", "ruf", "modell"], null, "S.mat.zinn = 0;"));
  await klick(p, "#quest"); await aufnahme(p, "w-alle-engpass-antippen");
  const ohneAufgabe = flowSetzen(["basis", "lohn", "markt", "geologie", "ruf", "modell"], { fields: {} }, "S.arbeiterGesamt -= freieArbeiter();");
  await szene(p, "w-ohne-aufgabe-karte", "karte", ohneAufgabe);
  await szene(p, "w-ohne-aufgabe-markt", "markt", ohneAufgabe);
  await szene(p, "w-blatt-offen", "karte", flowSetzen(["basis"]));
  await pinKlick(p, "mine", "katanga"); await aufnahme(p, "w-blatt-offen-quelle");
  await p.close();

  // Einstellungen: Animationen an («ruhig») und über die Einstellungen ausschalten
  p = await neueSeite(null, { opt: { schrift: 106, tempo: 100, anim: 1 } });
  await neueRunde(p);
  await aufKarte(p); await aufnahme(p, "anim-an-karte");
  await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); await aufnahme(p, "anim-an-erledigt");
  await aufKarte(p);
  await p.evaluate(() => document.querySelector('[data-tun="einst"]').click());
  await regler(p, '#einst [data-regler="anim"]', 0); await aufnahme(p, "anim-aus-einstellungen");
  await p.evaluate(() => { ueberlageZu("einst"); zeichnen(); }); await aufnahme(p, "anim-aus-karte");
  await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 15); await aufnahme(p, "anim-aus-erledigt");
  await p.close();
  // Ohne «weniger Bewegung» im System: Rückmeldung mit Einblenden (nur die Karte im Bild)
  p = await neueSeite(null, { opt: { schrift: 106, tempo: 100, anim: 1 }, bewegung: "no-preference" });
  await neueRunde(p);
  await aufKarte(p); await aufnahme(p, "bewegung-karte", true);
  await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); await aufnahme(p, "bewegung-erledigt", true);
  await p.close();

  // Schmaler Bildschirm (360 px) und Tablet (820 px)
  for (const [name, viewport] of [["schmal", { width: 360, height: 800 }], ["tablet", { width: 820, height: 1180 }]]) {
    p = await neueSeite(null, { viewport });
    await neueRunde(p);
    await aufKarte(p); await aufnahme(p, `${name}-einf-karte`);
    await seite(p, "team"); await aufnahme(p, `${name}-einf-team`);
    await aufKarte(p); await klick(p, "#quest .objective-guide-action"); await aufnahme(p, `${name}-einf-ziel-zeigen`);
    await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); await aufnahme(p, `${name}-einf-erledigt`);
    await p.close();
    p = await neueSeite(kette(), { viewport });
    await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
    await merken(p);
    await szene(p, `${name}-w-bereit-karte`, "karte");
    await szene(p, `${name}-w-bereit-markt`, "markt");
    await szene(p, `${name}-w-lohn-engpass-karte`, "karte", flowSetzen(["basis"], null, "S.mat.zinn = 0;"));
    await szene(p, `${name}-w-ruf-ziel`, "ziel", flowSetzen(["basis", "lohn", "markt", "geologie"]));
    await p.close();
  }

  // ---------- Einführung und Wissen (ab Schritt 7) ----------
  // Zusätzlich zum Zustand: Feier (Funken in den Farben der Erfolgsfeier, Vibration)
  // seit der letzten Aufnahme und die letzten Einträge im Meldungsverlauf.
  const FEIER = () => {
    window.__vergleichFeier = [];
    const echtFunken = funken;
    funken = function (x, y, farben, n) {
      if (Array.isArray(farben) && farben.join() === "#f5b73d,#ffe9a8,#2fbe7e,#6fb8e0,#fff") window.__vergleichFeier.push("funken " + n);
      return echtFunken.apply(this, arguments);
    };
    if (typeof navigator.vibrate === "function") {
      const echt = navigator.vibrate.bind(navigator);
      navigator.vibrate = m => { window.__vergleichFeier.push("vibration " + JSON.stringify(m)); return echt(m); };
    }
  };
  const MEHR = () => ({
    feier: (window.__vergleichFeier || []).splice(0),
    log: (S.log || []).slice(0, 4).map(l => l.tag + " " + String(l.text).replace(/\s+/g, " ")),
    fokus: document.activeElement ? (document.activeElement.id || document.activeElement.className || document.activeElement.tagName) + "|" + (document.activeElement.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) : null,
    intro: document.getElementById("bilder-intro").open,
    menue: !document.getElementById("spielmenue").hidden,
    schleier: !document.getElementById("schleier").hidden,
    lupe: document.getElementById("lupe").hidden ? null : document.getElementById("lupeinhalt").innerText.replace(/[ \t]+/g, " ").trim(),
    perkKnoepfe: [...document.querySelectorAll("#lupe [data-tun='perk']")].map(b => [b.textContent.replace(/\s+/g, " ").trim(), b.disabled, b.classList.contains("puls")])
  });
  const aufnahmeMehr = async (p, name, nurQuest) => {
    await aufnahme(p, name, nurQuest);
    const schluessel = Object.keys(ergebnis).pop();
    ergebnis[schluessel].mehr = await p.evaluate(MEHR);
  };
  // Neuladen: Spielstand wie beim Verlassen der Seite speichern («pagehide») und den ganzen
  // Speicher in eine frische Seite übernehmen. Steht ein Spiel im Speicherplatz, wird es
  // fortgesetzt (wie «Spiel fortsetzen» im Hauptmenü). Rückgabe: die neue Seite.
  const neuLaden = async alt => {
    const alles = await alt.evaluate(() => { window.dispatchEvent(new Event("pagehide")); return Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])); });
    const viewport = alt.viewportSize();
    await alt.close();
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await ctx.addInitScript(INIT, { alles });
    return oeffnen(ctx, { feier: true });
  };
  const seiteMitFeier = (speicher, mehr) => neueSeite(speicher, Object.assign({ feier: true }, mehr || {}));

  // Hauptmenü und Bilder-Intro: Escape, Neuladen vor, während und nach dem Intro
  p = await seiteMitFeier();
  await aufnahmeMehr(p, "e-menue");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-menue-neu-geladen");
  await zumIntro(p); await aufnahmeMehr(p, "e-intro");
  await p.evaluate(() => document.querySelector("#bilder-intro .intro-weiter").click());
  await p.waitForFunction(() => document.querySelector("#bilder-intro .intro-zaehler").textContent.startsWith("2"));
  await aufnahmeMehr(p, "e-intro-bild-2");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-intro-neu-geladen");
  await p.close();
  p = await seiteMitFeier();
  await zumIntro(p);
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  await aufnahmeMehr(p, "e-intro-escape");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-gesehen-neu-geladen");
  // Schwer freigeschaltet: Dialog neu zeigen, Schwer wählen
  await p.evaluate(() => { META.mittelGeschafft = true; metaSpeichern(); schwierigkeitZeigen(); });
  await aufnahmeMehr(p, "e-schwer-frei");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-schwer-frei-neu-geladen");
  await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][2].click());
  await aufnahmeMehr(p, "e-schwer-gewaehlt");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-schwer-gewaehlt-neu-geladen");
  await p.close();
  // Intro bis zum Ende («Firma gründen»), dann Mittel wählen (Schwer gesperrt)
  p = await seiteMitFeier();
  await zumIntro(p);
  for (let i = 2; i <= 4; i++) {
    await p.evaluate(() => document.querySelector("#bilder-intro .intro-weiter").click());
    await p.waitForFunction(i => document.querySelector("#bilder-intro .intro-zaehler").textContent.startsWith(String(i)), i);
  }
  await aufnahmeMehr(p, "e-intro-bild-4");
  await p.evaluate(() => document.querySelector("#bilder-intro .intro-weiter").click()); await p.waitForTimeout(400);
  await aufnahmeMehr(p, "e-schwierigkeit-fokus");
  await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][2].click()); await aufnahmeMehr(p, "e-schwer-gesperrt-klick");
  await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][1].click()); await aufnahmeMehr(p, "e-mittel-gewaehlt");
  await p.close();

  // Neue Runde nach einer beendeten Runde: zurück ins Hauptmenü, Speicherplatz überschreiben
  p = await seiteMitFeier(kette());
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; S.einstiegGesehen = true;
    S.ende = { grund: "etappe", etappe: 1, gewinn: etappenGewinn(), ruf: Math.round(S.ruf), geschafft: false }; speichern(); seiteWechseln("ziel"); zeichnen(); });
  await aufnahmeMehr(p, "e-runde-beendet");
  await klick(p, '#seite [data-tun="reset"]'); await p.waitForTimeout(400);
  await aufnahmeMehr(p, "e-neue-runde-menue");
  await p.evaluate(() => document.querySelector('#spielmenue [data-slot-id="1"] button').click());
  await p.waitForFunction(() => spielAktiv && (document.getElementById("bilder-intro").open ? !document.querySelector("#bilder-intro .intro-weiter").disabled : !document.getElementById("schleier").hidden));
  await aufnahmeMehr(p, "e-neue-runde-intro");
  await introSchliessen(p); await p.waitForTimeout(400); await aufnahmeMehr(p, "e-neue-runde-schwierigkeit");
  await p.evaluate(() => [...document.querySelectorAll("#d-wahlen .wahl")][0].click()); await aufnahmeMehr(p, "e-neue-runde-karte");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-neue-runde-neu-geladen");
  // Neue Runde über die Einstellungen mitten in der Einführung
  await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]');
  await p.evaluate(() => { blattZu(); document.querySelector('[data-tun="einst"]').click(); });
  await aufnahmeMehr(p, "e-einstellungen-einfuehrung");
  await klick(p, '#einst [data-tun="reset"]'); await p.waitForTimeout(400);
  await aufnahmeMehr(p, "e-reset-einstellungen");
  await p.close();

  // Rückmeldung und Feier nach jedem Einführungsschritt
  p = await seiteMitFeier();
  await neueRunde(p);
  const SCHRITT = {
    "kupfer-auf": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); },
    "kupfer-crew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 15); },
    "alu-auf": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); },
    "alu-crew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5); },
    "zinn-auf": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); },
    "zinn-crew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 10); },
    "raff": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="raff-bau"]'); },
    "raffcrew": async () => { await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5); },
    "fab": async () => { await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="fab-bau"]'); },
    "fab-crew": async () => { await tageBis(p, () => S.fabriken[0].restbau <= 0); await zielKlick(p); await regler(p, "#blattinhalt .besetzung-regler", 5); },
    "verkauf": async () => { await tageBis(p, () => S.ware.kabel > 0); await seite(p, "markt"); await knopf(p, '#seite [data-tun="handverkauf"]'); },
    "verkaeufer": async () => { await seite(p, "markt"); await regler(p, "#seite .besetzung-regler", 4); }
  };
  for (let i = 0; i < 14; i++) {
    const id = await p.evaluate(() => tutorialSchritt() ? tutorialSchritt().id : null);
    if (!id) break;
    await SCHRITT[id]();
    await aufnahmeMehr(p, `e-feier-${id}`);
    if (i === 3 || i === 8) { p = await neuLaden(p); await aufnahmeMehr(p, `e-feier-${id}-neu-geladen`); }
  }
  // Nach der Einführung: Lupe offen, Verbesserung nicht mehr gesperrt
  await seite(p, "wissen"); await p.evaluate(() => lupeFuellen("kette")); await aufnahmeMehr(p, "e-nach-einf-lupe-kette");
  await p.close();

  // Lupe in der Einführung: Verbesserungen gesperrt, Klick bewirkt nichts
  p = await seiteMitFeier();
  await neueRunde(p);
  for (const seg of ["kette", "markt", "modell"]) {
    await p.evaluate(s => { blattZu(); seiteWechseln("wissen"); lupeFuellen(s); }, seg);
    await aufnahmeMehr(p, `e-einf-lupe-${seg}`);
  }
  await p.evaluate(() => { const b = document.querySelector('#lupe [data-tun="perk"]'); b.disabled = false; b.click(); });
  await aufnahmeMehr(p, "e-einf-perk-erzwungen");
  await p.close();

  // Lupe für jeden Wissens-Bereich: ohne abgeholtes Wissen, abgeholt mit genug Geld,
  // abgeholt mit zu wenig Geld, erste Stufe finanziert, alles finanziert
  const BEREICHE = ["kette", "geologie", "leute", "chemie", "fabrik", "markt", "ruf", "modell"];
  const ALLE_QUESTS = ["basis", "lohn", "markt", "geologie", "ruf", "modell"];
  p = await seiteMitFeier(kette());
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
  await merken(p);
  const lupeSzene = async (name, seg, setzen) => {
    await p.evaluate(([seg, setzen]) => {
      S = JSON.parse(window.__vergleichGrund);
      if (setzen) (0, eval)("(" + setzen + ")")();
      blattZu(); blattStand = ""; seitenStand = "";
      seiteWechseln("wissen"); zeichnen(); lupeFuellen(seg);
    }, [seg, setzen ? String(setzen) : null]);
    await aufnahmeMehr(p, name);
  };
  for (const seg of BEREICHE) {
    await lupeSzene(`e-lupe-${seg}-ohne-wissen`, seg);
    await lupeSzene(`e-lupe-${seg}-bereit`, seg, flowSetzen(ALLE_QUESTS));
    await lupeSzene(`e-lupe-${seg}-wenig-geld`, seg, flowSetzen(ALLE_QUESTS, null, "S.kasse = 5000;"));
    await lupeSzene(`e-lupe-${seg}-stufe-2`, seg, flowSetzen(ALLE_QUESTS, null, `S.perks[WISSEN.find(s => s.id === "${seg}").perks[0].id] = true;`));
    await lupeSzene(`e-lupe-${seg}-voll`, seg, flowSetzen(ALLE_QUESTS, null, `for (const x of WISSEN.find(s => s.id === "${seg}").perks) S.perks[x.id] = true;`));
  }
  await lupeSzene("e-lupe-unbekannt", "gibtsnicht", flowSetzen(ALLE_QUESTS));
  // Verbesserung finanzieren: genug Geld, dann zweite Stufe; zu wenig Geld (Knopf aus)
  await lupeSzene("e-perk-vorher", "markt", flowSetzen(ALLE_QUESTS));
  await klick(p, '#lupe [data-tun="perk"]'); await aufnahmeMehr(p, "e-perk-finanziert");
  await klick(p, '#lupe [data-tun="perk"]'); await aufnahmeMehr(p, "e-perk-stufe-2-finanziert");
  await p.evaluate(() => { document.querySelector('[data-schliessen="lupe"]')?.click(); });
  await aufnahmeMehr(p, "e-perk-wissen-seite");
  await lupeSzene("e-perk-wenig-geld-vorher", "ruf", flowSetzen(ALLE_QUESTS, null, "S.kasse = 5000;"));
  await p.evaluate(() => document.querySelector('#lupe [data-tun="perk"]').click()); await aufnahmeMehr(p, "e-perk-wenig-geld-klick");
  await lupeSzene("e-perk-ohne-wissen-vorher", "chemie");
  await p.evaluate(() => document.querySelector('#lupe [data-tun="perk"]').click()); await aufnahmeMehr(p, "e-perk-ohne-wissen-klick");
  await p.close();

  // Wissens-Quests nacheinander bis zum Abschluss, mit Neuladen dazwischen
  p = await seiteMitFeier(kette());
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
  await aufnahmeMehr(p, "e-wq-basis-bereit");
  const ansehen = async name => {
    await aufKarte(p); await klick(p, "#quest .wissen-quest-action"); await aufnahmeMehr(p, name);
    await p.evaluate(() => { document.querySelector('[data-schliessen="lupe"]')?.click(); });
    await aufKarte(p); await aufnahmeMehr(p, name + "-danach");
  };
  await ansehen("e-wq-basis-ansehen");
  await pinKlick(p, "mine", "boke"); await knopf(p, '#blattinhalt [data-tun="lohn"][aria-pressed="true"]').catch(() => {});
  await aufnahmeMehr(p, "e-wq-lohn-gleiche-stufe");
  await knopf(p, '#blattinhalt [data-tun="lohn"][aria-pressed="false"]'); await aufnahmeMehr(p, "e-wq-lohn-geaendert");
  p = await neuLaden(p); await aufnahmeMehr(p, "e-wq-lohn-neu-geladen");
  await ansehen("e-wq-lohn-ansehen");
  await seite(p, "markt"); await knopf(p, '#seite [data-tun="handverkauf"]'); await aufnahmeMehr(p, "e-wq-markt-verkauft");
  await ansehen("e-wq-markt-ansehen");
  await pinKlick(p, "mine", "katanga"); await aufnahmeMehr(p, "e-wq-geologie-1");
  await pinKlick(p, "mine", "katanga"); await aufnahmeMehr(p, "e-wq-geologie-1-nochmals");
  p = await neuLaden(p); await aufKarte(p); await aufnahmeMehr(p, "e-wq-geologie-1-neu-geladen");
  await pinKlick(p, "mine", "obuasi"); await aufnahmeMehr(p, "e-wq-geologie-2");
  await ansehen("e-wq-geologie-ansehen");
  await p.evaluate(() => document.querySelector('#dock [data-seite="ziel"]').click()); await aufnahmeMehr(p, "e-wq-ruf-ziel");
  await ansehen("e-wq-ruf-ansehen");
  await ansehen("e-wq-modell-ansehen");
  p = await neuLaden(p); await aufKarte(p); await aufnahmeMehr(p, "e-wq-alle-neu-geladen");
  await seite(p, "wissen"); await aufnahmeMehr(p, "e-wq-alle-wissen");
  await p.close();

  // Ältere Einführungs-Spielstände (Fassung 2) und ohne Startteam
  for (const [name, mehr] of [
    ["e-alt-fassung2-mitte", { einfuehrung: 2, tutorial: 5, minen: { katanga: quelle(15), boke: quelle(5) }, arbeiterGesamt: 20, startTeam: 0 }],
    ["e-alt-fassung2-fertig", { einfuehrung: 2, tutorial: 13, minen: { katanga: quelle(15) }, arbeiterGesamt: 15, startTeam: 0 }],
    ["e-alt-ohne-startteam", { tutorial: 0, minen: {}, arbeiterGesamt: 10 }]
  ]) {
    p = await seiteMitFeier(ALT(Object.assign({ tag: 20, kasse: 800000, schwierigkeit: "einfach", raff: {}, fabriken: [] }, mehr)), { alt: true });
    await aufnahmeMehr(p, name);
    await p.close();
  }

  // ---------- Karte (ab Schritt 8a) ----------
  // Zusätzlich zum Zustand: jeder Pin als Markup (Klassen und Stilangaben sortiert, damit
  // nur zählt, was gilt, nicht in welcher Reihenfolge es gesetzt wurde), Ebenen, Chips und
  // Filter-Knopf, Transform der Welt, Linien der Karte (Lieferweg, Transport, Lieferfluss)
  // in ihrer Reihenfolge, Lieferweg-Knopf, Fokus und auf Wunsch die Meldungen.
  const KARTE = mehr => {
    const norm = s => String(s).replace(/\s+/g, " ");
    const attr = n => [...n.attributes].map(a => {
      let v = norm(a.value).trim();
      if (a.name === "class") v = v.split(" ").filter(Boolean).sort().join(" ");
      else if (a.name === "style") v = v.split(";").map(x => x.trim().replace(/\s*:\s*/, ":")).filter(Boolean).sort().join(";");
      return [a.name, v];
    }).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => ` ${k}="${v}"`).join("");
    const markup = n => {
      if (!n) return null;
      if (n.nodeType === 3) return norm(n.textContent);
      if (n.nodeType !== 1) return "";
      const tag = n.tagName.toLowerCase();
      return `<${tag}${attr(n)}>${[...n.childNodes].map(markup).join("").replace(/> </g, "><")}</${tag}>`;
    };
    const el = id => document.getElementById(id);
    const svg = document.querySelector("svg.weltkarte");
    const a = document.activeElement;
    return {
      pins: [...document.querySelectorAll("#welt .pin")].map(markup),
      welt: [norm(welt.getAttribute("style") || ""), [...welt.classList].sort().join(" ")],
      ebenen: typeof ebenen !== "undefined" ? Object.assign({}, ebenen) : null,
      ebenenHtml: markup(el("ebenen")),
      zoomHtml: markup(el("zoom")),
      svg: svg ? [...svg.children].map(c => c.id || c.getAttribute("class") || c.tagName) : null,
      linien: svg ? ["didaktik-lieferweg", "didaktik-transport", "lieferfluss"].map(id => markup(svg.querySelector("#" + id))) : null,
      routeNotiz: el("didaktik-route-note") ? [el("didaktik-route-note").hidden, norm(el("didaktik-route-note").innerHTML)] : null,
      legende: el("didaktik-transport-legende") ? [el("didaktik-transport-legende").hidden, norm(el("didaktik-transport-legende").innerHTML)] : null,
      lieferwegKnopf: markup(el("lieferweg-knopf")),
      sichtKinder: [...el("sicht").children].map(c => c.id || c.className),
      body: [...document.body.classList].sort().join(" "),
      aktiv: a ? [a.tagName, a.id, a.dataset ? (a.dataset.pin || a.dataset.ebene || "") + ":" + (a.dataset.id || "") : "", norm(a.textContent || "").trim().slice(0, 40)].join("|") : null,
      toasts: mehr && mehr.toasts ? [...document.querySelectorAll("#toasts .toast")].map(markup) : null,
      tabFolge: mehr && mehr.tabFolge ? mehr.tabFolge : null
    };
  };
  const aufnahmeKarte = async (p, name, mehr) => {
    mehr = mehr || {};
    await aufnahme(p, name, mehr.nurQuest);
    const schluessel = Object.keys(ergebnis).pop();
    ergebnis[schluessel].karte = await p.evaluate(KARTE, { toasts: !!mehr.toasts, tabFolge: mehr.tabFolge || null });
  };
  // Szene wie oben, danach Kamera auf den festen Startpunkt (wie beim Laden).
  const karteSzene = async (p, name, setzen, mehr) => {
    await p.evaluate(setzen => {
      S = JSON.parse(window.__vergleichGrund);
      if (setzen) (0, eval)("(" + setzen + ")")();
      blattZu(); blattStand = ""; seitenStand = "";
      seiteWechseln("karte"); zeichnen();
    }, setzen ? String(setzen) : null);
    await aufnahmeKarte(p, name, mehr);
  };
  // Wartet die Sperre nach einem Fokus ab (700 ms), damit der nächste Fokus immer gleich läuft.
  const kameraStart = async p => { await p.waitForTimeout(750); await p.evaluate(() => { ansicht.z = 1.15; zeigeAuf("obuasi", 1.15); }); };
  // Eine neue Meldung, sofort gezeichnet (frühere Meldungen weg, damit kein Zeitablauf zählt).
  const meldung = (p, text, art) => p.evaluate(([text, art]) => {
    document.getElementById("toasts").replaceChildren(); notiz(text, art || ""); zeichnen();
  }, [text, art || ""]);
  // Leere Stelle der Karte (kein Pin, keine Bedienung) für Ziehen und Rad.
  const leereStelle = p => p.evaluate(() => {
    const r = document.getElementById("sicht").getBoundingClientRect();
    for (let y = r.top + r.height * .55; y < r.bottom - 120; y += 17) for (let x = r.left + 30; x < r.right - 30; x += 19) {
      const e = document.elementFromPoint(x, y);
      if (e && !e.closest(".pin, #quest, #hud, #dock, #zoom, #ebenen, #lieferweg-knopf, #toasts, #didaktik-route-note") && e.closest("#sicht")) return [Math.round(x), Math.round(y)];
    }
    throw new Error("keine leere Stelle");
  });
  const PIN_MIX = () => {
    const m = (n, mehr) => Object.assign({ arbeiter: n, stufe: 1, zufriedenheit: 70, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0, sicherheit: false, nachweis: false }, mehr || {});
    S.minen.bangka = m(10, { stillBis: S.tag + 6, zufriedenheit: 18 });
    S.minen.obuasi = m(8, { stillBis: S.tag + 4 });
    S.log.unshift({ tag: S.tag, text: "<b>Obuasi</b>: Unfall – die Förderung steht für die Sicherheitsprüfung.", art: "warn" });
    S.minen.escondida = m(6, { stillBis: S.tag + 1200 });
    S.minen.sulawesi = m(0);
    S.raff.r_malay = { arbeiter: 0, ausbau: 0 };
    S.fabriken.push({ produkt: "board", land: "vietnam", arbeiter: 0, restbau: 4 });
    S.fabriken.push({ produkt: "phone", land: "mexiko", arbeiter: 3, restbau: 0 });
    S.arbeiterGesamt += 27;
  };

  // Pins aller Arten und Zustände, Ebenen, Kamera, Fokus, Meldungen, Lieferweg, Tastatur
  p = await neueSeite(kette());
  await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
  await merken(p);
  await karteSzene(p, "k-kette-karte");
  await karteSzene(p, "k-pins-mix", PIN_MIX);
  await karteSzene(p, "k-pins-ohne-rohstoff", () => { S.erz = {}; S.mat = {}; });
  await karteSzene(p, "k-pins-zwei-im-bau", () => { S.fabriken.push({ produkt: "kabel", land: "vietnam", arbeiter: 0, restbau: 3 }, { produkt: "board", land: "vietnam", arbeiter: 0, restbau: 7 }); });
  await karteSzene(p, "k-pins-streik-endet", () => { S.minen.katanga.stillBis = S.tag + 2; S.minen.katanga.zufriedenheit = 20; });
  await p.evaluate(() => { S.minen.katanga.stillBis = 0; zeichnen(); }); await aufnahmeKarte(p, "k-pins-streik-vorbei");
  await karteSzene(p, "k-pins-ohne-fabrik", () => { S.fabriken = []; S.minen.katanga.arbeiter = 0; });
  // Frisch eröffnet: kaufen, die flüchtige Anzeige «Neu eröffnet» (1,8 s) abwarten
  await karteSzene(p, "k-vor-kauf");
  await pinKlick(p, "mine", "obuasi"); await knopf(p, '#blattinhalt [data-tun="mine-auf"]');
  await p.waitForTimeout(2100);
  await p.evaluate(() => { blattZu(); zeichnen(); }); await aufnahmeKarte(p, "k-frisch-eroeffnet");
  await pinKlick(p, "raff", "r_malay"); await knopf(p, '#blattinhalt [data-tun="raff-bau"]');
  await p.waitForTimeout(2100);
  await p.evaluate(() => { blattZu(); zeichnen(); }); await aufnahmeKarte(p, "k-frisch-raffinerie");
  await pinKlick(p, "fab", "mexiko"); await knopf(p, '#blattinhalt [data-tun="fab-bau"]');
  await p.waitForTimeout(2100);
  await p.evaluate(() => { blattZu(); zeichnen(); }); await aufnahmeKarte(p, "k-frisch-fabrik-im-bau");
  await tag(p, 1); await aufnahmeKarte(p, "k-fabrik-bau-tag");
  // Ebenen einzeln und kombiniert (echter Klick; ohne Zeichnen danach)
  await karteSzene(p, "k-ebenen-alle", PIN_MIX);
  const chip = (p, e) => p.evaluate(e => document.querySelector(`#ebenen [data-ebene="${e}"]`).click(), e);
  await knopf(p, "#filterknopf"); await aufnahmeKarte(p, "k-filter-offen");
  await chip(p, "mine"); await aufnahmeKarte(p, "k-ebene-ohne-quellen");
  await chip(p, "raff"); await aufnahmeKarte(p, "k-ebene-ohne-quellen-werke");
  await chip(p, "fab"); await aufnahmeKarte(p, "k-ebene-keine");
  await chip(p, "mine"); await aufnahmeKarte(p, "k-ebene-nur-quellen");
  await p.evaluate(() => zeichnen()); await aufnahmeKarte(p, "k-ebene-nur-quellen-gezeichnet");
  await p.evaluate(() => document.querySelector("svg.weltkarte").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await aufnahmeKarte(p, "k-filter-zu");
  await chip(p, "raff"); await chip(p, "fab"); await chip(p, "mine"); await aufnahmeKarte(p, "k-ebene-nur-werke-fabriken");
  await chip(p, "mine"); await chip(p, "raff"); await aufnahmeKarte(p, "k-ebene-nur-fabriken");
  await chip(p, "mine"); await chip(p, "raff"); await p.evaluate(() => zeichnen()); await aufnahmeKarte(p, "k-ebene-wieder-alle");
  // Kamera: Zoom + / −, Ziehen, Rad
  await karteSzene(p, "k-kamera-start");
  await knopf(p, '#zoom [data-zoom="1"]'); await aufnahmeKarte(p, "k-zoom-plus");
  await knopf(p, '#zoom [data-zoom="1"]'); await knopf(p, '#zoom [data-zoom="1"]'); await aufnahmeKarte(p, "k-zoom-plus-3");
  for (let i = 0; i < 4; i++) await knopf(p, '#zoom [data-zoom="1"]');
  await aufnahmeKarte(p, "k-zoom-max");
  for (let i = 0; i < 9; i++) await knopf(p, '#zoom [data-zoom="-1"]');
  await aufnahmeKarte(p, "k-zoom-min");
  await knopf(p, '#zoom [data-zoom="1"]'); await knopf(p, '#zoom [data-zoom="1"]');
  {
    const [x, y] = await leereStelle(p);
    await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x - 90, y - 70, { steps: 6 }); await p.mouse.up();
    await aufnahmeKarte(p, "k-ziehen");
    const [x2, y2] = await leereStelle(p);
    await p.mouse.move(x2, y2); await p.mouse.wheel(0, -300); await p.waitForTimeout(100);
    await aufnahmeKarte(p, "k-rad-naeher");
    await p.mouse.wheel(0, 500); await p.waitForTimeout(100);
    await aufnahmeKarte(p, "k-rad-weiter");
  }
  // Fokus auf Pins jeder Art über Meldungen mit Ortsbezug (Klick, Enter, ausgeblendete Ebene)
  await karteSzene(p, "k-fokus-start", PIN_MIX);
  await merken(p);
  for (const [name, text] of [["quelle", "<b>Katanga</b>: Die Förderung läuft wieder."], ["streik", "<b>Bangka</b>: Streik – die Leute fordern mehr Lohn."],
    ["raffinerie", "<b>Guangdong</b>: Die Raffinerie arbeitet wieder."], ["fabrik", "Die Fabrik in Vietnam ist bald fertig gebaut."], ["ohne-ort", "Der Dollar steigt."]]) {
    await kameraStart(p);
    await meldung(p, text); await aufnahmeKarte(p, `k-meldung-${name}`, { toasts: true });
    if (await hat(p, "#toasts .toast.map-link")) { await klick(p, "#toasts .toast.map-link"); await aufnahmeKarte(p, `k-meldung-${name}-geklickt`, { toasts: true }); }
  }
  await kameraStart(p);
  await meldung(p, "<b>Kuantan</b>: Kein Personal in der Raffinerie.");
  await p.evaluate(() => document.querySelector("#toasts .toast.map-link").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  await aufnahmeKarte(p, "k-meldung-enter", { toasts: true });
  await kameraStart(p);
  await chip(p, "raff"); await meldung(p, "<b>Guangdong</b>: Neue Lieferung angekommen.");
  await klick(p, "#toasts .toast.map-link"); await aufnahmeKarte(p, "k-meldung-ebene-aus-geklickt", { toasts: true });
  await kameraStart(p);
  await chip(p, "fab"); await meldung(p, "Die Fabrik in Vietnam braucht Material.");
  await p.evaluate(() => document.querySelector("#toasts .toast.map-link").dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })));
  await aufnahmeKarte(p, "k-meldung-ebene-aus-leertaste", { toasts: true });
  // Aufgabenkarte als Hinweis («Vorschlag» für einen neuen Ort) und als Engpass
  await kameraStart(p);
  await karteSzene(p, "k-hinweis-ohne-raffinerie", `() => { ${flowCode(ALLE_QUESTS)} S.raff = {}; S.arbeiterGesamt -= 5; }`);
  await klick(p, "#quest"); await aufnahmeKarte(p, "k-hinweis-angetippt");
  await kameraStart(p);
  await karteSzene(p, "k-hinweis-quelle-ohne-personal", `() => { ${flowCode(ALLE_QUESTS)} S.minen.boke.arbeiter = 0; S.minen.katanga.arbeiter = 0; S.minen.bangka.arbeiter = 0; }`);
  await klick(p, "#quest"); await aufnahmeKarte(p, "k-hinweis-quelle-angetippt");
  await kameraStart(p);
  await karteSzene(p, "k-hinweis-fabrik-fehlt", `() => { ${flowCode(ALLE_QUESTS)} S.fabriken = []; }`);
  await klick(p, "#quest"); await aufnahmeKarte(p, "k-hinweis-fabrik-angetippt");
  // Ziel aus dem Text der Aufgabenkarte (ohne Ortsnamen): neuer Ort als «Vorschlag», eigener Ort, Reiter
  for (const [name, titel] of [["quelle-neu", "Eröffne eine weitere Rohstoffquelle"], ["raffinerie-neu", "Baue eine Raffinerie"],
    ["fabrik-neu", "Baue eine Fabrik"], ["quelle-eigen", "Deine Rohstoffquelle fördert zu wenig"], ["personal", "Personal zuweisen"],
    ["verkauf", "Mehr verkaufen"], ["team", "Weitere Personen einstellen"]]) {
    await kameraStart(p);
    await karteSzene(p, `k-text-${name}`, `() => { ${flowCode(ALLE_QUESTS)} S.minen.boke.arbeiter = 0; S.arbeiterGesamt -= 5; }`);
    await p.evaluate(t => { document.getElementById("q-titel").textContent = t; document.getElementById("q-text").textContent = ""; document.querySelectorAll("#quest .engpass-kasten, #quest .objective-guide-action").forEach(e => e.remove()); document.getElementById("quest").click(); }, titel);
    await aufnahmeKarte(p, `k-text-${name}-angetippt`);
  }
  // Lieferweg-Knopf an/aus, Linien bei offenem Blatt und auf anderen Reitern
  await kameraStart(p);
  await karteSzene(p, "k-lieferweg-zu");
  await knopf(p, "#lieferweg-knopf"); await aufnahmeKarte(p, "k-lieferweg-offen");
  await knopf(p, "#lieferweg-knopf"); await aufnahmeKarte(p, "k-lieferweg-wieder-zu");
  await knopf(p, "#lieferweg-knopf");
  await p.evaluate(() => document.querySelector("svg.weltkarte").dispatchEvent(new MouseEvent("click", { bubbles: true }))); await aufnahmeKarte(p, "k-lieferweg-ausserhalb-zu");
  await pinKlick(p, "mine", "katanga"); await aufnahmeKarte(p, "k-lieferweg-blatt-offen");
  await seite(p, "markt"); await aufnahmeKarte(p, "k-lieferweg-markt");
  await karteSzene(p, "k-lieferweg-zweite-fabrik", () => { S.fabriken.push({ produkt: "board", land: "vietnam", arbeiter: 4, restbau: 0 }); S.arbeiterGesamt += 4; S.minen.escondida = { arbeiter: 8, stufe: 1, zufriedenheit: 70, stillBis: 0, malus: 1, malusBis: 0, ausbau: 0 }; S.arbeiterGesamt += 8; });
  await karteSzene(p, "k-lieferweg-ebene-aus", () => { ebenen.raff = false; });
  await p.evaluate(() => { ebenen.raff = true; zeichnen(); });
  await karteSzene(p, "k-lieferweg-quelle-steht", () => { S.minen.katanga.stillBis = S.tag + 5; });
  // Tastatur: Tab über die Bedienung, Enter auf Pin und Ebenen-Chip, Leertaste
  await karteSzene(p, "k-tastatur-start");
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  {
    const folge = [];
    for (let i = 0; i < 14; i++) {
      await p.keyboard.press("Tab");
      folge.push(await p.evaluate(() => { const a = document.activeElement; return a ? [a.tagName, a.id, a.dataset.pin || a.dataset.ebene || a.dataset.zoom || a.dataset.tempo || a.dataset.seite || "", a.dataset.id || "", (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50)].join("|") : null; }));
    }
    await aufnahmeKarte(p, "k-tastatur-tab", { tabFolge: folge });
  }
  await p.evaluate(() => document.querySelector('#welt .pin[data-pin="raff"][data-id="r_china"]').focus());
  await p.keyboard.press("Enter"); await aufnahmeKarte(p, "k-tastatur-pin-enter");
  await p.evaluate(() => { blattZu(); zeichnen(); document.querySelector('#welt .pin[data-pin="mine"][data-id="obuasi"]').focus(); });
  await p.keyboard.press(" "); await aufnahmeKarte(p, "k-tastatur-pin-leertaste");
  await p.evaluate(() => { blattZu(); zeichnen(); });
  await knopf(p, "#filterknopf");
  await p.evaluate(() => document.querySelector('#ebenen [data-ebene="raff"]').focus());
  await p.keyboard.press("Enter"); await aufnahmeKarte(p, "k-tastatur-chip-enter");
  await p.keyboard.press(" "); await aufnahmeKarte(p, "k-tastatur-chip-leertaste");
  await p.evaluate(() => document.querySelector('#zoom [data-zoom="1"]').focus());
  await p.keyboard.press("Enter"); await aufnahmeKarte(p, "k-tastatur-zoom-enter");
  await p.keyboard.press("Escape"); await aufnahmeKarte(p, "k-tastatur-escape");
  // Neuladen: Pins, Linien und Knopf wie nach dem Laden
  p = await neuLaden(p); await aufKarte(p); await aufnahmeKarte(p, "k-neu-geladen");
  await p.close();

  // Einführung: Ziel-Pin leuchtet, Aufgabenkarte mit Tastatur, Kamera nach dem Kauf
  p = await neueSeite();
  await aufnahmeKarte(p, "k-einf-geladen");
  await neueRunde(p);
  await aufnahmeKarte(p, "k-einf-karte");
  await p.waitForTimeout(100);
  await kameraStart(p); await p.evaluate(() => document.getElementById("quest").focus());
  await p.keyboard.press("Enter"); await aufnahmeKarte(p, "k-einf-quest-enter");
  await aufKarte(p); await kameraStart(p); await p.evaluate(() => document.getElementById("quest").focus());
  await p.keyboard.press(" "); await aufnahmeKarte(p, "k-einf-quest-leertaste");
  await knopf(p, "#filterknopf"); await chip(p, "mine"); await aufnahmeKarte(p, "k-einf-ebene-ohne-quellen");
  await p.evaluate(() => document.querySelector("svg.weltkarte").dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await kameraStart(p); await klick(p, "#quest"); await aufnahmeKarte(p, "k-einf-quest-ebene-aus");
  await p.evaluate(() => { if (!ebenen.mine) document.querySelector('#ebenen [data-ebene="mine"]').click(); });
  await zielKlick(p); await knopf(p, '#blattinhalt [data-tun="mine-auf"]'); await aufnahmeKarte(p, "k-einf-gekauft");
  await p.waitForTimeout(2100); await p.evaluate(() => { blattZu(); zeichnen(); }); await aufnahmeKarte(p, "k-einf-gekauft-danach");
  await pinKlick(p, "mine", "potosi"); await aufnahmeKarte(p, "k-einf-gesperrt");
  if (await hat(p, "#blattinhalt [data-einfuehrung-hin]")) { await klick(p, "#blattinhalt [data-einfuehrung-hin]"); await aufnahmeKarte(p, "k-einf-zum-ziel"); }
  await p.close();

  // Linien mit Bewegung («ruhig» und «voll»), Bewegung aus- und wieder einschalten
  for (const anim of [1, 2]) {
    p = await neueSeite(kette(), { opt: { schrift: 106, tempo: 100, anim }, bewegung: "no-preference" });
    await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
    await aufnahmeKarte(p, `k-anim${anim}-linien`, { nurQuest: true });
    await p.evaluate(() => document.querySelector('[data-tun="einst"]').click());
    await regler(p, '#einst [data-regler="anim"]', 0);
    await p.evaluate(() => { ueberlageZu("einst"); zeichnen(); }); await aufnahmeKarte(p, `k-anim${anim}-aus`, { nurQuest: true });
    await p.evaluate(() => document.querySelector('[data-tun="einst"]').click());
    await regler(p, '#einst [data-regler="anim"]', anim);
    await p.evaluate(() => { ueberlageZu("einst"); zeichnen(); }); await aufnahmeKarte(p, `k-anim${anim}-wieder-an`, { nurQuest: true });
    await p.evaluate(PIN_MIX); await p.evaluate(() => zeichnen()); await aufnahmeKarte(p, `k-anim${anim}-pins-mix`, { nurQuest: true });
    await p.close();
  }

  // 360 px, 820 px, 1280 px
  for (const [name, viewport] of [["k360", { width: 360, height: 800 }], ["k820", { width: 820, height: 1180 }], ["k1280", { width: 1280, height: 800 }]]) {
    p = await neueSeite(null, { viewport });
    await neueRunde(p);
    await aufnahmeKarte(p, `${name}-einf-karte`);
    await kameraStart(p); await klick(p, "#quest"); await aufnahmeKarte(p, `${name}-einf-quest-angetippt`);
    await p.close();
    p = await neueSeite(kette(), { viewport });
    await p.evaluate(() => { modalOffen = false; document.getElementById("schleier").hidden = true; zeichnen(); });
    await merken(p);
    await karteSzene(p, `${name}-pins-mix`, PIN_MIX);
    await knopf(p, "#filterknopf"); await chip(p, "fab"); await aufnahmeKarte(p, `${name}-filter-ohne-fabriken`);
    await chip(p, "fab");
    await p.evaluate(() => document.querySelector("svg.weltkarte").dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await knopf(p, '#zoom [data-zoom="1"]'); await aufnahmeKarte(p, `${name}-zoom-plus`);
    await knopf(p, '#zoom [data-zoom="-1"]'); await knopf(p, '#zoom [data-zoom="-1"]'); await aufnahmeKarte(p, `${name}-zoom-minus`);
    await kameraStart(p);
    await meldung(p, "<b>Guangdong</b>: Die Raffinerie arbeitet wieder.");
    await klick(p, "#toasts .toast.map-link"); await aufnahmeKarte(p, `${name}-meldung-geklickt`, { toasts: true });
    await kameraStart(p);
    await karteSzene(p, `${name}-lieferweg`);
    await knopf(p, "#lieferweg-knopf"); await aufnahmeKarte(p, `${name}-lieferweg-offen`);
    await p.close();
  }

  ergebnis["zz-nicht-da"] = { nichtDa };
  fs.writeFileSync(path.join(AUS, "zustaende.json"), JSON.stringify({ fehler, ergebnis }, null, 1));
  await browser.close();
  console.log(`${Object.keys(ergebnis).length} Zustände aufgenommen nach ${AUS}` + (fehler.length ? ` · ${fehler.length} Seitenfehler` : ""));
  if (fehler.length) { console.log(fehler.join("\n")); process.exitCode = 1; }
})().catch(e => { console.error("FEHLER", e); process.exit(1); });
