"use strict";
/* ============================================================
   LANDSCHAFT AUF DER KARTE

   Leichte Vegetation und Gelände auf dem Land: Schnee und Eis, verschneite
   Tannenwälder, Nadel- und Laubwald, Regenwald und Dschungel, Savanne, Wüste
   mit Dünen, Gebirge, die grossen Flüsse. Dazu leichte Wellen auf dem Ozean.

   Alles ist Dekoration: unter den Pins, ohne Klicks (pointer-events:none),
   fest verteilt (gleicher Zufall bei jedem Laden). Die Gebiete sind als grobe
   Umrisse nach Klimazonen gesetzt; Bäume stehen dicht und dünnen zu den Rändern
   aus. Gleiche Farben einer Zeile stehen in einem Pfad (wenige Elemente, auch bei
   Tausenden Bäumen). Wellen: wenige Kämme auf offener See, die langsam kommen
   und gehen.

   Leistung: In der Übersicht stehen die Bäume als ein fertiges Bild (kurz nach
   dem Start erzeugt), erst beim Hineinzoomen als Pfade, und dann nur die
   sichtbaren Zellen. Bodenfarben und Küstensaum sind kleine, vergrösserte Bilder
   statt SVG-Weichzeichner. Gebietsränder kommen aus einer weichen Maske statt aus
   vielen Punkt-im-Umriss-Tests.

   Einstellungen (OPT, gespeichert):
     landschaft  0 aus · 1 leicht (Standard) · 2 voll
     wellen      0 aus · 1 an (Standard); bei Animationen «Aus» stehen sie still
   ============================================================ */
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const start = performance.now();
  const svg = document.querySelector("#welt svg.weltkarte");
  const land = svg?.querySelector("path.land:not(.kleine-inseln)");
  if (!svg || !land) return;

  const punkt = (lon, lat) => [(lon + 180) / 360 * KARTE_B, (78 - lat) / 138 * KARTE_H];
  const inseln = svg.querySelector("path.land.kleine-inseln");
  const r1 = v => Math.round(v * 10) / 10;

  /* ---------- Landmaske: einmal auf ein Canvas gezeichnet, schnell abfragbar ---------- */
  // Eine Einheit pro Pixel genügt (Bäume halten ohnehin Abstand zur Küste).
  const MS = 1, mb = KARTE_B * MS, mh = KARTE_H * MS;
  let maske = null, landPfade = [];
  try {
    landPfade = [land, inseln].filter(Boolean).map(p => [p, new Path2D(p.getAttribute("d"))]);
    const c = document.createElement("canvas"); c.width = mb; c.height = mh;
    const g = c.getContext("2d", {willReadFrequently:true});
    g.scale(MS, MS); g.fillStyle = "#000";
    for (const [, pfad] of landPfade) g.fill(pfad, "evenodd");
    maske = g.getImageData(0, 0, mb, mh).data;
  } catch (e){ maske = null; }
  const istLand = (x, y) => {
    if (!maske) return false;
    const ix = Math.round(x * MS), iy = Math.round(y * MS);
    return ix >= 0 && iy >= 0 && ix < mb && iy < mh && maske[(iy * mb + ix) * 4 + 3] > 127;
  };
  // Land mit etwas Abstand zur Küste (Bäume stehen nicht im Wasser)
  const imLand = (x, y, rand) => istLand(x, y) && istLand(x - rand, y) && istLand(x + rand, y) && istLand(x, y + rand * .6);
  const nahLand = (x, y, d) => { for (let w = 0; w < 8; w++) if (istLand(x + Math.cos(w * .785) * d, y + Math.sin(w * .785) * d)) return true; return istLand(x, y); };

  /* Fester Zufall: gleiche Verteilung bei jedem Laden */
  function zufall(saat){
    let a = saat >>> 0;
    return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  // Weiches Rauschen für Lichtungen und Ränder
  const rauschen = (x, y) => (Math.sin(x * .061 + y * .023) + Math.sin(y * .077 - x * .031 + 1.7) + Math.sin((x + y) * .043 + 4.1)) / 6 + .5;

  /* ---------- Gebiete als Umrisse [Länge, Breite] ---------- */
  const GEBIETE = {
    eis: [
      [[-55,80],[-20,81],[-18,72],[-30,67],[-42,60.5],[-50,63],[-54,70]],
      [[-122,79],[-62,82],[-64,74],[-80,72],[-100,74],[-118,74]]
    ],
    tundra: [
      [[22,71],[40,68.5],[60,68.5],[75,69],[95,72],[115,73],[140,71.5],[180,68],[180,75],[140,77],[100,79],[60,76],[30,72.5]],
      [[-168,66],[-145,70],[-120,69],[-95,67],[-82,63],[-76,62],[-62,59],[-62,66],[-80,70],[-100,71],[-125,72],[-168,72]],
      [[-180,64],[-168,64],[-168,71],[-180,71]]
    ],
    taiga: [
      [[5,59],[7.5,58],[12,56.5],[16,56],[21,56.5],[28,57],[38,56.5],[50,56],[62,55],[76,54.5],[88,52.5],[100,51],[112,51],[124,50],[133,46],[138,47],[141,53],[152,59],[163,61],[176,64],[180,66],[168,67.5],[150,69],[130,71],[110,72],[90,70.5],[72,67.5],[58,67.5],[44,67],[33,69.5],[26,70.5],[18,69.5],[13,67],[8,63.5],[5,61]],
      [[-166,61],[-160,66],[-142,68.5],[-122,68],[-104,64],[-94,59],[-84,56],[-78,58.5],[-72,60],[-64,58],[-56,52.5],[-59,47.5],[-68,46.5],[-78,46.5],[-88,47.5],[-97,51],[-112,53],[-122,55],[-134,58.5],[-150,60.5]],
      [[-125,39],[-120,39.5],[-117,47],[-119,53],[-128,55.5],[-132,55],[-124.5,47]],
      [[3,46],[8,47.5],[12,47.5],[16,46.5],[13,45.5],[6,44.5]]
    ],
    laubwald: [
      [[-9,42],[-5,47.5],[-3,49],[1,50],[4,52],[8,54],[14,54.5],[20,55],[28,55.5],[36,55],[46,54],[50,52],[42,49],[32,47.5],[24,45.5],[19,43],[14,45],[10,44],[4,43.5],[-2,43]],
      [[-6,50],[-2,51],[1,52],[-1,55],[-4,57],[-6,55],[-8,52]],
      [[-96,30],[-95,38],[-92,44],[-84,46],[-76,45.5],[-69,46],[-70,42],[-75,39],[-77,35],[-81,31],[-86,30.5]],
      [[103,26],[110,24],[118,25],[121,29],[121,33],[120,37],[125,40],[130,43],[135,46],[130,48],[122,44],[116,40],[110,35],[104,30]],
      [[130,31],[136,34],[141,38],[142,43],[139,40],[133,35]],
      [[-74,-38],[-71,-38],[-71.5,-48],[-74,-50]],
      [[145,-36],[150,-34],[148,-38],[143,-39]],
      [[167,-46],[174,-38],[178,-40],[171,-44]]
    ],
    regenwald: [
      [[-79,1.5],[-75,5],[-67,6],[-60,7.5],[-53,4.5],[-50,1],[-46,-2],[-45,-4],[-48,-8],[-54,-10.5],[-62,-12.5],[-69,-12.5],[-74,-9.5],[-77.5,-5],[-79,-2]],
      [[-48,-24],[-40.5,-17],[-35,-7],[-37.5,-12],[-43,-23.5]],
      [[-92,18],[-87,17],[-84,11],[-78,8.5],[-77,6.5],[-80,7],[-84,9],[-88,13],[-92,15]],
      [[9,4],[15,4.5],[22,5],[28,4.5],[30,2],[30,-3],[26,-5.5],[18,-6],[12.5,-4.5],[9,-1]],
      [[-13.5,9.5],[-8,8.5],[-3,7.5],[3,7.5],[8,5.5],[4,5.5],[-3,5],[-8,4.5],[-12,7]],
      [[94.5,6],[99,7],[103.5,4],[110,3],[117,7],[122,11],[126,8],[127,4],[134,-1],[141,-2.5],[150,-5.5],[148,-10],[141,-9],[133,-4],[125,-6],[117,-8],[106,-7],[101,-3],[96,2.5]],
      [[97,24],[106,22],[109,16],[106.5,10.5],[103,10.5],[100,13],[98,17]],
      [[90,27.5],[96,28],[95,22.5],[90,22]],
      [[48.5,-13.5],[50.4,-15.5],[48,-24],[47,-20]],
      [[142.5,-11],[146,-16.5],[145,-18.5],[142,-13]],
      [[74,15],[77,13],[76.5,8.5],[74.5,12]]
    ],
    savanne: [
      [[-16.5,14.5],[-5,15.5],[5,15],[15,14],[25,13.5],[33,13],[38,11.5],[42,6],[40,1],[40.5,-4],[39,-10],[36,-17],[32.5,-23.5],[27,-25],[20,-21],[14,-16],[13,-9],[18,-7.5],[25,-6.5],[30,-3.5],[31,3.5],[22,5.5],[14,6],[7,7.5],[2,8.5],[-4,9],[-10,10.5],[-15,11.5]],
      [[-61,-11],[-50,-6],[-41,-8.5],[-41,-15],[-44,-21],[-52,-22],[-58,-19],[-62,-15]],
      [[-72,7],[-62,9.5],[-60,7],[-67,5]],
      [[121,-18],[130,-13],[136,-12],[143,-15],[148,-21],[150,-25],[141,-23],[132,-21],[124,-21]],
      [[72,23],[80,24.5],[86,24],[82,17],[78,13],[75,16],[73,19]],
      [[-104,24],[-98,28],[-97,32],[-100,40],[-104,48],[-112,49],[-108,40],[-105,32]]
    ],
    wueste: [
      [[-16,18],[-14.5,26],[-9,30],[-1,32.5],[9,33],[13,32],[20,30.5],[28,31],[33.5,30],[35,27],[37,21],[36.5,17],[30,15.5],[22,16],[12,16.5],[4,17],[-6,17],[-12,17]],
      [[35.5,30],[44,31],[48,29],[52,25],[56.5,24.5],[59,22],[55,19],[52,17],[45,14.5],[42,16],[39,21]],
      [[53,31],[57,34],[62,35],[66,30],[67,26],[61,26],[56,28]],
      [[69,28.5],[73.5,29],[73,25],[69.5,24.5]],
      [[51,45],[57,45.5],[64,44.5],[69,43],[66,39],[61,38.5],[55,39.5]],
      [[76,40.5],[84,41.5],[90,42.5],[98,43.5],[105,45],[112,44],[110,41.5],[104,40],[96,38.5],[88,37.5],[80,37]],
      [[115,-21],[123,-20],[131,-19.5],[139,-21.5],[142,-26],[141,-30],[135,-31],[128,-30],[121,-29.5],[115,-27]],
      [[12.5,-17.5],[17,-18],[22,-19.5],[25,-23.5],[22,-28.5],[17,-28.5],[14.5,-24],[12,-20]],
      [[-71.5,-17],[-69.5,-18],[-69.5,-27.5],[-71.5,-27.5]],
      [[-119,36],[-113,37.5],[-108,34.5],[-104,30],[-107,27.5],[-111,28],[-114.5,30.5],[-117,32.5]],
      [[-71,-41],[-66,-40],[-65.5,-46],[-69,-50],[-71.5,-47]]
    ]
  };
  const GEBIRGE = [
    {hoch:1, lauf:[[-76,9],[-78.5,1],[-79,-5],[-75.5,-12],[-71,-17],[-68.5,-23],[-69.5,-31],[-71,-39],[-72.5,-46],[-73.5,-51]]},
    {hoch:1, lauf:[[-150,62],[-136,59.5],[-126,54.5],[-118,50],[-113,45],[-109,40],[-106,35.5]]},
    {hoch:1, lauf:[[71,36.5],[76,35],[80,31.5],[84,29],[88,28],[92,28],[96,28.5]]},
    {hoch:0, lauf:[[82,34.5],[90,33.5],[98,33],[100,31]]},
    {hoch:1, lauf:[[69,36],[72,38],[76,39]]},
    {hoch:0, lauf:[[74,42],[80,42.5],[86,43.5]]},
    {hoch:1, lauf:[[5.8,44.5],[7,45.8],[9.5,46.4],[12.5,47],[15,47.2]]},
    {hoch:0, lauf:[[59.5,67],[59,62],[58.5,57],[58,52]]},
    {hoch:1, lauf:[[40,43.6],[44,42.7],[48,41.5]]},
    {hoch:0, lauf:[[-8.5,30.5],[-4,32.5],[1,34.5],[7,36]]},
    {hoch:1, lauf:[[6.5,59.5],[9,62],[13,64.5],[16.5,67.5],[20,69]]},
    {hoch:0, lauf:[[44.5,37.5],[48,34],[51,31],[55,28.5]]},
    {hoch:0, lauf:[[37.5,-3],[37.5,3],[38.5,8],[39.5,12]]},
    {hoch:0, lauf:[[146,-17],[149,-24],[150.5,-30],[148.5,-36]]},
    {hoch:0, lauf:[[-112,31],[-107,26],[-103,21],[-99,18.5]]},
    {hoch:0, lauf:[[-83,35],[-80,37.5],[-77,40],[-73.5,43]]},
    {hoch:1, lauf:[[170,-44.5],[172,-42.5]]}
  ];

  // Punkt in Umriss (Kartenkoordinaten)
  const umrisse = {};
  for (const [art, liste] of Object.entries(GEBIETE)) umrisse[art] = liste.map(u => u.map(([lon, lat]) => punkt(lon, lat)));
  function innen(u, x, y){
    let drin = false;
    for (let i = 0, j = u.length - 1; i < u.length; j = i++){
      const [xi, yi] = u[i], [xj, yj] = u[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) drin = !drin;
    }
    return drin;
  }
  // Weiche Gebietsmaske: klein gezeichnet und vergrössert; der Wert (0–1) sagt,
  // wie tief ein Punkt im Gebiet liegt – damit dünnen die Ränder aus.
  function weicheMaske(art, grob){
    const fein = .5, fb = Math.ceil(KARTE_B * fein), fh = Math.ceil(KARTE_H * fein);
    try {
      const k = document.createElement("canvas");
      k.width = Math.ceil(KARTE_B * grob); k.height = Math.ceil(KARTE_H * grob);
      const g = k.getContext("2d"); g.scale(grob, grob); g.fillStyle = "#000";
      for (const u of umrisse[art]) g.fill(new Path2D("M" + u.map(p => p.map(r1).join(",")).join("L") + "Z"));
      const f = document.createElement("canvas"); f.width = fb; f.height = fh;
      const fg = f.getContext("2d", {willReadFrequently:true}); fg.imageSmoothingEnabled = true; fg.imageSmoothingQuality = "high";
      fg.drawImage(k, 0, 0, fb, fh);
      const daten = fg.getImageData(0, 0, fb, fh).data;
      return (x, y) => {
        const ix = Math.round(x * fein), iy = Math.round(y * fein);
        return ix >= 0 && iy >= 0 && ix < fb && iy < fh ? daten[(iy * fb + ix) * 4 + 3] / 255 : 0;
      };
    } catch (e){ return () => .8; }
  }

  /* ---------- Zeichen als Pfadstücke; gleiche Farben landen in einem Pfad ---------- */
  // Jede Zeile (Band) hat eigene Pfade, damit vordere Bäume hintere überdecken;
  // jede Zeile ist zusätzlich in Zellen geteilt, damit beim Hineinzoomen nur die
  // sichtbaren Pfade gezeichnet werden.
  const BAND = 5, ZELLE = 125;
  const baender = [new Map(), new Map()];   // [leicht, voll] → Band·Zelle → Farbe → Pfad
  let aktX = 0;
  function setze(stufe, y, farbe, d){
    const b = Math.floor(y / BAND) * 100 + Math.floor(aktX / ZELLE), m = baender[stufe];
    if (!m.has(b)) m.set(b, new Map());
    const f = m.get(b);
    f.set(farbe, (f.get(farbe) || "") + d);
  }
  const kreis = (x, y, r) => `M${r1(x - r)},${r1(y)}a${r1(r)},${r1(r)} 0 1,0 ${r1(2 * r)},0a${r1(r)},${r1(r)} 0 1,0 ${r1(-2 * r)},0`;
  const ellipse = (x, y, rx, ry) => `M${r1(x - rx)},${r1(y)}a${r1(rx)},${r1(ry)} 0 1,0 ${r1(2 * rx)},0a${r1(rx)},${r1(ry)} 0 1,0 ${r1(-2 * rx)},0`;

  const ZEICHNEN = {
    tanne(st, x, y, h, rnd, schnee){
      const w = h * .56, a = r1(w / 2), t = r1(h * .5);
      const dunkel = schnee ? "#2f5a45" : "#2e5c3f", hell = schnee ? "#4a7a5f" : "#467a52";
      setze(st, y, "#5a4330", `M${r1(x - .35)},${r1(y)}h.7v${r1(h * .14)}h-.7z`);
      setze(st, y, dunkel, `M${r1(x)},${r1(y - h)}l${r1(w * .3)},${t}h${r1(-w * .1)}l${r1(w * .3)},${r1(h * .5)}h${r1(-w)}l${r1(w * .3)},${r1(-h * .5)}h${r1(-w * .1)}z`);
      setze(st, y, hell, `M${r1(x)},${r1(y - h)}v${r1(h)}h${-a}l${r1(w * .3)},${r1(-h * .5)}h${r1(-w * .1)}z`);
      if (schnee){
        setze(st, y, "#f7fbfd", `M${r1(x)},${r1(y - h)}l${r1(w * .17)},${r1(h * .3)}h${r1(-w * .34)}z`
          + `M${r1(x - w * .32)},${r1(y - h * .48)}h${r1(w * .64)}l${r1(w * .07)},${r1(h * .12)}h${r1(-w * .78)}z`);
      }
    },
    laubbaum(st, x, y, h, rnd){
      const r = h * .46;
      setze(st, y, "#5a4330", `M${r1(x - .4)},${r1(y - r * .4)}h.8v${r1(r * .55)}h-.8z`);
      setze(st, y, rnd() < .25 ? "#55803f" : "#5f8b45", kreis(x, y - r * 1.1, r));
      setze(st, y, "#80aa5e", kreis(x - r * .3, y - r * 1.4, r * .5));
    },
    regenwald(st, x, y, h, rnd){
      const r = h * .36;
      setze(st, y, "#1f5230", kreis(x + r * .55, y - r * .7, r * .95));
      setze(st, y, rnd() < .5 ? "#2c6a38" : "#337640", kreis(x - r * .35, y - r, r));
      setze(st, y, "#4f9550", kreis(x - r * .6, y - r * 1.35, r * .45));
      if (rnd() < .08) setze(st, y, "#6fb05c", kreis(x + r * .2, y - r * 1.6, r * .35));
    },
    akazie(st, x, y, h, rnd){
      setze(st, y, "#6b4f35", `M${r1(x - .3)},${r1(y - h * .45)}h.6v${r1(h * .45)}h-.6z`);
      setze(st, y, "#6e8c43", ellipse(x, y - h * .5, h * .5, h * .16));
      setze(st, y, "#8aa557", ellipse(x - h * .1, y - h * .56, h * .3, h * .08));
    },
    busch(st, x, y, h, rnd, farbe){
      setze(st, y, farbe, ellipse(x, y - h * .2, h * .3, h * .18));
    },
    duene(st, x, y, h, rnd){
      const w = h * 1.4;
      setze(st, y, "#e3be7c", `M${r1(x - w)},${r1(y)}q${r1(w)},${r1(-h * .9)} ${r1(w * 2)},0q${r1(-w * .9)},${r1(-h * .35)} ${r1(-w * 2)},0z`);
      setze(st, y, "#c99a58", `M${r1(x)},${r1(y - h * .45)}q${r1(w * .55)},${r1(h * .1)} ${r1(w)},${r1(h * .45)}q${r1(-w * .5)},${r1(-h * .22)} ${r1(-w)},${r1(-h * .45)}z`);
    },
    kaktus(st, x, y, h){
      setze(st, y, "#4f7d43", `M${r1(x - .4)},${r1(y - h * .6)}h.8v${r1(h * .6)}h-.8zM${r1(x - 1.4)},${r1(y - h * .45)}h.6v${r1(h * .2)}h.8v.5h-1.4zM${r1(x + .8)},${r1(y - h * .5)}h.6v${r1(h * .3)}h-1v-.5h.4z`);
    },
    berg(st, x, y, h, rnd, hoch){
      const w = h * .8;
      setze(st, y, "#a68b66", `M${r1(x - w)},${r1(y)}L${r1(x)},${r1(y - h)}L${r1(x + w)},${r1(y)}z`);
      setze(st, y, "#86704f", `M${r1(x)},${r1(y - h)}L${r1(x + w)},${r1(y)}h${r1(-w * .55)}z`);
      if (hoch || rnd() < .25) setze(st, y, "#fbfaf6", `M${r1(x)},${r1(y - h)}l${r1(w * .32)},${r1(h * .38)}l${r1(-w * .14)},${r1(-h * .06)}l${r1(-w * .14)},${r1(h * .07)}l${r1(-w * .14)},${r1(-h * .09)}l${r1(-w * .1)},${r1(h * .05)}z`);
    }
  };

  /* ---------- Verteilen ---------- */
  // Abstand (Karteneinheiten), Grösse, Zeichen; Anteil, der schon bei «leicht» steht
  const VERTEILUNG = {
    taiga:     {abstand:3.3, groesse:[5.5, 7.5], leicht:.72},
    laubwald:  {abstand:3.3, groesse:[5, 6.5],   leicht:.7},
    regenwald: {abstand:2.9, groesse:[5.5, 7.5], leicht:.75},
    savanne:   {abstand:8.5, groesse:[5, 6.5],   leicht:.6},
    wueste:    {abstand:10,  groesse:[3.5, 5],   leicht:.6},
    tundra:    {abstand:7,   groesse:[3, 4],     leicht:.55}
  };
  let anzahl = 0;
  Object.entries(VERTEILUNG).forEach(([art, v], nr) => {
    const rnd = zufall(4049 + nr * 977);
    const tiefe = weicheMaske(art, art === "wueste" || art === "savanne" ? .07 : .125);
    for (const u of umrisse[art]){
      const xs = u.map(p => p[0]), ys = u.map(p => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      for (let gy = y0; gy <= y1; gy += v.abstand * .87){
        const versatz = (Math.round(gy / v.abstand) % 2) * v.abstand / 2;
        for (let gx = x0 + versatz; gx <= x1; gx += v.abstand){
          const x = gx + (rnd() - .5) * v.abstand * .8, y = gy + (rnd() - .5) * v.abstand * .7;
          if (!imLand(x, y, 1.6) || !innen(u, x, y)) continue;
          const rand = tiefe(x, y);
          const dichte = (art === "regenwald" ? .55 : .35) + rand * .65 - (1 - rauschen(x, y)) * (art === "regenwald" ? .15 : .45);
          if (rnd() > dichte) continue;
          const h = v.groesse[0] + rnd() * (v.groesse[1] - v.groesse[0]);
          const st = rnd() < v.leicht ? 0 : 1;
          aktX = x;
          const lat = 78 - y / KARTE_H * 138, lon = x / KARTE_B * 360 - 180;
          if (art === "taiga"){
            const schnee = lat > 60 + rnd() * 6 || (lon > 4 && lon < 20 && lat > 58 + rnd() * 6);
            ZEICHNEN.tanne(st, x, y, h, rnd, schnee);
          } else if (art === "laubwald"){
            rnd() < .28 ? ZEICHNEN.tanne(st, x, y, h, rnd, false) : ZEICHNEN.laubbaum(st, x, y, h, rnd);
          } else if (art === "regenwald"){
            ZEICHNEN.regenwald(st, x, y, h, rnd);
          } else if (art === "savanne"){
            rnd() < .55 ? ZEICHNEN.akazie(st, x, y, h, rnd) : ZEICHNEN.busch(st, x, y, h * .8, rnd, "#a3a75a");
          } else if (art === "wueste"){
            lon < -60 && rnd() < .3 ? ZEICHNEN.kaktus(st, x, y, h) : ZEICHNEN.duene(st, x, y, h, rnd);
          } else {
            ZEICHNEN.busch(st, x, y, h, rnd, rnd() < .5 ? "#93a07a" : "#a9ab88");
          }
          anzahl++;
        }
      }
    }
  });
  // Gebirgsketten: Gipfel entlang der Linie, zwei bis drei Reihen
  GEBIRGE.forEach(({hoch, lauf}, nr) => {
    const rnd = zufall(9001 + nr * 131);
    const pkt = lauf.map(([lon, lat]) => punkt(lon, lat));
    for (let i = 1; i < pkt.length; i++){
      const [ax, ay] = pkt[i - 1], [bx, by] = pkt[i];
      const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
      for (let s = 0; s < len; s += 2.6){
        const quer = (rnd() - .5) * (hoch ? 10 : 7);
        const x = ax + (bx - ax) * s / len + nx * quer, y = ay + (by - ay) * s / len + ny * quer;
        if (!imLand(x, y, 1)) continue;
        const h = (hoch ? 6.5 : 4.5) + rnd() * 3 - Math.abs(quer) * .25;
        aktX = x;
        ZEICHNEN.berg(rnd() < .7 ? 0 : 1, x, y, h, rnd, hoch && Math.abs(quer) < 3);
        anzahl++;
      }
    }
  });

  /* ---------- Aufbau ---------- */
  function el(name, attr){ const e = document.createElementNS(NS, name); for (const k in attr) e.setAttribute(k, attr[k]); return e; }
  if (!land.id) land.id = "erzwelt-land";
  if (inseln && !inseln.id) inseln.id = "erzwelt-inseln";

  const defs = el("defs", {});
  const clip = el("clipPath", {id:"landschaft-clip"});
  clip.append(el("use", {href:"#" + land.id}));
  if (inseln) clip.append(el("use", {href:"#" + inseln.id}));
  defs.append(clip);

  /* Weiche Flächen als kleines Bild statt SVG-Weichzeichner: klein zeichnen,
     dann vergrössern – das Vergrössern macht die Ränder weich. Ein Bild kostet
     beim Verschieben und Zoomen fast nichts, ein Weichzeichner sehr viel. */
  function weichesBild(zeichnen, grob, fein){
    const k = document.createElement("canvas");
    k.width = Math.ceil(KARTE_B * grob); k.height = Math.ceil(KARTE_H * grob);
    const g = k.getContext("2d"); g.scale(grob, grob); zeichnen(g);
    const f = document.createElement("canvas");
    f.width = Math.ceil(KARTE_B * fein); f.height = Math.ceil(KARTE_H * fein);
    const fg = f.getContext("2d"); fg.imageSmoothingEnabled = true; fg.imageSmoothingQuality = "high";
    fg.drawImage(k, 0, 0, f.width, f.height);
    return el("image", {href:f.toDataURL("image/png"), x:"0", y:"0", width:String(KARTE_B), height:String(KARTE_H), preserveAspectRatio:"none"});
  }
  const pfadVon = liste => "M" + liste.map(([lon, lat]) => punkt(lon, lat).map(r1).join(",")).join("L");

  // Bodenfarbe pro Gebiet, weich auslaufend
  const BODEN = {
    tundra:"#c9cdb0", taiga:"#7da57a", laubwald:"#a9c487", regenwald:"#4f8f52",
    savanne:"#d6c47c", wueste:"#f0d39a", eis:"#f6f9fb"
  };
  const DECKKRAFT = {tundra:.55, taiga:.55, laubwald:.5, regenwald:.75, savanne:.55, wueste:.8, eis:.95};
  const ebene = el("g", {class:"karten-landschaft", "aria-hidden":"true"});
  const flaechen = el("g", {class:"landschaft-flaechen", "clip-path":"url(#landschaft-clip)"});
  // Bodenfarbe und Küstensaum entstehen kurz nach dem Start (siehe spaeter())
  function bodenBauen(){
   try {
    const boden = weichesBild(g => {
      for (const art of ["tundra", "savanne", "wueste", "laubwald", "taiga", "regenwald", "eis"]){
        g.fillStyle = BODEN[art]; g.globalAlpha = DECKKRAFT[art];
        for (const u of umrisse[art]) g.fill(new Path2D("M" + u.map(p => p.map(r1).join(",")).join("L") + "Z"));
      }
      // Schnee über dem hohen Norden der Wälder
      g.fillStyle = "#eef3f4"; g.globalAlpha = .6;
      g.fill(new Path2D(pfadVon([[-170,66],[-120,69],[-95,63],[-75,61],[-60,60],[-60,70],[-170,72]]) + "Z"));
      g.globalAlpha = .55;
      g.fill(new Path2D(pfadVon([[10,66],[30,68],[60,64],[100,64],[140,63],[180,63],[180,72],[100,74],[40,71],[14,70]]) + "Z"));
      g.strokeStyle = "#b59c74"; g.globalAlpha = .45; g.lineWidth = 9; g.lineCap = g.lineJoin = "round";
      for (const {lauf} of GEBIRGE) g.stroke(new Path2D(pfadVon(lauf)));
    }, .125, .5);
    boden.setAttribute("class", "landschaft-boden");
    flaechen.prepend(boden);
   } catch (e){ /* ohne Bodenfarbe */ }
  }

  /* Grosse Flüsse: weich gerundete Linien von der Quelle zur Mündung */
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
  // Catmull-Rom zu Bézier: runde statt eckige Flussläufe
  function rund(p){
    let d = `M${p[0].map(r1).join(",")}`;
    for (let i = 0; i < p.length - 1; i++){
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += `C${r1(b[0] + (c[0] - a[0]) / 6)},${r1(b[1] + (c[1] - a[1]) / 6)} ${r1(c[0] - (e[0] - b[0]) / 6)},${r1(c[1] - (e[1] - b[1]) / 6)} ${r1(c[0])},${r1(c[1])}`;
    }
    return d;
  }
  const fluesse = el("g", {class:"landschaft-fluesse", "clip-path":"url(#landschaft-clip)"});
  for (const lauf of FLUESSE){
    fluesse.append(el("path", {d:rund(lauf.map(([lon, lat]) => punkt(lon, lat))),
      fill:"none", stroke:"#5f9ec4", "stroke-width":"1.3", "stroke-linecap":"round", "stroke-linejoin":"round", opacity:".9"}));
  }

  // Zeichen: pro Band und Zelle die Pfade in Zeichenreihenfolge
  const ordnung = baender.map(m => [...m.keys()].sort((a, b) => a - b).flatMap(k => [...m.get(k)]));
  function zeichenGruppe(liste, klasse){
    const g = el("g", {class:klasse});
    for (const [farbe, d] of liste) g.append(el("path", {d, fill:farbe}));
    return g;
  }
  // Die Pfade entstehen erst, wenn sie gebraucht werden (Hineinzoomen)
  const leicht = el("g", {class:"landschaft-zeichen"});
  const voll = el("g", {class:"landschaft-zeichen landschaft-voll"});
  let vektorFertig = false;
  function vektorBauen(){
    if (vektorFertig) return;
    vektorFertig = true;
    leicht.replaceWith(zeichenGruppe(ordnung[0], "landschaft-zeichen"));
    voll.replaceWith(zeichenGruppe(ordnung[1], "landschaft-zeichen landschaft-voll"));
  }
  // Für die Übersicht: dieselben Zeichen als ein Bild (wird nach dem Start erzeugt)
  const bild = el("image", {class:"landschaft-bild", x:"0", y:"0", width:String(KARTE_B), height:String(KARTE_H), preserveAspectRatio:"none"});
  ebene.append(flaechen, fluesse, bild, leicht, voll);

  // Flaches Wasser an den Küsten: heller Saum unter dem Land
  function kuesteBauen(){
   try {
    const kueste = weichesBild(g => {
      g.strokeStyle = "#8fd0e8"; g.globalAlpha = .4; g.lineJoin = "round";
      for (const [p, pfad] of landPfade){ g.lineWidth = p === land ? 8 : 5; g.stroke(pfad); }
    }, .25, .5);
    kueste.setAttribute("class", "landschaft-kueste");
    kueste.setAttribute("aria-hidden", "true");
    land.before(kueste);
   } catch (e){ /* ohne Küstensaum */ }
  }

  svg.insertBefore(defs, svg.firstChild);
  setTimeout(() => { bodenBauen(); kuesteBauen(); }, 30);
  (inseln || land).after(ebene);

  /* ---------- Wellen: wenige Wellenkämme auf offener See, die kommen und gehen ---------- */
  const wellen = document.createElement("div");
  wellen.className = "karten-wellen";
  wellen.setAttribute("aria-hidden", "true");
  const kamm = (x, y, w) => `M${r1(x - w)},${r1(y)}q${r1(w)},${r1(-w * .42)} ${r1(w * 2)},0q${r1(-w)},${r1(-w * .2)} ${r1(-w * 2)},0z`;
  const wrnd = zufall(777);
  const gruppen = ["", ""];
  let kaemme = 0;
  for (let gy = 18; gy < KARTE_H - 10; gy += 34){
    for (let gx = 12 + (gy / 34 % 2) * 24; gx < KARTE_B - 10; gx += 48){
      const x = gx + (wrnd() - .5) * 30, y = gy + (wrnd() - .5) * 20;
      if (wrnd() < .35 || nahLand(x, y, 16)) continue;
      const w = 4 + wrnd() * 3;
      let d = kamm(x, y, w);
      if (wrnd() < .6) d += kamm(x + w * .9, y + 3.2, w * .7);
      gruppen[kaemme++ % 2] += d;
    }
  }
  wellen.innerHTML = gruppen.map((d, i) =>
    `<svg class="welle welle-${i}" viewBox="0 0 ${KARTE_B} ${KARTE_H}" width="${KARTE_B}" height="${KARTE_H}"><path d="${d}" fill="#ffffff"/></svg>`).join("");
  svg.before(wellen);

  const stil = document.createElement("style");
  stil.id = "erzwelt-karten-landschaft-style";
  stil.textContent = `
    .karten-landschaft,.landschaft-kueste{pointer-events:none}
    .karten-wellen{position:absolute;top:0;left:0;width:${KARTE_B}px;height:${KARTE_H}px;pointer-events:none}
    .karten-wellen .welle{position:absolute;inset:0;opacity:.16;will-change:opacity,transform;animation:karten-welle 12s ease-in-out infinite}
    .karten-wellen .welle-1{animation-delay:-6s}
    #welt > svg.weltkarte{position:relative}
    @keyframes karten-welle{0%,100%{opacity:0;transform:translate(-1.5px,.6px)}45%{opacity:.32;transform:translate(1.5px,-.6px)}60%{opacity:.32}}
    body[data-anim="0"] .karten-wellen .welle{animation:none}
    @media (prefers-reduced-motion: reduce){.karten-wellen .welle{animation:none}}
    body[data-landschaft="0"] .karten-landschaft,body[data-landschaft="0"] .landschaft-kueste{display:none}
    body[data-landschaft="1"] .landschaft-voll{display:none}
    .karten-landschaft:not(.nah) .landschaft-zeichen,.karten-landschaft.nah .landschaft-bild{display:none}
    body[data-wellen="0"] .karten-wellen{display:none}`;
  document.head.append(stil);

  /* ---------- Übersicht als Bild, beim Hineinzoomen scharfe Zeichen ----------
     Tausende Bäume als Pfade kosten bei jedem Zoomschritt viel Zeichenzeit. In der
     Übersicht steht deshalb ein fertiges Bild; erst ab Z_NAH (wo das Bild unscharf
     würde) die Pfade, von denen dann nur die sichtbaren Zellen gezeichnet werden. */
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const SCHAERFE = dpr >= 1.5 ? 3 : 2;
  const Z_NAH = Math.max(1.6, SCHAERFE / dpr * 1.2);
  let bildMs = 0, bildStufe = -1, bildBereit = false, bildFehler = false, bildUrl = null, nah = null;
  function zoomPruefen(){
    const z = typeof ansicht === "object" && ansicht ? ansicht.z : 1;
    const n = bildFehler || z >= Z_NAH;
    if (n !== nah){ nah = n; if (n) vektorBauen(); ebene.classList.toggle("nah", n); }
  }
  function bildErzeugen(stufe){
    if (stufe === bildStufe) return;
    bildStufe = stufe; bildBereit = false;
    if (!stufe) return;
    if (typeof Path2D !== "function"){ bildFehler = true; zoomPruefen(); return; }
    setTimeout(() => {
      if (bildStufe !== stufe) return;
      try {
        const c = document.createElement("canvas");
        c.width = KARTE_B * SCHAERFE; c.height = KARTE_H * SCHAERFE;
        const g = c.getContext("2d"); g.scale(SCHAERFE, SCHAERFE);
        for (let st = 0; st < stufe; st++) for (const [farbe, d] of ordnung[st]){ g.fillStyle = farbe; g.fill(new Path2D(d)); }
        c.toBlob(blob => {
          if (bildStufe !== stufe || !blob) return;
          const url = URL.createObjectURL(blob), probe = new Image();
          probe.src = url;
          (probe.decode ? probe.decode() : Promise.resolve()).then(() => {
            if (bildStufe !== stufe){ URL.revokeObjectURL(url); return; }
            bild.setAttribute("href", url);
            if (bildUrl) URL.revokeObjectURL(bildUrl);
            bildUrl = url; bildBereit = true; bildMs = Math.round(performance.now() - start); zoomPruefen();
          }, () => { URL.revokeObjectURL(url); bildFehler = true; zoomPruefen(); });
        }, "image/png");
      } catch (e){ bildFehler = true; zoomPruefen(); }
    }, 60);
  }
  const weltEl = document.getElementById("welt");
  if (weltEl) new MutationObserver(zoomPruefen).observe(weltEl, {attributes:true, attributeFilter:["style"]});

  /* ---------- Einstellungen ---------- */
  const STUFEN = () => [textVon("landschaft.aus"), textVon("landschaft.leicht"), textVon("landschaft.voll")];
  const wert = (k, std, max) => Number.isInteger(OPT[k]) && OPT[k] >= 0 && OPT[k] <= max ? OPT[k] : std;
  function anwenden(){
    const stufe = wert("landschaft", 1, 2);
    document.body.dataset.landschaft = String(stufe);
    bildErzeugen(stufe);
    document.body.dataset.wellen = String(wert("wellen", 1, 1));
  }
  anwenden();
  zoomPruefen();

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

  window.__erzweltKartenLandschaft = {version:3, zeichen:anzahl, kaemme, pfade:ordnung[0].length + ordnung[1].length, anwenden,
    ms:Math.round(performance.now() - start), zustand:() => ({bildMs, bildBereit, bildFehler, nah, vektorFertig, schaerfe:SCHAERFE, zNah:Z_NAH})};
})();
