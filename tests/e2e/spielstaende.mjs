import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless:true, chromiumSandbox:true });
const url = 'http://127.0.0.1:4173/index.html';
const errors = [];
const newPage = async (options, init) => {
  const context = await browser.newContext({ acceptDownloads:true, reducedMotion:'reduce', ...options });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return page;
};
const menu = page => page.locator('#spielmenue');
const slot = (page, id) => menu(page).locator(`[data-slot-id="${id}"]`);
const open = (page, id) => menu(page).locator('#spielmenue-' + id).click();
const act = (region, name) => region.getByRole('button', {name}).click();
const visible = locator => locator.waitFor({state:'visible'});
const state = page => page.evaluate(() => structuredClone(S));
const stored = (page, id) => page.evaluate(n => localStorage.getItem('erzwelt_slot_v1_' + n), id);
const noGame = page => page.evaluate(() => !spielAktiv && !takt && tempo === 0);
const settings = page => page.locator('#einst');
const manualSave = page => page.evaluate(() => speichern(true));

async function newGame(page, id, difficulty){
  await open(page, 'neu');
  await act(slot(page, id), /^Hier starten/);
  await page.locator('#einstieg .es-los').click();
  await page.locator('#einstieg').waitFor({state:'hidden'});
  await act(page.locator('#d-wahlen'), new RegExp('^' + difficulty));
  await page.evaluate(() => tempoSetzen(0));
}

async function leave(page){
  await page.locator('#einstauf').click();
  await act(settings(page), 'Speichern & zum Hauptmenü');
  await visible(menu(page));
  assert.ok(await noGame(page));
}

async function exportJson(page, target){
  const [download] = await Promise.all([page.waitForEvent('download'), target.click()]);
  assert.match(download.suggestedFilename(), /^erzwelt-.+\.json$/);
  return JSON.parse(await readFile(await download.path(), 'utf8'));
}

async function importJson(page, content){
  await page.locator('#spielmenue-datei').setInputFiles({
    name:'spielstand.json', mimeType:'application/json', buffer:Buffer.from(content)
  });
}

