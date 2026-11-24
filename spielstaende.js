"use strict";

(function(){
  let aktiv = null;
  let ansichtMenue = "start";
  let importVorschau = null;
  let importAnfrage = 0;
  let sicherungStand = null;
  let verlassenAngeboten = false;
  let speicherFehler = "";

  const spiel = $("#spiel");
  const menue = document.createElement("main");
  menue.id = "spielmenue";
  menue.innerHTML = `
    <div class="spielmenue-innen">
      <div class="spielmenue-marke">
        <span class="sm-markenicon" aria-hidden="true">${IK.hacke}</span>
        <h1 id="spielmenue-titel" tabindex="-1">Erzwelt</h1>
      </div>
      <section id="spielmenue-inhalt" aria-labelledby="spielmenue-titel"></section>
      <p id="spielmenue-meldung" class="sm-meldung" role="status" hidden></p>
      <input id="spielmenue-datei" type="file" accept=".json,application/json" hidden>
    </div>`;
  menue.setAttribute("aria-labelledby", "spielmenue-titel");
  document.body.append(menue);
  const titel = $("#spielmenue-titel");
  const inhalt = $("#spielmenue-inhalt");
  const meldung = $("#spielmenue-meldung");
  const datei = $("#spielmenue-datei");

  const stil = document.createElement("style");
  stil.textContent = `
    #spielmenue {position:fixed;inset:0;z-index:150;overflow:auto;overscroll-behavior:contain;
      background:radial-gradient(130% 120% at 50% 0%,#165676,#0b3648 44%,#082a39 100%);color:#fff}
    #spielmenue[hidden],.sm-dialogaktionen [hidden] {display:none}
    #spiel.spielmenue-offen {visibility:hidden}
    .spielmenue-innen {width:min(100%,610px);min-height:100%;margin:auto;display:flex;flex-direction:column;
      justify-content:safe center;padding:calc(20px + env(safe-area-inset-top)) max(16px,env(safe-area-inset-right))
      calc(26px + env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}
    .spielmenue-marke {display:flex;align-items:center;gap:14px;margin:0 0 20px}
    .sm-markenicon {display:grid;place-items:center;flex:none;width:52px;height:52px;color:#173743;
      background:var(--gold);border-radius:14px;box-shadow:0 4px 0 #d09029}
    .sm-markenicon svg {width:31px;height:31px}
    #spielmenue h1 {font:800 clamp(27px,7vw,45px)/1.08 "Baloo 2",sans-serif;overflow-wrap:anywhere;margin:0}
    #spielmenue h1:focus {outline:none}
    .sm-karten {display:grid;gap:10px}
    .sm-karte {background:#faf3e4;color:#192f36;border-radius:16px;padding:14px 16px;overflow-wrap:anywhere}
    .sm-karte h2 {font:800 var(--f3)/1.15 "Baloo 2",sans-serif;margin:0 0 4px}
    .sm-karte p,.sm-meldung,.sm-hinweis {font-size:var(--f1);margin:5px 0}
    .sm-details {color:#394e52}
    .sm-menuaktionen {display:grid;gap:8px}
    .sm-aktionen,.sm-dialogaktionen {display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    .sm-aktionen .cta,.sm-dialogaktionen .cta {flex:1 1 auto;width:auto;margin:0}
    #spielmenue .cta,.sm-dialogaktionen .cta {white-space:normal;min-height:44px;text-align:center}
    #spielmenue .cta {box-shadow:none;margin-top:0}
    #spielmenue :is(button,a):focus-visible,.sm-dialogaktionen button:focus-visible {outline:3px solid #1a8dc3;outline-offset:2px}
    .sm-menuaktionen .cta.still,.sm-zurueck {background:#ffffff16;color:white;border:1px solid #ffffff66}
    .sm-menuaktionen .sm-hinweis {color:#d6eaf5;margin:0 0 9px;text-align:center;overflow-wrap:anywhere}
    .sm-meldung {margin:14px 0 0;color:#fff1c7;overflow-wrap:anywhere}
    #spielmenue .sm-zurueck {margin:14px 0 0}
    .sm-karten .sm-hinweis {margin:0 0 3px}
    #schleier .dialog {max-height:calc(100dvh - 18px);overflow:auto}
    .sm-dialogaktionen .notiz {flex:1 0 100%;margin:0}
    .sm-speicherwarnung {position:absolute;z-index:43;left:50%;bottom:calc(var(--dockh) + 6px);transform:translateX(-50%);
      max-width:min(90%,420px);width:max-content;color:#142a32;background:#ffe0a0;border-radius:10px;padding:6px 10px;
      font-size:var(--f0);font-weight:800;pointer-events:none}
    @media (max-width:420px){.sm-karte{padding:11px 12px}.sm-aktionen .cta{flex-basis:calc(50% - 8px)}}
  `;
  document.head.append(stil);

  const warnung = document.createElement("div");
  warnung.className = "sm-speicherwarnung";
  warnung.setAttribute("role", "status");
  warnung.hidden = true;
  spiel.append(warnung);

  const lokalzeit = zeit => new Date(zeit).toLocaleString("de-CH", {dateStyle:"medium", timeStyle:"short"});
  const schwierigkeit = state => SCHWIERIGKEIT[state.schwierigkeit]?.name || "Schwierigkeit offen";
  function status(state){
    if (state.ende?.grund === "insolvenz") return "Insolvent";
    if (state.ende) return state.ende.geschafft ? "Etappenziel erreicht" : "Etappe beendet";
    return state.schwierigkeit ? "Läuft" : "Spielstart";
  }
  function beschreibung(state){
    return `${schwierigkeit(state)} · Tag ${state.tag} · Etappe ${state.etappe || 1} · ${chf(state.kasse)} · ${status(state)}`;
  }

  function knopf(text, aktion, {still = false, id, slot} = {}){
    const b = document.createElement("button");
    b.className = "cta" + (still ? " still" : "");
    b.type = "button";
    b.textContent = text;
    if (id) b.id = id;
    if (aktion) b.addEventListener("click", aktion);
    if (slot) b.setAttribute("aria-label", text + " · " + (slot.name || slotStandardname(slot.id)));
    return b;
  }

  function menueMeldung(text){
    meldung.textContent = text;
    meldung.hidden = !text;
  }
  function speicherMeldung(text){
    speicherFehler = text;
    warnung.textContent = SPEICHER.echt
      ? "Autosave fehlgeschlagen. Exportiere den Spielstand in den Einstellungen."
      : "Nur für diese Sitzung gespeichert.";
    warnung.hidden = !text;
    const fehler = $("#spielstand-fehler");
    if (fehler){
      fehler.textContent = text;
      fehler.hidden = !text;
    }
  }
  slotSpeichern = zustand => {
    if (!aktiv || zustand !== S) return false;
    try {
      const savedAt = new Date().toISOString();
      aktiv.roh = slotSchreiben(aktiv, {name:aktiv.name, savedAt, state:zustand, legacy:aktiv.legacy || undefined});
      aktiv.savedAt = savedAt;
      speicherMeldung("");
      return true;
    } catch (e){ speicherMeldung(e.message); return false; }
  };

  function exportieren({name, savedAt, state}){
    const paket = {
      saveFormat:SPIELSTAND_FORMAT, schemaVersion:SPIELSTAND_VERSION,
      exportedAt:new Date().toISOString(),
      slot:{name, savedAt, difficulty:state.schwierigkeit, day:state.tag, stage:state.etappe},
      gameState:state
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(paket, null, 2) + "\n"],
      {type:"application/json;charset=utf-8"}));
    const link = document.createElement("a");
    link.href = url;
    const dateiname = name.normalize("NFKC").replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40);
    link.download = `erzwelt-${dateiname || "spielstand"}-${paket.exportedAt.slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function alleSlots(){ return SPIELSTAND_NUMMERN.map(slotLesen); }
  function letzterSlot(slots){
    let letzter;
    try { letzter = Number(SPEICHER.lies(SPIELSTAND_LETZTER)); } catch (e){}
    const belegte = slots.filter(slot => slot.state);
    return belegte.find(slot => slot.id === letzter) ||
      belegte.sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
  }

  function karteErstellen(slot, vorschau = false){
    const karte = document.createElement("article");
    karte.className = "sm-karte";
    if (!vorschau) karte.dataset.slotId = slot.id;
    const kopf = document.createElement("h2");
    kopf.textContent = vorschau ? slot.name : `${slot.id} · ${slot.name || "Freier Speicherplatz"}`;
    karte.append(kopf);
    const details = document.createElement("p");
    details.className = "sm-details";
    details.textContent = slot.state ? beschreibung(slot.state) : slot.fehler ? "Beschädigter Spielstand" : "Leer";
    karte.append(details);
    if (slot.state){
      const zeit = document.createElement("p");
      zeit.className = "sm-details";
      zeit.textContent = `Zuletzt gespeichert ${lokalzeit(slot.savedAt)} (Ortszeit)`;
      karte.append(zeit);
    }
    return karte;
  }

  function verwalten(slot, aktionen){
    if (slot.state){
      aktionen.append(
        knopf("Fortsetzen", () => fortsetzen(slot.id), {slot}),
        knopf("Umbenennen", () => umbenennen(slot.id), {still:true, slot}),
        knopf("Exportieren", () => {
          const aktuell = slotLesen(slot.id);
          if (aktuell.state) exportieren(aktuell);
          else menueZeigen("verwalten", "Der Spielstand ist inzwischen nicht mehr verfügbar.");
        }, {still:true, slot})
      );
    }
    if (slot.roh === null) aktionen.append(knopf("Neues Spiel", () => neu(slot), {slot}));
    else if (typeof slot.roh === "string") aktionen.append(knopf("Löschen", () => loeschen(slot), {still:true, slot}));
  }

  function menueZeigen(modus = "start", hinweis = ""){
    ansichtMenue = modus;
    if (modus !== "import"){ importVorschau = null; importAnfrage++; }
    menue.hidden = false;
    spiel.inert = true;
    spiel.classList.add("spielmenue-offen");
    inhalt.replaceChildren();
    const slots = alleSlots();
    if (modus === "start"){
      titel.textContent = "Erzwelt";
      const aktionen = document.createElement("div");
      aktionen.className = "sm-menuaktionen";
      const zuletzt = letzterSlot(slots);
      if (zuletzt){
        const detail = document.createElement("p");
        detail.className = "sm-hinweis";
        detail.textContent = `${zuletzt.name} · ${schwierigkeit(zuletzt.state)} · Tag ${zuletzt.state.tag}`;
        aktionen.append(knopf("Spiel fortsetzen", () => fortsetzen(zuletzt.id), {id:"spielmenue-weiter"}), detail);
      }
      aktionen.append(
        knopf("Neues Spiel", () => menueZeigen("neu"), {still:!!zuletzt, id:"spielmenue-neu"}),
        knopf("Spielstände", () => menueZeigen("verwalten"), {still:true, id:"spielmenue-slots"}),
        knopf("JSON importieren", () => datei.click(), {still:true, id:"spielmenue-import"})
      );
      inhalt.append(aktionen);
    } else {
      titel.textContent = {neu:"Speicherplatz wählen", verwalten:"Spielstände", import:"Spielstand importieren"}[modus];
      const karten = document.createElement("div");
      karten.className = "sm-karten";
      if (modus === "import") karten.append(karteErstellen(importVorschau, true));
      const ersterFreier = slots.find(slot => slot.roh === null);
      if (ersterFreier && modus !== "verwalten"){
        const tipp = document.createElement("p");
        tipp.className = "sm-hinweis";
        tipp.textContent = "Empfohlen · freier Speicherplatz " + ersterFreier.id;
        karten.append(tipp);
      }
      for (const slot of slots){
        const karte = karteErstellen(slot);
        const aktionen = document.createElement("div");
        aktionen.className = "sm-aktionen";
        if (modus === "verwalten") verwalten(slot, aktionen);
        else {
          const frei = slot.roh === null;
          const beschriftung = modus === "import"
            ? (frei ? "Hier importieren" : "Mit Import überschreiben")
            : (frei ? "Hier starten" : "Mit neuem Spiel überschreiben");
          const b = knopf(beschriftung, () => modus === "import" ? importieren(slot) : neu(slot), {slot, still:!frei});
          b.disabled = slot.fehler && typeof slot.roh !== "string";
          aktionen.append(b);
        }
        karte.append(aktionen);
        karten.append(karte);
      }
      const zurueck = knopf("Zum Hauptmenü", () => menueZeigen(), {still:true});
      zurueck.classList.add("sm-zurueck");
      inhalt.append(karten, zurueck);
    }
    menueMeldung([hinweis, SPEICHER.echt ? "" : "Nur für diese Sitzung gespeichert. Sichere deine Spielstände als JSON-Datei."]
      .filter(Boolean).join(" "));
    titel.focus();
    menue.scrollTop = 0;
  }

  function slotErsetzen(slot, daten){
    if (slot.roh !== null && !confirm(`«${slot.name}» auf Speicherplatz ${slot.id} überschreiben?`)) return false;
    try { slotSchreiben(slot, daten); return true; }
    catch (e){ menueMeldung(e.message); return false; }
  }

  function neu(slot){
    const state = neuerZustand();
    if (!slotErsetzen(slot, {name:slotStandardname(slot.id), savedAt:new Date().toISOString(), state})) return;
    fortsetzen(slot.id, true);
  }

  function umbenennen(id){
    const slot = slotLesen(id);
    if (!slot.state) return menueZeigen("verwalten", "Der Spielstand ist nicht verfügbar.");
    const eingabe = prompt("Neuer Name für «" + slot.name + "»", slot.name);
    if (eingabe === null || eingabe === slot.name) return;
    try {
      const name = spielstandName(eingabe);
      const daten = JSON.parse(slot.roh);
      slotSchreiben(slot, {...daten, name});
      menueZeigen("verwalten", "Spielstand umbenannt.");
    } catch (e){ menueMeldung(e.message); }
  }

  function loeschen(slot){
    if (!confirm(`«${slot.name}» auf Speicherplatz ${slot.id} unwiderruflich löschen?`)) return;
    try {
      const key = slotSchluessel(slot.id);
      if (SPEICHER.lies(key) !== slot.roh) return menueZeigen("verwalten", "Der Speicherplatz wurde inzwischen geändert.");
      SPEICHER.loesch(key);
      if (SPEICHER.lies(key) !== null) throw new Error();
      menueZeigen("verwalten", "Spielstand gelöscht.");
    } catch (e){ menueMeldung("Der Spielstand konnte nicht gelöscht werden."); }
  }

  datei.addEventListener("change", async () => {
    const quelle = datei.files[0];
    datei.value = "";
    if (!quelle) return;
    const anfrage = ++importAnfrage;
    try {
      if (quelle.size > SPIELSTAND_DATEIGRENZE) throw new Error("Die Datei ist grösser als 1 MB.");
      let roh;
      try { roh = new TextDecoder("utf-8", {fatal:true}).decode(await quelle.arrayBuffer()); }
      catch (e){ throw new Error("Die Datei muss als UTF-8-JSON gespeichert sein."); }
      if (anfrage !== importAnfrage) return;
      importVorschau = spielstandDatei(roh);
      menueZeigen("import");
    } catch (e){ if (anfrage === importAnfrage) menueMeldung(e.message); }
  });

  function importieren(slot){
    if (!importVorschau || !slotErsetzen(slot, {...importVorschau, savedAt:new Date().toISOString()})) return;
    menueZeigen("verwalten", "Spielstand importiert.");
    const weiter = knopf("Jetzt fortsetzen", () => fortsetzen(slot.id), {id:"spielmenue-import-weiter"});
    inhalt.prepend(weiter);
    weiter.focus();
  }

  function spieloberflaecheSchliessen(){
    document.body.classList.remove("toast-history-open");
    $("#schleier").hidden = true;
    $("#lupe").hidden = true;
    $("#einst").hidden = true;
    offeneLupe = null;
    wissenTempoVorher = null;
    modalOffen = false;
    aktiveSeite = "karte";
    seite.hidden = true;
    seitenStand = "";
    blattZu();
    tempoSetzen(0);
    toastsZuruecksetzen();
  }

  function offenesEreignisZeigen(){
    if (!S.offenesEreignis || S.ende) return false;
    const {id, mine} = S.offenesEreignis;
    dialogZeigen(ereignis(id).bau(mine));
    return true;
  }

  function fortsetzen(id, neuBegonnen = false){
    const slot = slotLesen(id);
    if (!slot.state) return menueZeigen("verwalten", "Der Spielstand ist nicht verfügbar.");
    spieloberflaecheSchliessen();
    if (!laden(slot.state)) return menueZeigen("verwalten", "Der Spielstand konnte nicht geladen werden.");
    aktiv = slot;
    spielAktiv = true;
    produktentdeckungenInitialisieren();
    sicherungStand = null;
    verlassenAngeboten = false;
    speicherMeldung("");
    importVorschau = null;
    importAnfrage++;
    try { SPEICHER.schreib(SPIELSTAND_LETZTER, String(id)); } catch (e){}
    menue.hidden = true;
    spiel.inert = false;
    spiel.classList.remove("spielmenue-offen");
    gespeicherteMeldungenMarkieren(slot.state.log);
    letzterMeldungstag = null;
    letzterTagGezeigt = S.tag;
    letzteFoerderung = {};
    zeigeAuf("obuasi", 1.15);
    masseMessen();
    zeichnen();
    if (!S.schwierigkeit){
      metaLaden();
      if (neuBegonnen && !META.bilderIntroGesehen) bilderIntroZeigen(true);
      else schwierigkeitZeigen();
    }
    else if (S.ende) window.__erzweltLogikFixes.abschlussZeigen();
    else if (!offenesEreignisZeigen() && !produktentdeckungZeigen(1)){
      tempoSetzen(1);
      $("#einstauf").focus({preventScroll:true});
    }
  }

  function exportAktiv(){
    if (!aktiv) return;
    exportieren({name:aktiv.name, savedAt:aktiv.savedAt, state:S});
    if (verlassenAngeboten){
      sicherungStand = JSON.stringify(S);
      document.querySelectorAll('[data-spielstand="verlassen"]').forEach(el => { el.hidden = false; });
    }
  }
  function speichernUndVerlassen(neuWaehlen = false){
    if (!aktiv) return;
    tempoSetzen(0);
    const gesichert = speichern(true);
    if (gesichert && SPEICHER.echt) return spielVerlassen(neuWaehlen);
    verlassenAngeboten = true;
    const text = gesichert ? "Nur für diese Sitzung gespeichert. Exportiere eine JSON-Sicherung für später."
      : "Der aktuelle Fortschritt konnte nicht im Browser gespeichert werden. Exportiere ihn vor dem Verlassen. " + speicherFehler;
    speicherMeldung(text);
    for (const el of document.querySelectorAll(".sm-fehler")){
      el.textContent = text;
      el.hidden = false;
    }
    if (gesichert || sicherungStand === JSON.stringify(S)){
      document.querySelectorAll('[data-spielstand="verlassen"]').forEach(el => { el.hidden = false; });
    }
  }
  function spielVerlassen(neuWaehlen = false){
    spielAktiv = false;
    aktiv = null;
    spieloberflaecheSchliessen();
    menueZeigen(neuWaehlen ? "neu" : "start");
  }
  zuruecksetzen = () => speichernUndVerlassen(true);

  function dialogAktionen(bereich){
    const div = document.createElement("div");
    div.className = "sm-dialogaktionen";
    div.innerHTML = `<p class="sm-fehler notiz" role="alert" hidden></p>
      <button type="button" class="cta still" data-spielstand="menue">Speichern &amp; zum Hauptmenü</button>
      <button type="button" class="cta still" data-spielstand="export">Spielstand exportieren</button>
      <button type="button" class="cta still" data-spielstand="verlassen" hidden>Zum Hauptmenü</button>`;
    bereich.append(div);
  }

  const dialogVorher = dialogZeigen;
  dialogZeigen = function(e){
    const spielstand = S;
    dialogVorher(e);
    for (const b of $("#d-wahlen").querySelectorAll(".wahl:not([data-certificate-open])")){
      const waehlen = b.onclick;
      b.onclick = () => {
        if (spielstand !== S || !spielAktiv) return;
        waehlen();
        if (e.nachWahl){ e.nachWahl(); return; }
        if (!e.offenesEreignis) offenesEreignisZeigen();
        else if (!tempo) tempoSetzen(1);
        produktentdeckungZeigen();
      };
    }
    if (aktiv) dialogAktionen($("#d-wahlen"));
  };

  const schwierigkeitVorher = schwierigkeitZeigen;
  schwierigkeitZeigen = function(){
    schwierigkeitVorher();
    dialogAktionen($("#d-wahlen"));
  };

  const einstVorher = einstFuellen;
  einstFuellen = function(){
    einstVorher();
    $("#aktiver-spielstand").textContent = aktiv ? `${aktiv.name} · Tag ${S.tag}` : "";
    const fehler = $("#spielstand-fehler");
    fehler.textContent = speicherFehler;
    fehler.hidden = !speicherFehler;
    const verlassen = knopf("Zum Hauptmenü", undefined, {still:true});
    verlassen.dataset.spielstand = "verlassen";
    verlassen.hidden = true;
    $("#einstinhalt .karte").append(verlassen);
  };

  document.addEventListener("click", e => {
    const aktion = e.target.closest("[data-spielstand]")?.dataset.spielstand;
    if (aktion === "menue") speichernUndVerlassen();
    if (aktion === "export") exportAktiv();
    if (aktion === "verlassen" && verlassenAngeboten){
      if (!SPEICHER.echt || sicherungStand === JSON.stringify(S)) spielVerlassen();
      else speichernUndVerlassen();
    }
  });
  document.addEventListener("visibilitychange", () => {
    clearTimeout(takt);
    takt = null;
    if (!document.hidden && spielAktiv) spieltagPlanen();
  });
  menue.addEventListener("keydown", e => {
    if (e.key === "Escape" && ansichtMenue !== "start"){
      e.preventDefault();
      menueZeigen();
    }
  });
  menueZeigen("start", alteSpielstaendeUebernehmen());
})();
