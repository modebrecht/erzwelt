import { readFile, writeFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const corePath = path.join(root, "erzwelt-core.html");
const manifestPath = path.join(root, "patches.json");
const outputPath = path.join(root, "erzwelt.html");

const core = await readFile(corePath, "utf8");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

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

const blocks = [];
for (const { group, file } of entries) {
  const filePath = path.join(root, file);
  await access(filePath);
  const source = await readFile(filePath, "utf8");
  if (!source.trim()) throw new Error(`${file} ist leer`);

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
await writeFile(outputPath, standalone, "utf8");

console.log(`Generated ${path.relative(root, outputPath)} with ${entries.length} patches.`);
