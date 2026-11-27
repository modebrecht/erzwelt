// Produktentwicklung (AP1): nur Mittel/Schwer nach der Einführung, ein Projekt,
// Gebühr einmal, Lohn nur an Forschungstagen, Stufe gilt ab dem nächsten Tag,
// Speichern/Neuladen, JSON-Export/-Import, manipulierte Daten werden abgelehnt.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const url = 'http://127.0.0.1:4173/index.html';
const errors = [];
const context = await browser.newContext({ viewport:{width:360, height:800}, reducedMotion:'reduce' });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));

async function neuesSpiel(stufe){
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('#spielmenue-neu').click();
  await page.getByRole('button', { name: 'Hier starten · Spielstand 1' }).click();
  await page.locator('#bilder-intro .intro-sprung').evaluate(b => b.click());
  await page.getByRole('button', { name: new RegExp(stufe) }).filter({ visible: true }).first().click();
  await page.evaluate(() => tempoSetzen(0));
}
const wissenForschung = async () => {
  await page.evaluate(() => seiteWechseln('wissen'));
  await page.locator('[data-pe-reiter="forschung"]').click();
};
const betrieb = () => page.evaluate(() => {
  ereignisPruefen = () => {};
  S.tutorial = TUTORIAL.length;
  S.fabriken.push({produkt:'board', land:'vietnam', arbeiter:10, restbau:0});
  S.produktEntdeckungen = {board:{status:'gesehen'}};   // Entdeckungskarte (AP2) hier nicht testen
  S.arbeiterGesamt += 10; S.verkaeufer = 6; S.arbeiterGesamt += 6;
  for (const k in MATERIAL) S.mat[k] = 1e6;
  speichern(true);
});
const tage = n => page.evaluate(n => { for (let i = 0; i < n; i++) tagVor(); }, n);

// Einfach: keine Bedienelemente
await neuesSpiel('Einfach');
await page.evaluate(() => { S.tutorial = TUTORIAL.length; });
await wissenForschung();
assert.match(await page.locator('.pe-bereich').textContent(), /gibt es auf Mittel und Schwer/);
assert.equal(await page.locator('[data-pe-start]').count(), 0);

// Mittel, noch in der Einführung: noch zu
await neuesSpiel('Mittel');
await wissenForschung();
assert.match(await page.locator('.pe-bereich').textContent(), /nach der Einführung/);
// Wissen & Verbesserungen bleibt unverändert erreichbar
await page.locator('[data-pe-reiter="wissen"]').click();
assert.equal(await page.locator('.segkarte').count(), await page.evaluate(() => WISSEN.length));

// Nach der Einführung: Mainboard mit Experte (20 Tage, CHF 6'500)
await betrieb();
await tage(10);
await wissenForschung();
assert.equal(await page.locator('[data-pe-produkt="kabel"]').getAttribute('aria-disabled'), 'true', 'ohne Fabrik nicht wählbar');
await page.locator('[data-pe-produkt="board"]').click();
await page.locator('[data-pe-forscher="experte"]').click();
const vor = await page.evaluate(() => ({kasse:S.kasse, aus:S.ausgegeben, preis:warenPreis('board'), tag:S.tag}));
await page.locator('[data-pe-start="board"]').click();
await page.locator('[data-pe-start="board"]').click({timeout:300}).catch(() => {});   // Doppelklick: kein zweites Projekt
const gestartet = await page.evaluate(() => ({kasse:S.kasse, aus:S.ausgegeben, f:structuredClone(S.produktForschung)}));
assert.equal(gestartet.f.aktiv.gebuehr, 106000, '6 Tagesumsätze einer vollen Mainboard-Fabrik (1100 × 16 × 6), auf CHF 1000 gerundet');
assert.ok(Math.abs((vor.kasse - gestartet.kasse) - 106000) < 1e-6, 'Gebühr genau einmal');
assert.ok(Math.abs((gestartet.aus - vor.aus) - 106000) < 1e-6);
assert.equal(await page.evaluate(() => window.__erzweltProduktentwicklung.startenMoeglich('board', 'junior')), 'laeuft');

