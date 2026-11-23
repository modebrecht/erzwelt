"use strict";
/* ============================================================
   EINFÜHRUNG – ein Schritt pro Teilaufgabe

   Das Tutorial führt an der Hand: Jede Aufgabe verlangt genau EINE
   Handlung an genau EINEM Ort, und nur dieser Ort leuchtet auf der Karte.
     Kupfer eröffnen → Kupfer besetzen → Team aufstocken →
     Aluminium eröffnen → besetzen → Zinn eröffnen → besetzen →
     Raffinerie bauen → besetzen → Kabelfabrik bauen → besetzen →
     selbst verkaufen → Verkaufsteam einsetzen
   - Vorgeschlagen werden die günstigsten Orte; wer schon eine passende
     Quelle oder Raffinerie hat (alter Spielstand), arbeitet mit dieser.
   - Personal: Jede Station lässt sich nur bis zum Bedarf besetzen
     (Kupfer 10, Aluminium 5, Zinn 5, Raffinerie 5, Fabrik 5, Verkauf 2),
     eingestellt wird genau der fehlende Rest.
   - Kaufen geht nur am Zielort des aktuellen Schritts. Verbesserungen im
     Wissen gibt es erst nach der Einführung. So kann niemand das Geld
     ausgeben und dann feststecken.
   - Fehlen freie Leute, sagt die Aufgabe, wo zu viele sitzen.
   - Spielstände aus der alten 11-Schritt-Fassung werden übernommen.
   ============================================================ */
