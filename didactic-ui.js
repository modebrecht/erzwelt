"use strict";
/* ---------- Sichtbare Oberflächen ---------- */
/* Markt-Reiter: ersetzt die Fassung des Kerns (Reihenfolge: module/seiten.js) */
(window.__erzweltSeitenTeile ||= {}).markt = function(){
  const kraft = verkaufsKraft(), lager = warenLager();
  const heuteSchon = S.handverkaufTag === S.tag;
  const frei = freieArbeiter();
  let handStueck = 0;
  for (const p in PRODUKT) handStueck += Math.min(S.ware[p]||0, Math.round(nachfrage(p)));

  const prod = Object.keys(PRODUKT).map(p => {
    const l = S.ware[p]||0;
    return `<tr><td>${PRODUKT[p].name}</td><td class="n">${l}</td><td class="n">${Math.round(nachfrage(p))}</td><td class="n">${Math.round(warenPreis(p))}</td></tr>`;
  }).join("");
  const roh = Object.keys(MATERIAL).map(k => {
    const quellen = MINEN.filter(m=>m.mat===k && S.minen[m.id]);
    const quelle = quellen.length ? quellen.map(m=>m.ort).join(", ") : "–";
    return `<tr><td><i class="punkt" style="background:${MATERIAL[k].farbe}"></i> ${MATERIAL[k].name}</td><td>${quelle}</td><td class="n">${Math.round(S.mat[k]||0)}</td><td class="n">${Math.round(S.erz[k]||0)}</td></tr>`;
  }).join("");
  const eff = S.globalMod.filter(m => m.bis > S.tag);

  return textVon("didacticui.markt-verkauf-fertige-produkte", {p1:(lager), p2:((!heuteSchon&&handStueck>0)?"puls":""), p3:((heuteSchon||handStueck<=0)?"disabled":""), p4:(IK.muenze), p5:(handStueck<=0?"Nichts zu verkaufen":heuteSchon?"Heute schon verkauft":"SELBST VERKAUFEN · "+handStueck+" Stück"), p6:(frei), p7:(chf(VERKAUF_LOHN)), p8:((S.verkaeufer||0)<=0?"disabled":""), p9:((S.verkaeufer||0)<=0?"disabled":""), p10:(S.verkaeufer||0), p11:((frei<=0||(S.verkaeufer||0)>=VERKAUF_PLAETZE)?"disabled":""), p12:((frei<=0||(S.verkaeufer||0)>=VERKAUF_PLAETZE)?"disabled":""), p13:(kraft), p14:(chf((S.verkaeufer||0)*VERKAUF_LOHN)), p15:(""), p16:(prod), p17:(roh), p18:(eff.length?`<div class="karte"><h3>Aktuelle Einflüsse</h3>${eff.map(m=>`<div class="zeile"><span>${m.art==="dollar"?"US-Dollar / Fertigwaren":"Durchsatz im Hafen"}</span><b>${Math.round(m.wert*100)} % · ${m.bis-S.tag} T.</b></div>`).join("")}</div>`:"")});
};

/* Vor jedem Zeichnen (Reihenfolge: module/karte.js) */
(window.__erzweltKarteTeile ||= {}).didaktikVor = () => didaktikMigration();
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