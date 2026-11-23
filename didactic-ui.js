"use strict";
/* ---------- Sichtbare Oberflächen ----------
   Der Markt-Reiter steht in module/seiten.js. */
Erzwelt.vorZeichnen(() => didaktikMigration());
document.addEventListener("click", e => {
  const b = e.target.closest("[data-didaktik='sicherheit']");
  if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const id = b.dataset.id, m = S.minen[id];
  if (!m || m.sicherheit) return;
  const kosten = Math.max(20000, Math.round(SICHERHEIT_BASIS_KOSTEN * perkMult("sicherheit") / 1000) * 1000);
  if (S.kasse < kosten) return;
  S.kasse -= kosten; S.ausgegeben += kosten; m.sicherheit = true;
  notiz(`<b>${MINEN.find(x=>x.id===id).ort}</b>: Sicherheit verbessert.`, "gut");
  speichern(); blattStand=""; seitenStand=""; zeichnen();
}, true);

document.addEventListener("click", e => {
  const b = e.target.closest('[data-tun="mine-auf"]');
  if (!b) return;
  setTimeout(()=>{
    const m = S.minen[b.dataset.id];
    if (m){ if (m.sicherheit===undefined) m.sicherheit=false; if (m.nachweis===undefined) m.nachweis=false; speichern(); }
  },0);
}, false);

didaktikMigration();
seitenStand = "";
blattStand = "";
zeichnen();