(function(){
  const VERSION = 2;                         // Marke im Spielstand: S.einfuehrung
  const ALTE_LAENGE = 11;

  /* ---------- Orte ---------- */
  const minenDef = id => MINEN.find(d => d.id === id);
  const raffDef = id => RAFF_ORTE.find(d => d.id === id);
  const guenstigsteMine = k => MINEN.filter(d => d.mat === k).sort((a, b) => a.erschliessung - b.erschliessung)[0];
  const quelle = k => materialMine(k) || guenstigsteMine(k).id;
  const raffId = () => Object.keys(S.raff)[0] || [...RAFF_ORTE].sort((a, b) => a.bau - b.bau)[0].id;
  const fabLand = () => {
    const eigene = S.fabriken.find(f => f.produkt === START_PRODUKT);
    if (eigene) return eigene.land;
    const rl = raffDef(raffId())?.land;
    return FAB_ORTE.includes(rl) ? rl : FAB_ORTE[0];
  };
  const fabIndex = () => S.fabriken.findIndex(f => f.produkt === START_PRODUKT);
  const ortName = (art, id) => art === "mine" ? minenDef(id).ort : art === "raff" ? raffDef(id).ort : LAND[id].name;
  const pinZiel = (art, id) => `pin:${art}:${id}`;
  const fett = s => `«${s}»`;

  /* Wo sitzen mehr Leute, als die Einführung braucht? */
  function zuViele(ausser){
    const soll = {};
    for (const k of START_MATERIALIEN){ const id = materialMine(k); if (id) soll["mine:" + id] = k === START_MATERIALIEN[0] ? 10 : 5; }
    let best = null;
    const pruefe = (art, id, ist, brauch) => {
      if (art + ":" + id === ausser) return;
      const ueber = ist - brauch;
      if (ueber > 0 && (!best || ueber > best.ueber)) best = {art, id, ueber, ist, brauch};
    };
    for (const id in S.minen) pruefe("mine", id, S.minen[id].arbeiter, soll["mine:" + id] || 0);
    for (const id in S.raff) pruefe("raff", id, S.raff[id].arbeiter, 5);
    for (const f of S.fabriken) pruefe("fab", f.land, f.arbeiter, 5);
    return best;
  }

  /* ---------- Bedarf: so viele Leute braucht die Einführung ---------- */
  const BEDARF = {quelle: k => k === START_MATERIALIEN[0] ? 10 : 5, raff: 5, fab: 5, verkauf: 2};
  function bedarfListe(){
    const fi = fabIndex();
    return [
      ...START_MATERIALIEN.map(k => { const id = materialMine(k); return {name: MAT_NAME(k), soll: BEDARF.quelle(k), ist: id ? S.minen[id].arbeiter : 0}; }),
      {name:"Raffinerie", soll: BEDARF.raff, ist: Object.values(S.raff)[0]?.arbeiter || 0},
      {name:"Fabrik", soll: BEDARF.fab, ist: fi >= 0 ? S.fabriken[fi].arbeiter : 0},
      {name:"Verkauf", soll: BEDARF.verkauf, ist: S.verkaeufer || 0}
    ];
  }
  const offenerBedarf = () => bedarfListe().reduce((a, b) => a + Math.max(0, b.soll - b.ist), 0);
  /* Wie viele Leute dürfen jetzt noch eingestellt werden? Gesamtbedarf minus
     alle Angestellten – wer anderswo zu viele hat, verteilt um statt neu einzustellen. */
  const nochEinstellen = () => Math.max(0, bedarfListe().reduce((a, b) => a + b.soll, 0) - S.arbeiterGesamt);

  /* Höchstzahl pro Station während der Einführung */
  function obergrenze(tun, ref){
    if (!tutorialLaeuft()) return null;
    if (tun === "crew"){
      const k = START_MATERIALIEN.find(k => materialMine(k) === String(ref));
      return k ? BEDARF.quelle(k) : 0;
    }
    if (tun === "rcrew") return BEDARF.raff;
    if (tun === "fcrew") return BEDARF.fab;
    if (tun === "vcrew") return BEDARF.verkauf;
    return null;
  }
  function istWert(tun, ref){
    if (tun === "crew") return S.minen[ref]?.arbeiter || 0;
    if (tun === "rcrew") return S.raff[ref]?.arbeiter || 0;
    if (tun === "fcrew") return S.fabriken[+ref]?.arbeiter || 0;
    return S.verkaeufer || 0;
  }

  /* Text für Besetzungs-Schritte: zeigt um, wenn niemand frei ist. */
  function besetzen(art, id, n, normal){
    const ist = art === "mine" ? (S.minen[id]?.arbeiter || 0) : art === "raff" ? (S.raff[id]?.arbeiter || 0) : (S.fabriken[fabIndex()]?.arbeiter || 0);
    const fehlt = n - ist;
    if (fehlt <= 0 || freieArbeiter() >= fehlt) return {text: normal, ziel: pinZiel(art, id)};
    const v = zuViele(art + ":" + id);
    if (v) return {
      text: `Im Team ist zu wenig Personal frei. In ${ortName(v.art, v.id)} arbeiten ${v.ist}, nötig sind ${v.brauch}. Öffne ${ortName(v.art, v.id)} und schieb den Regler auf ${v.brauch}.`,
      ziel: pinZiel(v.art, v.id), entlasten: v};
    return {text: `Im Team ist zu wenig Personal frei. Tippe unten auf «Team» und stelle ${nochEinstellen()} Personen ein.`, ziel: "dock:team"};
  }

  /* ---------- Die Schritte ---------- */
  const [CU, AL, SN] = START_MATERIALIEN;          // kupfer, alu, zinn
  const MAT_NAME = k => MATERIAL[k].name;

  function quellenSchritte(k, ikon, n, zusammenhangAuf){
    const name = MAT_NAME(k);
    return [
      { id: k + "-auf", ikon, titel: `${name}-Quelle eröffnen`,
        get text(){ return `Tippe auf der Karte auf ${fett(ortName("mine", quelle(k)))} und eröffne die Rohstoffquelle.`; },
        zusammenhang: zusammenhangAuf,
        ziel: () => pinZiel("mine", quelle(k)),
        kauf: () => ({art:"mine", id: quelle(k)}),
        fertig: () => !!materialMine(k) },
      { id: k + "-crew", ikon:"person", get titel(){ return `Personal nach ${ortName("mine", quelle(k))}`; },
        get text(){ const o = ortName("mine", quelle(k)); return besetzen("mine", quelle(k), n, `Öffne ${fett(o)} und schieb den Regler auf ${n} Personen.`).text; },
        zusammenhang: `Ohne Personal wird kein ${rohstoffName(k)} gefördert.`,
        ziel: () => besetzen("mine", quelle(k), n, "").ziel,
        crew: () => ({tun:"crew", ref: quelle(k), n}),
        fertig: () => { const id = materialMine(k); return !!id && S.minen[id].arbeiter >= n; } }
    ];
  }
  function rohstoffName(k){
    const id = quelle(k), def = minenDef(id);
    try { return typeof rohstoffDerMine === "function" ? rohstoffDerMine(def) : MAT_NAME(k) + "erz"; } catch (e){ return MAT_NAME(k) + "erz"; }
  }

  const SCHRITTE = [
    ...quellenSchritte(CU, "hacke", 10, "Das Ladekabel braucht Kupfer, Aluminium und Zinn. Jede Rohstoffquelle liefert einen Rohstoff."),
    { id:"team", ikon:"person", titel:"Personal einstellen",
      get text(){
        const n = nochEinstellen();
        return `Für die ganze Lieferkette fehlen noch ${n} Personen. Tippe unten auf «Team» und dann auf «Stelle ${n} Personen ein».`;
      },
      zusammenhang:"Stell nur so viele Leute ein, wie du brauchst – jede Person kostet Lohn.",
      ziel: () => "dock:team",
      fertig: () => nochEinstellen() === 0 },
    ...quellenSchritte(AL, "berg", 5, "Bauxit wird später zu Aluminium."),
    ...quellenSchritte(SN, "berg", 5, "Zinnerz wird später zu Zinn. Jetzt hast du alle drei Rohstoffe."),
    { id:"raff", ikon:"kolben", titel:"Raffinerie bauen",
      get text(){ return `Rohstoff lässt sich nicht direkt verbauen. Tippe auf ${fett(ortName("raff", raffId()))} und baue die Raffinerie.`; },
      zusammenhang:"Rohstoff → Raffinerie → Material",
      ziel: () => pinZiel("raff", raffId()),
      kauf: () => ({art:"raff", id: raffId()}),
      fertig: () => Object.keys(S.raff).length > 0 },
    { id:"raffcrew", ikon:"person", get titel(){ return `Personal nach ${ortName("raff", raffId())}`; },
      get text(){ const o = ortName("raff", raffId()); return besetzen("raff", raffId(), 5, `Öffne ${fett(o)} und schieb den Regler auf 5 Personen.`).text; },
      zusammenhang:"Ohne Personal steht die Raffinerie still.",
      ziel: () => besetzen("raff", raffId(), 5, "").ziel,
      crew: () => ({tun:"rcrew", ref: raffId(), n:5}),
      fertig: () => Object.values(S.raff).some(r => r.arbeiter >= 5) },
    { id:"fab", ikon:"fabrik", titel:"Kabelfabrik bauen",
      get text(){ return `Tippe auf den Fabrikstandort ${fett(ortName("fab", fabLand()))} und baue die Fabrik für Ladekabel.`; },
      zusammenhang:"Material → Fabrik → Produkt",
      ziel: () => pinZiel("fab", fabLand()),
      kauf: () => ({art:"fab", id: fabLand()}),
      fertig: () => S.fabriken.length > 0 },
    { id:"fab-crew", ikon:"zahnrad", titel:"Personal in die Fabrik",
      get text(){
        const f = S.fabriken[fabIndex()];
        if (f && f.restbau > 0) return `Die Fabrik wird gebaut. Noch ${f.restbau} ${f.restbau === 1 ? "Tag" : "Tage"} – lass die Zeit laufen.`;
        return besetzen("fab", fabLand(), 5, `Die Fabrik ist fertig. Öffne ${fett(ortName("fab", fabLand()))} und schieb den Regler auf 5 Personen.`).text;
      },
      zusammenhang:"Personal + Material → Ladekabel",
      ziel: () => { const f = S.fabriken[fabIndex()]; return f && f.restbau > 0 ? pinZiel("fab", fabLand()) : besetzen("fab", fabLand(), 5, "").ziel; },
      crew: () => { const f = S.fabriken[fabIndex()]; return f && f.restbau <= 0 ? {tun:"fcrew", ref: fabIndex(), n:5} : null; },
      fertig: () => S.fabriken.some(f => f.restbau === 0 && f.arbeiter >= BEDARF.fab) },
    { id:"verkauf", ikon:"markt", titel:"Ladekabel selbst verkaufen",
      text:"Tippe unten auf «Markt» und dann auf «Selbst verkaufen».",
      zusammenhang:"Produkt → Verkauf → Geld",
      ziel: () => "dock:markt",
      fertig: () => S.verkauftSelber },
    { id:"verkaeufer", ikon:"muenze", titel:"Verkaufsteam einsetzen",
      get text(){
        const fehlt = 2 - (S.verkaeufer || 0);
        if (fehlt > 0 && freieArbeiter() < fehlt) return `Für den Verkauf ist niemand frei. Tippe unten auf «Team» und stelle ${nochEinstellen()} Personen ein.`;
        return "Im Markt beim Verkaufsteam: Schieb den Regler auf 2 Personen. Sie verkaufen dann jeden Tag.";
      },
      zusammenhang:"Das Verkaufsteam verkauft jeden Tag – du musst nicht mehr selbst.",
      ziel: () => { const fehlt = 2 - (S.verkaeufer || 0); return fehlt > 0 && freieArbeiter() < fehlt ? "dock:team" : "dock:markt"; },
      crew: () => ({tun:"vcrew", ref:null, n:2}),
      fertig: () => (S.verkaeufer || 0) >= 2 }
  ];

  TUTORIAL.splice(0, TUTORIAL.length, ...SCHRITTE);

  const schritt = () => tutorialSchritt();
  const kaufZiel = () => { const t = schritt(); return t && t.kauf ? t.kauf() : null; };

  /* ---------- Spielstände übernehmen ---------- */
  function migrieren(){
    if (!S || S.einfuehrung === VERSION) return;
    if (S.tutorial >= ALTE_LAENGE) S.tutorial = TUTORIAL.length;
    else if (S.tutorial > 0){
      S.tutorial = 0;                                   // still vorspulen, was schon erledigt ist
      while (tutorialLaeuft() && TUTORIAL[S.tutorial].fertig()) S.tutorial++;
    }
    S.einfuehrung = VERSION;
    if (typeof speichern === "function") speichern();
  }
  migrieren();

  const vorherPruefen = tutorialPruefen;
  tutorialPruefen = function(){ migrieren(); return vorherPruefen.apply(this, arguments); };
  const vorherZeichnen = zeichnen;
  zeichnen = function(){ migrieren(); return vorherZeichnen.apply(this, arguments); };

  /* ---------- Nur der Zielort ist kaufbar ---------- */
  const erlaubtKauf = (art, id) => {
    const k = kaufZiel();
    return !!k && k.art === art && (id === undefined || String(id) === String(k.id));
  };
  const vorherErlaubt = mineErlaubt;
  mineErlaubt = function(id){
    if (!tutorialLaeuft()) return vorherErlaubt(id);
    return !!S.minen[id] || erlaubtKauf("mine", id);
  };
  const vorherGesperrt = gesperrt;
  gesperrt = function(art, id){
    if (!tutorialLaeuft()) return vorherGesperrt(art, id);
    if (art === "mine" || art === "raff" || art === "fab") return !erlaubtKauf(art, id);
    return vorherGesperrt(art, id);
  };

  function sperrHinweis(){
    const k = kaufZiel(), t = schritt();
    const ziel = k ? {art:k.art, id:k.id} : zielAusText(t && t.ziel());
    const wohin = ziel ? `<button class="einfuehrung-hin" data-einfuehrung-hin="${ziel.art}:${ziel.id}">Zu ${ortName(ziel.art, ziel.id)}</button>` : "";
    const was = k ? `Hier noch nicht. In der Einführung ist jetzt <b>${ortName(k.art, k.id)}</b> dran.`
                  : "Hier noch nicht. Folge Schritt für Schritt der Aufgabe – danach sind alle Orte offen.";
    return `<div class="notiz einfuehrung-sperre">${was}${wohin}</div>`;
  }
  function zielAusText(z){
    const m = /^pin:(mine|raff|fab):(.+)$/.exec(z || "");
    return m ? {art:m[1], id:m[2]} : null;
  }

  const ALTE_NOTIZEN = [
    /<div class="notiz">(?:Für <b>[^<]*<\/b> hast du bereits eine Mine\. Im Tutorial genügt eine pro Material\.|Im Tutorial eröffnest du zuerst[\s\S]*?Danach werden alle Standorte frei\.)<\/div>/,
    /<div class="notiz">Im Tutorial baust du zuerst nur <b>eine<\/b> Raffinerie\.<\/div>/,
    /<div class="notiz">Im Tutorial baust du zuerst nur <b>eine<\/b> Fabrik\. Danach stehen alle Produkte offen\.<\/div>/
  ];
  const KAUF_KNOPF = /<button class="cta[^"]*"\s+data-tun="(mine-auf|raff-bau|fab-bau)"([^>]*)>[\s\S]*?<\/button>/g;

  function kaufSperren(html, art, id){
    if (!tutorialLaeuft() || erlaubtKauf(art, id)) return html;
    let ersetzt = false;
    for (const re of ALTE_NOTIZEN) html = html.replace(re, () => { ersetzt = true; return sperrHinweis(); });
    html = html.replace(KAUF_KNOPF, (_, tun, attrs) =>
      `<button class="cta" data-tun="${tun}"${attrs.replace(/\sdisabled\b/g, "")} disabled>Noch nicht dran</button>`);
    if (!ersetzt) html = html.replace(/(<div class="titelzeile">[\s\S]*?<\/div><\/div><\/div>)/, `$1${sperrHinweis()}`);
    return html;
  }

  const vorherMine = blattMine;
  blattMine = function(id){ const h = vorherMine(id); return S.minen[id] ? h : kaufSperren(h, "mine", id); };
  const vorherRaff = blattRaff;
  blattRaff = function(id){ const h = vorherRaff(id); return S.raff[id] ? h : kaufSperren(h, "raff", id); };
  const vorherFab = blattFab;
  blattFab = function(land){ const h = vorherFab(land); return S.fabriken.some(f => f.land === land) ? h : kaufSperren(h, "fab", land); };

  /* Sicherheitsnetz, falls ein Knopf trotzdem erreicht wird */
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest('[data-tun="mine-auf"],[data-tun="raff-bau"],[data-tun="fab-bau"],[data-tun="perk"]');
    if (!b || !tutorialLaeuft()) return;
    const tun = b.dataset.tun;
    const ok = tun === "mine-auf" ? erlaubtKauf("mine", b.dataset.id)
             : tun === "raff-bau" ? erlaubtKauf("raff", b.dataset.id)
             : tun === "fab-bau" ? erlaubtKauf("fab", b.dataset.l) && b.dataset.p === START_PRODUKT
             : false;
    if (!ok){ e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* «Zu …» im gesperrten Blatt: direkt das richtige Blatt öffnen */
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-einfuehrung-hin]");
    if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const [art, id] = b.dataset.einfuehrungHin.split(":");
    if (typeof zeigeAuf === "function") zeigeAuf(art === "fab" ? "f_" + id : id);
    blattFuellen(art, id);
  }, true);

  /* ---------- Nur so viel Personal wie nötig ---------- */
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest('[data-tun="crew"],[data-tun="rcrew"],[data-tun="fcrew"],[data-tun="vcrew"]');
    if (!b || !tutorialLaeuft() || !(+b.dataset.n > 0)) return;
    const tun = b.dataset.tun, ref = tun === "fcrew" ? b.dataset.i : tun === "vcrew" ? null : b.dataset.id;
    const platz = obergrenze(tun, ref) - istWert(tun, ref);
    if (platz <= 0){ e.preventDefault(); e.stopImmediatePropagation(); blattStand = ""; seitenStand = ""; zeichnen(); return; }
    if (+b.dataset.n > platz) b.dataset.n = platz;
  }, true);

  const vorherAnstellbar = anstellbar;
  anstellbar = function(){
    if (!tutorialLaeuft()) return vorherAnstellbar();
    return nochEinstellen();
  };

  const REGLER_ANSTELL = /<div class="reglerzeile">\s*<div class="kopf"><b>Wie viele\?<\/b>[\s\S]*?<\/small><\/div>/;
  const vorherTeam = seiteTeam;
  seiteTeam = function(){
    if (!tutorialLaeuft()){
      if (anstellMenge % 5) anstellMenge = 10;          // Regler wieder auf seine Stufen
      return vorherTeam.apply(this, arguments);
    }
    const n = nochEinstellen();
    anstellMenge = Math.max(1, n);
    let html = vorherTeam.apply(this, arguments);
    const liste = bedarfListe().map(b => `<span>${b.name} <b>${b.soll}</b></span>`).join("");
    html = html.replace(REGLER_ANSTELL, `<div class="einfuehrung-bedarf">
        <b>${n > 0 ? `Es fehlen noch ${n} Personen` : "Du hast genug Personal"}</b>
        <div class="bedarf-liste">${liste}</div>
        <small>In der Einführung stellst du genau so viele Leute ein, wie die Lieferkette braucht. Jede Person kostet CHF&nbsp;${LOHN_PRO_KOPF.toLocaleString("de-CH")} beim Einstellen und danach Lohn.</small>
      </div>`);
    html = html.replace(/Im Tutorial genügen \d+ Leute/, "Genug Personal für die Einführung");
    return html;
  };

  /* ---------- Wissen: Verbesserungen erst nach der Einführung ---------- */
  if (typeof lupeFuellen === "function"){
    const vorherLupe = lupeFuellen;
    lupeFuellen = function(){
      const out = vorherLupe.apply(this, arguments);
      if (tutorialLaeuft()) document.querySelectorAll('#lupe [data-tun="perk"]').forEach(b => {
        b.disabled = true; b.classList.remove("puls");
        b.textContent = "Erst nach der Einführung";
      });
      return out;
    };
  }

  /* ---------- Karte: genau ein Ziel leuchtet ---------- */
  function zielPinMarkieren(){
    const z = zielAusText(hinweisZiel());
    if (!z) return;
    document.querySelectorAll("#welt .pin").forEach(p => {
      const treffer = p.dataset.pin === z.art && p.dataset.id === z.id;
      p.classList.toggle("wink", treffer);
      p.classList.toggle("blass", !treffer);
    });
  }
  const vorherPins = pinsZeichnen;
  pinsZeichnen = function(){ const out = vorherPins.apply(this, arguments); zielPinMarkieren(); return out; };

  /* Ziel des Reglers im Blatt (Marke «Ziel 10») */
  function besetzungsZiel(tun, ref){
    const t = schritt();
    if (!t || !t.crew) return null;
    const c = t.crew();
    if (c && c.tun === tun && String(c.ref) === String(ref)) return c.n;
    // Umverteilen: Die Aufgabe zeigt auf eine Station mit zu vielen Leuten.
    const art = tun === "crew" ? "mine" : tun === "rcrew" ? "raff" : null;
    const z = zielAusText(t.ziel()), v = art && z && z.art === art && String(z.id) === String(ref) ? zuViele() : null;
    return v && v.art === art && String(v.id) === String(ref) ? v.brauch : null;
  }

  const style = document.createElement("style");
  style.id = "erzwelt-einfuehrung-style";
  style.textContent = `
    #blattinhalt .einfuehrung-sperre{background:#fff4e0;border:1.5px solid #ecc06a;color:#6b4a0a}
    #blattinhalt .einfuehrung-hin{display:flex;align-items:center;justify-content:center;width:100%;min-height:42px;margin-top:8px;
      border-radius:10px;border:1.5px solid #e5ba55;background:#fff7df;color:#704d0b;
      font-family:"Baloo 2",sans-serif;font-weight:800;font-size:var(--f1);box-shadow:0 2px 0 #d6a438;cursor:pointer}
    .einfuehrung-bedarf{margin:14px 0 12px}
    .einfuehrung-bedarf > b{display:block;font-family:"Baloo 2",sans-serif;font-size:var(--f3)}
    .einfuehrung-bedarf .bedarf-liste{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:8px 0}
    .einfuehrung-bedarf .bedarf-liste span{padding:3px 10px;border-radius:99px;background:#f3e8d2;font-size:var(--f0);font-weight:700}
    .einfuehrung-bedarf small{display:block;color:var(--grau);font-size:var(--f0);font-weight:600;line-height:1.35}
  `;
  document.head.appendChild(style);

  window.__erzweltEinfuehrung = {version: VERSION, schritte: TUTORIAL.map(t => t.id), besetzungsZiel, obergrenze, offenerBedarf, nochEinstellen};
  blattStand = ""; seitenStand = "";
  if (typeof zeichnen === "function") zeichnen();
})();
