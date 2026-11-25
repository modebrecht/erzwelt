import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const url = 'http://127.0.0.1:4173/index.html';
const errors = [];
const {introBilder} = JSON.parse(await readFile('patches.json', 'utf8'));
const newPage = async viewport => {
  const page = await browser.newPage({viewport, reducedMotion:'reduce', hasTouch:true, acceptDownloads:true});
  page.on('pageerror', error => errors.push(error.message));
  return page;
};
const intro = page => page.locator('#bilder-intro');
const image = page => intro(page).locator('img');
const choice = page => page.locator('#d-wahlen');
const discovery = page => page.locator('#schleier:not([hidden]) .entdeckung');
const click = (region, name) => region.getByRole('button', {name}).click();
const next = page => click(choice(page), 'Weiter');
const wait = locator => locator.waitFor({state:'visible'});

async function start(page, nummer){
  await page.locator('#spielmenue-neu').click();
  await page.locator(`[data-slot-id="${nummer}"] button`).click();
}
async function chooseDifficulty(page){
  await click(choice(page), /^Mittel/);
  await page.evaluate(() => tempoSetzen(0));
}
async function checkImage(page, nummer){
  assert.equal(await image(page).count(),1);
  await page.waitForFunction(nummer => {
    const img = document.querySelector('#bilder-intro img');
    return img?.complete && img.naturalWidth >= 1200 &&
      document.querySelector('#bilder-intro .intro-zaehler').textContent === `${nummer} / 4`;
  }, nummer);
  assert.equal(await image(page).getAttribute('alt'), introBilder[nummer-1].alt);
  assert.equal(await intro(page).locator('.intro-text').innerText(), introBilder[nummer-1].text);
  assert.equal(await image(page).evaluate(img => getComputedStyle(img).objectFit), 'contain');
}
async function swipe(page, dx, dy){
  await image(page).evaluate((target, {dx,dy}) => {
    const touch = (clientX,clientY) => new Touch({identifier:1,target,clientX,clientY});
    target.dispatchEvent(new TouchEvent('touchstart',{touches:[touch(150,300)],bubbles:true}));
    target.dispatchEvent(new TouchEvent('touchend',{changedTouches:[touch(150+dx,300+dy)],bubbles:true}));
  }, {dx,dy});
}
async function toMenu(page){
  await page.locator('#einstauf').click();
  await click(page.locator('#einst'), 'Speichern & zum Hauptmenü');
}
async function checkDiscovery(page, id){
  await wait(discovery(page));
  assert.equal(await discovery(page).getAttribute('data-produkt'), id);
  assert.equal(await page.evaluate(() => tempo), 0);
}

