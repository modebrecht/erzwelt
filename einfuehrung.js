"use strict";
/* ============================================================
   EINFÜHRUNG – ein Schritt pro Teilaufgabe

   Das Tutorial führt an der Hand: Jede Aufgabe verlangt genau EINE
   Handlung an genau EINEM Ort, und nur dieser Ort leuchtet auf der Karte.
     Kupfer eröffnen → Kupfer besetzen → Aluminium eröffnen → besetzen →
     Zinn eröffnen → besetzen →
     Raffinerie bauen → besetzen → Kabelfabrik bauen → besetzen →
     selbst verkaufen → Verkaufsteam einsetzen
   - Vorgeschlagen werden die günstigsten Orte; wer schon eine passende
     Quelle oder Raffinerie hat (alter Spielstand), arbeitet mit dieser.
   - Neue Runde startet mit 0 Personen. Eingestellt wird direkt an der
     Station über den Regler (belegschaft-regler.js); dort steht, was einmalig
     und was jeden Monat kostet. Jede Station lässt sich nur bis zum Bedarf
     besetzen (Kupfer 15, Aluminium 5, Zinn 10, Raffinerie 5, Fabrik 5,
     Verkauf 4). Durchgerechnet: Damit läuft die Kette danach ohne Engpass
     (16 Kabel pro Tag hergestellt, bis 20 verkauft). Im Team-Reiter wird
     während der Einführung nicht eingestellt.
   - Kaufen geht nur am Zielort des aktuellen Schritts. Verbesserungen im
     Wissen gibt es erst nach der Einführung. So kann niemand das Geld
     ausgeben und dann feststecken.
   - Sitzen anderswo zu viele Leute (alter Spielstand), schickt die Aufgabe
     zuerst dorthin zum Umverteilen statt neu einzustellen.
   - Spielstände aus älteren Fassungen werden übernommen (S.einfuehrung).
   ============================================================ */
