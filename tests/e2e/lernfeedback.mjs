import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({viewport:{width:360,height:800}});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  if (!localStorage.getItem('erzwelt_opt')) localStorage.setItem('erzwelt_opt', '{"meldungsdauer":50}');
});
const feedback = page.locator('#tutorial-lernfeedback');
const slider = page.getByRole('slider', {name:'Dauer für Schrittfeedback'});
const settings = page.locator('#einst');

try {
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.locator('#spielmenue-neu').click();
  await page.locator('[data-slot-id="1"] button').click();
  if (await page.locator('#bilder-intro').isVisible()) await page.locator('#bilder-intro .intro-sprung').click();
  await page.locator('#d-wahlen').getByRole('button', {name:/^Mittel/}).click();
  await page.evaluate(() => tempoSetzen(0));
  await page.clock.install();

  await page.evaluate(() => {
    S.minen.katanga = {arbeiter:0,stufe:1,zufriedenheit:55,stillBis:0,malus:1,malusBis:0,ausbau:0};
    tutorialPruefen();
    S.minen.katanga.arbeiter = S.arbeiterGesamt = 15;
    tutorialPruefen();
    zeichnen();
  });
  assert.match(await feedback.innerText(), /Das Ladekabel braucht Kupfer/);
  await page.clock.runFor(3500);
  assert.match(await feedback.innerText(), /Das Ladekabel braucht Kupfer/);
  assert.equal(await feedback.evaluate(el => el.classList.contains('feedback-aus')), false);
  // Opazität kann noch kurz überblenden – auf den Endwert warten statt sofort messen
  await page.waitForFunction(() => getComputedStyle(document.getElementById('toasts')).opacity === '1', null, { timeout: 3000 });

  await page.locator('#einstauf').evaluate(btn => btn.click());
  assert.match(await page.locator('#w-lernfeedbackdauer').innerText(), /6[.,]7.*10[.,]7 s/);
  await slider.fill('200');
  assert.match(await page.locator('#w-lernfeedbackdauer').innerText(), /13[.,]4.*21[.,]4 s/);
  assert.equal(await page.evaluate(() => OPT.meldungsdauer), 50);
  await page.clock.runFor(8000);
  assert.match(await feedback.innerText(), /Das Ladekabel braucht Kupfer/);
  // Nächstes Feedback innerhalb der eingestellten Dauer (max. 21.4 s) – in kleinen
  // Schritten vorspulen, damit echte Laufzeit auf dem Runner das Timing nicht kippt.
  let naechstes = '';
  for (let i = 0; i < 40 && !/Personal kostet zweimal/.test(naechstes); i++){
    await page.clock.runFor(250);
    naechstes = await feedback.count() ? await feedback.innerText() : '';
  }
  assert.match(naechstes, /Personal kostet zweimal/);

  // Complete the last tutorial task and check the longer timing without animations.
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(() => {
    window.__erzweltTutorialEnhance.feedbackZuruecksetzen();
    S.tutorial = TUTORIAL.length - 1;
    S.verkaeufer = 4;
    tutorialPruefen();
  });
  assert.match(await feedback.innerText(), /Tutorial abgeschlossen/);
  assert.equal(await feedback.locator('.lernfeedback-zeit').isVisible(), false);
  await slider.fill('100');
  await page.clock.runFor(9500);
  assert.match(await feedback.innerText(), /Tutorial abgeschlossen/);
  // Ende nach 10.7 s (+ Ausblenden): in kleinen Schritten abwarten statt fixem Fenster
  for (let i = 0; i < 16 && await feedback.count(); i++) await page.clock.runFor(250);
  assert.equal(await feedback.count(), 0);

  await slider.fill('150');
  await page.evaluate(() => {
    S.tutorial = TUTORIAL.length - 1;
    tutorialPruefen();
  });
  assert.equal(await feedback.count(), 1);
  await settings.getByRole('button', {name:'Speichern & zum Hauptmenü'}).evaluate(btn => btn.click());
  assert.equal(await feedback.count(), 0);
  await page.reload();
  await page.locator('#spielmenue-weiter').click();
  assert.deepEqual(await page.evaluate(() => [OPT.lernfeedbackdauer, OPT.meldungsdauer]), [150,50]);
  assert.equal(await feedback.count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS tutorial feedback: longer reading time, queue, slider, reduced motion and save-slot cleanup');
} finally {
  await browser.close();
}
