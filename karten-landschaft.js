"use strict";
/* ============================================================
   LANDSCHAFT AUF DER KARTE

   Leichte Vegetation und Gelände auf dem Land: Schnee und Eis, verschneite
   Tannenwälder, Nadel- und Laubwald, Regenwald und Dschungel, Savanne, Wüste
   mit Dünen, Gebirge, die grossen Flüsse. Dazu leichte Wellen auf dem Ozean.

   Alles ist Dekoration: unter den Pins, ohne Klicks (pointer-events:none),
   fest verteilt (gleicher Zufall bei jedem Laden). Die Gebiete sind grob nach
   Klimazonen gesetzt und auf die Landfläche zugeschnitten.

   Einstellungen (OPT, gespeichert):
     landschaft  0 aus · 1 leicht (Standard) · 2 voll
     wellen      0 aus · 1 an (Standard); bei Animationen «Aus» stehen sie still
   ============================================================ */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.querySelector("#welt svg.weltkarte");
  const land = svg?.querySelector("path.land:not(.kleine-inseln)");
  if (!svg || !land) return;

  const punkt = (lon, lat) => [(lon + 180) / 360 * KARTE_B, (78 - lat) / 138 * KARTE_H];

  /* ---------- Gebiete: [Art, Länge, Breite, Halbachse Länge, Halbachse Breite] ---------- */
  const GEBIETE = [
    // Schnee und Eis
    ["schnee", -42, 74, 22, 11], ["schnee", -95, 74, 30, 5], ["schnee", 100, 75, 45, 4],
    // Verschneite Nadelwälder (hoher Norden)
    ["schneewald", -120, 63, 30, 5], ["schneewald", -75, 57, 14, 4], ["schneewald", 95, 64, 45, 5],
    ["schneewald", 155, 64, 20, 5], ["schneewald", 25, 66, 8, 3],
    // Nadelwald (Taiga)
    ["nadelwald", -105, 55, 30, 5], ["nadelwald", 70, 58, 30, 4], ["nadelwald", 120, 55, 25, 4],
    ["nadelwald", 16, 61, 7, 3],
    // Laubwald
    ["laubwald", 12, 50, 14, 5], ["laubwald", -82, 39, 12, 6], ["laubwald", 116, 32, 9, 6],
    ["laubwald", 38, 54, 12, 3],
    // Regenwald und Dschungel
    ["regenwald", -62, -5, 15, 8], ["regenwald", 21, 0, 10, 5], ["regenwald", -5, 6, 8, 2],
    ["regenwald", 114, 0, 12, 5], ["regenwald", 140, -5, 7, 3], ["dschungel", 102, 15, 6, 7],
    ["dschungel", -86, 14, 6, 5], ["dschungel", 78, 20, 5, 6],
    // Savanne
    ["savanne", 5, 11, 22, 4], ["savanne", 30, -15, 10, 7], ["savanne", -48, -15, 10, 6],
    ["savanne", 133, -17, 12, 4],
    // Wüste
    ["wueste", 10, 24, 22, 7], ["wueste", 47, 23, 9, 7], ["wueste", 63, 30, 8, 4],
    ["wueste", 102, 42, 11, 4], ["wueste", 84, 39, 7, 2.5], ["wueste", 130, -26, 12, 6],
    ["wueste", -112, 33, 6, 4], ["wueste", 19, -24, 5, 4], ["wueste", -70, -23, 2, 5],
    // Gebirge
    ["gebirge", -70, -25, 3, 18], ["gebirge", -77, -2, 2.5, 7], ["gebirge", -113, 47, 5, 10],
    ["gebirge", 85, 31, 10, 3], ["gebirge", 10, 46.5, 4, 1.2], ["gebirge", 59, 59, 1.5, 7]
  ];
  // Fläche (Farbe, Deckkraft innen) und Zeichen pro Art
  const ART = {
    schnee:     {farbe:"#f5f8fb", deckkraft:.9,  zeichen:null},
    schneewald: {farbe:"#dfe7e3", deckkraft:.75, zeichen:["schneetanne", "schneetanne", "tanne"]},
    nadelwald:  {farbe:"#97b38a", deckkraft:.5,  zeichen:["tanne"]},
    laubwald:   {farbe:"#adc48e", deckkraft:.45, zeichen:["laubbaum", "laubbaum", "tanne"]},
    regenwald:  {farbe:"#5e9a5a", deckkraft:.6,  zeichen:["regenwald"]},
    dschungel:  {farbe:"#6aa264", deckkraft:.55, zeichen:["regenwald", "palme"]},
    savanne:    {farbe:"#d9c983", deckkraft:.5,  zeichen:["akazie"]},
    wueste:     {farbe:"#efd59a", deckkraft:.75, zeichen:["duene", "duene", "duene", "kaktus"]},
    gebirge:    {farbe:"#c9b48a", deckkraft:.45, zeichen:["berg"]}
  };
  // Zeichen pro Fläche (Gradquadrat) bei «leicht»; «voll» legt gleich viele dazu
  const DICHTE = {schneewald:.05, nadelwald:.05, laubwald:.06, regenwald:.08, dschungel:.08, savanne:.04, wueste:.035, gebirge:.12};

  const ZEICHEN = {
    tanne: `<path d="M0,-5.2 3,-.6H1.4L3.5,2.6H-3.5L-1.4,-.6H-3Z" fill="#3f6b4a"/><rect x="-.5" y="2.6" width="1" height="1.4" fill="#6b4f35"/>`,
    schneetanne: `<path d="M0,-5.2 3,-.6H1.4L3.5,2.6H-3.5L-1.4,-.6H-3Z" fill="#4b715a"/><path d="M0,-5.2 1.7,-2.6H-1.7Z" fill="#fff"/><path d="M-1.4,-.6H1.4L2.3,.8H-2.3Z" fill="#f4f8fb"/><rect x="-.5" y="2.6" width="1" height="1.4" fill="#6b4f35"/>`,
    laubbaum: `<rect x="-.45" y=".4" width=".9" height="2.4" fill="#6b4f35"/><circle cy="-1.4" r="2.6" fill="#6f9a55"/><circle cx="-1" cy="-2" r="1.1" fill="#86ad68"/>`,
    regenwald: `<circle cx="-1.8" cy="0" r="2.1" fill="#3d7543"/><circle cx="1.6" cy=".2" r="2.2" fill="#447f48"/><circle cx="0" cy="-1.6" r="2.3" fill="#4f8d50"/>`,
    palme: `<path d="M0,3 Q.6,0 0,-2.6" stroke="#7a5a3a" stroke-width=".7" fill="none"/><path d="M0,-2.6 Q-2.5,-3.6 -3.6,-1.6M0,-2.6 Q2.5,-3.6 3.6,-1.6M0,-2.6 Q-1,-4.6 -2.6,-4.4M0,-2.6 Q1,-4.6 2.6,-4.4" stroke="#3f7d43" stroke-width=".8" fill="none" stroke-linecap="round"/>`,
    akazie: `<path d="M0,2.6V-.6M0,-.2 -1.2,-1.1M0,-.4 1.1,-1.2" stroke="#6b4f35" stroke-width=".55" fill="none"/><ellipse cy="-1.6" rx="3.4" ry="1.1" fill="#7f9b4f"/>`,
    duene: `<path d="M-4,1.2Q-1.2,-1.6 1.6,1.2M-.6,2.4Q2,.2 4.6,2.4" stroke="#c99f5c" stroke-width=".6" fill="none" stroke-linecap="round"/>`,
    kaktus: `<path d="M0,2.6V-2.6M0,.2H-1.4V-1.4M0,-.6H1.3V-2" stroke="#5f8a4e" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
    berg: `<path d="M-4.2,2.6 -.6,-3.4 1.2,-.6 2.2,-2 4.6,2.6Z" fill="#a78d68"/><path d="M-.6,-3.4 .5,-1.6 -.2,-1.2 -1,-1.8 -1.7,-1.6Z" fill="#fbfaf6"/>`
  };

  /* Fester Zufall: gleiche Verteilung bei jedem Laden */
  function zufall(saat){
    let a = saat >>> 0;
    return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  /* ---------- Aufbau ---------- */
  function el(name, attr){ const e = document.createElementNS(NS, name); for (const k in attr) e.setAttribute(k, attr[k]); return e; }
  if (!land.id) land.id = "erzwelt-land";

  const defs = el("defs", {});
  const clip = el("clipPath", {id:"landschaft-clip"});
  clip.append(el("use", {href:"#" + land.id}));
  defs.append(clip);
  for (const [art, a] of Object.entries(ART)){
    const g = el("radialGradient", {id:"landschaft-" + art});
    g.append(el("stop", {offset:"0", "stop-color":a.farbe, "stop-opacity":a.deckkraft}),
             el("stop", {offset:".6", "stop-color":a.farbe, "stop-opacity":a.deckkraft * .75}),
             el("stop", {offset:"1", "stop-color":a.farbe, "stop-opacity":0}));
    defs.append(g);
  }
  for (const [name, inhalt] of Object.entries(ZEICHEN)){
    const s = el("symbol", {id:"lz-" + name, viewBox:"-5 -5.5 10 10", overflow:"visible"});
    s.innerHTML = inhalt;
    defs.append(s);
  }

  const ebene = el("g", {class:"karten-landschaft", "aria-hidden":"true"});
  const flaechen = el("g", {class:"landschaft-flaechen", "clip-path":"url(#landschaft-clip)"});
  const leicht = el("g", {class:"landschaft-zeichen"});
  const voll = el("g", {class:"landschaft-zeichen landschaft-voll"});
  const imLand = (x, y) => {
    try { return land.isPointInFill(new DOMPoint(x, y)); } catch (e){ return false; }
  };

  GEBIETE.forEach(([art, lon, lat, rLon, rLat], nr) => {
    const [cx, cy] = punkt(lon, lat);
    const rx = rLon / 360 * KARTE_B, ry = rLat / 138 * KARTE_H;
    flaechen.append(el("ellipse", {cx:cx.toFixed(1), cy:cy.toFixed(1), rx:(rx * 1.25).toFixed(1), ry:(ry * 1.25).toFixed(1), fill:`url(#landschaft-${art})`}));
    const zeichen = ART[art].zeichen;
    if (!zeichen) return;
    const anzahl = Math.max(2, Math.round(DICHTE[art] * rLon * rLat * Math.PI));
    const rnd = zufall(4049 + nr * 97);
    let gesetzt = 0;
    for (let versuch = 0; versuch < anzahl * 8 && gesetzt < anzahl * 2; versuch++){
      const w = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      const x = cx + Math.cos(w) * r * rx, y = cy + Math.sin(w) * r * ry;
      if (!imLand(x, y)) continue;
      const name = zeichen[Math.floor(rnd() * zeichen.length)];
      const groesse = 7 + rnd() * 3;
      const u = el("use", {href:"#lz-" + name, x:(x - groesse / 2).toFixed(1), y:(y - groesse / 2).toFixed(1),
        width:groesse.toFixed(1), height:groesse.toFixed(1)});
      (gesetzt % 2 ? voll : leicht).append(u);
      gesetzt++;
    }
  });
  /* Grosse Flüsse: grobe Linien von der Quelle zur Mündung, auf das Land zugeschnitten */
  const FLUESSE = [
    [[-78,-4.5],[-73,-4],[-70,-3.5],[-65,-3.5],[-60,-3.2],[-55,-2.4],[-52,-1.5],[-50,-.5]],          // Amazonas
    [[-47,-20],[-52,-22],[-55,-27],[-58.5,-31],[-58.4,-34]],                                         // Paraná
    [[26,1],[24,1.5],[22,2],[19,1],[17,-1],[16,-3],[15,-4.3],[13,-5.8]],                             // Kongo
    [[33,-1],[32.5,4],[31.5,9],[32.5,15.5],[33,19],[31,22],[32.8,24],[31.3,28],[31.2,30],[31,31.5]], // Nil
    [[-10,10],[-6,13],[-3,16.5],[0,16],[3,13],[6,9],[6.5,5]],                                        // Niger
    [[-95,47],[-91.5,43],[-91,39],[-89.5,36],[-91,32],[-90,30],[-89.4,29]],                          // Mississippi
    [[-117,61],[-123,64],[-130,67.5],[-135,69]],                                                     // Mackenzie
    [[9.5,46.8],[8,47.6],[8.4,49],[7.6,50.3],[6.8,51.3],[4.2,51.9]],                                 // Rhein
    [[8.5,48],[12,48.5],[16.5,48],[19,47.5],[19,45],[22,44],[26,43.8],[28.5,45],[29.7,45.2]],        // Donau
    [[86,52],[83,55],[77,61],[69,61],[66,64],[66.5,66.5]],                                           // Ob
    [[106,54],[115,58],[127,62],[128,66],[127,71]],                                                  // Lena
    [[91,33],[98,30],[102,28],[105,29.5],[110,30.5],[114,30.5],[118,31.5],[121.5,31.4]],             // Jangtse
    [[98,30],[100,23],[102,18],[105,15],[105.5,11],[106.5,10]],                                      // Mekong
    [[79,30],[81,26],[84.5,25.5],[88,24],[90,22.5]],                                                 // Ganges
    [[148,-36],[144,-35.5],[140,-34],[139,-35.5]]                                                    // Murray
  ];
  const fluesse = el("g", {class:"landschaft-fluesse", "clip-path":"url(#landschaft-clip)"});
  for (const lauf of FLUESSE){
    fluesse.append(el("path", {d:"M" + lauf.map(([lon, lat]) => punkt(lon, lat).map(v => v.toFixed(1)).join(",")).join(" L"),
      fill:"none", stroke:"#6aa6c8", "stroke-width":"1.4", "stroke-linecap":"round", "stroke-linejoin":"round", opacity:".85"}));
  }
  ebene.append(flaechen, fluesse, leicht, voll);

  // Direkt über die Landflächen, unter Linien, Routen und Pins
  const inseln = svg.querySelector("path.land.kleine-inseln") || land;
  svg.insertBefore(defs, svg.firstChild);
  inseln.after(ebene);

  /* ---------- Wellen auf dem Ozean (eigene Ebene hinter der Karte) ---------- */
  const wellen = document.createElement("div");
  wellen.className = "karten-wellen";
  wellen.setAttribute("aria-hidden", "true");
  svg.before(wellen);

  const stil = document.createElement("style");
  stil.id = "erzwelt-karten-landschaft-style";
  const welle = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="36"><path d="M4 12q6-5 12 0t12 0M40 30q6-5 12 0t12 0" stroke="#ffffff" stroke-opacity=".12" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`);
  stil.textContent = `
    .karten-landschaft{pointer-events:none}
    .karten-wellen{position:absolute;top:0;left:-72px;width:${KARTE_B + 144}px;height:${KARTE_H}px;pointer-events:none;
      background:url("data:image/svg+xml,${welle}") repeat;will-change:transform;animation:karten-wellen 14s linear infinite}
    #welt > svg.weltkarte{position:relative}
    @keyframes karten-wellen{from{transform:translateX(0)}to{transform:translateX(72px)}}
    body[data-anim="0"] .karten-wellen{animation:none}
    @media (prefers-reduced-motion: reduce){.karten-wellen{animation:none}}
    body[data-landschaft="0"] .karten-landschaft{display:none}
    body[data-landschaft="1"] .landschaft-voll{display:none}
    body[data-wellen="0"] .karten-wellen{display:none}`;
  document.head.append(stil);

  /* ---------- Einstellungen ---------- */
  const STUFEN = () => [textVon("landschaft.aus"), textVon("landschaft.leicht"), textVon("landschaft.voll")];
  const wert = (k, std, max) => Number.isInteger(OPT[k]) && OPT[k] >= 0 && OPT[k] <= max ? OPT[k] : std;
  function anwenden(){
    document.body.dataset.landschaft = String(wert("landschaft", 1, 2));
    document.body.dataset.wellen = String(wert("wellen", 1, 1));
  }
  anwenden();

  /* Nach einstFuellen: Regler «Landschaft» und «Meereswellen» (module/meldungen.js) */
  (window.__erzweltMeldungenTeile ||= {}).landschaft = function(){
    if (document.getElementById("r-landschaft") || typeof regler !== "function") return;
    const vor = document.querySelector("#lieferanzeige")?.closest(".reglerzeile");
    if (!vor) return;
    const l = wert("landschaft", 1, 2), w = wert("wellen", 1, 1);
    vor.insertAdjacentHTML("afterend",
      regler("landschaft", textVon("landschaft.titel"), textVon("landschaft.hilfe"), 0, 2, 1, l, STUFEN()[l])
      + regler("wellen", textVon("wellen.titel"), textVon("wellen.hilfe"), 0, 1, 1, w, textVon(w ? "wellen.an" : "wellen.aus")));
  };
  document.addEventListener("input", e => {
    const r = e.target.closest?.('[data-regler="landschaft"], [data-regler="wellen"]');
    if (!r) return;
    const art = r.dataset.regler;
    OPT[art] = +r.value;
    const anzeige = document.getElementById("w-" + art);
    if (anzeige) anzeige.textContent = art === "landschaft" ? STUFEN()[OPT[art]] : textVon(OPT[art] ? "wellen.an" : "wellen.aus");
    anwenden();
    if (typeof optSpeichern === "function") optSpeichern();
  });

  window.__erzweltKartenLandschaft = {version:1, zeichen: leicht.childElementCount + voll.childElementCount, anwenden};
})();
