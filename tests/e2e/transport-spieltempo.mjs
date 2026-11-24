import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({headless:true, chromiumSandbox:true});
const page = await browser.newPage({viewport:{width:390,height:844}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const tag = () => page.evaluate(() => S.tag);
const lieferpunkte = page.locator('svg.weltkarte .lieferpunkt');

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

  await page.evaluate(() => { OPT.anim=0; optAnwenden(); });
  assert.equal(await lieferpunkte.count(), 0);
  assert.equal(await page.locator('svg.weltkarte .lieferlinie').count(), 3);
  await page.evaluate(() => { OPT.anim=1; optAnwenden(); });
  assert.equal(await lieferpunkte.count(), 3);
  await page.emulateMedia({reducedMotion:'reduce'});
  await lieferpunkte.first().waitFor({state:'hidden'});
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
  assert.deepEqual(errors, []);
  console.log('PASS transport and pacing: one marker per route, motion settings, green sale amount and 3s/750ms days');
} finally {
  await browser.close();
}
