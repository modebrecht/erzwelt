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
// On phones an open sheet covers the dock; close it like a player would.
const closeBlatt = async () => {
  if (await page.locator('#blatt.auf').count()) {
    await page.locator('#blatt.auf #zu').click();
    await page.waitForTimeout(350);
  }
};
const dock = async seite => {
  await closeBlatt();
  await page.locator(`button[data-seite="${seite}"]`).first().click();
};
const goMap = async () => {
  await closeLupe();
  await closeBlatt();
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

// The story intro leads to the existing difficulty choice.
await page.locator('#spielmenue-neu').click();
await page.getByRole('button', { name: 'Hier starten · Spielstand 1' }).click();
await page.locator('#bilder-intro .intro-sprung').evaluate(b => b.click());

// Choose Mittel through the real modal.
const mittel = page.getByRole('button', { name: /Mittel/ }).filter({ visible: true });
await mittel.first().click();
await page.waitForFunction(() => S.schwierigkeit === 'mittel', null, { timeout: 5000 });
await checkpoint('difficulty-selected');

// The task card spans from Pause to Settings at each viewport width.
for (const width of [320, 360, 844, 390]) {
  await page.setViewportSize({ width, height: 844 });
  await page.waitForFunction(() => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect();
    const quest = rect('#quest'), pause = rect('[data-tempo="0"]'), settings = rect('#einstauf');
    return quest.width > 0 && quest.top >= settings.bottom &&
      Math.abs(quest.left - pause.left) < 1 && Math.abs(quest.right - settings.right) < 1;
  }, null, { timeout: 5000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const rect = selector => document.querySelector(selector).getBoundingClientRect();
    const values = rect('.hudwerte'), history = rect('#toast-history-control'), settings = rect('#einstauf');
    const center = box => box.top + box.height / 2;
    if (Math.abs(center(values) - center(settings)) > 1 || Math.abs(center(history) - center(settings)) > 1 ||
        values.left < 0 || values.right > history.left || settings.right > innerWidth) {
      throw new Error(`HUD controls do not fit in one row at ${innerWidth}px: ${JSON.stringify({values, history, settings})}`);
    }
    const cash = rect('.pille.kasse'), day = rect('.pille.tag');
    if (rect('#h-kasse-i').width <= 0 || cash.right >= day.left ||
        getComputedStyle(document.querySelector('.pille.kasse')).backgroundColor === 'rgba(0, 0, 0, 0)' ||
        getComputedStyle(document.querySelector('.pille.tag')).backgroundColor === 'rgba(0, 0, 0, 0)') {
      throw new Error('Cash icon or separate day pill missing at ' + innerWidth);
    }
    const historyLabel = document.querySelector('.toast-history-label');
    if (innerWidth === 844 && getComputedStyle(historyLabel).display === 'none') {
      throw new Error('History text missing despite available width');
    }
    if (document.querySelector('#h-crew') || !document.querySelector('#dock [data-seite="team"]')) {
      throw new Error('Personnel overview belongs in the Team tab');
    }
    const title = document.querySelector('#q-titel');
    const titleStyle = getComputedStyle(title);
    const textStyle = getComputedStyle(document.querySelector('#q-text'));
    if (parseFloat(titleStyle.fontSize) < parseFloat(textStyle.fontSize)) {
      throw new Error('The task title is smaller than the task text');
    }
    if (title.getBoundingClientRect().height > parseFloat(titleStyle.lineHeight) + 1) {
      throw new Error(`The opening task title wraps at ${innerWidth}px`);
    }
  });
}

// Einführung: one action per step, exactly one highlighted target.
const winkPins = () => page.evaluate(() => [...document.querySelectorAll('#welt .pin.wink')].map(p => `${p.dataset.pin}:${p.dataset.id}`));
const expectOnlyTarget = async expected => {
  const w = await winkPins();
  if (w.length !== 1 || (expected && w[0] !== expected)) throw new Error(`Expected exactly one target ${expected || ''}, got ${JSON.stringify(w)}`);
  return w[0];
};
const openTarget = async expected => {
  await goMap();
  await expectOnlyTarget(expected);
  await page.locator('#welt .pin.wink .knopf').first().evaluate(el => el.click());
  await page.waitForTimeout(120);
};
const setSlider = async (scope, value) => {
  const r = page.locator(`${scope} .besetzung-regler`).filter({ visible: true }).first();
  await r.waitFor({ state: 'visible', timeout: 10000 });
  await r.fill(String(value));
  await page.waitForTimeout(150);
};
const steps = await page.evaluate(() => TUTORIAL.map(t => t.id));
const expectedSteps = ['kupfer-auf','kupfer-crew','alu-auf','alu-crew','zinn-auf','zinn-crew','raff','raffcrew','fab','fab-crew','verkauf','verkaeufer'];
if (JSON.stringify(steps) !== JSON.stringify(expectedSteps)) throw new Error(`Unexpected tutorial steps ${JSON.stringify(steps)}`);

