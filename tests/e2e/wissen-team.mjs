import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({viewport:{width:360,height:800}, reducedMotion:'reduce'});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const guide = page.getByRole('button', {name:'Aktuelles Ziel anzeigen'});
const team = page.locator('#team-einsaetze');

try {
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.locator('#spielmenue-neu').click();
  await page.locator('[data-slot-id="1"] button').click();
  if (await page.locator('#bilder-intro').isVisible()) await page.locator('#bilder-intro .intro-sprung').evaluate(b => b.click());
  await page.locator('#d-wahlen').getByRole('button', {name:/^Mittel/}).click();

  await page.evaluate(() => {
    tempoSetzen(0);
    S.tutorial = TUTORIAL.length;
    S.wissenQuestFlow.collected.basis = true;
    zeichnen();
  });
  assert.match(await page.locator('#q-text').innerText(), /Eröffne eine eigene Rohstoffquelle/);
  assert.equal(await guide.count(), 0);

  const erwartet = await page.evaluate(() => {
    S.minen.boke = {arbeiter:0,stufe:1,zufriedenheit:55,stillBis:0,malus:1,malusBis:0,ausbau:0,sicherheit:true,nachweis:true};
    S.minen.katanga = {...S.minen.boke, arbeiter:3, stufe:2};
    S.raff.r_china = {arbeiter:2,ausbau:0};
    S.fabriken = [{produkt:'kabel',land:'mexiko',arbeiter:4,restbau:0}];
    S.verkaeufer = 2;
    S.arbeiterGesamt = 14;
    S.perks.mod1 = S.perks.mod2 = true;
    ebenen.mine = false;
    zeichnen();
    const rohstoff = 3 * LAND[MINEN.find(m => m.id === 'katanga').land].lohn * LOHNSTUFE[2].faktor;
    const personal = (rohstoff + 2*LAND.china.lohn + 4*LAND.mexiko.lohn + 2*VERKAUF_LOHN + 3*200) * .94;
    const betrieb = (9000 + 14000) * .85;
    return {
      rohstoff:chf(rohstoff * .94), frei:chf(3*200*.94), personal:chf(personal),
      betrieb:chf(betrieb), gesamt:chf(personal+betrieb), wert:personal+betrieb
    };
  });
  await guide.click();
  await page.waitForFunction(() => offenesBlatt?.id === 'katanga' && ebenen.mine &&
    document.activeElement.dataset.tun === 'lohn');
  await page.locator('#blatt #zu').click();
  await page.locator('#dock button[data-seite="team"]').click();
  assert.match(await team.innerText(), /Lohn pro Monat/);
  assert.match(await team.innerText(), /alle 30 Spieltage/);
  assert.equal(await team.locator('#team-personalkosten').innerText(), erwartet.personal);
  assert.equal(await team.locator('#team-betriebskosten').innerText(), erwartet.betrieb);
  assert.equal(await team.locator('#team-gesamtausgaben').innerText(), erwartet.gesamt);
  assert.equal(await team.getByRole('row').filter({hasText:'Katanga'}).locator('td').last().innerText(), erwartet.rohstoff);
  assert.equal(await team.getByRole('row').filter({hasText:'Ohne Einsatz'}).locator('td').last().innerText(), erwartet.frei);
  assert.ok(await team.evaluate(el => el.scrollWidth <= el.clientWidth));

  const belastung = await page.evaluate(() => {
    S.tag = 29;
    const ausgaben = S.ausgegeben;
    tagVor();
    const tag30 = S.ausgegeben - ausgaben;
    tagVor();
    return [tag30, S.ausgegeben - ausgaben];
  });
  assert.equal(belastung[0], 0);
  assert.ok(Math.abs(belastung[1] - erwartet.wert) < 1e-6);
  assert.deepEqual(errors, []);
  console.log('PASS knowledge targets and team costs: owned mine, wage control, monthly wages and actual debit');
} finally {
  await browser.close();
}
