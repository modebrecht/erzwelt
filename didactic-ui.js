"use strict";
/* ---------- Sichtbare Oberflächen ---------- */
const originalBlattMine = blattMine;
blattMine = function(id){
  let html = originalBlattMine(id);
  const def = MINEN.find(x=>x.id===id);
  const m = S.minen[id];
  const mat = MATERIAL[def.mat];
  const roh = rohstoffDerMine(def);

  html = html.replace(`${LAND[def.land].name} · Mine`, `${LAND[def.land].name} · Rohstoffquelle`);
  html = html.replace(/<div class="erzband"([^>]*)><span class="kugel">([^<]+)<\/span>[^<]+<\/div>/,
    `<div class="erzband"$1><span class="kugel">$2</span>${roh} → ${mat.name}</div>`);
  html = html.replace(/<small>Ergiebigkeit<\/small><b>([^<]+) Erz<\/b>/g, `<small>Ergiebigkeit</small><b>$1 Rohstoff</b>`);
  html = html.replace(/<div class="ort">Was du zahlst, entscheidet über Zufriedenheit und Ruf<\/div>/,
    `<div class="ort">Der Lohn beeinflusst die Zufriedenheit</div>`);
  html = html.replace(/<div class="zeile"><span>Zielwert Zufriedenheit<\/span><b>[^<]+<\/b><\/div>/,
    `<div class="zeile"><span>Zielwert Zufriedenheit</span><b>${m?Math.round(LOHNSTUFE[m.stufe].ziel + perkPlus("zufrieden")):0} %</b></div>`);

  const modellHinweis = `<div class="notiz blau"><b>Spielmodell:</b> Mengen und Löhne sind vereinfachte Spielwerte.</div>`;
  if (!tutorialLaeuft() && !html.includes("Spielmodell:")) html += modellHinweis;

  if (m && !tutorialLaeuft()){
    const sicher = !!m.sicherheit;
    const kosten = Math.max(20000, Math.round(SICHERHEIT_BASIS_KOSTEN * perkMult("sicherheit") / 1000) * 1000);
    const karte = `<div class="karte">
      <h3>Sicherheit</h3>
      <div class="ort">Sicherheit senkt das Unfallrisiko – unabhängig vom Lohn.</div>
      <div class="zeile"><span>Status</span><b style="color:${sicher?"var(--gruen)":"var(--warn)"}">${sicher?"verbessert":"nicht verbessert"}</b></div>
      ${sicher?"":`<button class="cta gruen" data-didaktik="sicherheit" data-id="${id}" ${S.kasse>=kosten?"":"disabled"}>${IK.schild}${S.kasse>=kosten?"Sicherheit verbessern · "+chf(kosten):"Zu wenig Geld · "+chf(kosten)}</button>`}
    </div>`;
    const marker = `<div class="karte">\n      <h3>Zufriedenheit</h3>`;
    if (html.includes(marker)) html = html.replace(marker, karte + "\n\n    " + marker);
    else html += karte;
  }
  return html;
};

const originalBlattRaff = blattRaff;
blattRaff = function(id){
  let html = originalBlattRaff(id);
  html = html.replace(/Roherz im Lager/g, "Rohstoff im Lager");
  html = html.replace(/Aus 1 Erz wird je nach Material unterschiedlich viel:[^<]*<\/div>/,
    "Aus 1 Einheit Rohstoff wird je nach Material unterschiedlich viel nutzbares Material. Der Rest steht im Spielmodell für Abraum und Verluste.</div>");
  return html;
};

