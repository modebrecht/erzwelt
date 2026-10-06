import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const checkpoints = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

const state = () => page.evaluate(() => ({
  tutorial: typeof S !== 'undefined' ? S.tutorial : null,
  tutorialId: typeof TUTORIAL !== 'undefined' ? (TUTORIAL[S.tutorial]?.id || null) : null,
  tag: S.tag,
  kasse: S.kasse,
  workers: S.arbeiterGesamt,
  free: typeof freieArbeiter === 'function' ? freieArbeiter() : null,
  minen: structuredClone(S.minen),
  raff: structuredClone(S.raff),
  fabriken: structuredClone(S.fabriken),
  ware: structuredClone(S.ware),
  verkaeufer: S.verkaeufer || 0,
  verkauftSelber: !!S.verkauftSelber,
  knowledge: structuredClone(S.wissenQuestFlow || null),
  difficulty: S.schwierigkeit
}));
const checkpoint = async name => {
  const s = await state();
  checkpoints.push({ name, state: s });
  console.log(`CHECKPOINT ${name}: ${JSON.stringify(s)}`);
};
const waitTutorial = id => page.waitForFunction(id => typeof TUTORIAL !== 'undefined' && TUTORIAL[S.tutorial]?.id === id, id, { timeout: 15000 });
const currentTutorial = () => page.evaluate(() => TUTORIAL[S.tutorial]?.id || null);
const clickVisible = async selector => {
  const loc = page.locator(selector).filter({ visible: true });
  await loc.first().waitFor({ state: 'visible', timeout: 10000 });
  await loc.first().evaluate(el => {
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    el.click();
  });
  await page.waitForTimeout(60);
};
const closeLupe = async () => {
  const b = page.locator('button[data-schliessen="lupe"]:visible');
  if (await b.count()) await b.first().click();
};
const goMap = async () => {
  await closeLupe();
  const b = page.locator('button[data-seite="karte"]');
  if (await b.count()) await b.first().click();
  await page.waitForTimeout(120);
};
const setTempo = async n => {
  const b = page.locator(`button[data-tempo="${n}"]`);
  await b.first().click();
};
const collectKnowledge = async expectedId => {
  const button = page.locator(`button[data-wissen-quest="${expectedId}"]`);
  await button.waitFor({ state: 'visible', timeout: 10000 });
  await button.click();
  await page.waitForFunction(id => !!S.wissenQuestFlow?.collected?.[id], expectedId, { timeout: 5000 });
  await page.waitForTimeout(100);
};
const clickMineById = async id => {
  await goMap();
  const pin = page.locator(`.pin[data-pin="mine"][data-id="${id}"] .knopf, button[data-pin="mine"][data-id="${id}"]`).first();
  await pin.evaluate(el => el.click());
  await page.waitForTimeout(120);
};

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'load' });
await page.waitForFunction(() => window.__erzweltDidacticComplexity?.declarativeCopy && window.__erzweltKnowledgeQuestFlow && window.__erzweltObjectiveGuide, null, { timeout: 15000 });
await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });

// Initial mobile + module smoke.
const initial = await page.evaluate(() => ({
  width: innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  didactic: window.__erzweltDidacticComplexity,
  knowledge: !!window.__erzweltKnowledgeQuestFlow,
  objective: !!window.__erzweltObjectiveGuide
}));
if (initial.scrollWidth > initial.width + 1) throw new Error(`Initial horizontal overflow: ${initial.scrollWidth} > ${initial.width}`);
if (!initial.didactic?.declarativeCopy || initial.didactic?.stringReplacementLayer !== false) throw new Error('Clean Sek-B didactic module not active');
if (!initial.knowledge || !initial.objective) throw new Error('Knowledge/objective modules missing');

// Choose Mittel through the real modal.
const mittel = page.getByRole('button', { name: /Mittel/ }).filter({ visible: true });
await mittel.first().click();
await page.waitForFunction(() => S.schwierigkeit === 'mittel', null, { timeout: 5000 });
await checkpoint('difficulty-selected');

