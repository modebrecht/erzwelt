/* Erzwelt · module/einfuehrung.js – Start und Einführung
   ---------------------------------------------------------------
   Besitzer von allem, was eine neue Runde bis zum Ende der Einführung führt:
     1. Schritte: ein Schritt pro Teilaufgabe, genau EINE Handlung an genau
        EINEM Ort, nur dieser Ort leuchtet auf der Karte.
          Kupfer eröffnen → Kupfer besetzen → Aluminium eröffnen → besetzen →
          Zinn eröffnen → besetzen → Raffinerie bauen → besetzen →
          Kabelfabrik bauen → besetzen → selbst verkaufen → Verkaufsteam
        Vorgeschlagen werden die günstigsten Orte; wer schon eine passende
        Quelle oder Raffinerie hat (alter Spielstand), arbeitet mit dieser.
     2. Bedarf: Neue Runde startet mit 0 Personen. Eingestellt wird an der
        Station (belegschaft-regler.js), höchstens bis zum Bedarf (Kupfer 15,
        Aluminium 5, Zinn 10, Raffinerie 5, Fabrik 5, Verkauf 4). Damit läuft
        die Kette danach ohne Engpass (16 Kabel pro Tag, bis 20 verkauft). Im
        Team-Reiter wird in der Einführung nicht eingestellt (anstellbar = 0).
        Sitzen anderswo zu viele Leute (alter Spielstand), schickt die Aufgabe
        zuerst dorthin zum Umverteilen.
     3. Kaufsperre: Kaufen geht nur am Zielort des aktuellen Schritts
        (mineErlaubt, gesperrt, Sicherheitsnetz beim Klick). Verbesserungen im
        Wissen erst nach der Einführung. So kann niemand das Geld ausgeben und
        dann feststecken.
     4. Spielstände übernehmen (S.einfuehrung = 3; frühere Fassungen 11 bzw.
        13 Schritte), auch vor jedem Zeichnen und jeder Prüfung.
     5. Phasen und Text für die Aufgabenkarte, Rückmeldung «Schritt
        abgeschlossen» und Erfolg feiern nach einem Schritt (tutorialPruefen).
     6. Startbild «Woher kommt dein Ladekabel?» vor der Schwierigkeitswahl einer
        neuen Runde, einmal pro Runde (S.einstiegGesehen).
     7. Schwierigkeitswahl: ohne Fachjargon, Einfach empfohlen, Schwer erst nach
        einer geschafften Mittel-Etappe, Brocken statt Emojis.
   Früher: einfuehrung.js, tutorial-enhance.js, einstieg.js, der Einführungs-Teil
   von erfolg-feier.js, die Schwierigkeitswahl aus sek-b-klarheit.js und stil.js.

   Ladereihenfolge (patches.json): an der früheren Stelle von einfuehrung.js
   (nach belegschaft-regler.js, vor module/blaetter.js). Beim Laden, in dieser
   Reihenfolge: Schritte einsetzen (TUTORIAL.splice), neue Runde ohne Personal,
   Spielstand übernehmen, Klick-Listener (Capture), Karte zeichnen, dann den
   schon offenen Schwierigkeitsdialog in der endgültigen Fassung zeigen und
   darüber das Startbild.

   Bleibt woanders: Aufgabenkarte zeichnen (module/aufgabe.js), Regler und
   Kaufblatt (belegschaft-regler.js, module/blaetter.js), Bedarfsliste im
   Team-Reiter (module/seiten.js), Ton/Funken/Vibration (erfolg-feier.js),
   Wirkungstexte der Schwierigkeit (sek-b-klarheit.js), Brocken und Schloss
   (module/basis.js), Stil (module/stil.js).

   Markierungen: window.__erzweltEinfuehrung (belegschaft-regler.js,
   module/blaetter.js, module/seiten.js, Prüfskripte), __erzweltTutorialEnhance
   (module/aufgabe.js), __erzweltEinstieg (Prüfskripte). */