// 1: copper source. A new round starts without staff; a different source must not be buyable.
await waitTutorial('kupfer-auf');
if ((await state()).workers !== 0) throw new Error('New round should start with 0 people');
await clickMineById('boke');
if (!await page.locator('#blatt.auf button[data-tun="mine-auf"][disabled]').count()) throw new Error('Non-target source was buyable during the introduction');
if (!await page.locator('#blatt.auf [data-einfuehrung-hin]').count()) throw new Error('Locked sheet does not point to the current target');
await page.locator('#blatt.auf [data-einfuehrung-hin]').first().click();
await clickVisible('#blatt.auf button[data-tun="mine-auf"]:not([disabled])');
await waitTutorial('kupfer-crew');
await checkpoint('kupfer-auf');

// 2: staff copper with the slider: the missing people are hired right there.
if (!await page.locator('#blatt.auf .besetzung-ziel').count()) throw new Error('Slider goal marker missing');
if (await page.locator('#blatt.auf .besetzung-regler').getAttribute('max') !== '15') throw new Error('Copper slider not capped at the introduction need');
if (!/Jeden Monat/i.test(await page.locator('#blatt.auf .besetzung-kosten').innerText()) || /Einmalig/i.test(await page.locator('#blatt.auf .besetzung-kosten').innerText())) throw new Error('Monthly cost tile missing or one-time cost still shown');
const cashBeforeHire = (await state()).kasse;
await setSlider('#blatt.auf', 15);
await waitTutorial('alu-auf');
const hired = await state();
if (hired.workers !== 15 || hired.free !== 0 || cashBeforeHire !== hired.kasse) throw new Error(`Inline hiring wrong: ${JSON.stringify(hired)}`);
await checkpoint('kupfer-crew');

// The team page does not hire during the introduction (close the open sheet first).
await dock('team');
if (await page.locator('#seite button[data-tun="anstellen"]').count()) throw new Error('Team page still hires during the introduction');

// 3-6: aluminium and tin, one source and one staffing step each.
for (const k of ['alu','zinn']) {
  await openTarget();
  await clickVisible('#blatt.auf button[data-tun="mine-auf"]:not([disabled])');
  await waitTutorial(`${k}-crew`);
  // "Ziel zeigen" must now point at the new, unstaffed source – not at copper.
  const target = await (async () => { await goMap(); return expectOnlyTarget(); })();
  const own = await page.evaluate(k => materialMine(k), k);
  if (target !== `mine:${own}`) throw new Error(`Target ${target} is not the unstaffed ${k} source ${own}`);
  await openTarget(target);
  await setSlider('#blatt.auf', k === 'alu' ? 5 : 10);
  const next = k === 'alu' ? 'zinn-auf' : 'raff';
  await waitTutorial(next);
  await checkpoint(`${k}-staffed`);
}

// 7-8: refinery.
await openTarget();
await clickVisible('#blatt.auf button[data-tun="raff-bau"]:not([disabled])');
await waitTutorial('raffcrew');
await setSlider('#blatt.auf', 5);
await waitTutorial('fab');
await checkpoint('refinery-staffed');

// 9: cable factory.
await openTarget();
await clickVisible('#blatt.auf button[data-tun="fab-bau"]:not([disabled])');
await waitTutorial('fab-crew');
await checkpoint('factory-started');

// 10: wait for construction at 4x, then staff.
await goMap();
await setTempo(4);
await page.waitForFunction(() => S.fabriken.length && S.fabriken[0].restbau === 0, null, { timeout: 30000 });
await setTempo(0);
await openTarget();
await setSlider('#blatt.auf', 5);
await waitTutorial('verkauf');
await checkpoint('factory-staffed');

// Produce at least one cable.
await goMap();
await setTempo(4);
await page.waitForFunction(() => (S.ware?.kabel || 0) > 0, null, { timeout: 30000 });
await page.locator('#schleier .es-kabel').waitFor({state:'visible'});
await page.locator('#d-wahlen').getByRole('button', {name:'Weiter', exact:true}).click();
await setTempo(0);