try {
  await mkdir('artifacts', {recursive:true});
  const page = await newPage({width:360,height:800});
  const requested = [];
  page.on('request', req => { if (req.url().includes('/assets/intro/')) requested.push(req.url()); });
  let bundleFreigeben;
  const kalterCache = new Promise(resolve => { bundleFreigeben = resolve; });
  await page.route('**/assets/intro/bilder.json', async route => {
    await kalterCache;
    await route.continue();
  });
  await page.goto(url);
  await wait(page.locator('#spielmenue-neu'));
  assert.deepEqual(requested,[]);
  try {
    await start(page, 1);
    await wait(intro(page).getByText('Intro wird geladen …'));
    assert.equal(await intro(page).getByRole('button',{name:'Weiter'}).isDisabled(),true);
  } finally {
    bundleFreigeben();
  }
  await checkImage(page,1);
  assert.deepEqual(requested,['http://127.0.0.1:4173/assets/intro/bilder.json']);
  assert.ok((await image(page).getAttribute('src')).startsWith('data:image/webp;base64,'));
  assert.equal(await page.locator('#schleier').isVisible(),false);
  assert.equal(await intro(page).getByRole('button',{name:'Zurück'}).isDisabled(),true);
  await page.screenshot({path:'artifacts/intro-mobil.png'});
  await page.keyboard.press('ArrowRight');
  await checkImage(page,2);
  await swipe(page,-12,90);
  assert.equal(await intro(page).locator('.intro-zaehler').innerText(),'2 / 4');
  await swipe(page,-100,12);
  await checkImage(page,3);
  await click(intro(page), 'Zurück');
  await checkImage(page,2);
  await click(intro(page), 'Weiter');
  await checkImage(page,3);
  await page.keyboard.press('ArrowRight');
  await checkImage(page,4);
  assert.equal(requested.length,1);
  await click(intro(page), 'Firma gründen');
  assert.equal(await page.evaluate(() => META.bilderIntroGesehen),true);
  await chooseDifficulty(page);
  await toMenu(page);
  await page.reload();
  await page.locator('#spielmenue-weiter').click();
  assert.equal(await intro(page).isVisible(),false);
  await page.evaluate(() => tempoSetzen(0));
  await toMenu(page);
  await start(page,2);
  assert.equal(await intro(page).isVisible(),false);
  await chooseDifficulty(page);

  await page.evaluate(() => tempoSetzen(4));
  await page.locator('#einstauf').click();
  const replay = page.locator('#einst').getByRole('button',{name:'Intro erneut ansehen'});
  await replay.click();
  await checkImage(page,1);
  const pausedAt = await page.evaluate(() => S.tag);
  await page.waitForTimeout(550);
  assert.deepEqual(await page.evaluate(() => [S.tag,tempo]),[pausedAt,0]);
  await page.keyboard.press('Escape');
  assert.equal(await replay.evaluate(btn => btn === document.activeElement),true);
  assert.equal(await page.evaluate(() => tempo),4);
  await page.evaluate(() => tempoSetzen(0));
  await page.locator('[data-schliessen="einst"]').click();

  // Construction and a sale out of an existing stock are separate from first production.
  await page.evaluate(() => {
    S.verkaeufer = 20;
    S.ware.kabel = 1;
    S.mat = {kupfer:200, alu:200, zinn:200};
    S.fabriken = [{produkt:'kabel',land:'china',arbeiter:1,restbau:2}];
    spieltagWeiter();
    spieltagWeiter();
  });
  assert.deepEqual(await page.evaluate(() => [S.fabriken[0].restbau,S.ware.kabel,S.produktEntdeckungen]),[0,0,{}]);
  assert.equal(await discovery(page).count(),0);
  await page.evaluate(() => tempoSetzen(4));
  await checkDiscovery(page,'kabel');
  const ersterTag = await page.evaluate(() => S.tag);
  assert.ok(await page.evaluate(() => S.leistungsdaten.produkte.kabel.hergestellt > 0 &&
    S.leistungsdaten.produkte.kabel.verkauft > 1 && S.ware.kabel === 0));
  await wait(discovery(page).locator('.es-kabel'));
  // Animationen laufen jetzt auch bei «Bewegung reduzieren»: auf das Ende der Zeichen-Animation warten
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.es-mantel')).strokeDashoffset === '0px', null, {timeout:8000});
  await page.screenshot({path:'artifacts/entdeckung-ladekabel-mobil.png'});
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => S.tag),ersterTag);
  await next(page);
  assert.equal(await page.evaluate(() => tempo),4);
  await page.evaluate(() => tempoSetzen(0));
  assert.deepEqual(await page.evaluate(() => S.produktEntdeckungen.kabel),{status:'gesehen',ersterTag});

  const produkte = await page.evaluate(() => {
    const ids = Object.keys(PRODUKT).filter(id => id !== 'kabel');
    S.mat = Object.fromEntries(Object.keys(MATERIAL).map(id => [id,1000]));
    for (const produkt of ids) S.fabriken.push({produkt,land:'china',arbeiter:2,restbau:0});
    const pruefen = ereignisPruefen;
    ereignisPruefen = () => {
      S.minen.katanga = {arbeiter:0,stufe:1,zufriedenheit:20,stillBis:0,malus:1,malusBis:0,ausbau:0,sicherheit:false,nachweis:false};
      dialogZeigen(ereignis('protest').bau('katanga'));
    };
    spieltagWeiter();
    ereignisPruefen = pruefen;
    return ids;
  });
  await wait(page.locator('#schleier').getByText(/Streik in Katanga/));
  assert.equal(await discovery(page).count(),0);
  await click(choice(page), /^Lohn erhöhen/);
  await checkDiscovery(page,produkte[0]);
  assert.ok(produkte.includes('motor'));
  const [download] = await Promise.all([
    page.waitForEvent('download'), click(choice(page),'Spielstand exportieren')
  ]);
  const json = await readFile(await download.path());
  const paket = JSON.parse(json);
  assert.equal(paket.gameState.produktEntdeckungen.kabel.status,'gesehen');
  assert.ok(produkte.every(id => paket.gameState.produktEntdeckungen[id].status === 'offen'));
  await click(choice(page),'Speichern & zum Hauptmenü');
  await page.reload();
  await page.locator('#spielmenue-weiter').click();
  for (const id of produkte){
    await checkDiscovery(page,id);
    const angezeigt = await discovery(page).locator('li').allTextContents();
    const namen = await page.evaluate(p => Object.keys(PRODUKT[p].rezept).map(k => MATERIAL[k].name),id);
    assert.equal(angezeigt.length,namen.length);
    assert.ok(namen.every(name => angezeigt.some(text => text.endsWith(name))));
    if (namen.length > 4){
      await discovery(page).getByText('Alle Materialien anzeigen').click();
      assert.equal(await discovery(page).locator('li:visible').count(), namen.length);
    }
    await next(page);
  }
  assert.equal(await page.evaluate(() => tempo),1);
  await page.evaluate(() => tempoSetzen(0));
  assert.equal(await discovery(page).count(),0);
  await toMenu(page);
  await page.locator('#spielmenue-slots').click();
  await click(page.locator('[data-slot-id="1"]'), /Fortsetzen/);
  assert.deepEqual(await page.evaluate(() => S.produktEntdeckungen),{});
  assert.equal(await intro(page).isVisible(),false);
  await page.evaluate(() => {
    tempoSetzen(0);
    delete S.produktEntdeckungen;
    S.leistungsdaten.produkte.kabel = {hergestellt:6,verkauft:6,erloes:600};
    S.ware.akku = 2;
    speichern(true);
  });
  await page.reload();
  await page.locator('#spielmenue-weiter').click();
  assert.deepEqual(await page.evaluate(() => S.produktEntdeckungen),{kabel:{status:'gesehen'},akku:{status:'gesehen'}});
  assert.equal(await discovery(page).count(),0);
  await page.evaluate(() => {
    tempoSetzen(0);
    produktBuchen('motor',1);
    produktentdeckungZeigen();
  });
  await checkDiscovery(page,'motor');
  await next(page);
  assert.equal(await page.evaluate(() => tempo),0);

  // The paused card survives export into a browser without an intro flag.
  const imported = await newPage({width:1280,height:800});
  await imported.goto(url);
  await wait(imported.locator('#spielmenue-neu'));
  await imported.locator('#spielmenue-datei').setInputFiles({name:'erzwelt.json',mimeType:'application/json',buffer:json});
  await click(imported.locator('[data-slot-id="1"]'),/^Hier importieren/);
  await imported.locator('#spielmenue-import-weiter').click();
  await checkDiscovery(imported,produkte[0]);
  assert.equal(await intro(imported).isVisible(),false);
  assert.equal(await imported.evaluate(() => META.bilderIntroGesehen),undefined);
  assert.equal(await imported.evaluate(() => S.produktEntdeckungen.kabel.status),'gesehen');

  const fallback = await newPage({width:360,height:800});
  await fallback.route('**/assets/intro/bilder.json', route => route.fulfill({status:503}));
  await fallback.goto(url);
  await start(fallback,1);
  await checkImage(fallback,1);
  assert.equal(await image(fallback).getAttribute('src'), `./${introBilder[0].datei}`);
  await fallback.close();

  // The packaged HTML loads every exact original PNG with external requests blocked.
  const offline = await newPage({width:1280,height:800});
  await offline.route(/^https?:/, route => route.abort());
  await offline.goto(pathToFileURL(resolve('artifacts/erzwelt-offline.html')).href);
  await start(offline,1);
  for (let i=1;i<=introBilder.length;i++){
    await checkImage(offline,i);
    const src = await image(offline).getAttribute('src');
    assert.ok(src.startsWith('data:image/png;base64,'));
    assert.ok(Buffer.from(src.split(',')[1],'base64').equals(await readFile(introBilder[i-1].datei)));
    if (i<introBilder.length) await click(intro(offline),'Weiter');
  }
  await offline.keyboard.press('Escape');
  await chooseDifficulty(offline);

  assert.deepEqual(errors,[]);
  console.log('PASS AP2: one intro bundle request with a cold cache, original images as fallback and offline, intro controls and replay, production, events, slots and JSON');
} finally {
  await browser.close();
}