"use strict";
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
            ? `Öffne ${fett(o)} und schieb den Regler auf ${n}. Die Leute werden dabei eingestellt.`
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
      "Kabel brauchen doppelt so viel Kupfer wie Aluminium."),
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

  /* Einziger Besitzer von tutorialPruefen: Spielstand übernehmen, erledigte
     Schritte weiterschalten (je eine Meldung), danach Rückmeldung, Aufgabenkarte
     neu und Erfolg feiern (erfolg-feier.js: Ton, Vibration, Funken). */
  const FERTIG_MELDUNG = "Tutorial abgeschlossen – du hast die Lieferkette einmal vollständig aufgebaut. Weitere Standorte, Produkte und Ausbauten sind jetzt verfügbar.";
  tutorialPruefen = function(){
    migrieren();
    const vorher = S.tutorial, erster = TUTORIAL[vorher];
    while (tutorialLaeuft() && TUTORIAL[S.tutorial].fertig()){
      const erledigt = TUTORIAL[S.tutorial];
      S.tutorial++;
      notiz(tutorialLaeuft() ? "Erledigt: " + erledigt.titel : FERTIG_MELDUNG, "gut");
    }
    if (S.tutorial <= vorher) return;
    const fertig = S.tutorial >= TUTORIAL.length;
    if (fertig) rueckmeldung("Rohstoffquelle → Raffinerie → Fabrik → Verkauf → Geld", true);
    else if (erster && erster.zusammenhang) rueckmeldung(erster.zusammenhang, false);
    if (window.__erzweltAufgabe) window.__erzweltAufgabe.tutorialNeu();
    questZeichnen();
    window.__erzweltErfolgFeier.feiern(fertig);
  };
  Erzwelt.vorZeichnen(() => migrieren());

  /* ---------- Nur der Zielort ist kaufbar ---------- */
  const erlaubtKauf = (art, id) => {
    const k = kaufZiel();
    return !!k && k.art === art && (id === undefined || String(id) === String(k.id));
  };
  mineErlaubt = function(id){
    return !tutorialLaeuft() || !!S.minen[id] || erlaubtKauf("mine", id);
  };
  gesperrt = function(art, id){
    if (!tutorialLaeuft()) return false;
    return (art === "mine" || art === "raff" || art === "fab") && !erlaubtKauf(art, id);
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

  /* Gesperrtes Kaufblatt: module/blaetter.js zeigt den Sperrhinweis und
     «Noch nicht dran», wenn kaufSperre(art, id) gilt. */
  const kaufSperre = (art, id) => tutorialLaeuft() && !erlaubtKauf(art, id);

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
  anstellbar = function(){ return tutorialLaeuft() ? 0 : anstellMenge; };

  /* Bedarfsliste statt Einstellen; der Team-Reiter (module/seiten.js) setzt sie ein. */
  function bedarfHinweis(){
    const liste = bedarfListe().map(b => `<span>${b.name} <b>${b.ist}/${b.soll}</b></span>`).join("");
    return `<div class="einfuehrung-bedarf">
        <b>Eingestellt wird an der Station</b>
        <small>Öffne eine Rohstoffquelle, Raffinerie oder Fabrik und schieb dort den Regler. Fehlende Leute werden dabei eingestellt – du siehst, was einmalig und was jeden Monat kostet.</small>
        <div class="bedarf-liste">${liste}</div>
      </div>`;
  }

  /* Verbesserungen im Wissen: Die Lupe (module/wissen.js) zeigt «Erst nach der
     Einführung»; das Sicherheitsnetz oben fängt den Kauf ab. */

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
  Erzwelt.nachPins(() => zielPinMarkieren());

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


  /* ---------- Phasen und Text für die Aufgabenkarte ---------- */
  const PHASEN = [
    {id:"rohstoff", nr:1, label:"Rohstoffe", steps:["kupfer-auf","kupfer-crew","alu-auf","alu-crew","zinn-auf","zinn-crew"]},
    {id:"raff", nr:2, label:"Raffination", steps:["raff","raffcrew"]},
    {id:"fab", nr:3, label:"Fertigung", steps:["fab","fab-crew"]},
    {id:"verkauf", nr:4, label:"Verkauf", steps:["verkauf","verkaeufer"]}
  ];
  const phaseFor = id => PHASEN.findIndex(p => p.steps.includes(id));

  /* Aufgabentext; beim Verkaufen mit Blick auf Lager, Fabrik und Material */
  function dynamischerText(t){
    if (!t) return "";
    if (t.id === "verkauf"){
      const lager = S.ware?.[START_PRODUKT] || 0;
      if (lager <= 0){
        const fab = S.fabriken.find(f => f.produkt === START_PRODUKT && f.restbau <= 0);
        if (!fab) return "Noch ist keine fertige Kabelfabrik vorhanden. Lass den Bau zuerst abschliessen.";
        if (fab.arbeiter <= 0) return "Noch entstehen keine Ladekabel. Der Fabrik ist noch kein Personal zugewiesen.";
        const def = PRODUKT[START_PRODUKT];
        const fehlt = Object.keys(def.rezept || {}).filter(k => (S.mat[k] || 0) < def.rezept[k]);
        if (fehlt.length) return `Noch entstehen keine Ladekabel. Es fehlt ${fehlt.map(k => MATERIAL[k].name).join(", ")}. Prüfe Rohstoffquellen und Raffinerie.`;
        return "Die Fabrik kann produzieren. Lass die Zeit laufen, bis mindestens ein Ladekabel im Lager liegt; verkaufe es danach im Markt.";
      }
      return `Im Lager liegen ${Math.round(lager)} Ladekabel. Verkaufe einmal selbst im Markt und beobachte, wie aus Ware Geld wird.`;
    }
    return t.text;
  }

  /* Meldungen auf dem Handy unter die Aufgabenkarte statt darüber */
  function syncTutorialToastLayout(q, t){
    const root = document.getElementById("toasts");
    if (!root) return;
    const small = window.matchMedia?.("(max-width:560px)").matches;
    const stacked = !!t && !!q && !q.hidden && q.classList.contains("tutorial-aktiv") && !q.classList.contains("breit") && small && aktiveSeite === "karte" && !offenesBlatt;
    if (!stacked){
      root.style.removeProperty("top");
      root.style.removeProperty("width");
      return;
    }
    const bottom = Math.ceil(q.getBoundingClientRect().bottom + 8);
    root.style.setProperty("top", bottom + "px", "important");
    root.style.setProperty("width", "min(72%,310px)", "important");
  }
  function scheduleToastLayout(){
    const q = document.getElementById("quest"), t = typeof tutorialSchritt === "function" ? tutorialSchritt() : null;
    requestAnimationFrame(() => syncTutorialToastLayout(q, t));
  }
  window.addEventListener("resize", scheduleToastLayout);
  const tutorialQuest = document.getElementById("quest");
  if (tutorialQuest && typeof ResizeObserver === "function") new ResizeObserver(scheduleToastLayout).observe(tutorialQuest);

  /* ---------- Rückmeldung nach einem Schritt ---------- */
  let rueckmeldungUhr = 0;
  function rueckmeldung(html, finale){
    let el = document.getElementById("tutorial-lernfeedback");
    if (!el){ el = document.createElement("div"); el.id = "tutorial-lernfeedback"; document.body.appendChild(el); }
    clearTimeout(rueckmeldungUhr); el.classList.remove("rein");
    el.innerHTML = finale ? `<b>Tutorial abgeschlossen</b><br>${html}` : `<b>Schritt abgeschlossen</b><br>${html}`;
    if (OPT.anim !== 0 && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){ requestAnimationFrame(() => el.classList.add("rein")); rueckmeldungUhr = setTimeout(() => el.remove(), 3000); }
    else { el.style.opacity = "1"; rueckmeldungUhr = setTimeout(() => el.remove(), 2200); }
  }

  /* ---------- Startbild «Woher kommt dein Ladekabel?» ----------
     Vor der Schwierigkeitswahl einer neuen Runde ein aufgeschnittenes Ladekabel:
     Kupfer in der Leitung, Aluminium im Stecker, Zinn in der Lötstelle – jedes
     mit dem Ort, an dem die Einführung danach die Quelle eröffnet. Darunter die
     Kette Quelle → Raffinerie → Fabrik → Markt und «Firma gründen». Ein Ablauf
     beim Öffnen (Kabel zeichnen, dann die drei Materialien); bei «Animationen:
     aus» oder reduzierter Bewegung sofort vollständig. */
  const startOrt = k => {
    const d = MINEN.filter(x => x.mat === k).sort((a, b) => a.erschliessung - b.erschliessung)[0];
    return d ? `${d.ort}, ${LAND[d.land].name}` : "";
  };
  // lage: {left|right: %, top: %}; «rechts» = Symbol rechts, Text rechtsbündig
  const chip = (k, wofuer, lage, rechts) => {
    const m = MATERIAL[k];
    const pos = Object.entries(lage).map(([a, v]) => `${a}:${v}%`).join(";");
    return `<div class="es-chip ${rechts ? "es-rechts" : ""}" style="${pos}">
      <span class="es-sym" style="background:${m.farbe}">${m.sym}</span>
      <span class="es-txt"><b>${m.name}</b><small>${wofuer}</small><small class="es-ort">${startOrt(k)}</small></span>
    </div>`;
  };

  /* Kabel: Stecker links und rechts aus Aluminium, Mitte aufgeschnitten (Kupfer),
     Lötstelle (Zinn) am rechten Stecker. viewBox 340 × 230 */
  const BILD = `<svg class="es-kabel" viewBox="0 0 340 230" aria-hidden="true">
    <path class="es-mantel" d="M66 168C120 168 112 110 168 108S224 76 262 76" fill="none" stroke="#1d2a33" stroke-width="12" stroke-linecap="round"/>
    <path class="es-kern" d="M138 125C150 112 158 109 170 108S190 104 198 99" fill="none" stroke="${MATERIAL[CU].farbe}" stroke-width="7" stroke-linecap="round"/>
    <path class="es-kern" d="M140 122C151 112 159 110 170 109.5S189 106 196 101" fill="none" stroke="#f2b27f" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="22" y="157" width="48" height="23" rx="7" fill="${MATERIAL[AL].farbe}" stroke="#6f8296" stroke-width="2"/>
    <rect x="9" y="162" width="15" height="13" rx="3" fill="#d6dee7" stroke="#6f8296" stroke-width="2"/>
    <rect x="258" y="64" width="48" height="24" rx="7" fill="${MATERIAL[AL].farbe}" stroke="#6f8296" stroke-width="2"/>
    <rect x="304" y="69" width="15" height="14" rx="3" fill="#d6dee7" stroke="#6f8296" stroke-width="2"/>
    <circle class="es-loet" cx="262" cy="76" r="6.5" fill="${MATERIAL[SN].farbe}" stroke="#fff" stroke-width="2"/>
    <path class="es-zeiger z1" d="M168 103 152 46" stroke="#ffffff88" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
    <path class="es-zeiger z2" d="M46 182 50 200" stroke="#ffffff88" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
    <path class="es-zeiger z3" d="M262 83 266 138" stroke="#ffffff88" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
  </svg>`;

  const KETTE = [["hacke", "Quelle"], ["kolben", "Raffinerie"], ["fabrik", "Fabrik"], ["markt", "Markt"]];

  function bauen(){
    const el = document.createElement("div");
    el.id = "einstieg";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "es-titel");
    el.innerHTML = `<div class="es-innen">
      <div class="es-marke">Erzwelt</div>
      <h1 id="es-titel">Woher kommt dein Ladekabel?</h1>
      <div class="es-bild">
        ${BILD}
        ${chip(CU, "leitet den Strom", {left: 39, top: 5})}
        ${chip(AL, "Steckergehäuse", {left: 4, top: 82})}
        ${chip(SN, "Lötstelle", {right: 19, top: 57}, true)}
      </div>
      <p class="es-text">Drei Rohstoffe aus drei Ländern. Du baust die Kette auf, die daraus ein Kabel macht – und verkaufst es.</p>
      <ol class="es-kette" aria-label="Deine Lieferkette">
        ${KETTE.map(([ik, name]) => `<li><span class="es-ik">${IK[ik] || ""}</span>${name}</li>`).join("")}
      </ol>
      <button type="button" class="cta es-los">Firma gründen</button>
    </div>`;
    return el;
  }

  const ruhig = () => (typeof OPT !== "undefined" && OPT.anim === 0) || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function startbildZeigen(){
    if (document.getElementById("einstieg")) return;
    const el = bauen();
    if (!ruhig()) el.classList.add("es-ablauf");
    document.body.appendChild(el);
    const los = el.querySelector(".es-los");
    const weiter = () => {
      S.einstiegGesehen = true;
      if (typeof speichern === "function") speichern();
      el.classList.add("es-weg");
      setTimeout(() => el.remove(), ruhig() ? 0 : 260);
      setTimeout(() => document.querySelector("#d-wahlen .wahl:not([disabled])")?.focus(), ruhig() ? 0 : 280);
    };
    los.addEventListener("click", weiter);
    el.addEventListener("keydown", e => { if (e.key === "Escape"){ e.preventDefault(); weiter(); } });
    // Nach der Schwierigkeitswahl (die ihren Knopf nach 60 ms fokussiert) den Fokus hierher holen
    setTimeout(() => los.focus({focusVisible: false}), 150);   // kein Fokusrahmen auf dem Handy
  }
  const brauchtEinstieg = () => S && !S.einstiegGesehen && !SCHWIERIGKEIT[S.schwierigkeit] && !S.ende;

  /* ---------- Schwierigkeitswahl ----------
     Wirkung ohne Fachjargon, Einfach empfohlen, Schwer erst nach einer
     geschafften Mittel-Etappe. Bei jeder neuen Runde liegt darüber zuerst das
     Startbild. */
  const kurzChf = n => (n >= 1e6 ? `CHF ${(n/1e6).toLocaleString("de-CH")} Mio` : chf(n)).replace(/ /g, "&nbsp;");
  schwierigkeitZeigen = function(){
    const ziele = (window.__erzweltLogikFixes && window.__erzweltLogikFixes.ziele) || {einfach:500000, mittel:3000000, schwer:3000000};
    modalOffen = true; tempoSetzen(0);
    $("#d-art").textContent = "Neue Runde";
    $("#d-titel").textContent = "Wähle die Schwierigkeit";
    $("#d-text").innerHTML = `Die Schwierigkeit bestimmt, wie viel dir ein Verkauf einbringt und wie hoch dein Ziel ist. Für den Start empfehlen wir <b>Einfach</b>.`;
    const optionen = [
      ["einfach", 1, "Einfach", `Verkauf bringt 20&nbsp;% mehr<br>Ziel: ${kurzChf(ziele.einfach)}`, false],
      ["mittel", 2, "Mittel", `Normale Verkaufspreise<br>Ziel: ${kurzChf(ziele.mittel)}`, false],
      ["schwer", 3, "Schwer", `Verkauf bringt 30&nbsp;% weniger<br>Ziel: ${kurzChf(ziele.schwer)}`, !META.mittelGeschafft]
    ];
    $("#d-wahlen").innerHTML = "";
    optionen.forEach(([id, n, name, klein, gesperrt]) => {
      const b = document.createElement("button");
      b.className = "wahl schwierigkeit"; b.disabled = gesperrt;
      const badge = id === "einfach" ? ` <span class="empfohlen">Empfohlen</span>` : "";
      const sperre = gesperrt ? `<br><span class="sperre">${Erzwelt.ikon.schloss} Erst Mittel schaffen</span>` : "";
      b.innerHTML = `<span class="schwierigkeitsicon">${Erzwelt.stufe(n)}</span><span><b>${name}${badge}</b><small>${klein}${sperre}</small></span>`;
      if (!gesperrt) b.onclick = () => {
        S.schwierigkeit = id; S.etappe = 1; S.etappeStartEingenommen = S.eingenommen; S.etappeStartAusgegeben = S.ausgegeben; S.ende = null;
        modalOffen = false; $("#schleier").hidden = true;
        notiz(`Schwierigkeit <b>${name}</b> gewählt · ${SCHWIERIGKEIT[id].effekt}.`, "gut");
        speichern(); tempoSetzen(1); zeichnen();
      };
      $("#d-wahlen").appendChild(b);
      if (id === "einfach") setTimeout(() => b.focus(), 60);
    });
    $("#schleier").hidden = false; zeichnen();
    if (brauchtEinstieg()) startbildZeigen();
  };

  /* ---------- Markierungen und Laden ---------- */
  window.__erzweltEinfuehrung = {version: VERSION, schritte: TUTORIAL.map(t => t.id), besetzungsZiel, obergrenze, offenerBedarf, kaufSperre, sperrHinweis, bedarfHinweis};
  window.__erzweltTutorialEnhance = {version: 3, steps: TUTORIAL.length, phases: PHASEN.map(p => p.id), mobileToastStack: true, eventDrivenToastLayout: true,
    phasen: PHASEN, phase: phaseFor, text: dynamischerText, toastLayout: syncTutorialToastLayout};
  window.__erzweltEinstieg = {version: 1, zeigen: startbildZeigen};

  blattStand = ""; seitenStand = "";
  zeichnen();
  /* Der Kern hat den Schwierigkeitsdialog schon gezeigt: in der endgültigen
     Fassung neu zeigen (samt Startbild, falls die Runde neu ist). */
  if (!$("#schleier").hidden && $("#d-titel").textContent === "Wähle die Schwierigkeit") schwierigkeitZeigen();
  if (brauchtEinstieg() && !$("#schleier").hidden) startbildZeigen();
})();
