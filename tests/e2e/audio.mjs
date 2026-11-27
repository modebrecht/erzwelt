// Audio: Musik wird erst beim Abspielen geladen, nur die gewählte Fassung,
// Musik und Soundeffekte sind unabhängig, Einstellungen überleben ein Neuladen.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const url = 'http://127.0.0.1:4173/index.html';
const errors = [];
const context = await browser.newContext({ viewport:{width:1180, height:820} });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
const requests = [];
page.on('request', r => { if (r.url().includes('/audio/')) requests.push(r.url().split('/audio/')[1]); });
const dateien = () => [...new Set(requests)];
const anfragen = async n => { for (let i = 0; i < 50 && dateien().length < n; i++) await page.waitForTimeout(100); };
const zustand = () => page.evaluate(() => window.__erzweltAudio.zustand());
const opt = () => page.evaluate(() => JSON.parse(localStorage.getItem('erzwelt_opt')));

// 1. Frisches Profil: Hauptmenü und Audio-Bereich laden keine Musik
await page.goto(url);
await page.locator('#spielmenue-audio').click();
await page.locator('.audio-bereich').waitFor();
assert.equal(await page.locator('[data-musik-wahl="1"]').getAttribute('aria-checked'), 'true', 'Musik 1 vorausgewählt');
assert.equal(await page.locator('#r-musik').inputValue(), '0', 'Musik ist zu Beginn aus');
await page.locator('[data-musik-wahl="2"]').click();
await page.locator('[data-musik-wahl="1"]').click();
await page.waitForTimeout(300);
assert.deepEqual(requests, [], 'ohne Musik wird keine Audiodatei geladen');

// Einschalten lädt Musik 1
await page.locator('#r-musik').fill('1');
await page.locator('[data-musik-wahl="1"]').click();
await page.waitForFunction(() => window.__erzweltAudio.zustand().laeuft);
await anfragen(1);
assert.equal(dateien().length, 1);
assert.match(dateien()[0], /^musik-1-[0-9a-f]{8}\.ogg$/);

// 2. Wechsel auf Musik 3: nur diese Datei wird neu angefordert, die alte verstummt
await page.locator('[data-musik-wahl="3"]').click();
await page.waitForFunction(() => /musik-3/.test(window.__erzweltAudio.zustand().quelle || '') && window.__erzweltAudio.zustand().laeuft);
await anfragen(2);
await page.waitForTimeout(300);
assert.equal(dateien().length, 2, 'nur die gewählte Fassung wird neu angefordert');
assert.match(dateien()[1], /^musik-3-/);
assert.ok(await page.evaluate(() => window.__erzweltAudio.element().currentTime < 5), 'neue Fassung beginnt von vorne');

// 3. Lautstärke wirkt sofort ohne Neustart; Musik und SFX unabhängig
const vorher = await page.evaluate(() => window.__erzweltAudio.element().currentTime);
await page.locator('#r-musikLaut').fill('80');
const nachher = await page.evaluate(() => ({t:window.__erzweltAudio.element().currentTime, v:window.__erzweltAudio.element().volume}));
assert.ok(nachher.t >= vorher, 'Lautstärke startet den Titel nicht neu');
assert.ok(Math.abs(nachher.v - 0.64) < 0.01, 'Musiklautstärke gesetzt');
await page.locator('#r-ton').fill('0');
assert.ok((await zustand()).laeuft, 'SFX aus lässt die Musik laufen');
await page.locator('#r-ton').fill('1');
await page.locator('#r-sfxLaut').fill('50');
assert.ok(Math.abs(await page.evaluate(() => window.__erzweltAudio.sfxFaktor()) - 0.25) < 0.01);
await page.locator('#r-musik').fill('0');
assert.ok(!(await zustand()).laeuft, 'Musik aus hält an');
assert.equal((await opt()).ton, 1, 'Musik aus lässt SFX an');
await page.locator('#r-musik').fill('1');
await page.locator('[data-musik-wahl="3"]').click();
await page.waitForFunction(() => window.__erzweltAudio.zustand().laeuft);

// Schleife: am Ende beginnt die Fassung von vorne
await page.evaluate(() => { const a = window.__erzweltAudio.element(); a.currentTime = a.duration - 0.5; });
await page.waitForTimeout(2000);
const schleife = await page.evaluate(() => ({t:window.__erzweltAudio.element().currentTime, paused:window.__erzweltAudio.element().paused}));
assert.ok(!schleife.paused && schleife.t < 10, 'Fassung wiederholt sich');

// 4. Neuladen: Einstellungen bleiben, Musik setzt beim nächsten Knopf wieder ein
assert.deepEqual(
  (({musik, musikWahl, musikLaut, ton, sfxLaut}) => ({musik, musikWahl, musikLaut, ton, sfxLaut}))(await opt()),
  {musik:1, musikWahl:3, musikLaut:80, ton:1, sfxLaut:50});
requests.length = 0;
await page.reload();
await page.locator('#spielmenue-audio').waitFor();
await page.waitForTimeout(300);
assert.deepEqual(requests, [], 'nach dem Neuladen nichts geladen, bevor jemand tippt');
await page.locator('#spielmenue-neu').click();
await page.waitForFunction(() => window.__erzweltAudio.zustand().laeuft);
assert.match((await zustand()).quelle, /musik-3-/);
await page.getByRole('button', { name: 'Zum Hauptmenü' }).click();
await page.locator('#spielmenue-audio').click();
assert.equal(await page.locator('#r-musikLaut').inputValue(), '80');
assert.equal(await page.locator('#r-sfxLaut').inputValue(), '50');
assert.equal(await page.locator('[data-musik-wahl="3"]').getAttribute('aria-checked'), 'true');

// Im Spiel: derselbe Bereich in den Einstellungen, nur einmal vorhanden
await page.getByRole('button', { name: 'Zum Hauptmenü' }).click();
await page.locator('#spielmenue-neu').click();
await page.getByRole('button', { name: 'Hier starten · Spielstand 1' }).click();
await page.locator('#bilder-intro .intro-sprung').evaluate(b => b.click());
await page.getByRole('button', { name: /Einfach/ }).filter({ visible: true }).first().click();
await page.locator('#einstauf').click();
await page.locator('#einstinhalt .audio-bereich').waitFor();
assert.equal(await page.locator('.audio-bereich').count(), 1);
await page.locator('[data-musik-wahl="2"]').click();
await page.waitForFunction(() => /musik-2-/.test(window.__erzweltAudio.zustand().quelle || '') && window.__erzweltAudio.zustand().laeuft);

assert.deepEqual(errors, []);
await browser.close();
console.log('PASS audio: lazy loading, switching, independent volumes, loop, persistence');