(function(){
  const VERSION = 3;                         // Marke im Spielstand: S.einfuehrung
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
    for (const k of START_MATERIALIEN){ const id = materialMine(k); if (id) soll["mine:" + id] = BEDARF.quelle(k); }
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
  /* Abgestimmt (Simulation ohne Ereignisse, 120 Tage): Fabrik 5 → 16 Kabel pro Tag,
     dafür Kupfer 15, Aluminium 5, Zinn 10; Verkauf 4 → 20 pro Tag. Kein Engpass,
     Lager bleibt leer, rund CHF 41'000 laufender Gewinn pro Monat (Einfach). */
  const BEDARF = {quelle: k => [15, 5, 10][START_MATERIALIEN.indexOf(k)] ?? 5, raff: 5, fab: 5, verkauf: 4};
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
    const v = fehlt > 0 && freieArbeiter() < fehlt ? zuViele(art + ":" + id) : null;
    if (v) return {
      text: `In ${ortName(v.art, v.id)} arbeiten ${v.ist}, nötig sind ${v.brauch}. Öffne zuerst ${ortName(v.art, v.id)} und schieb den Regler auf ${v.brauch} – so musst du niemanden neu einstellen.`,
      ziel: pinZiel(v.art, v.id), entlasten: v};
    return {text: normal, ziel: pinZiel(art, id)};
  }

  /* ---------- Die Schritte ---------- */
  const [CU, AL, SN] = START_MATERIALIEN;          // kupfer, alu, zinn
  const MAT_NAME = k => MATERIAL[k].name;

  function quellenSchritte(k, ikon, zusammenhangAuf, warum){
    const name = MAT_NAME(k), n = BEDARF.quelle(k);
    return [
      { id: k + "-auf", ikon, titel: `${name}-Quelle eröffnen`,
        get text(){ return `Tippe auf der Karte auf ${fett(ortName("mine", quelle(k)))} und eröffne die Rohstoffquelle.`; },
        zusammenhang: zusammenhangAuf,
        ziel: () => pinZiel("mine", quelle(k)),
        kauf: () => ({art:"mine", id: quelle(k)}),
        fertig: () => !!materialMine(k) },
      { id: k + "-crew", ikon:"person", get titel(){ return `Personal nach ${ortName("mine", quelle(k))}`; },
        get text(){
          const o = ortName("mine", quelle(k));
          const erst = k === START_MATERIALIEN[0] && !S.arbeiterGesamt
            ? `Du hast noch kein Personal. Öffne ${fett(o)} und schieb den Regler auf ${n} – die Leute werden dabei eingestellt.${warum ? " " + warum : ""}`
            : `Öffne ${fett(o)} und schieb den Regler auf ${n} Personen.${warum ? " " + warum : ""}`;
          return besetzen("mine", quelle(k), n, erst).text;
        },
        zusammenhang: k === START_MATERIALIEN[0]
          ? "Personal kostet zweimal: einmal beim Einstellen, danach jeden Monat Lohn."
          : `Ohne Personal wird kein ${rohstoffName(k)} gefördert.`,
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
    ...quellenSchritte(CU, "hacke", "Das Ladekabel braucht Kupfer, Aluminium und Zinn. Jede Rohstoffquelle liefert einen Rohstoff.",
      "Ein Ladekabel braucht doppelt so viel Kupfer wie Aluminium oder Zinn."),
    ...quellenSchritte(AL, "berg", "Bauxit wird später zu Aluminium."),
    ...quellenSchritte(SN, "berg", "Zinnerz wird später zu Zinn. Jetzt hast du alle drei Rohstoffe.",
      "Zinnerz enthält wenig Zinn – darum braucht es hier mehr Leute als in Boké."),
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
        return `Im Markt beim Verkaufsteam: Schieb den Regler auf ${BEDARF.verkauf} Personen. Jede verkauft ${STUECK_PRO_VERKAEUFER} Kabel pro Tag – zusammen mehr, als die Fabrik herstellt.`;
      },
      zusammenhang:"Das Verkaufsteam verkauft jeden Tag – du musst nicht mehr selbst.",
      ziel: () => "dock:markt",
      crew: () => ({tun:"vcrew", ref:null, n: BEDARF.verkauf}),
      fertig: () => (S.verkaeufer || 0) >= BEDARF.verkauf }
  ];

  TUTORIAL.splice(0, TUTORIAL.length, ...SCHRITTE);

  const schritt = () => tutorialSchritt();
  const kaufZiel = () => { const t = schritt(); return t && t.kauf ? t.kauf() : null; };

  /* ---------- Neue Runde: 0 Personen ---------- */
  const vorherNeu = neuerZustand;
  neuerZustand = function(){ const z = vorherNeu.apply(this, arguments); z.arbeiterGesamt = 0; z.startTeam = 0; return z; };
  // Ältere Spielstände hatten 10 Startleute (zählen nicht als Investition).
  const vorherLaden = laden;
  laden = function(){
    let roh = null;
    try { roh = JSON.parse(SPEICHER.lies(SCHLUESSEL) || SPEICHER.lies("erzwelt_v1") || "null"); } catch (e){}
    const ok = vorherLaden.apply(this, arguments);
    if (ok && roh && roh.startTeam === undefined) S.startTeam = 10;
    return ok;
  };
  // Beim Seitenstart wurde eine neue Runde noch mit dem alten Startzustand angelegt.
  if (typeof geladen !== "undefined" && !geladen && S.tag === 1 && S.schwierigkeit === null
      && !Object.keys(S.minen).length && S.startTeam === undefined){
    S.arbeiterGesamt = 0; S.startTeam = 0;
  }

  /* ---------- Spielstände übernehmen ---------- */
  const LAENGE_FRUEHER = {undefined: ALTE_LAENGE, 2: 13};
  function migrieren(){
    if (!S || S.einfuehrung === VERSION) return;
    if (S.tutorial >= (LAENGE_FRUEHER[S.einfuehrung] ?? ALTE_LAENGE)) S.tutorial = TUTORIAL.length;
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

  /* Team-Reiter: In der Einführung wird an der Station eingestellt, nicht hier. */
  const vorherAnstellbar = anstellbar;
  anstellbar = function(){ return tutorialLaeuft() ? 0 : vorherAnstellbar(); };

  const REGLER_ANSTELL = /<div class="reglerzeile">\s*<div class="kopf"><b>Wie viele\?<\/b>[\s\S]*?<\/small><\/div>/;
  const KNOPF_ANSTELL = /<button class="cta riesig[^"]*" data-tun="anstellen"[\s\S]*?<\/button>(\s*<div class="notiz monatskosten">[\s\S]*?<\/div>)?/;
  const vorherTeam = seiteTeam;
  seiteTeam = function(){
    if (!tutorialLaeuft()){
      if (anstellMenge % 5 || anstellMenge < 5) anstellMenge = 10;
      return vorherTeam.apply(this, arguments);
    }
    const liste = bedarfListe().map(b => `<span>${b.name} <b>${b.ist}/${b.soll}</b></span>`).join("");
    return vorherTeam.apply(this, arguments).replace(">Stelle mehr Personen ein</h3>", ">Dein Personal in der Einführung</h3>").replace(REGLER_ANSTELL, "").replace(KNOPF_ANSTELL, `<div class="einfuehrung-bedarf">
        <b>Eingestellt wird an der Station</b>
        <small>Öffne eine Rohstoffquelle, Raffinerie oder Fabrik und schieb dort den Regler. Fehlende Leute werden dabei eingestellt – du siehst, was einmalig und was jeden Monat kostet.</small>
        <div class="bedarf-liste">${liste}</div>
      </div>`);
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

  window.__erzweltEinfuehrung = {version: VERSION, schritte: TUTORIAL.map(t => t.id), besetzungsZiel, obergrenze, offenerBedarf};
  blattStand = ""; seitenStand = "";
  if (typeof zeichnen === "function") zeichnen();
})();