try {
  const page = await newPage({ viewport:{width:360,height:800}, isMobile:true, hasTouch:true });
  await page.goto(url);
  await visible(page.locator('#spielmenue-neu'));
  await page.waitForTimeout(1600);
  assert.ok(await noGame(page));
  assert.equal((await state(page)).tag, 1);
  assert.equal(await menu(page).locator('#spielmenue-weiter').count(), 0);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'spielmenue-neu');
  await page.keyboard.press('Enter');
  await visible(slot(page, 3));
  assert.equal(await menu(page).locator('[data-slot-id]').count(), 3);
  await page.evaluate(() => { OPT.schrift = 175; optAnwenden(); });
  assert.ok(await page.evaluate(() => document.querySelector('#spielmenue').scrollWidth <= innerWidth));
  await page.evaluate(() => { OPT.schrift = 106; optAnwenden(); });
  await act(menu(page), 'Zum Hauptmenü');

  await newGame(page, 1, 'Mittel');
  // Rich state at a payday boundary, while a factory is still being built.
  await page.evaluate(() => {
    S.tag = 30;
    S.kasse = 923456;
    S.ausgegeben = 326544;
    S.arbeiterGesamt = 11;
    S.minen.katanga = {arbeiter:4, stufe:1, zufriedenheit:52, stillBis:0, malus:1, malusBis:0, ausbau:0, sicherheit:true, nachweis:false};
    S.fabriken.push({produkt:'kabel', land:'china', arbeiter:3, restbau:4});
    S.erz.kupfer = 123;
    S.mat.kupfer = 87;
    S.ware.kabel = 11;
    S.nachfrageMod.kabel = {faktor:1.1, bis:86};
    S.wissenQuestFlow.flags.lohn = true;
    S.zertifikatProfil = {vorname:'André'};
    produktBuchen('kabel', 23, 12, 4567);
    notiz('Monatsabschluss: Löhne CHF 400, Betrieb CHF 300.', 'geld');
  });
  assert.ok(await manualSave(page));
  await page.locator('#einstauf').click();
  const active = await exportJson(page, settings(page).getByRole('button', {name:'Spielstand exportieren'}));
  assert.equal(active.slot.day, 30);
  assert.equal(active.gameState.leistungsdaten.produkte.kabel.erloes, 4567);
  await act(settings(page), 'Speichern & zum Hauptmenü');
  await visible(menu(page));
  const firstRaw = await stored(page, 1);
  await page.waitForTimeout(1600);
  assert.equal(await stored(page, 1), firstRaw);

  await newGame(page, 2, 'Einfach');
  assert.equal((await state(page)).tag, 1);
  assert.deepEqual((await state(page)).minen, {});
  await leave(page);
  const secondRaw = await stored(page, 2);
  await newGame(page, 3, 'Mittel');
  await page.evaluate(() => { S.tag = 17; speichern(); });
  await leave(page);
  assert.equal(await stored(page, 1), firstRaw);
  assert.equal(await stored(page, 2), secondRaw);
  await page.reload();
  await visible(menu(page).locator('#spielmenue-weiter'));
  assert.match(await menu(page).innerText(), /Spielstand 3 · Mittel · Tag 17/);
  await open(page, 'slots');
  const inactive = await exportJson(page, slot(page, 1).getByRole('button', {name:/Exportieren/}));
  assert.deepEqual(inactive.gameState, active.gameState);
  await act(slot(page, 1), /Fortsetzen/);
  assert.equal(await page.evaluate(() => tempo), 1);
  assert.deepEqual(await state(page), active.gameState);

  // A hidden document must not run a day, even if the player selected fast speed.
  await page.evaluate(() => {
    tempoSetzen(4);
    Object.defineProperty(document, 'hidden', {configurable:true, value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(850);
  assert.equal((await state(page)).tag, 30);
  await page.evaluate(() => { tempoSetzen(0); delete document.hidden; });

  // A critical decision is saved and reopens with the same mine, then settles once.
  await page.evaluate(() => dialogZeigen(ereignis('protest').bau('katanga')));
  await act(page.locator('#d-wahlen'), 'Speichern & zum Hauptmenü');
  await visible(menu(page));
  await open(page, 'weiter');
  await visible(page.getByText('Streik in Katanga', {exact:false}));
  const vorEinigung = (await state(page)).kasse;
  await act(page.locator('#d-wahlen'), /^Verhandeln und Prämie zahlen/);
  await page.evaluate(() => tempoSetzen(0));
  assert.equal((await state(page)).kasse, vorEinigung - 60000);
  assert.equal((await state(page)).minen.katanga.stillBis, 35);
  assert.equal((await state(page)).offenesEreignis, undefined);

  for (const grund of ['etappe', 'insolvenz']){
    await page.evaluate(g => rundeBeenden(g), grund);
    await act(page.locator('#d-wahlen'), 'Speichern & zum Hauptmenü');
    await visible(menu(page));
    await open(page, 'weiter');
    await visible(page.locator('[data-certificate-open]'));
    assert.equal((await state(page)).ende.grund, grund);
    if (grund === 'etappe'){
      await act(page.locator('#d-wahlen'), /^Weiter · Etappe/);
      await page.evaluate(() => tempoSetzen(0));
      assert.equal((await state(page)).etappe, 2);
    }
  }
  await act(page.locator('#d-wahlen'), 'Speichern & zum Hauptmenü');
  await open(page, 'slots');
  page.once('dialog', d => d.accept('Meine Firma'));
  await act(slot(page, 1), /Umbenennen/);
  await visible(slot(page, 1).getByRole('heading', {name:/Meine Firma/}));
  page.once('dialog', async d => { assert.match(d.message(), /Meine Firma/); await d.dismiss(); });
  await act(slot(page, 1), /Löschen/);
  await visible(slot(page, 1).getByRole('heading', {name:/Meine Firma/}));
  page.once('dialog', async d => { assert.match(d.message(), /Meine Firma/); await d.accept(); });
  await act(slot(page, 1), /Löschen/);
  await visible(slot(page, 1).getByRole('heading', {name:/Freier Speicherplatz/}));
  assert.equal(await stored(page, 2), secondRaw);
  await act(menu(page), 'Zum Hauptmenü');
  await open(page, 'neu');
  page.once('dialog', d => d.dismiss());
  await act(slot(page, 2), /Mit neuem Spiel überschreiben/);
  assert.equal(await stored(page, 2), secondRaw);
  const thirdRaw = await stored(page, 3);
  page.once('dialog', async d => { assert.match(d.message(), /Spielstand 2/); await d.accept(); });
  await act(slot(page, 2), /Mit neuem Spiel überschreiben/);
  await visible(page.locator('#einstieg .es-los'));
  assert.equal((await state(page)).schwierigkeit, null);
  assert.equal(await stored(page, 3), thirdRaw);

  const clean = await newPage({ viewport:{width:1280,height:800} });
  await clean.goto(url);
  await visible(menu(clean).locator('#spielmenue-import'));
  for (const [content, message] of [
    ['{', /gültiges JSON/],
    [JSON.stringify({...inactive, schemaVersion:999}), /Version/],
    [JSON.stringify({...inactive, gameState:{...inactive.gameState, minen:{katanga:{arbeiter:'drei'}}}}), /minen/],
    [JSON.stringify({...inactive, gameState:{...inactive.gameState, ware:{erfunden:17}}}), /ware/],
    [JSON.stringify({...inactive, gameState:{...inactive.gameState, offenesEreignis:{id:'protest', mine:['katanga']}}}), /offenesEreignis/],
    [JSON.stringify({...inactive, gameState:{...inactive.gameState, perks:JSON.parse('{"__proto__":true}')}}), /Eigenschaft/]
  ]){
    await importJson(clean, content);
    await visible(menu(clean).getByText(message));
    assert.equal(await stored(clean, 1), null);
  }
  await importJson(clean, JSON.stringify(inactive));
  await visible(menu(clean).getByRole('heading', {name:'Spielstand importieren'}));
  assert.equal(await stored(clean, 1), null);
  await act(slot(clean, 1), /Hier importieren/);
  assert.ok(await noGame(clean));
  await open(clean, 'import-weiter');
  assert.deepEqual(await state(clean), inactive.gameState);
  await leave(clean);

  const risky = structuredClone(inactive);
  risky.slot.name = '<img src=x onerror="window.ap3Executed=true"> Übung';
  risky.gameState.schwierigkeit = 'schwer';
  risky.gameState.log.unshift({tag:30, art:'warn', text:'<b onclick="window.ap3Executed=true">Prüfung</b><img src=x onerror="window.ap3Executed=true"><script>window.ap3Executed=true</script>'});
  risky.gameState.ende = {grund:'etappe', etappe:1, gewinn:4000000, ruf:90, geschafft:true};
  risky.gameState.OPT = {tempo:250};
  risky.gameState.META = {mittelGeschafft:true};
  await importJson(clean, JSON.stringify(risky));
  await visible(menu(clean).getByText(risky.slot.name, {exact:true}));
  const cleanFirst = await stored(clean, 1);
  clean.once('dialog', d => d.dismiss());
  await act(slot(clean, 1), /Mit Import überschreiben/);
  assert.equal(await stored(clean, 1), cleanFirst);
  await act(slot(clean, 2), /Hier importieren/);
  await open(clean, 'import-weiter');
  const sicher = await state(clean);
  assert.equal(sicher.log[0].text, '<b>Prüfung</b>');
  assert.equal(sicher.schwierigkeit, 'schwer');
  assert.equal(sicher.OPT, undefined);
  assert.deepEqual(await clean.evaluate(() => [META.mittelGeschafft, OPT.tempo, window.ap3Executed]), [false,100,undefined]);
  assert.equal(await stored(clean, 1), cleanFirst);
  await act(clean.locator('#d-wahlen'), 'Speichern & zum Hauptmenü');
  await importJson(clean, JSON.stringify({...inactive, slot:{...inactive.slot, name:'Überschrieben'}}));
  await visible(menu(clean).getByRole('heading', {name:'Spielstand importieren'}));
  const cleanSecond = await stored(clean, 2);
  clean.once('dialog', async d => { assert.match(d.message(), /Spielstand 1/); await d.accept(); });
  await act(slot(clean, 1), /Mit Import überschreiben/);
  assert.equal(JSON.parse(await stored(clean, 1)).name, 'Überschrieben');
  assert.equal(await stored(clean, 2), cleanSecond);

  const legacy = await newPage();
  await legacy.goto(url);
  await visible(menu(legacy).locator('#spielmenue-neu'));
  const rawLegacy = await legacy.evaluate(() => {
    const alt = neuerZustand();
    Object.assign(alt, {tag:77, kasse:612345, arbeiterGesamt:10, schwierigkeit:'mittel'});
    delete alt.leistungsdaten;
    delete alt.startTeam;
    localStorage.setItem('erzwelt_v1', JSON.stringify(alt));
    localStorage.setItem('erzwelt_v2', '{broken');
    return localStorage.getItem('erzwelt_v1');
  });
  await legacy.reload();
  await visible(menu(legacy).getByText(/lesbare alte Spielstand/));
  assert.equal(await legacy.evaluate(() => localStorage.getItem('erzwelt_v1')), rawLegacy);
  assert.equal(await legacy.evaluate(() => localStorage.getItem('erzwelt_v2')), '{broken');
  await open(legacy, 'slots');
  const backup = await exportJson(legacy, slot(legacy, 1).getByRole('button', {name:/Exportieren/}));
  assert.equal(backup.gameState.leistungsdaten.vollstaendig, false);
  assert.equal(backup.gameState.startTeam, 10);
  await legacy.reload();
  await open(legacy, 'slots');
  legacy.once('dialog', d => d.accept());
  await act(slot(legacy, 1), /Löschen/);
  await legacy.reload();
  await visible(menu(legacy).locator('#spielmenue-neu'));
  assert.equal(await stored(legacy, 1), null);

  const quota = await newPage();
  await quota.goto(url);
  await newGame(quota, 1, 'Mittel');
  const quotaBefore = await stored(quota, 1);
  await quota.evaluate(() => {
    S.kasse = 17;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value){
      if (key.startsWith('erzwelt_slot_v1_')) throw new DOMException('Voll', 'QuotaExceededError');
      return setItem.call(this, key, value);
    };
  });
  await quota.locator('#einstauf').click();
  await act(settings(quota), 'Speichern & zum Hauptmenü');
  await visible(settings(quota).getByRole('alert'));
  assert.equal(await quota.evaluate(() => tempo), 0);
  assert.equal(await stored(quota, 1), quotaBefore);
  const rescue = await exportJson(quota, settings(quota).getByRole('button', {name:'Spielstand exportieren'}));
  assert.equal(rescue.gameState.kasse, 17);
  await act(settings(quota), /^Zum Hauptmenü$/);
  await visible(menu(quota));

  const offline = await newPage({}, () => {
    Object.defineProperty(window, 'localStorage', { get(){ throw new DOMException('Gesperrt', 'SecurityError'); } });
  });
  await offline.context().route(/^https?:/, route => route.abort());
  await offline.goto(pathToFileURL(path.resolve('index.html')).href);
  await visible(menu(offline).getByText(/Nur für diese Sitzung/));
  await newGame(offline, 1, 'Mittel');
  await offline.locator('#einstauf').click();
  await act(settings(offline), 'Speichern & zum Hauptmenü');
  await visible(settings(offline).getByText(/Nur für diese Sitzung gespeichert/));
  const session = await exportJson(offline, settings(offline).getByRole('button', {name:'Spielstand exportieren'}));
  assert.equal(session.saveFormat, 'erzwelt-save');
  await act(settings(offline), /^Zum Hauptmenü$/);
  await visible(menu(offline).locator('#spielmenue-weiter'));

  assert.deepEqual(errors, []);
  console.log('PASS AP3: startup, three isolated slots, JSON round trip, validation, migration, modal restore, storage failures, offline and mobile');
} finally {
  await browser.close();
}