// 1: first mine.
await waitTutorial('mine1');
await page.locator('.pin.wink .knopf').first().evaluate(el => el.click());
await clickVisible('button[data-tun="mine-auf"]');
await waitTutorial('minecrew');
await checkpoint('mine1');

// 2: staff first mine.
await clickVisible('button[data-tun="crew"][data-n="10"]');
await waitTutorial('team');
await checkpoint('minecrew');

// 3: hire to >= 40.
await page.locator('button[data-seite="team"]').first().click();
for (let i=0;i<10 && (await state()).workers < 40;i++) {
  const hire = page.locator('button[data-tun="anstellen"]:not([disabled])');
  if (!await hire.count()) throw new Error('Hire button missing before 40 workers');
  await hire.first().evaluate(el => el.click());
  await page.waitForTimeout(100);
}
if ((await state()).workers < 40) throw new Error('Could not hire 40 workers');
await waitTutorial('minen3');
await checkpoint('team40');

// 4: buy the other tutorial mines, always via highlighted target + CTA.
await goMap();
for (let i=0;i<5 && (await currentTutorial()) === 'minen3';i++) {
  const target = page.locator('.pin.wink .knopf').first();
  await target.evaluate(el => el.click());
  await clickVisible('button[data-tun="mine-auf"]');
  await page.waitForTimeout(150);
  if ((await currentTutorial()) === 'minen3') await goMap();
}
await waitTutorial('crew3');
await checkpoint('three-mines');

// 5: staff every tutorial mine to >= 5 using state only to select the UI target.
for (let i=0;i<5 && (await currentTutorial()) === 'crew3';i++) {
  const s = await state();
  const id = Object.entries(s.minen).find(([,m]) => m.arbeiter < 5)?.[0];
  if (!id) break;
  await clickMineById(id);
  const plus = page.locator(`button[data-tun="crew"][data-id="${id}"][data-n="10"]:not([disabled])`).first();
  await plus.click();
  await page.waitForTimeout(120);
}
await waitTutorial('raff');
await checkpoint('three-mines-staffed');

// 6: refinery.
await goMap();
await page.locator('.pin.wink .knopf').first().evaluate(el => el.click());
await clickVisible('button[data-tun="raff-bau"]');
await waitTutorial('raffcrew');
await checkpoint('refinery-built');

// 7: refinery staff.
await clickVisible('button[data-tun="rcrew"][data-n="5"]');
await waitTutorial('fab');
await checkpoint('refinery-staffed');

// 8: cable factory.
await goMap();
await page.locator('.pin.wink .knopf').first().evaluate(el => el.click());
await clickVisible('button[data-tun="fab-bau"]:not([disabled])');
await waitTutorial('fabcrew');
await checkpoint('factory-started');

// 9: wait for construction at 4x, then staff.
await goMap();
await setTempo(4);
await page.waitForFunction(() => S.fabriken.length && S.fabriken[0].restbau === 0, null, { timeout: 30000 });
await setTempo(0);
// Re-open factory sheet if needed.
const fs = await state();
if (!fs.fabriken.length) throw new Error('Factory disappeared');
await goMap();
const fLand = fs.fabriken[0].land;
const fabPin = page.locator(`.pin[data-pin="fab"][data-id="${fLand}"] .knopf, button[data-pin="fab"][data-id="${fLand}"]`).first();
await fabPin.evaluate(el => el.click());
await clickVisible('button[data-tun="fcrew"][data-n="5"]');
await waitTutorial('verkauf');
await checkpoint('factory-staffed');

// Produce at least one cable.
await goMap();
await setTempo(4);
await page.waitForFunction(() => (S.ware?.kabel || 0) > 0, null, { timeout: 30000 });
await setTempo(0);

// 10: manual sale.
await page.locator('button[data-seite="markt"]').first().click();
await clickVisible('button[data-tun="handverkauf"]:not([disabled])');
await waitTutorial('verkaeufer');
await checkpoint('manual-sale');

