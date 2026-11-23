"use strict";

/* ============================================================
   DIDAKTISCHER MUST-FIX-PASS
   Die sichtbare Logik bleibt absichtlich klein:
   Rohstoff -> Raffination -> Material -> Produkt
   Lohn -> Zufriedenheit -> Streik
   Sicherheit -> Unfallrisiko
   Ruf -> Nachfrage
   Nachweise -> Lieferkettengesetz
   ============================================================ */

const DIDAKTIK_VERSION = 2;
const SICHERHEIT_BASIS_KOSTEN = 60000;

const ROHSTOFF_STANDARD = {
  kupfer: "Kupfererz",
  alu: "Bauxit",
  silizium: "Quarz / Rohsilizium",
  zinn: "Zinnerz (Kassiterit)",
  nickel: "Nickelerz",
  lithium: "Lithiumerz / Sole",
  kobalt: "Kupfer-/Kobalterz",
  silber: "Silbererz",
  seltene: "Erz mit Seltenen Erden",
  tantal: "Coltan",
  indium: "Zinkerz (Indium als Nebenprodukt)",
  gold: "Golderz"
};

const ROHSTOFF_ORT = {
  kolwezi: "Kupfer-/Kobalterz",
  katanga: "Kupfererz",
  rubaya: "Coltan",
  kigali: "Coltan",
  bayanobo: "Erz mit Seltenen Erden",
  jiangxi: "Quarz → Rohsilizium",
  liuzhou: "Zinkerz (Indium als Nebenprodukt)",
  sprucepine: "Quarz (Spielmodell)",
  mountainpass: "Erz mit Seltenen Erden",
  greenbushes: "Lithiumerz (Spodumen)",
  kalgoorlie: "Golderz",
  atacama: "Lithium-Sole",
  escondida: "Kupfererz",
  fresnillo: "Silbererz",
  sanrafael: "Zinnerz (Kassiterit)",
  bangka: "Zinnerz (Kassiterit)",
  sulawesi: "Nickelerz",
  obuasi: "Golderz",
  boke: "Bauxit",
  potosi: "Silbererz"
};

function rohstoffDerMine(def){
  return ROHSTOFF_ORT[def.id] || ROHSTOFF_STANDARD[def.mat] || "Rohstoff";
}

Object.entries(ROHSTOFF_STANDARD).forEach(([id, rohstoff]) => {
  if (MATERIAL[id]) MATERIAL[id].rohstoff = rohstoff;
});

/* Keine versteckte Länderwertung für Zufriedenheit oder Zwangsereignisse. */
Object.values(LAND).forEach(land => { land.risiko = 1; });

/* Lohn ist Lohn. Schutzhelm und Gefahrensymbol gehören nicht in die Lohnwahl. */
LOHNSTUFE[2].name = "deutlich über üblichem Lohn";
ikonLohn = function(stufe, aktiv){
  const n = stufe + 1;
  const gold = aktiv ? "#f5b73d" : "#cfc0a4";
  const rand = aktiv ? "#c48d1c" : "#b3a58a";
  let m = "";
  for (let i=0;i<n;i++){
    const x = 15 + (i-(n-1)/2)*5.5;
    m += `<circle cx="${x}" cy="11" r="5" fill="${gold}" stroke="${rand}" stroke-width="1.2"/>`;
    m += `<path d="M${x-1.8} 11h3.6" stroke="${rand}" stroke-width="1" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 30 22" aria-hidden="true">${m}</svg>`;
};

/* Sicherheit ist eine sichtbare Entscheidung pro Mine.
   Das Wissens-Upgrade macht diese Entscheidung günstiger, statt sie automatisch zu setzen.
   Lerntexte der Wissens-Bereiche (Titel, Kurztext, Text, Fakten) und der Text der
   Verbesserung: module/wissen.js. */
const leuteSeg = WISSEN.find(s => s.id === "leute");
if (leuteSeg){
  const sicherPerk = leuteSeg.perks.find(p => p.id === "leute1");
  if (sicherPerk){
    sicherPerk.titel = "Sicherheitsprogramm";
    sicherPerk.wirkung = ["Sicherheitsausbau −50 % Kosten"];
    delete sicherPerk.plus;
    sicherPerk.mult = {sicherheit:0.50};
  }
}

/* Bestehende Spielstände erweitern, ohne Progress zu verlieren. */
function didaktikMigration(){
  if (!S || typeof S !== "object") return;
  if (!S.preisMod || typeof S.preisMod !== "object") S.preisMod = {};
  S.preisMod = {};
  for (const id in S.minen){
    const m = S.minen[id];
    if (m.sicherheit === undefined) m.sicherheit = false;
    if (m.nachweis === undefined) m.nachweis = false;
  }
  S.didaktikVersion = DIDAKTIK_VERSION;
}

function nachweisStatus(){
  if (perkHat("ruf2")) return {stufe:2, text:"zertifiziert"};
  if (perkHat("ruf1")) return {stufe:1, text:"dokumentiert"};
  const ids = offeneMinen();
  if (ids.length && ids.every(id => S.minen[id] && S.minen[id].nachweis)) return {stufe:1, text:"dokumentiert"};
  return {stufe:0, text:"fehlen"};
}

/* Rohstoff-Weltmarktpreise sind kein Spielsystem mehr. */
marktBewegen = function(){};
matPreis = function(k){ return MATERIAL[k].preis || 0; };

/* Ruf wird nicht mehr jeden Monat heimlich aus dem Durchschnittslohn berechnet. */
rufAnpassen = function(){};