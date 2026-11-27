// Produktentwicklung: nur Mittel/Schwer nach der Einführung. Eine Forschungsstelle:
// anstellen, kündigen, wechseln; Lohn jeden Tag, solange jemand angestellt ist;
// Forschungsziel mit automatischem Weiterforschen am nächsten Tier; Meldungen;
// Speichern/Neuladen; JSON-Import prüft die Daten.
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
  S.arbeiterGesamt += 16; S.verkaeufer = 6;
  for (const k in MATERIAL) S.mat[k] = 1e6;
  speichern(true);
});
// Forschungskosten eines Tages = Ausgaben ohne Monatslöhne und Betriebskosten
const tagesKosten = n => page.evaluate(n => {
  const out = [];
  for (let i = 0; i < n; i++){
    const a = S.ausgegeben, monat = S.tag % 30 === 0, l = lohnsumme() + betriebskostenMonat();
    tagVor(); out.push(+(S.ausgegeben - a - (monat ? l : 0)).toFixed(4));
  }
  return out;
}, n);
const PE = () => page.evaluate(() => structuredClone(S.produktForschung || null));

// Einfach: keine Bedienelemente
await neuesSpiel('Einfach');
await page.evaluate(() => { S.tutorial = TUTORIAL.length; });
await wissenForschung();
assert.match(await page.locator('.pe-bereich').textContent(), /gibt es auf Mittel und Schwer/);
assert.equal(await page.locator('[data-pe-einstellen]').count(), 0);

// Mittel, noch in der Einführung: noch zu; Wissen & Verbesserungen unverändert
await neuesSpiel('Mittel');
await wissenForschung();
assert.match(await page.locator('.pe-bereich').textContent(), /nach der Einführung/);
await page.locator('[data-pe-reiter="wissen"]').click();
assert.equal(await page.locator('.segkarte').count(), await page.evaluate(() => WISSEN.length));

// Nach der Einführung: Stelle offen, drei Personen zur Wahl
await betrieb();
await page.evaluate(() => { for (let i = 0; i < 10; i++) tagVor(); });
await wissenForschung();
assert.equal(await page.locator('[data-pe-einstellen]').count(), 3);
assert.equal(await page.locator('[data-pe-ziel="kabel"]').getAttribute('aria-disabled'), 'true', 'ohne Fabrik kein Ziel');
assert.deepEqual(await tagesKosten(3), [0, 0, 0], 'ohne Person kein Lohn');

// Ziel Mainboard, Experte anstellen (CHF 18'000 pro Monat, 60 Tage pro Tier)
await wissenForschung();
await page.locator('[data-pe-ziel="board"]').click();
await page.locator('[data-pe-einstellen="experte"]').click();
assert.equal((await PE()).forscher, 'experte');
const lohn = 18000 / 30;
const kosten60 = await tagesKosten(60);
assert.ok(kosten60.every(x => Math.abs(x - lohn) < 0.01), 'Lohn jeden Tag: ' + kosten60.join(', '));
let pe = await PE();
assert.equal(pe.stufen.board, 2, 'nach 60 Tagen Tier 2');
assert.equal(await page.evaluate(() => window.__erzweltProduktentwicklung.faktor('board')), 1.05);
let log = await page.evaluate(() => S.log.map(e => e.text).join(' | '));
assert.match(log, /Forschung abgeschlossen!.*Mainboard V1.*Stufe 2.*weiter mit Stufe 3/);
// automatisch weiter am nächsten Tier
await tagesKosten(5);
pe = await PE();
assert.equal(pe.ziel, 'board');
assert.ok(Math.abs(pe.fortschritt.board - 5 / 60) < 1e-9, 'Tier 3 läuft automatisch: ' + pe.fortschritt.board);

// Kündigen: kein Lohn, kein Fortschritt; Fortschritt bleibt
await wissenForschung();
await page.locator('[data-pe-kuendigen]').click();
assert.deepEqual(await tagesKosten(4), [0, 0, 0, 0]);
assert.ok(Math.abs((await PE()).fortschritt.board - 5 / 60) < 1e-9);