// Ensure free workers, then hire 2 sellers.
let s = await state();
if (s.free < 2) {
  await page.locator('button[data-seite="team"]').first().click();
  const hire = page.locator('button[data-tun="anstellen"]:not([disabled])');
  await hire.first().click();
  await page.waitForTimeout(100);
}
await page.locator('button[data-seite="markt"]').first().click();
for (let i=0;i<3 && (await state()).verkaeufer < 2;i++) {
  const plus = page.locator('button[data-tun="vcrew"][data-n="1"]:not([disabled]), button[data-tun="vcrew"][data-n="5"]:not([disabled])').first();
  await plus.click();
  await page.waitForTimeout(100);
}
await page.waitForFunction(() => (S.verkaeufer || 0) >= 2 && S.tutorial >= TUTORIAL.length, null, { timeout: 10000 });
await checkpoint('tutorial-complete');
await page.screenshot({ path: 'artifacts/tutorial-complete-mobile.png', fullPage: true });

// Knowledge 1: basis should now be ready and collectible.
await collectKnowledge('basis');
await checkpoint('knowledge-basis');

// Knowledge 2: change wage in a real owned mine.
await closeLupe();
s = await state();
const firstMine = Object.keys(s.minen)[0];
await clickMineById(firstMine);
await clickVisible('button[data-tun="lohn"][aria-pressed="false"]');
await goMap();
await collectKnowledge('lohn');
await checkpoint('knowledge-lohn');

// Save/reload exactly here and assert progression survives.
const beforeReload = await state();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !!window.__erzweltKnowledgeQuestFlow && !!document.querySelector('#quest'), null, { timeout: 15000 });
const afterReload = await state();
for (const key of ['tutorial','difficulty']) {
  if (JSON.stringify(beforeReload[key]) !== JSON.stringify(afterReload[key])) throw new Error(`Reload mismatch ${key}`);
}
if (JSON.stringify(beforeReload.knowledge) !== JSON.stringify(afterReload.knowledge)) throw new Error('Knowledge quest state did not survive reload');
if (Object.keys(beforeReload.minen).length !== Object.keys(afterReload.minen).length) throw new Error('Mine state did not survive reload');
await checkpoint('reload-ok');

// Knowledge 3: post-tutorial manual market experience. Remove sellers, make stock, sell.
await closeLupe();
await page.locator('button[data-seite="markt"]').first().click();
while ((await state()).verkaeufer > 0) {
  const minus = page.locator('button[data-tun="vcrew"][data-n="-1"]:not([disabled])').first();
  if (!await minus.count()) break;
  await minus.click();
  await page.waitForTimeout(80);
}
await goMap();
await setTempo(4);
await page.waitForFunction(() => (S.ware?.kabel || 0) > 0 && S.handverkaufTag !== S.tag, null, { timeout: 30000 });
await setTempo(0);
await page.locator('button[data-seite="markt"]').first().click();
await clickVisible('button[data-tun="handverkauf"]:not([disabled])');
await collectKnowledge('markt');
await checkpoint('knowledge-market');

// Knowledge 4: visit two mine locations.
await closeLupe();
s = await state();
const mineIds = Object.keys(s.minen).slice(0,2);
if (mineIds.length < 2) throw new Error('Need two mines for geology quest');
for (const id of mineIds) {
  await clickMineById(id);
  const close = page.locator('#zu:visible');
  if (await close.count()) await close.evaluate(el => el.click());
}
await goMap();
await collectKnowledge('geologie');
await checkpoint('knowledge-geology');

// Knowledge 5: open Ziel.
await closeLupe();
await page.locator('button[data-seite="ziel"]').first().click();
await page.waitForTimeout(150);
await collectKnowledge('ruf');
await checkpoint('knowledge-reputation');

// Knowledge 6: model becomes ready after previous quests.
await closeLupe();
await collectKnowledge('modell');
await checkpoint('knowledge-model');

