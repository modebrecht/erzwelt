import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

// Dev-only E2E probe. This intentionally exercises the generated standalone.
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const consoleMessages = [];
const pageErrors = [];
page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'load' });
await page.waitForTimeout(2500);

const snapshot = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  bodyText: (document.body?.innerText || '').slice(0, 12000),
  buttons: Array.from(document.querySelectorAll('button')).map((b, i) => ({
    i,
    text: (b.innerText || b.textContent || '').trim().replace(/\s+/g, ' '),
    hidden: !!(b.hidden || b.closest('[hidden]')),
    disabled: !!b.disabled,
    id: b.id || null,
    data: Object.fromEntries([...b.attributes].filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value]))
  })),
  dialogs: Array.from(document.querySelectorAll('[role="dialog"], dialog, #dialog, #overlay')).map(el => ({
    id: el.id || null,
    hidden: !!(el.hidden || el.closest('[hidden]')),
    text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 1500)
  })),
  localStorage: Object.fromEntries(Object.entries(localStorage)),
  globals: {
    tutorialLaeuft: typeof window.tutorialLaeuft,
    questApi: !!window.__erzweltKnowledgeQuestFlow,
    objectiveGuide: !!window.__erzweltObjectiveGuide,
    didacticComplexity: window.__erzweltDidacticComplexity || null
  }
}));

await page.screenshot({ path: 'artifacts/probe-mobile.png', fullPage: true });
await writeFile('artifacts/probe.json', JSON.stringify({ snapshot, consoleMessages, pageErrors }, null, 2));
console.log('=== PROBE SNAPSHOT ===');
console.log(JSON.stringify({
  title: snapshot.title,
  buttons: snapshot.buttons.filter(b => !b.hidden).slice(0, 80),
  dialogs: snapshot.dialogs,
  globals: snapshot.globals,
  bodyText: snapshot.bodyText,
  consoleMessages,
  pageErrors
}, null, 2));

if (pageErrors.length) process.exitCode = 2;
await browser.close();