const originalBlattFab = blattFab;
blattFab = function(land){
  let html = originalBlattFab(land);
  html = html.replace(/Zukaufen geht nicht – eröffne dafür eine Mine\./g, "Zukaufen geht nicht – sichere dafür eine eigene Rohstoffquelle.");
  if (!tutorialLaeuft()) html = html.replace(/(<div class="stueck">)/g, `<div class="ort" style="margin-top:7px">Spielrezept · stark vereinfacht</div>$1`);
  return html;
};

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

  return `<h1>Markt &amp; Verkauf</h1><div class="unter">Fertige Ware verkauft sich nicht von allein</div>
    <div class="karte" style="background:linear-gradient(#fffdf6,#fdf3dd)">
      <h3>Verkauf</h3><div class="ort">Im Lager liegen <b>${lager}</b> Stück</div>
      <button class="cta riesig ${(!heuteSchon&&handStueck>0)?"puls":""}" data-tun="handverkauf" ${(heuteSchon||handStueck<=0)?"disabled":""}>${IK.muenze}${handStueck<=0?"Nichts zu verkaufen":heuteSchon?"Heute schon verkauft":"SELBER VERKAUFEN · "+handStueck+" Stück"}</button>
      <div class="notiz">Einmal pro Tag kannst du selber verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.</div>
      <h3 style="margin-top:14px">Dein Verkaufsteam</h3><div class="ort">${frei} Leute frei · Lohn ${chf(VERKAUF_LOHN)} pro Person und Monat</div>
      <div class="crewzeile"><button data-tun="vcrew" data-n="-5" ${(S.verkaeufer||0)<=0?"disabled":""}>−5</button><button data-tun="vcrew" data-n="-1" ${(S.verkaeufer||0)<=0?"disabled":""}>−</button><div class="zahl"><b>${S.verkaeufer||0}</b><small>Verkauf</small></div><button data-tun="vcrew" data-n="1" ${(frei<=0||(S.verkaeufer||0)>=VERKAUF_PLAETZE)?"disabled":""}>+</button><button data-tun="vcrew" data-n="5" ${(frei<=0||(S.verkaeufer||0)>=VERKAUF_PLAETZE)?"disabled":""}>+5</button></div>
      <div class="zeile"><span>Setzen ab</span><b>${kraft} Stück/Tag</b></div><div class="zeile"><span>Lohnkosten</span><b>${chf((S.verkaeufer||0)*VERKAUF_LOHN)}/Mt.</b></div>
      ${frei<=0?`<div class="notiz rot">Niemand ist frei. Stell im Team neue Leute an.<button class="cta" data-tun="zumteam">${IK.person}Zum Team</button></div>`:""}
    </div>
    <div class="karte"><h3>Deine Produkte</h3><table><tr><th>Produkt</th><th class="n">Lager</th><th class="n">Nachfr.</th><th class="n">CHF</th></tr>${prod}</table><div class="notiz">Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.</div></div>
    <div class="karte"><h3>Deine Rohstoffquellen</h3><table><tr><th>Material</th><th>Quelle</th><th class="n">Bereit</th><th class="n">Rohstoff</th></tr>${roh}</table><div class="notiz">Kein Weltpreis-Spielsystem: Primärrohstoffe kommen aus deinen eigenen Quellen und werden raffiniert. Recycling kann später einen Teil ersetzen.</div></div>
    ${eff.length?`<div class="karte"><h3>Aktuelle Sondereffekte</h3>${eff.map(m=>`<div class="zeile"><span>${m.art==="dollar"?"Dollar / Fertigwaren":"Hafen-Durchsatz"}</span><b>${Math.round(m.wert*100)} % · ${m.bis-S.tag} T.</b></div>`).join("")}</div>`:""}`;
};

const originalSeiteTeam = seiteTeam;
seiteTeam = function(){
  let html = originalSeiteTeam();
  html = html.replace("Jeder Mensch kostet Lohn – auch ohne Aufgabe", "Lohnkosten im Spielmodell");
  if (!tutorialLaeuft()) html += `<div class="notiz blau"><b>Spielmodell:</b> Die Lohnwerte sind vereinfacht und keine aktuelle Lohnstatistik.</div>`;
  return html;
};

const originalSeiteZiel = seiteZiel;
seiteZiel = function(){
  let html = originalSeiteZiel();
  const status = nachweisStatus();
  const nachweisKarte = `<div class="karte"><h3>Lieferketten-Nachweise</h3><div class="zeile"><span>Status</span><b style="color:${status.stufe?"var(--gruen)":"var(--warn)"}">${status.text}</b></div><div class="notiz">Nachweise entscheiden bei Lieferkettengesetzen. Dein Ruf ist davon getrennt und beeinflusst die Nachfrage.</div></div>`;
  const meldungen = `<div class="karte"><h3>Meldungen</h3>`;
  if (html.includes(meldungen)) html = html.replace(meldungen, nachweisKarte + meldungen);
  return html.replace(/ Erz<\/small>/g, " Rohstoff</small>");
};

