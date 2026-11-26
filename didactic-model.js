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
  kupfer: textVon("didacticmodel.kupfererz"),
  alu: textVon("didacticmodel.bauxit"),
  silizium: textVon("didacticmodel.quarz-rohsilizium"),
  zinn: textVon("didacticmodel.zinnerz-kassiterit"),
  nickel: textVon("didacticmodel.nickelerz"),
  lithium: textVon("didacticmodel.lithiumerz-sole"),
  kobalt: textVon("didacticmodel.kupfer-kobalterz"),
  silber: textVon("didacticmodel.silbererz"),
  seltene: textVon("didacticmodel.erz-mit-seltenen-erden"),
  tantal: textVon("didacticmodel.coltan"),
  indium: textVon("didacticmodel.zinkerz-indium-als-nebenprodukt"),
  gold: textVon("didacticmodel.golderz")
};

const ROHSTOFF_ORT = {
  kolwezi: textVon("didacticmodel.kupfer-kobalterz"),
  katanga: textVon("didacticmodel.kupfererz"),
  rubaya: textVon("didacticmodel.coltan"),
  kigali: textVon("didacticmodel.coltan"),
  bayanobo: textVon("didacticmodel.erz-mit-seltenen-erden"),
  jiangxi: textVon("didacticmodel.quarz-rohsilizium-2"),
  liuzhou: textVon("didacticmodel.zinkerz-indium-als-nebenprodukt"),
  sprucepine: textVon("didacticmodel.quarz-spielmodell"),
  mountainpass: textVon("didacticmodel.erz-mit-seltenen-erden"),
  greenbushes: textVon("didacticmodel.lithiumerz-spodumen"),
  kalgoorlie: textVon("didacticmodel.golderz"),
  atacama: textVon("didacticmodel.lithium-sole"),
  escondida: textVon("didacticmodel.kupfererz"),
  fresnillo: textVon("didacticmodel.silbererz"),
  sanrafael: textVon("didacticmodel.zinnerz-kassiterit"),
  bangka: textVon("didacticmodel.zinnerz-kassiterit"),
  sulawesi: textVon("didacticmodel.nickelerz"),
  obuasi: textVon("didacticmodel.golderz"),
  boke: textVon("didacticmodel.bauxit"),
  potosi: textVon("didacticmodel.silbererz")
};

function rohstoffDerMine(def){
  return ROHSTOFF_ORT[def.id] || ROHSTOFF_STANDARD[def.mat] || textVon("didacticmodel.rohstoff");
}

Object.entries(ROHSTOFF_STANDARD).forEach(([id, rohstoff]) => {
  if (MATERIAL[id]) MATERIAL[id].rohstoff = rohstoff;
});

/* Keine versteckte Länderwertung für Zufriedenheit oder Zwangsereignisse. */
Object.values(LAND).forEach(land => { land.risiko = 1; });

/* Lohn ist Lohn. Schutzhelm und Gefahrensymbol gehören nicht in die Lohnwahl. */
LOHNSTUFE[2].name = textVon("didacticmodel.deutlich-ueber-ueblichem-lohn");
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
   Das Wissens-Upgrade macht diese Entscheidung günstiger, statt sie automatisch zu setzen. */
