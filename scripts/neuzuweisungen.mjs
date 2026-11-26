// Listet pro globaler Funktion, wo sie definiert und wo sie später neu zugewiesen
// oder umhüllt wird – in der Ladereihenfolge von patches.json.
//
//   node scripts/neuzuweisungen.mjs > docs/neuzuweisungen.md
//
// Erkannt werden (textbasiert, ohne Parser):
//   Definition    `function name(` am Zeilenanfang im Kern oder in einem Patch
//   Ersetzung     `name = function` / `name = (…) =>` ohne den Vorgänger zu merken
//   Hülle         wie Ersetzung, aber der Patch merkt sich vorher den Vorgänger
//                 (`const alt = name;`, `const alt = window.name`) und ruft ihn auf
//   Modul         Zuweisung in module/*.js: die eine Fassung, die die Schritte
//                 aller früheren Hüllen in fester Reihenfolge aufruft
// Kommentare und Zeichenketten werden vor der Suche entfernt. Das ist eine Übersicht
// für den Umbau, keine exakte Analyse.
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, "patches.json"), "utf8"));
const kernHtml = await readFile(path.join(root, "erzwelt-core.html"), "utf8");
const kern = [...kernHtml.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join("\n");
const dateien = manifest.groups.flatMap(g => g.files).filter(f => !f.startsWith("vendor/"));

// Kommentare, Zeichenketten und Template-Texte durch Leerzeichen ersetzen (Zeilen bleiben).
function entkernen(code) {
  let aus = "", i = 0;
  const leer = s => s.replace(/[^\n]/g, " ");
  while (i < code.length) {
    const c = code[i], n = code[i + 1];
    if (c === "/" && n === "/") { const e = code.indexOf("\n", i); const j = e < 0 ? code.length : e; aus += leer(code.slice(i, j)); i = j; }
    else if (c === "/" && n === "*") { const j = code.indexOf("*/", i + 2) + 2 || code.length; aus += leer(code.slice(i, j)); i = j; }
    else if (c === '"' || c === "'") {
      let j = i + 1; while (j < code.length && code[j] !== c && code[j] !== "\n") j += code[j] === "\\" ? 2 : 1;
      aus += c + leer(code.slice(i + 1, j)) + c; i = j + 1;
    } else if (c === "`") {
      // Template: Text leeren, ${…} behalten (verschachtelt einfach gezählt)
      let j = i + 1, tiefe = 0; aus += "`";
      while (j < code.length) {
        if (tiefe === 0 && code[j] === "`") break;
        if (code[j] === "\\") { aus += "  "; j += 2; continue; }
        if (code[j] === "$" && code[j + 1] === "{") { tiefe++; aus += "${"; j += 2; continue; }
        if (tiefe > 0 && code[j] === "{") tiefe++;
        if (tiefe > 0 && code[j] === "}") { tiefe--; aus += "}"; j++; continue; }
        aus += tiefe > 0 ? code[j] : (code[j] === "\n" ? "\n" : " "); j++;
      }
      aus += "`"; i = j + 1;
    } else { aus += c; i++; }
  }
  return aus;
}

const zeileVon = (code, idx) => code.slice(0, idx).split("\n").length;
const eintraege = new Map(); // name -> [{datei, zeile, art}]
const merke = (name, e) => { if (!eintraege.has(name)) eintraege.set(name, []); eintraege.get(name).push(e); };

// Globale Funktionen: Deklarationen am Zeilenanfang im Kern und in Patches,
// dazu `let/var name = …=>|function` am Zeilenanfang im Kern.
const quellen = [["erzwelt-core.html", entkernen(kern)]];
for (const d of dateien) quellen.push([d, entkernen(await readFile(path.join(root, d), "utf8"))]);
const global = new Set();
for (const [, code] of quellen) {
  for (const m of code.matchAll(/^(?:async\s+)?function\s+([A-Za-zÄÖÜäöüß_$][\w$äöüÄÖÜß]*)\s*\(/gmu)) global.add(m[1]);
}
for (const m of quellen[0][1].matchAll(/^(?:let|var)\s+([A-Za-zÄÖÜäöüß_$][\w$äöüÄÖÜß]*)\s*=\s*(?:function|\([^)]*\)\s*=>|[\w$]+\s*=>)/gmu)) global.add(m[1]);

for (const [datei, code] of quellen) {
  for (const m of code.matchAll(/^(?:async\s+)?function\s+([A-Za-zÄÖÜäöüß_$][\w$äöüÄÖÜß]*)\s*\(/gmu)) {
    merke(m[1], { datei, zeile: zeileVon(code, m.index), art: eintraege.has(m[1]) ? "Ersetzung (function)" : "Definition" });
  }
  if (datei === "erzwelt-core.html") {
    for (const m of code.matchAll(/^(?:let|var)\s+([A-Za-zÄÖÜäöüß_$][\w$äöüÄÖÜß]*)\s*=\s*(?:function|\([^)]*\)\s*=>|[\w$]+\s*=>)/gmu)) merke(m[1], { datei, zeile: zeileVon(code, m.index), art: "Definition" });
  }
  for (const name of global) {
    const n = name.replace(/\$/g, "\\$");
    // Lokale Namen gleichen Namens im Patch (const/let/function in einer Funktion) überspringen
    if (datei !== "erzwelt-core.html" && new RegExp(`(?:const|let|var)\\s+${n}\\b`).test(code)) continue;
    const zuweisung = new RegExp(`(?<![\\w$.])(?:window\\.)?${n}\\s*=(?![=>])`, "gu");
    const gemerkt = new RegExp(`(?:const|let|var)\\s+[\\w$]+\\s*=\\s*(?:window\\.)?${n}\\s*(?:[;,\\n]|\\.bind|\\|\\|)`, "u").test(code) ||
      new RegExp(`\\(\\s*(?:window\\.)?${n}\\s*\\)\\s*;?\\s*$|\\}\\)\\(\\s*(?:window\\.)?${n}\\s*\\)`, "mu").test(code);
    for (const m of code.matchAll(zuweisung)) {
      if (datei === "erzwelt-core.html") continue; // im Kern: Initialisierung, keine Umhüllung
      const art = datei.startsWith("module/") ? "Modul" : gemerkt ? "Hülle" : "Ersetzung";
      merke(name, { datei, zeile: zeileVon(code, m.index), art });
    }
  }
}

// Ausgabe: nur Funktionen mit mindestens einer Neuzuweisung, absteigend nach Anzahl
const reihenfolge = new Map(quellen.map(([d], i) => [d, i]));
const liste = [...eintraege].map(([name, e]) => [name, e.sort((a, b) => reihenfolge.get(a.datei) - reihenfolge.get(b.datei) || a.zeile - b.zeile)])
  .filter(([, e]) => e.some(x => x.art !== "Definition"))
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

const aus = [];
aus.push("# Neuzuweisungen globaler Funktionen", "",
  "Erzeugt mit `node scripts/neuzuweisungen.mjs` (Ladereihenfolge aus `patches.json`).",
  "Textbasiert: «Hülle» = der Patch merkt sich den Vorgänger und ruft ihn auf,",
  "«Ersetzung» = neue Fassung ohne Vorgänger, «Modul» = die eine Fassung in `module/`.",
  "Nur Funktionen mit mindestens einer Neuzuweisung.", "",
  `${liste.length} Funktionen werden nach ihrer Definition neu zugewiesen, davon ` +
    `${liste.filter(([, e]) => e.some(x => x.art === "Modul") && e.filter(x => x.art !== "Definition").length === 1).length} nur noch durch ein Modul.`, "",
  "| Funktion | Schichten | Reihenfolge |", "|---|---:|---|");
for (const [name, e] of liste) {
  aus.push(`| \`${name}\` | ${e.length} | ${e.map(x => `${x.datei}:${x.zeile} (${x.art})`).join(" → ")} |`);
}
aus.push("", "## Pro Datei", "", "| Datei | neu zugewiesene Funktionen |", "|---|---|");
for (const [d] of quellen.slice(1)) {
  const namen = liste.filter(([, e]) => e.some(x => x.datei === d && x.art !== "Definition")).map(([n]) => "`" + n + "`");
  if (namen.length) aus.push(`| ${d} | ${namen.join(", ")} |`);
}
console.log(aus.join("\n"));