// Junior übernimmt: Anteil bleibt, Junior braucht 90 Tage pro Tier
await wissenForschung();
await page.locator('[data-pe-einstellen="junior"]').click();
await tagesKosten(10);
assert.ok(Math.abs((await PE()).fortschritt.board - (5 / 60 + 10 / 90)) < 1e-9);

// Speichern, neu laden, weiter
await page.evaluate(() => speichern(true));
const vorReload = await PE();
await page.reload();
await page.locator('#spielmenue-weiter').click();
await page.evaluate(() => { tempoSetzen(0); ereignisPruefen = () => {}; });
assert.deepEqual(await PE(), vorReload);

// Export → Import behält alles; manipulierte Daten werden abgelehnt
const paket = await page.evaluate(() => JSON.stringify({saveFormat:SPIELSTAND_FORMAT, schemaVersion:SPIELSTAND_VERSION,
  slot:{name:'Test', savedAt:new Date().toISOString()}, gameState:S}));
assert.deepEqual(await page.evaluate(roh => spielstandDatei(roh).state.produktForschung, paket), vorReload);
for (const [name, aendern] of [
  ['Tier 6', s => { s.produktForschung.stufen.board = 6; }],
  ['unbekannte Person', s => { s.produktForschung.forscher = 'genie'; }],
  ['Fortschritt über 100 %', s => { s.produktForschung.fortschritt.board = 2; }],
  ['negativer Lohn', s => { s.produktForschung.lohnBezahlt = -5; }],
  ['unbekanntes Feld', s => { s.produktForschung.bonus = 99; }],
  ['unbekanntes Produkt', s => { s.produktForschung.ziel = 'grafikkarte'; }]
]){
  const abgelehnt = await page.evaluate(([roh, code]) => {
    const p = JSON.parse(roh); (0, eval)('(' + code + ')')(p.gameState);
    try { spielstandDatei(JSON.stringify(p)); return false; } catch (e){ return true; }
  }, [paket, aendern.toString()]);
  assert.ok(abgelehnt, name + ' muss abgelehnt werden');
}

// Weiter bis Tier 5: je Tier eine Meldung, dann «höchstes Tier»; Lohn läuft weiter
const rest = await page.evaluate(() => {
  let n = 0;
  while (S.produktForschung.stufen.board < 3 && n < 120){ tagVor(); n++; }
  return n;
});
assert.equal(rest, 73, 'Junior: 90 Tage pro Tier, 5/60 + 10/90 geschafft → noch 72.5, also 73 Tage');
assert.equal(await page.evaluate(() => window.__erzweltProduktentwicklung.faktor('board')), 1.1);
await page.evaluate(() => { let n = 0; while (S.produktForschung.stufen.board < 5 && n < 400){ tagVor(); n++; } });
assert.equal(await page.evaluate(() => window.__erzweltProduktentwicklung.faktor('board')), 1.2);
log = await page.evaluate(() => S.log.map(e => e.text).join(' | '));
assert.match(log, /Stufe 5.*höchste Stufe/);
assert.equal(await page.evaluate(() => S.log.filter(e => /Forschung abgeschlossen!/.test(e.text)).length), 4, 'je Tier genau eine Meldung');
const leer = await tagesKosten(3);
assert.ok(leer.every(x => Math.abs(x - 8000 / 30) < 0.01), 'Lohn läuft weiter, solange angestellt');

// Ansicht auf 360 px: Kündigen-Knopf und Hinweis sichtbar
await wissenForschung();
assert.match(await page.locator('.pe-bereich').textContent(), /höchste Stufe/);
const box = await page.locator('[data-pe-kuendigen]').boundingBox();
assert.ok(box && box.width <= 360 && box.height >= 44);

assert.deepEqual(errors, []);
await browser.close();
console.log('PASS Produktentwicklung: Stelle, Lohn, Ziel, automatisch weiter, Meldungen, Speichern, Import-Prüfung');
