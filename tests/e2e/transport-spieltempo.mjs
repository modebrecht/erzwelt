import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({viewport:{width:390,height:844}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const tag = () => page.evaluate(() => S.tag);
const liefersymbole = page.locator('svg.weltkarte [data-lieferanzeige]');
const auswahl = page.getByRole('combobox', {name:'Liefersymbole'});

try {
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.locator('#spielmenue-neu').click();
  await page.locator('[data-slot-id="1"] button').click();
  if (await page.locator('#bilder-intro').isVisible()) await page.locator('#bilder-intro .intro-sprung').click();
  await page.locator('#d-wahlen').getByRole('button', {name:/^Mittel/}).click();
  await page.evaluate(() => tempoSetzen(0));

  const testzeit = new Date('2026-01-01T12:00:00Z');
  await page.clock.install({time:testzeit});
  await page.clock.pauseAt(new Date(testzeit.getTime() + 5000));
  async function spieltag(tempo, dauer){
    const vorher = await tag();
    await page.evaluate(v => tempoSetzen(v), tempo);
    await page.clock.runFor(dauer - 1);
    assert.equal(await tag(), vorher);
    await page.clock.runFor(1);
    assert.equal(await tag(), vorher + 1);
  }
  await spieltag(1, 3000);
  await spieltag(4, 750);
  await page.evaluate(() => { letzterMeldungstag = {spiel:S,tag:S.tag,folge:true}; });
  await spieltag(1, 6000);

  await page.evaluate(() => {
    tempoSetzen(0);
    S.tutorial = TUTORIAL.length;
    for (const id of ['katanga','boke']){
      S.minen[id] = {arbeiter:5,stufe:1,zufriedenheit:60,stillBis:0,malus:1,malusBis:0,ausbau:0,sicherheit:true,nachweis:true};
    }
    S.arbeiterGesamt = 30;
    S.raff.r_china = {arbeiter:5,ausbau:0};
    S.fabriken = [{produkt:'kabel',land:'deutschland',arbeiter:4,restbau:0}];
    S.erz.kupfer = 250;
    S.mat = {kupfer:250,alu:250,zinn:250};
    S.ware.kabel = 20;
    S.verkaeufer = 10;
    S.produktEntdeckungen.kabel = {status:'gesehen',ersterTag:S.tag};
    zeichnen();
  });
  const routes = await page.evaluate(() => ({
    linien:[...document.querySelectorAll('svg.weltkarte .lieferlinie')].map(el => el.getAttribute('d')),
    punkte:[...document.querySelectorAll('svg.weltkarte .lieferpunkt animateMotion')].map(el => el.getAttribute('path')),
    beispiel:[...document.querySelectorAll('#didaktik-transport animateMotion')].map(el => el.getAttribute('dur')),
    fahrzeuge:document.querySelectorAll('.didaktik-truck,.didaktik-ship').length,
    pausiert:document.querySelector('svg.weltkarte').animationsPaused()
  }));
  assert.equal(routes.linien.length, 3);
  assert.equal(new Set(routes.linien).size, routes.linien.length);
  assert.deepEqual(routes.punkte.sort(), routes.linien.sort());
  assert.deepEqual(routes.beispiel, ['16.00s','22.00s']);
  assert.equal(routes.fahrzeuge, 0);
  assert.equal(routes.pausiert, true);
  assert.doesNotMatch(await page.locator('#lieferweg-knopf').textContent(), /LKW|Lastwagen/);

  await page.locator('#einstauf').evaluate(btn => btn.click());
  assert.equal(await auswahl.inputValue(), 'punkt');
  for (const art of ['schiff','flugzeug','punkt','flugzeug']){
    await auswahl.selectOption(art);
    assert.deepEqual(await liefersymbole.evaluateAll(els => els.map(el => el.dataset.lieferanzeige)), [art,art,art]);
    if (art !== 'punkt') assert.ok(await liefersymbole.first().locator('path').evaluate(el => el.getTotalLength() > 0));
    const anzeige = await page.evaluate(() => ({
      pfade:[...document.querySelectorAll('[data-lieferanzeige] animateMotion')].map(el => el.getAttribute('path')).sort(),
      dauern:[...document.querySelectorAll('#didaktik-transport animateMotion')].map(el => el.getAttribute('dur')),
      tempo
    }));
    assert.deepEqual(anzeige.pfade, routes.linien);
    assert.deepEqual(anzeige.dauern, routes.beispiel);
    assert.equal(anzeige.tempo, 0);
  }
  await page.locator('[data-schliessen="einst"]').evaluate(btn => btn.click());

  await page.evaluate(() => { OPT.anim=0; optAnwenden(); });
  assert.equal(await liefersymbole.count(), 0);
  assert.equal(await page.locator('svg.weltkarte .lieferlinie').count(), 3);
  await page.evaluate(() => { OPT.anim=1; optAnwenden(); });
  assert.equal(await liefersymbole.count(), 3);
  await page.emulateMedia({reducedMotion:'reduce'});
  await liefersymbole.first().waitFor({state:'hidden'});
  await page.emulateMedia({reducedMotion:'no-preference'});

  const verkauf = await page.evaluate(() => {
    const vorher = S.eingenommen;
    tagVor();
    zeichnen();
    return Math.round(S.eingenommen - vorher);
  });
  assert.ok(verkauf > 0);
  const kasse = page.locator('.pille.kasse .kasse-plus');
  assert.equal(await kasse.innerText(), await page.evaluate(n => '+' + n.toLocaleString('de-CH'), verkauf));
  assert.equal(await kasse.evaluate(el => getComputedStyle(el).animationName), 'kassePlus');
  assert.equal(await kasse.evaluate(el => getComputedStyle(el).color), 'rgb(127, 224, 168)');
  await page.clock.runFor(1600);
  assert.equal(await kasse.count(), 0);
  assert.equal(await page.locator('.verkauf-paket,.verkauf-geld,.muenz-flug,#verkauf-visual-layer').count(), 0);
  await page.evaluate(() => speichern(true));
  await page.reload();
  await page.locator('#spielmenue-weiter').click();
  await page.evaluate(() => tempoSetzen(0));
  await page.locator('#einstauf').evaluate(btn => btn.click());
  assert.equal(await auswahl.inputValue(), 'flugzeug');
  assert.deepEqual(await liefersymbole.evaluateAll(els => els.map(el => el.dataset.lieferanzeige)), Array(3).fill('flugzeug'));
  assert.deepEqual(errors, []);
  console.log('PASS transport and pacing: three persisted symbol modes, one marker per route, motion settings, green sale amount and 3s/750ms days');
} finally {
  await browser.close();
}