// 11: manual sale.
await dock('markt');
await clickVisible('button[data-tun="handverkauf"]:not([disabled])');
await waitTutorial('verkaeufer');
await checkpoint('manual-sale');

// 12: sales team via the market slider (hires the two people directly).
let s;
await dock('markt');
await setSlider('#seite', 4);
await page.waitForFunction(() => (S.verkaeufer || 0) >= 4 && S.tutorial >= TUTORIAL.length, null, { timeout: 10000 });
await checkpoint('tutorial-complete');
await page.screenshot({ path: 'artifacts/tutorial-complete-mobile.png', fullPage: true });

// Knowledge 1: basis should now be ready and collectible.
await collectKnowledge('basis');
await checkpoint('knowledge-basis');

// Knowledge 2: change wage in a real owned mine.
await closeLupe();
await goMap();
s = await state();
const firstMine = Object.keys(s.minen)[0];
await page.evaluate(() => { ebenen.mine = false; zeichnen(); });
await page.getByRole('button', {name:'Aktuelles Ziel anzeigen'}).click();
await page.waitForFunction(id => offenesBlatt?.id === id && ebenen.mine && document.activeElement.dataset.tun === 'lohn', firstMine);
await clickVisible('button[data-tun="lohn"][aria-pressed="false"]');
await goMap();
await collectKnowledge('lohn');
await checkpoint('knowledge-lohn');

// Save/reload exactly here and assert progression survives.
const beforeReload = await state();
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !!window.__erzweltKnowledgeQuestFlow && !!document.querySelector('#quest'), null, { timeout: 15000 });
await page.locator('#spielmenue-weiter').click();
const afterReload = await state();
for (const key of ['tutorial','difficulty']) {
  if (JSON.stringify(beforeReload[key]) !== JSON.stringify(afterReload[key])) throw new Error(`Reload mismatch ${key}`);
}
if (JSON.stringify(beforeReload.knowledge) !== JSON.stringify(afterReload.knowledge)) throw new Error('Knowledge quest state did not survive reload');
if (Object.keys(beforeReload.minen).length !== Object.keys(afterReload.minen).length) throw new Error('Mine state did not survive reload');
await checkpoint('reload-ok');

// Knowledge 3: post-tutorial manual market experience. Remove sellers, make stock, sell.
await closeLupe();
await page.getByRole('button', {name:'Aktuelles Ziel anzeigen'}).click();
await page.waitForFunction(() => aktiveSeite === 'markt');
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
await dock('markt');
await clickVisible('button[data-tun="handverkauf"]:not([disabled])');
await collectKnowledge('markt');
await checkpoint('knowledge-market');

// Knowledge 4: the guide opens two distinct mine locations.
await closeLupe();
const geologieBesuche = [];
for (let i = 0; i < 2; i++) {
  await goMap();
  await page.getByRole('button', {name:'Aktuelles Ziel anzeigen'}).click();
  await page.waitForFunction(() => offenesBlatt?.art === 'mine');
  geologieBesuche.push(await page.evaluate(() => offenesBlatt.id));
}
if (new Set(geologieBesuche).size !== 2) throw new Error('Wissens-Quest zeigt denselben Standort zweimal');
await goMap();
await collectKnowledge('geologie');
await checkpoint('knowledge-geology');

// Knowledge 5: open Ziel.
await closeLupe();
await goMap();
await page.getByRole('button', {name:'Aktuelles Ziel anzeigen'}).click();
await page.waitForFunction(() => aktiveSeite === 'ziel' && S.wissenQuestFlow.flags.ruf);
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

// Event regression: Taiwan keeps its demand effects. Raw-material prices are
// not simulated, so the event must not claim or set a silicon price shock.
const eventCheck = await page.evaluate(() => {
  const e = EREIGNISSE.find(x => x.id === 'taiwan');
  delete S.preisMod.silizium;
  const d = e.bau();
  return {
    text: d?.text || '',
    silicon: S.preisMod?.silizium,
    phone: S.nachfrageMod?.phone,
    console: S.nachfrageMod?.konsole
  };
});
if (eventCheck.silicon !== undefined || /Silizium/.test(eventCheck.text) || eventCheck.phone?.faktor !== 1.5 || eventCheck.console?.faktor !== 1.5) {
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