const leuteSeg = WISSEN.find(s => s.id === "leute");
if (leuteSeg){
  leuteSeg.titel = textVon("didacticmodel.menschen-loehne-sicherheit");
  leuteSeg.kurz = "Lohn und Sicherheit sind zwei verschiedene Entscheidungen.";
  leuteSeg.text = [
    "Im Spiel beeinflusst der <b>Lohn</b> vor allem die Zufriedenheit. Sinkt sie stark, kann es zum Streik kommen.",
    textVon("didacticmodel.sicherheit-ist-separat-schutz")
  ];
  leuteSeg.fakten = [
    textVon("didacticmodel.sicherheitsmassnahmen-wie-geeignete-ausruestung"),
    textVon("didacticmodel.im-spiel-beeinflusst-die"),
    "Lohn und Sicherheit werden im Spiel getrennt dargestellt, damit ihre unterschiedlichen Wirkungen sichtbar bleiben."
  ];
  const sicherPerk = leuteSeg.perks.find(p => p.id === "leute1");
  if (sicherPerk){
    sicherPerk.titel = textVon("didacticmodel.sicherheitsprogramm");
    sicherPerk.text = textVon("didacticmodel.ein-gemeinsamer-standard-macht");
    sicherPerk.wirkung = [textVon("didacticmodel.sicherheitsausbau-kosten")];
    delete sicherPerk.plus;
    sicherPerk.mult = {sicherheit:0.50};
  }
}

const marktSeg = WISSEN.find(s => s.id === "markt");
if (marktSeg){
  marktSeg.kurz = "Nachfrage, Lager und Dollarkurs bei Fertigwaren.";
  marktSeg.text = [
    textVon("didacticmodel.fertige-produkte-muessen-verkauft"),
    textVon("didacticmodel.das-spiel-simuliert-preis")
  ];
}

const rufSeg = WISSEN.find(s => s.id === "ruf");
if (rufSeg){
  rufSeg.titel = textVon("didacticmodel.ruf-nachweise");
  rufSeg.kurz = "Ruf beeinflusst Nachfrage. Nachweise belegen deine Lieferkette.";
  rufSeg.text = [
    "Dein <b>Ruf</b> zeigt, wie Kundinnen und Kunden deine Firma wahrnehmen. Ein niedriger Ruf senkt die Nachfrage nach deinen Produkten.",
    textVon("didacticmodel.nachweise-sind-etwas-anderes")
  ];
}

const modellSeg = WISSEN.find(s => s.id === "modell");
if (modellSeg){
  modellSeg.text = [
    textVon("didacticmodel.erzwelt-ist-ein-spielmodell"),
    textVon("didacticmodel.das-modell-zeigt-nur")
  ];
  modellSeg.fakten = [
    "Die Werte sind gerundet und vereinfacht. Reale Lieferketten umfassen weitere Einflussfaktoren.",
    textVon("didacticmodel.ein-spieltag-folgt-der"),
    "Rohstoffpreise am Weltmarkt werden im Spiel nicht berechnet."
  ];
  modellSeg.formeln = [
    [textVon("didacticmodel.foerderung-tag"),textVon("didacticmodel.arbeiter-ergiebigkeit-zufriedenheit")],
    [textVon("didacticmodel.material-aus-rohstoff"),textVon("didacticmodel.rohstoff-ausbeute")],
    [textVon("didacticmodel.fabrik-ausstoss"),textVon("didacticmodel.arbeiter-ausstoss-begrenzt-vom")],
    [textVon("didacticmodel.nachfrage"),textVon("didacticmodel.grundwert-saison-ereignis-ruf")],
    [textVon("didacticmodel.verkaufspreis"),textVon("didacticmodel.grundpreis-ueberangebot-dollarkurs")]
  ];
}

const ketteSeg = WISSEN.find(s => s.id === "kette");
if (ketteSeg){
  ketteSeg.kurz = textVon("didacticmodel.rohstoff-raffinerie-material-fabrik");
  ketteSeg.text = [
    textVon("didacticmodel.aus-einer-rohstoffquelle-kommt"),
    textVon("didacticmodel.reisst-ein-glied-steht")
  ];
}

const chemieSeg = WISSEN.find(s => s.id === "chemie");
if (chemieSeg){
  chemieSeg.kurz = "Aus Rohstoffen werden nutzbare Materialien.";
  chemieSeg.text = [
    textVon("didacticmodel.die-ausbeute-ist-im"),
    "Nicht nur der Abbau, auch die Raffination kann zum Engpass einer Lieferkette werden."
  ];
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