import { readFile, writeFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const corePath = path.join(root, "erzwelt-core.html");
const manifestPath = path.join(root, "patches.json");
const outputPath = path.join(root, "index.html");

const core = await readFile(corePath, "utf8");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

function assertScriptSyntax(source, filename) {
  try {
    new vm.Script(source, { filename });
  } catch (error) {
    throw new Error(`JavaScript-Syntaxfehler in ${filename}: ${error.message}`);
  }
}

if (!Array.isArray(manifest.groups) || !manifest.groups.length) {
  throw new Error("patches.json enthält keine Patch-Gruppen");
}

const entries = manifest.groups.flatMap(group => {
  if (!group || typeof group.name !== "string" || !Array.isArray(group.files)) {
    throw new Error("Ungültige Patch-Gruppe in patches.json");
  }
  return group.files.map(file => ({ group: group.name, file }));
});

const names = entries.map(x => x.file);
const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
if (duplicates.length) {
  throw new Error(`Doppelte Patch-Dateien: ${[...new Set(duplicates)].join(", ")}`);
}

if (!core.includes("</body>")) {
  throw new Error("erzwelt-core.html enthält kein </body>");
}

const coreScripts = [...core.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
if (!coreScripts.length) {
  throw new Error("erzwelt-core.html enthält kein eingebettetes JavaScript");
}
coreScripts.forEach((match, index) => assertScriptSyntax(match[1], `erzwelt-core.html#script-${index + 1}`));

const blocks = [];
for (const { group, file } of entries) {
  const filePath = path.join(root, file);
  await access(filePath);
  const source = await readFile(filePath, "utf8");
  if (!source.trim()) throw new Error(`${file} ist leer`);
  assertScriptSyntax(source, file);

  // Each source remains its own classic-script execution unit. This preserves
  // the existing patch order and avoids changing global declaration semantics.
  const safeSource = source.replace(/<\/script/gi, "<\\/script");
  blocks.push(
    `\n<!-- ERZWELT PATCH · ${group} · ${file} -->\n` +
    `<script data-erzwelt-patch="${file}" data-erzwelt-group="${group}">\n${safeSource}\n<\/script>\n`
  );
}

const banner = [
  "<!--",
  "  ERZWELT STANDALONE BUILD",
  "  Generated from erzwelt-core.html + patches.json.",
  "  Do not hand-edit this generated file; edit the source files and rebuild.",
  `  Patch manifest version: ${manifest.version ?? "unknown"}`,
  `  Patch count: ${entries.length}`,
  "-->",
  ""
].join("\n");

const standalone = banner + core.replace("</body>", blocks.join("") + "</body>");

// Packaging gates: the generated file must contain every patch exactly once,
// in manifest order, and must not depend on the old HTTP loader at runtime.
const embedded = [...standalone.matchAll(/data-erzwelt-patch="([^"]+)"/g)].map(match => match[1]);
if (embedded.length !== names.length || embedded.some((name, i) => name !== names[i])) {
  throw new Error("Standalone-Patchreihenfolge stimmt nicht mit patches.json überein");
}
if (new Set(embedded).size !== embedded.length) {
  throw new Error("Standalone enthält doppelte Patch-Marker");
}
if (standalone.includes('fetch("./erzwelt-core.html"') || standalone.includes('fetch("./patches.json"')) {
  throw new Error("Standalone enthält noch Abhängigkeiten des alten HTTP-Loaders");
}
if (standalone.includes('<script src="./')) {
  throw new Error("Standalone enthält noch lokale externe Script-Abhängigkeiten");
}
if (!standalone.includes("ERZWELT STANDALONE BUILD")) {
  throw new Error("Standalone-Build-Banner fehlt");
}

await writeFile(outputPath, standalone, "utf8");

const written = await readFile(outputPath, "utf8");
if (written !== standalone) {
  throw new Error("Geschriebene Standalone-Datei weicht vom erzeugten Inhalt ab");
}

console.log(`Generated ${path.relative(root, outputPath)} with ${entries.length} patches.`);
console.log(`JavaScript syntax passed: ${coreScripts.length} core script(s) + ${entries.length} patch scripts.`);
console.log("Standalone verification passed: no runtime fetch, no local script dependencies, patch order exact.");