// Lohn pro Forschungstag, auch über das Monatsende
const lohnTage = await page.evaluate(() => {
  const out = [];
  for (let i = 0; i < 12; i++){ const a = S.ausgegeben, l = lohnsumme() + betriebskostenMonat(), monat = (S.tag) % 30 === 0;
    tagVor(); out.push(+(S.ausgegeben - a - (monat ? l : 0)).toFixed(4)); }
  return out;
});
assert.ok(lohnTage.every(x => Math.abs(x - 6500 / 30) < 0.01), 'Forschungslohn pro Tag: ' + lohnTage.join(', '));

// Speichern, neu laden, weiter
await page.evaluate(() => speichern(true));
await page.reload();
await page.locator('#spielmenue-weiter').click();
await page.evaluate(() => { tempoSetzen(0); ereignisPruefen = () => {}; });
const geladen = await page.evaluate(() => structuredClone(S.produktForschung.aktiv));
assert.equal(geladen.tage, 12);
assert.ok(Math.abs(geladen.lohnBezahlt - 12 * 6500 / 30) < 0.01);

// Export → Import in einen anderen Speicherplatz behält das Projekt
const paket = await page.evaluate(() => JSON.stringify({saveFormat:SPIELSTAND_FORMAT, schemaVersion:SPIELSTAND_VERSION,
  slot:{name:'Test', savedAt:new Date().toISOString()}, gameState:S}));
const importiert = await page.evaluate(roh => spielstandDatei(roh).state.produktForschung, paket);
assert.deepEqual(importiert.aktiv, geladen);
// Manipulierte Dateien werden abgelehnt
for (const [name, aendern] of [
  ['Stufe 4', s => { s.produktForschung.stufen.board = 4; }],
  ['falscher Lohn', s => { s.produktForschung.aktiv.lohnMonat = 1; }],
  ['negative Tage', s => { s.produktForschung.aktiv.tage = -3; }],
  ['falsche Gebühr', s => { s.produktForschung.aktiv.gebuehr = 0; }],
  ['unbekannter Forscher', s => { s.produktForschung.aktiv.forscher = 'genie'; }],
  ['Stufe überspringen', s => { s.produktForschung.aktiv.ziel = 3; }]
]){
  const abgelehnt = await page.evaluate(([roh, code]) => {
    const p = JSON.parse(roh); (0, eval)('(' + code + ')')(p.gameState);
    try { spielstandDatei(JSON.stringify(p)); return false; } catch (e){ return true; }
  }, [paket, aendern.toString()]);
  assert.ok(abgelehnt, name + ' muss abgelehnt werden');
}

// Fertig nach genau 20 Forschungstagen; Preis ab dann +5 %, danach kein Lohn mehr
const ende = await page.evaluate(() => {
  const start = S.produktForschung.aktiv.start, preisVor = warenPreis('board') / window.__erzweltProduktentwicklung.faktor('board');
  for (let i = 0; i < 40 && S.produktForschung.aktiv; i++){ if (modalOffen || S.ende) return {modal:modalOffen, ende:S.ende, titel:document.getElementById('d-titel')?.textContent}; tagVor(); }
  const tag = S.tag, a = S.ausgegeben;
  const monat = S.tag % 30 === 0, l = lohnsumme() + betriebskostenMonat();
  tagVor();
  return {start, tag, stufe:S.produktForschung.stufen.board, faktor:window.__erzweltProduktentwicklung.faktor('board'),
    danach:+(S.ausgegeben - a - (monat ? l : 0)).toFixed(4)};
});
assert.equal(ende.tag, ende.start + 20);
assert.equal(ende.stufe, 2);
assert.equal(ende.faktor, 1.05);
assert.equal(ende.danach, 0, 'kein Lohn nach Projektende');
const log = await page.evaluate(() => S.log.map(e => e.text).join(' | '));
assert.match(log, /Produkt verbessert!/);
assert.equal((log.match(/Produkt verbessert!/g) || []).length, 1, 'genau einmal fertig');

// Ansicht auf 360 px: Knopf sichtbar und nicht verdeckt
await page.evaluate(() => seiteWechseln('karte'));
await wissenForschung();
await page.locator('[data-pe-produkt="board"]').click();
const knopf = page.locator('[data-pe-start="board"]');
await knopf.scrollIntoViewIfNeeded();
const box = await knopf.boundingBox();
assert.ok(box && box.width <= 360 && box.height >= 44);
assert.match(await knopf.textContent(), /Forschung starten/);

assert.deepEqual(errors, []);
await browser.close();
console.log('PASS Produktentwicklung: Freischaltung, Kosten, Lohn, Abschluss, Speichern, Import-Prüfung');
