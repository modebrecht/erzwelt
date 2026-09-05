import { readFile, writeFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { gzipSync, gunzipSync } from "node:zlib";

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

// Keep the release file self-contained while avoiding a 400+ KB checked-in HTML
// artifact. The exact verified standalone document is gzip-compressed and embedded
// directly in index.html. At runtime the browser expands it in memory; there is no
// network fetch and the decompressed document still contains every patch as its own
// classic <script> execution unit.
const compressed = gzipSync(Buffer.from(standalone, "utf8"), { level: 9, mtime: 0 });
const payload = compressed.toString("base64");
const payloadWrapped = payload.match(/.{1,10000}/g).join("\n");

// Build-time round-trip gate: packing must be lossless before anything is written.
const roundTrip = gunzipSync(compressed).toString("utf8");
if (roundTrip !== standalone) {
  throw new Error("Komprimierter Standalone-Payload ist nicht verlustfrei");
}

const bootstrap = `<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b3648">
<title>Erzwelt — Rohstoffe &amp; Lieferketten</title>
</head>
<body>
<script id="erzwelt-standalone-gzip" type="application/octet-stream">${payloadWrapped}<\/script>
<script>
(async()=>{
  try{
    if(typeof DecompressionStream!=="function")throw new Error("Dieser Browser unterstützt DecompressionStream nicht.");
    const b64=document.getElementById("erzwelt-standalone-gzip").textContent.trim();
    const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const html=await new Response(stream).text();
    document.open();
    document.write(html);
    document.close();
  }catch(error){
    document.body.innerHTML='<main style="font:16px system-ui;padding:24px;max-width:680px;margin:auto"><h1>Erzwelt konnte nicht gestartet werden</h1><p>Bitte öffne die Datei in einem aktuellen Browser.</p><pre style="white-space:pre-wrap"></pre></main>';
    document.querySelector("pre").textContent=String(error&&error.message||error);
  }
})();
<\/script>
</body>
</html>
`;

// Bootstrap gates: self-contained release entry, no old loader and valid JS.
if (bootstrap.includes('fetch("./erzwelt-core.html"') || bootstrap.includes('fetch("./patches.json"')) {
  throw new Error("index.html enthält noch Abhängigkeiten des alten HTTP-Loaders");
}
if (bootstrap.includes('<script src="./')) {
  throw new Error("index.html enthält lokale externe Script-Abhängigkeiten");
}
const bootstrapScripts = [...bootstrap.matchAll(/<script\b(?![^>]*\btype="application\/octet-stream")[^>]*>([\s\S]*?)<\/script>/gi)];
bootstrapScripts.forEach((match, index) => assertScriptSyntax(match[1], `index.html#bootstrap-${index + 1}`));

await writeFile(outputPath, bootstrap, "utf8");

const written = await readFile(outputPath, "utf8");
if (written !== bootstrap) {
  throw new Error("Geschriebene index.html weicht vom erzeugten Inhalt ab");
}

console.log(`Generated ${path.relative(root, outputPath)} with ${entries.length} embedded patches.`);
console.log(`JavaScript syntax passed: ${coreScripts.length} core script(s) + ${entries.length} patch scripts + ${bootstrapScripts.length} bootstrap script(s).`);
console.log(`Packed standalone: ${Buffer.byteLength(standalone, "utf8")} bytes -> ${Buffer.byteLength(bootstrap, "utf8")} bytes.`);
console.log("Standalone verification passed: lossless embedded payload, no runtime fetch, no local script dependencies, patch order exact.");
