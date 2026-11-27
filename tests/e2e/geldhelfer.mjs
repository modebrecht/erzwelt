// Geldhelfer: nur auf Einfach, erscheint bei knapper Kasse in der Aufgabenkarte,
// nennt Gründe aus dem Spielstand, «Verstanden» blendet aus, genug Geld → weg.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const errors = [];
const page = await (await browser.newContext({ viewport:{width:360, height:800}, reducedMotion:'reduce' })).newPage();
page.on('pageerror', error => errors.push(error.message));

async function spiel(stufe){
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('#spielmenue-neu').click();
  await page.getByRole('button', { name: 'Hier starten · Spielstand 1' }).click();
  await page.locator('#bilder-intro .intro-sprung').evaluate(b => b.click());
  await page.getByRole('button', { name: new RegExp(stufe) }).filter({ visible: true }).first().click();
  return page.evaluate(() => {
    tempoSetzen(0); ereignisPruefen = () => {};
    S.tutorial = TUTORIAL.length;
    S.fabriken.push({produkt:'kabel', land:'china', arbeiter:0, restbau:0});
    S.produktEntdeckungen = {kabel:{status:'gesehen'}};
    S.arbeiterGesamt += 40; S.ware.kabel = 300;
    for (let i = 0; i < 12; i++) tagVor();
    S.kasse = 60000; questZeichnen();
    return document.querySelector('#quest .geld-helfer')?.textContent || null;
  });
}

const mittel = await spiel('Mittel');
assert.equal(mittel, null, 'auf Mittel kein Geldhelfer');

const text = await spiel('Einfach');
assert.ok(text, 'auf Einfach erscheint der Geldhelfer');
assert.match(text, /Kasse wird knapp/);
assert.match(text, /Personen ohne Aufgabe/);
await page.locator('[data-gh-mehr]').click();
const mehr = await page.locator('#quest .geld-helfer').textContent();
assert.match(mehr, /niemand verkauft/);
assert.match(mehr, /kein Personal/);
await page.locator('[data-gh-ok]').click();
assert.equal(await page.locator('#quest .geld-helfer').count(), 0, '«Verstanden» blendet aus');
// sinkt die Kasse stark weiter, kommt er wieder
await page.evaluate(() => { S.kasse = -5000; questZeichnen(); });
assert.match(await page.locator('#quest .geld-helfer').textContent(), /Kasse im Minus/);
// genug Geld: weg
await page.evaluate(() => { S.kasse = 2e6; questZeichnen(); });
assert.equal(await page.locator('#quest .geld-helfer').count(), 0);
// «Zum Team» öffnet den Team-Reiter
await page.evaluate(() => { S.kasse = 30000; questZeichnen(); });
await page.locator('[data-gh-ziel="team"]').click();
assert.equal(await page.evaluate(() => aktiveSeite), 'team');

assert.deepEqual(errors, []);
await browser.close();
console.log('PASS Geldhelfer: nur Einfach, Gründe, ausblenden, wieder einblenden, weg bei genug Geld');