const originalLupeFuellen = lupeFuellen;
lupeFuellen = function(segId){
  originalLupeFuellen(segId);
  const root = document.getElementById("lupeinhalt");
  if (!root) return;
  if (segId === "geologie"){
    const table = [...root.querySelectorAll("table")].find(t=>t.textContent.includes("Wichtige Förderländer"));
    if (table){
      const th = table.querySelector("th"); if (th) th.textContent = "Rohstoff → Material";
      const rows = table.querySelectorAll("tr");
      Object.keys(MATERIAL).forEach((k,i)=>{
        const cell = rows[i+1]?.querySelector("td");
        if (!cell) return;
        const quellen = [...new Set(MINEN.filter(m=>m.mat===k).map(m=>rohstoffDerMine(m)))];
        const usage = MATERIAL[k].wofuer;
        cell.innerHTML = `<i class="punkt" style="background:${MATERIAL[k].farbe}"></i> <b>${quellen.join(" / ")} → ${MATERIAL[k].name}</b><br><small style="color:var(--grau);font-weight:600">${usage}</small>`;
      });
      table.insertAdjacentHTML("afterend", `<div class="notiz blau"><b>Spielmodell:</b> Ergiebigkeit und Mengen sind vereinfachte Werte.</div>`);
    }
  }
  if (segId === "leute"){
    const notes = root.querySelectorAll(".notiz");
    notes.forEach(n=>{ if (n.textContent.includes("gerundete Grössenordnungen")) n.innerHTML = "<b>Spielmodell:</b> Diese Lohnwerte sind vereinfachte Spielwerte und keine aktuelle Statistik."; });
  }
  if (segId === "fabrik"){
    const card = [...root.querySelectorAll(".karte")].find(k=>k.querySelector("h3")?.textContent.includes("Was in einem Gerät steckt"));
    if (card && !card.textContent.includes("Spielrezepte")) card.insertAdjacentHTML("beforeend", `<div class="notiz blau"><b>Spielrezepte:</b> stark vereinfachte Materialanteile, keine Stücklisten realer Geräte.</div>`);
  }
};

const originalNaechsterSchritt = naechsterSchritt;
naechsterSchritt = function(){
  const w = originalNaechsterSchritt();
  if (w && w[0] === "Dein Ruf ist tief") return [w[0], "Das senkt die Nachfrage. Prüfe Meldungen und Entscheidungen, die Ruf gekostet haben."];
  if (w && w[1]) w[1] = w[1].replace(/Rohstoffe kannst du nicht zukaufen\. Eröffne dafür eine eigene Mine\./g, "Primärrohstoffe kommen aus eigenen Rohstoffquellen.");
  return w;
};

const tut = Object.fromEntries(TUTORIAL.map(t=>[t.id,t]));
if (tut.mine1) tut.mine1.text = "Dein Ladekabel braucht Kupfer, Aluminium und Zinn. Sichere zuerst eine eigene Rohstoffquelle.";
if (tut.minen3) tut.minen3.text = "Kupfererz → Kupfer, Bauxit → Aluminium, Zinnerz → Zinn. Öffne für alle drei eine Rohstoffquelle.";
if (tut.raff) tut.raff.text = "Rohstoffe lassen sich nicht direkt verbauen. Erst die Raffinerie macht daraus nutzbares Material.";

const originalZeichnen = zeichnen;
zeichnen = function(){
  didaktikMigration();
  originalZeichnen();
  document.querySelectorAll("#toasts .toast, #seite, #blattinhalt").forEach(root=>{
    if (!root || !root.innerHTML) return;
    root.querySelectorAll("*").forEach(el=>{
      if (el.children.length===0 && el.textContent && /\+\d+ Erz$/.test(el.textContent.trim())) el.textContent = el.textContent.replace(/ Erz$/, " Rohstoff");
    });
  });
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
  rufAendern(1);
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