// Source-owned copy regression: knowledge views must render final copy once,
// without didactic-ui post-render text/HTML patching.
const sourceOwnedCopy = await page.evaluate(() => {
  lupeFuellen('fabrik');
  const recipeNotes = [...document.querySelectorAll('#lupeinhalt .notiz')]
    .filter(el => el.textContent.includes('Vereinfachte Rezepte:')).length;

  lupeFuellen('geologie');
  const firstGeoCell = document.querySelector('#lupeinhalt table tr:nth-child(2) td')?.textContent.replace(/\s+/g, ' ').trim() || '';
  const geoModelNotes = [...document.querySelectorAll('#lupeinhalt .notiz')]
    .filter(el => el.textContent.includes('Ergiebigkeit und Mengen sind vereinfachte Werte.')).length;

  return { recipeNotes, firstGeoCell, geoModelNotes };
});
if (sourceOwnedCopy.recipeNotes !== 1) throw new Error(`Recipe disclaimer rendered ${sourceOwnedCopy.recipeNotes} times`);
if (!sourceOwnedCopy.firstGeoCell.includes('→')) throw new Error(`Geology source-to-material copy missing: ${sourceOwnedCopy.firstGeoCell}`);
if (sourceOwnedCopy.geoModelNotes !== 1) throw new Error(`Geology model disclaimer rendered ${sourceOwnedCopy.geoModelNotes} times`);
await closeLupe();

// Perk-gate hardening: collected field yes; tier 2 requires tier 1 perk.
const perkGate = await page.evaluate(() => ({
  tier1: wissenPraxis('kette',0),
  tier2Before: wissenPraxis('kette',1),
  field: !!S.wissenQuestFlow?.fields?.kette
}));
if (!perkGate.field || !perkGate.tier1?.ok) throw new Error('Collected knowledge field does not unlock first perk');
if (perkGate.tier2Before?.ok) throw new Error('Second perk unlocked without first perk');

// Event regression: Taiwan must keep silicon shock + demand effects.
const eventCheck = await page.evaluate(() => {
  const e = EREIGNISSE.find(x => x.id === 'taiwan');
  const d = e.bau();
  return {
    text: d?.text || '',
    silicon: S.preisMod?.silizium,
    phone: S.nachfrageMod?.phone,
    console: S.nachfrageMod?.konsole
  };
});
if (eventCheck.silicon?.faktor !== 2.4 || eventCheck.phone?.faktor !== 1.5 || eventCheck.console?.faktor !== 1.5) {
  throw new Error(`Taiwan event regression: ${JSON.stringify(eventCheck)}`);
}

// Final mobile integrity.
await goMap();
const mobile = await page.evaluate(() => ({
  width: innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  quest: (() => { const r=document.querySelector('#quest')?.getBoundingClientRect(); return r && {left:r.left,right:r.right,top:r.top,bottom:r.bottom}; })(),
  dock: (() => { const r=document.querySelector('#dock')?.getBoundingClientRect(); return r && {left:r.left,right:r.right,top:r.top,bottom:r.bottom}; })()
}));
if (mobile.scrollWidth > mobile.width + 1) throw new Error(`Final horizontal overflow: ${mobile.scrollWidth} > ${mobile.width}`);
await page.screenshot({ path: 'artifacts/final-mobile.png', fullPage: true });

// Additional viewport smoke: standalone loads without JS/page errors and no horizontal overflow.
for (const [w,h] of [[360,800],[412,915]]) {
  const c = await browser.newContext({ viewport: { width:w, height:h } });
  const p = await c.newPage();
  const errs=[]; p.on('pageerror', e=>errs.push(String(e)));
  await p.goto('http://127.0.0.1:4173/index.html', { waitUntil:'load' });
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => ({w:innerWidth,sw:document.documentElement.scrollWidth,title:document.title}));
  if (errs.length || m.sw > m.w + 1 || !m.title.includes('Erzwelt')) throw new Error(`Viewport ${w}x${h} smoke failed: ${JSON.stringify({errs,m})}`);
  await c.close();
}

const result = { ok: true, checkpoints, pageErrors, consoleErrors, perkGate, eventCheck, mobile };
await writeFile('artifacts/gameplay-result.json', JSON.stringify(result, null, 2));
console.log('=== E2E RESULT ===');
console.log(JSON.stringify({ok:true, checkpointNames:checkpoints.map(x=>x.name), pageErrors, consoleErrors, perkGate, eventCheck, mobile}, null, 2));
if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join('\n')}`);
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join('\n')}`);
await browser.close();
