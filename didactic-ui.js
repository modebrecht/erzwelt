"use strict";
/* ---------- Sichtbare Oberflächen ---------- */
seiteMarkt = function(){
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

  return `<h1>Markt &amp; Verkauf</h1><div class="unter">Fertige Produkte müssen verkauft werden</div>
    <div class="verkauf-kette-mini"><span>Produkt</span><b>→</b><span>Verkauf</span><b>→</b><span>Geld</span></div>
    <div class="karte" style="background:linear-gradient(#fffdf6,#fdf3dd)">
      <h3>Verkauf</h3><div class="ort">Im Lager liegen <b>${lager}</b> Stück</div>
      <button class="cta riesig ${(!heuteSchon&&handStueck>0)?"puls":""}" data-tun="handverkauf" ${(heuteSchon||handStueck<=0)?"disabled":""}>${IK.muenze}${handStueck<=0?"Nichts zu verkaufen":heuteSchon?"Heute schon verkauft":"SELBST VERKAUFEN · "+handStueck+" Stück"}</button>
      <div class="notiz">Einmal pro Tag kannst du selbst verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.</div>
      <h3 style="margin-top:14px">Dein Verkaufsteam</h3><div class="ort">${frei} Personen frei · Lohn ${chf(VERKAUF_LOHN)} pro Person und Monat</div>
      <div class="crewzeile"><button data-tun="vcrew" data-n="-5" ${(S.verkaeufer||0)<=0?"disabled":""}>−5</button><button data-tun="vcrew" data-n="-1" ${(S.verkaeufer||0)<=0?"disabled":""}>−</button><div class="zahl"><b>${S.verkaeufer||0}</b><small>Verkauf</small></div><button data-tun="vcrew" data-n="1" ${(frei<=0||(S.verkaeufer||0)>=VERKAUF_PLAETZE)?"disabled":""}>+</button><button data-tun="vcrew" data-n="5" ${(frei<=0||(S.verkaeufer||0)>=VERKAUF_PLAETZE)?"disabled":""}>+5</button></div>
      <div class="zeile"><span>Verkaufskapazität</span><b>${kraft} Stück/Tag</b></div><div class="zeile"><span>Lohnkosten</span><b>${chf((S.verkaeufer||0)*VERKAUF_LOHN)}/Mt.</b></div>
      ${frei<=0?`<div class="notiz rot">Niemand ist frei. Stelle im Team weitere Personen ein.<button class="cta" data-tun="zumteam">${IK.person}Zum Team</button></div>`:""}
    </div>
    <div class="karte"><h3>Deine Produkte</h3><table><tr><th>Produkt</th><th class="n">Lager</th><th class="n">Nachfr.</th><th class="n">CHF</th></tr>${prod}</table><div class="notiz">Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.</div></div>
    <div class="karte"><h3>Deine Rohstoffquellen</h3><table><tr><th>Material</th><th>Quelle</th><th class="n">Bereit</th><th class="n">Rohstoff</th></tr>${roh}</table><div class="notiz">Rohstoffpreise am Weltmarkt werden nicht berechnet. Die Rohstoffe stammen im Spiel aus eigenen Quellen und werden anschliessend raffiniert.</div></div>
    ${eff.length?`<div class="karte"><h3>Aktuelle Einflüsse</h3>${eff.map(m=>`<div class="zeile"><span>${m.art==="dollar"?"US-Dollar / Fertigwaren":"Durchsatz im Hafen"}</span><b>${Math.round(m.wert*100)} % · ${m.bis-S.tag} T.</b></div>`).join("")}</div>`:""}`;
};

const tut = Object.fromEntries(TUTORIAL.map(t=>[t.id,t]));
if (tut.mine1) tut.mine1.text = "Dein Ladekabel braucht Kupfer, Aluminium und Zinn. Sichere zuerst eine eigene Rohstoffquelle.";
if (tut.minen3) tut.minen3.text = "Kupfererz → Kupfer, Bauxit → Aluminium, Zinnerz → Zinn. Öffne für alle drei eine Rohstoffquelle.";
if (tut.raff) tut.raff.text = "Rohstoffe lassen sich nicht direkt verbauen. Erst die Raffinerie macht daraus nutzbares Material.";

const originalZeichnen = zeichnen;
zeichnen = function(){
  didaktikMigration();
  return originalZeichnen();
};
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