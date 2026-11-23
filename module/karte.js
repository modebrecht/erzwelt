/* Erzwelt · module/karte.js – die Weltkarte
   ---------------------------------------------------------------
   Alles, was die Karte zeichnet und bedient. Früher verteilt auf
   construction-visibility, stop-safety-visual (Pins), map-focus-navigation,
   interaction-focus-final-fix, didactic-transport, den Lieferweg aus
   didactic-should, die Karten-Caches aus performance-pass und Teile aus
   premium-spielgefuehl (Rohstoff-Pins, Lieferfluss, Lieferweg-Knopf),
   handy-layout (Filter-Knopf) und sek-b-klarheit («Ziel zeigen» unter der
   Aufgabenkarte).

   Einziger Besitzer von (je eine Definition, endgültiges Ergebnis direkt):
     pinsZeichnen     Pins aller Orte samt Rohstoff-Kürzel und Farbe, Cache
                      (nur neu, wenn sich Sichtbares ändert), Filter-Punkt,
                      danach Erzwelt.nachPins-Hooks (module/basis.js)
     ansichtAnwenden  Kamera begrenzen; Transform einmal pro Frame, Pin-Grösse
                      nur bei neuem Zoom; beim Fokus («Ziel zeigen», Meldung)
                      den Ziel-Pin mittig unter die Aufgabenkarte setzen
     pinFeiern        «Neu eröffnet» und Bauzeit merken, Anzeige nachziehen
   Aus dem Kern unverändert: zeigeAuf, zoomUm, pinGroesse, Ziehen/Rad,
   Klick auf Pin, Ebenen-Chip und Zoom-Knopf.

   Nach jedem Zeichnen (ein Erzwelt.nachZeichnen-Hook, in dieser Reihenfolge):
     1. Lieferweg (Linie, Text unten links; Cache)
     2. Transportweg LKW → Schiff → LKW mit Legende (Cache)
     3. Bau- und Statusanzeige an den Pins (Ring, Abzeichen, Hinweis, aria-label)
     4. Erzwelt.nachPinStatus-Hooks (Übergangs-Animationen, premium-animation-*)
     5. Stillstand an Quellen: Streik, Sicherheitsstopp, Stillstand
     6. Lieferfluss zwischen Quellen, Raffinerien und Fabriken
     7. Lieferweg-Knopf
   Die Statusanzeige läuft nach dem Zeichnen, nicht in pinsZeichnen: Ein Klick
   auf einen Ebenen-Chip zeichnet nur die Pins neu (Kern), ihr Status kommt mit
   dem nächsten Zeichnen – wie bisher.

   Weitere Hooks (module/basis.js):
     Erzwelt.nachMeldungen   neue Meldungen mit Ortsbezug verknüpfen («map-link»),
                             dann die Aufgabenkarte abgleichen
     Erzwelt.nachHinweisen   Aufgabenkarte abgleichen (Pins und Dock blinken neu)
     Erzwelt.nachTempo       Lieferfluss anhalten/weiterlaufen lassen
   Bedienung: Antippen der Aufgabenkarte und einer Meldung führt zum Ort
   (Kamera, Fokusring, «Vorschlag», ausgeblendete Ebene wieder an); Enter und
   Leertaste auf der verknüpften Aufgabenkarte, role/tabindex und Ebenen-Chips
   im nächsten Frame; Filter-Knopf über + und −; Lieferweg-Knopf.

   Exporte: window.__erzweltKarte
     transportNeu()          Transportweg neu zeichnen (reduced-motion-final.js)
     stillstand.ursache(def, m), .rest(m), .ikon.{schild, pause, stopp}
                             Ursache und Dauer eines Stillstands
                             (Stillstand-Karte im Blatt, stop-safety-visual.js)
   Markierungen: __erzweltMapFocusNavigation (questAction, zielSymbol: module/aufgabe.js),
   __erzweltWorldStatus, __erzweltInteractionFocusFinalFix.

   Lädt an der Stelle von construction-visibility.js (Gruppe world-presentation).
   Beim Laden in der Reihenfolge der früheren Dateien: Lieferweg (noch ohne
   Cache, wie früher vor performance-pass), Transportweg (noch ohne die ruhige
   Fassung, ebenso), Statusanzeige,
   Stillstand, Meldungen verknüpfen, Tastatur-Abgleich, Filter-Knopf,
   Lieferfluss. Die Pins zeichnet erst das nächste `zeichnen` neu. */
"use strict";
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const reduziert = () => OPT.anim === 0 || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const sortiert = o => Object.keys(o || {}).sort().map(k => [k, o[k]]);
  function svgEl(tag, attrs = {}){
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }

  /* ==========================================================
     Pins
     ========================================================== */
  let filterKnopf = null;
  function filterPunkt(){
    if (!filterKnopf) return;
    const aus = Object.values(ebenen).some(v => !v);
    filterKnopf.querySelector(".filter-punkt").hidden = !aus;
    filterKnopf.setAttribute("aria-label", aus ? "Karte filtern (nicht alle Orte sichtbar)" : "Karte filtern");
  }

  function pinsNeu(){
    const teile = [];
    const jetzt = Date.now();
    const ziel = typeof hinweisZiel === "function" ? hinweisZiel() : null;
    const winkt = (art, offen, erlaubt) => {
      if (!ziel) return "";
      if (ziel === art + "-frei"  && !offen) return erlaubt === false ? "blass" : "wink";
      if (ziel === "meine-" + art &&  offen) return "wink";
      if (ziel.startsWith("dock:")) return "";
      return "blass";
    };
    const frisch = id => (jetzt - (frischePins.get(id)||0)) < 900 ? "pop" : "";
    const staub = `<span class="staub"></span><span class="staub b"></span><span class="staub c"></span>`;

    // Rohstoffquellen zeigen auch geschlossen Kürzel und Farbe ihres Rohstoffs.
    if (ebenen.mine) for (const def of MINEN){
      const [x,y] = px(def.id);
      const m = S.minen[def.id], mat = MATERIAL[def.mat];
      const streik = m && m.stillBis > S.tag;
      const foerdert = m && m.arbeiter > 0 && !streik;
      const ort = `Rohstoffquelle ${def.ort}, ${LAND[def.land].name}`;
      teile.push(`<button class="pin ${m?"":"zu"} ${streik?"alarm":""} ${foerdert?"foerdert":""} ${winkt("minen", !!m, mineErlaubt(def.id))} ${frisch(def.id)} mat-pin"
        data-pin="mine" data-id="${def.id}" style="left:${x}px;top:${y}px;--mat:${mat.farbe}" aria-label="${ort.includes(mat.name) ? ort : `${ort}, ${mat.name}`}">
        <span class="knopf" style="${m?`background:${mat.farbe};color:#fff`:""}">
          <span class="sym">${mat.sym}</span>
          ${foerdert?staub:""}
          ${m&&m.arbeiter?`<span class="crew">${m.arbeiter}</span>`:""}</span>
        <span class="bez">${flagge(def.land)}${def.ort}</span></button>`);
    }

    if (ebenen.raff) for (const def of RAFF_ORTE){
      const [x,y] = px(def.id);
      const r = S.raff[def.id];
      teile.push(`<button class="pin werk ${r?"":"zu"} ${winkt("raff", !!r)} ${frisch(def.id)}" data-pin="raff" data-id="${def.id}"
        style="left:${x}px;top:${y}px" aria-label="Raffinerie ${def.ort}, ${LAND[def.land].name}">
        <span class="knopf" style="${r?"background:#5b8f7a;color:#fff":""}">${IK.kolben}
          ${r&&r.arbeiter?`<span class="crew">${r.arbeiter}</span>`:""}</span>
        <span class="bez">${flagge(def.land)}${def.ort}</span></button>`);
    }

    if (ebenen.fab) for (const land of FAB_ORTE){
      const [x,y] = px("f_"+land);
      const meine = S.fabriken.filter(f => f.land === land);
      const crew = meine.reduce((a,f)=>a+f.arbeiter, 0);
      teile.push(`<button class="pin werk ${meine.length?"":"zu"} ${winkt("fab", !!meine.length)} ${frisch("f_"+land)}"
        data-pin="fab" data-id="${land}" style="left:${x}px;top:${y}px" aria-label="Fabrikstandort ${LAND[land].name}">
        <span class="knopf" style="${meine.length?"background:#b5703c;color:#fff":""}">${IK.fabrik}
          ${crew?`<span class="crew">${crew}</span>`:""}</span>
        <span class="bez">${flagge(land)}${LAND[land].name}</span></button>`);
    }

    welt.querySelectorAll(".pin").forEach(p => p.remove());
    welt.insertAdjacentHTML("beforeend", teile.join(""));
    pinGroesse();
  }

  /* Cache: Nur was auf den Pins zu sehen ist, zählt. Kasse, Lager, Zufriedenheit
     und Ausbau bauen die Pins nicht neu. */
  let pinStand = "";
  pinsZeichnen = function(){
    const stand = JSON.stringify([
      S.tutorial,
      sortiert(S.minen).map(([id,m]) => [id, m.arbeiter, m.stillBis > S.tag ? 1 : 0]),
      sortiert(S.raff).map(([id,r]) => [id, r.arbeiter]),
      S.fabriken.map(f => [f.produkt, f.land, f.arbeiter]),
      ebenen.mine?1:0, ebenen.raff?1:0, ebenen.fab?1:0
    ]);
    if (stand !== pinStand){ pinStand = stand; pinsNeu(); }
    filterPunkt();
    Erzwelt.pinsGezeichnet();
  };

  /* ==========================================================
     Kamera
     ========================================================== */
  /* Die Lage wird sofort begrenzt, das Transform aber nur einmal pro Frame
     gesetzt; die Pin-Grösse nur, wenn sich der Zoom geändert hat. */
  let ansichtFrame = 0, pinZoom = NaN;
  function ansichtSetzen(){
    const b = sicht.clientWidth, hh = sicht.clientHeight;
    const zmin = Math.max(b/KARTE_B, 0.95), zmax = 4.5;
    ansicht.z = Math.min(zmax, Math.max(zmin, ansicht.z));
    const bb = KARTE_B*ansicht.z, bh = KARTE_H*ansicht.z;
    ansicht.x = bb <= b ? (b-bb)/2 : Math.min(0, Math.max(b-bb, ansicht.x));
    ansicht.y = bh <= hh ? (hh-bh)/2 : Math.min(0, Math.max(hh-bh, ansicht.y));
    if (ansichtFrame) return;
    ansichtFrame = requestAnimationFrame(() => {
      ansichtFrame = 0;
      welt.style.transform = `translate(${ansicht.x}px,${ansicht.y}px) scale(${ansicht.z})`;
      if (!Number.isFinite(pinZoom) || Math.abs(ansicht.z - pinZoom) > 0.0001){
        pinGroesse();
        pinZoom = ansicht.z;
      }
    });
  }

  /* «Ziel zeigen» nicht hinter der Aufgabenkarte: Der Fokus (kameraAuf) rechnet
     mit der Ecke des Pins. Hier wird der Ziel-Pin aus der Kamera-Formel
     zurückgerechnet und so gesetzt, dass sein sichtbarer Kopf mittig unter der
     Aufgabenkarte erscheint. */
  let fokusZuletzt = 0, fokusTimer = 0;
  ansichtAnwenden = function(){
    const fokus = welt.classList.contains("map-focus-moving");
    if (!fokus || Date.now() - fokusZuletzt < 700 || aktiveSeite !== "karte") return ansichtSetzen();
    fokusZuletzt = Date.now();
    const W = sicht.clientWidth;
    const hud = document.getElementById("hud")?.offsetHeight || 56;
    const dock = document.getElementById("dock")?.offsetHeight || 86;
    const oben = hud + 8, unten = Math.max(oben + 80, sicht.clientHeight - dock - 8);
    const alt = oben + (unten - oben) * .48;
    const px = (W * .5 - ansicht.x) / ansicht.z, py = (alt - ansicht.y) / ansicht.z;
    const pin = [...document.querySelectorAll("#welt .pin")].find(p =>
      Math.abs(p.offsetLeft + p.offsetWidth / 2 - px) < 3 && Math.abs(p.offsetTop + Math.min(28, p.offsetHeight / 2) - py) < 3);
    const kopf = pin && (pin.querySelector(".knopf") || pin);
    if (!kopf) return ansichtSetzen();

    let zielY = alt;
    const q = document.getElementById("quest");
    const s = sicht.getBoundingClientRect();
    if (q && !q.hidden && !q.classList.contains("breit")){
      const r = q.getBoundingClientRect();
      const kartenUnten = r.bottom - s.top;
      const deckt = r.left - s.left < W / 2 + 40 && r.right - s.left > W / 2 - 40 && kartenUnten > alt - 50;
      if (deckt && kartenUnten + 70 < unten) zielY = kartenUnten + (unten - kartenUnten) * .42;
    }
    // Der Pin hängt an seinem unteren Mittelpunkt und wird mit k/z skaliert (pinGroesse).
    const zmin = Math.max(W / KARTE_B, 0.95);
    const z = Math.min(4.5, Math.max(zmin, ansicht.z));
    const sk = Math.max(0.62, Math.min(1, 0.45 + z * 0.55)) / z;
    const kopfX = (kopf === pin ? 0 : kopf.offsetLeft + kopf.offsetWidth / 2 - pin.offsetWidth / 2) * sk;
    const kopfY = (pin.offsetHeight - (kopf === pin ? pin.offsetHeight / 2 : kopf.offsetTop + kopf.offsetHeight / 2)) * sk;
    const weltX = pin.offsetLeft + kopfX, weltY = pin.offsetTop - kopfY;
    ansicht.z = z;
    ansicht.x = W / 2 - weltX * z;
    ansicht.y = zielY - weltY * z;
    document.body.classList.add("ziel-fokus");
    clearTimeout(fokusTimer);
    fokusTimer = setTimeout(() => document.body.classList.remove("ziel-fokus"), 2600);
    return ansichtSetzen();
  };

  /* ==========================================================
     Bau- und Statusanzeige an den Pins
     Nur Darstellung aus Bau-, Personal- und Materialstand; keine Bauzeit dazu.
     Rohstoffquelle und Raffinerie sind sofort eingerichtet, nur Fabriken bauen.
     ========================================================== */
  const RING = 2*Math.PI*21;
  const bauGesamt = new WeakMap();
  const NEU_MS = 1800;
  const klemme = (v, a, b) => Math.max(a, Math.min(b, v));
  const werkzeug = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.2 8.9 2l3.2 3.1-2 2 8.2 8.2-3 3-8.2-8.2-2.1 2L2 9z" fill="currentColor"/><path d="m13.8 16.8 1.8-1.8 4.2 4.2-1.8 1.8z" fill="currentColor" opacity=".58"/></svg>`;
  function ring(fortschritt){
    const p = klemme(Number(fortschritt)||0, 0, 1), dash = (RING*p).toFixed(1);
    return `<svg class="pin-status-ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="ring-bg" cx="24" cy="24" r="21"/><circle class="ring-fg" cx="24" cy="24" r="21" stroke-dasharray="${dash} ${RING.toFixed(1)}"/></svg>`;
  }
  const frischEroeffnet = id => Date.now() - (frischePins.get(id)||0) < NEU_MS;
  function grundLabel(pin){
    if (!pin.dataset.baseAria) pin.dataset.baseAria = pin.getAttribute("aria-label") || "Standort";
    return pin.dataset.baseAria;
  }
  function statusWeg(pin){
    pin.classList.remove("bau-status","neu-status","inaktiv-status","aktiv-status","world-warn-status");
    pin.style.removeProperty("--pin-status");
    pin.querySelectorAll(".pin-status-ring,.pin-state-badge,.pin-build-tool,.pin-status-hint").forEach(el => el.remove());
  }
  function statusSetzen(pin, st){
    if (!pin) return;
    const key = JSON.stringify(st);
    if (pin.dataset.worldStateKey === key && pin.querySelector(".pin-state-badge,.pin-status-ring,.pin-build-tool")) return;
    pin.dataset.worldStateKey = key;
    statusWeg(pin);
    const base = grundLabel(pin);
    const knopf = pin.querySelector(".knopf");

    if (st.kind === "bau"){
      pin.classList.add("bau-status"); pin.style.setProperty("--pin-status", "#f5b73d");
      knopf?.insertAdjacentHTML("beforeend", ring(st.progress));
      knopf?.insertAdjacentHTML("beforeend", `<span class="pin-state-badge status-bau">${st.count>1?st.count+"× · ":""}${st.rest} T</span><span class="pin-build-tool">${werkzeug()}</span>`);
      pin.insertAdjacentHTML("beforeend", `<span class="pin-status-hint">Im Bau</span>`);
      pin.setAttribute("aria-label", `${base}. Im Bau, noch ${st.rest} ${st.rest===1?"Tag":"Tage"}${st.count>1?`, ${st.count} Bauprojekte`:""}.`);
      return;
    }
    if (st.kind === "neu"){
      pin.classList.add("neu-status");
      knopf?.insertAdjacentHTML("beforeend", `<span class="pin-state-badge">Neu</span><span class="pin-build-tool">${werkzeug()}</span>`);
      pin.insertAdjacentHTML("beforeend", `<span class="pin-status-hint">Neu eröffnet</span>`);
      pin.setAttribute("aria-label", `${base}. Neu eröffnet.`); return;
    }
    if (st.kind === "warn"){
      pin.classList.add("world-warn-status"); pin.style.setProperty("--pin-status", "#e0504a");
      knopf?.insertAdjacentHTML("beforeend", `<span class="pin-state-badge status-warn">!</span>`);
      pin.insertAdjacentHTML("beforeend", `<span class="pin-status-hint">${st.label}</span>`);
      pin.setAttribute("aria-label", `${base}. ${st.label}.`); return;
    }
    if (st.kind === "inaktiv"){
      pin.classList.add("inaktiv-status");
      knopf?.insertAdjacentHTML("beforeend", `<span class="pin-state-badge status-inaktiv">${st.badge}</span>`);
      pin.insertAdjacentHTML("beforeend", `<span class="pin-status-hint">${st.label}</span>`);
      pin.setAttribute("aria-label", `${base}. ${st.label}.`); return;
    }
    if (st.kind === "aktiv"){
      pin.classList.add("aktiv-status");
      knopf?.insertAdjacentHTML("beforeend", `<span class="pin-state-badge status-aktiv">aktiv</span>`);
      pin.setAttribute("aria-label", `${base}. Aktiv.`); return;
    }
    pin.setAttribute("aria-label", base);
  }
  function bauzeitGesamt(f){
    if (bauGesamt.has(f)) return bauGesamt.get(f);
    const def = PRODUKT[f.produkt];
    let schaetzung = Math.max(3, Math.round((def?.bauzeit||f.restbau||3) * (typeof perkMult === "function" ? perkMult("bauzeit") : 1)));
    schaetzung = Math.max(f.restbau||0, schaetzung);
    bauGesamt.set(f, schaetzung); return schaetzung;
  }
  function fabrikLaeuft(f){
    if (!f || f.restbau > 0 || f.arbeiter <= 0) return false;
    const def = PRODUKT[f.produkt];
    return Object.keys(def?.rezept||{}).every(k => (S.mat[k]||0) >= (def.rezept[k]||0));
  }
  const pinVon = (art, id) => welt.querySelector(`.pin[data-pin="${art}"][data-id="${id}"]`);
  function quelleStatus(def){
    const m = S.minen[def.id]; if (!m) return;
    const pin = pinVon("mine", def.id); if (!pin) return;
    if (frischEroeffnet(def.id)) return statusSetzen(pin, {kind:"neu"});
    if (m.stillBis > S.tag) return statusSetzen(pin, {kind:"warn", label:"Förderung gestoppt"});
    if (m.arbeiter <= 0) return statusSetzen(pin, {kind:"inaktiv", badge:"0 P", label:"Kein Personal"});
    return statusSetzen(pin, {kind:"aktiv"});
  }
  function raffStatus(def){
    const r = S.raff[def.id]; if (!r) return;
    const pin = pinVon("raff", def.id); if (!pin) return;
    if (frischEroeffnet(def.id)) return statusSetzen(pin, {kind:"neu"});
    if (r.arbeiter <= 0) return statusSetzen(pin, {kind:"inaktiv", badge:"0 P", label:"Kein Personal"});
    if (!Object.values(S.erz||{}).some(v => v > .5)) return statusSetzen(pin, {kind:"inaktiv", badge:"0 R", label:"Kein Rohstoff"});
    return statusSetzen(pin, {kind:"aktiv"});
  }
  function fabrikStatus(land){
    const liste = S.fabriken.filter(f => f.land === land); if (!liste.length) return;
    const pin = pinVon("fab", land); if (!pin) return;
    const imBau = liste.filter(f => f.restbau > 0);
    if (imBau.length){
      const naechste = imBau.slice().sort((a,b) => a.restbau - b.restbau)[0];
      const fortschritt = 1 - klemme(naechste.restbau / Math.max(1, bauzeitGesamt(naechste)), 0, 1);
      return statusSetzen(pin, {kind:"bau", rest:naechste.restbau, count:imBau.length, progress:Number(fortschritt.toFixed(3))});
    }
    const fertig = liste.filter(f => f.restbau <= 0);
    if (!fertig.length) return;
    if (fertig.some(fabrikLaeuft)) return statusSetzen(pin, {kind:"aktiv"});
    if (fertig.every(f => f.arbeiter <= 0)) return statusSetzen(pin, {kind:"inaktiv", badge:"0 P", label:"Kein Personal"});
    return statusSetzen(pin, {kind:"inaktiv", badge:"0 M", label:"Material fehlt"});
  }
  function statusZeigen(){
    for (const def of MINEN) if (S.minen[def.id]) quelleStatus(def);
    for (const def of RAFF_ORTE) if (S.raff[def.id]) raffStatus(def);
    for (const land of FAB_ORTE) if (S.fabriken.some(f => f.land === land)) fabrikStatus(land);
  }

  pinFeiern = function(id){
    frischePins.set(id, Date.now());
    if (String(id).startsWith("f_")){
      const land = String(id).slice(2);
      S.fabriken.filter(f => f.land === land && f.restbau > 0).forEach(f => { if (!bauGesamt.has(f)) bauGesamt.set(f, f.restbau); });
    }
    setTimeout(statusZeigen, 40);
    setTimeout(statusZeigen, NEU_MS + 80);
  };

  /* ==========================================================
     Stillstand an Rohstoffquellen: Streik (Lohn, Zufriedenheit) getrennt von
     Sicherheitsstopp (Unfall). Ursache aus Spielstand, offenem Dialog und S.log.
     ========================================================== */
  const IKON_SCHILD = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6z" fill="currentColor" opacity=".18"/><path d="M12 2.8 19 5.6v5.8c0 4.7-2.9 8-7 9.8-4.1-1.8-7-5.1-7-9.8V5.6zM12 7v5m0 3.3v.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const IKON_PAUSE = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>`;
  const IKON_STOPP = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7 17 10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const stillVorher = new Map();
  const effektTimer = new WeakMap();
  function nurText(html){
    const d = document.createElement("div"); d.innerHTML = String(html||"");
    return (d.textContent||"").replace(/\s+/g, " ").trim();
  }
  function ursache(def, m){
    const ort = String(def?.ort||"").toLowerCase();
    const dialogTitel = (document.getElementById("d-titel")?.textContent||"").toLowerCase();
    const dialogArt = (document.getElementById("d-art")?.textContent||"").toLowerCase();
    if (modalOffen && (!ort || dialogTitel.includes(ort))){
      if (dialogArt.includes("unfall") || dialogTitel.includes("unfall")) return "sicherheit";
      if (dialogArt.includes("protest") || dialogTitel.includes("streik")) return "streik";
    }
    for (const e of (S?.log||[])){
      const t = nurText(e.text).toLowerCase();
      if (ort && !t.includes(ort)) continue;
      if (/sicherheit|sicherheits|notreparatur|unfall|entschäd/.test(t)) return "sicherheit";
      if (/streik|einigung|prämie|lohn/.test(t)) return "streik";
    }
    if ((m?.zufriedenheit ?? 100) < 32) return "streik";
    return "stillstand";
  }
  function restText(m){
    if (!m || m.stillBis <= S.tag) return "";
    const rest = Math.max(0, Math.round(m.stillBis - S.tag));
    if (rest > 300) return "Entscheidung offen";
    return `${rest} ${rest===1?"Tag":"Tage"}`;
  }
  function stillWeg(pin){
    pin.classList.remove("mine-stop","mine-stop-strike","mine-stop-safety","mine-stop-generic");
    pin.querySelector(".pin-stop-kind")?.remove();
  }
  function stillEffekt(pin, art){
    if (!pin || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    pin.querySelector(".mine-stop-fx,.mine-resume-fx")?.remove();
    const el = document.createElement("span");
    el.className = art === "resume" ? "mine-resume-fx" : "mine-stop-fx rein";
    pin.querySelector(".knopf")?.appendChild(el);
    const alt = effektTimer.get(pin); if (alt) clearTimeout(alt);
    effektTimer.set(pin, setTimeout(() => { el.remove(); effektTimer.delete(pin); }, 900));
  }
  function quelleStill(def){
    const m = S?.minen?.[def.id];
    const pin = document.querySelector(`#welt .pin[data-pin="mine"][data-id="${def.id}"]`);
    if (!m || !pin) return;
    const steht = m.stillBis > S.tag;
    const vorher = stillVorher.get(def.id) || false;
    if (!steht){
      if (vorher) stillEffekt(pin, "resume");
      stillWeg(pin); stillVorher.set(def.id, false); return;
    }
    const grund = ursache(def, m), rest = restText(m);
    stillWeg(pin);
    pin.classList.add("mine-stop", grund === "streik" ? "mine-stop-strike" : grund === "sicherheit" ? "mine-stop-safety" : "mine-stop-generic");
    const abzeichen = pin.querySelector(".pin-state-badge.status-warn");
    if (abzeichen) abzeichen.textContent = grund === "sicherheit" ? "!" : "II";
    const hinweis = pin.querySelector(".pin-status-hint");
    const label = grund === "streik" ? `Streik${rest?" · "+rest:""}` : grund === "sicherheit" ? `Sicherheitsstopp${rest?" · "+rest:""}` : `Stillstand${rest?" · "+rest:""}`;
    if (hinweis) hinweis.textContent = label;
    let art = pin.querySelector(".pin-stop-kind");
    if (!art){ art = document.createElement("span"); art.className = "pin-stop-kind"; pin.querySelector(".knopf")?.appendChild(art); }
    art.innerHTML = grund === "sicherheit" ? IKON_SCHILD() : grund === "streik" ? IKON_PAUSE() : IKON_STOPP();
    const base = pin.dataset.baseAria || pin.getAttribute("aria-label") || "Rohstoffquelle";
    pin.setAttribute("aria-label", `${base.split(". Förderung gestoppt")[0]}. ${label}. Förderung gestoppt.`);
    if (!vorher) stillEffekt(pin, "stop");
    stillVorher.set(def.id, true);
  }
  function stillstandZeigen(){
    for (const def of MINEN) if (S.minen?.[def.id]) quelleStill(def);
  }

  /* ==========================================================
     Lieferweg: Beispielkette Quelle → Raffinerie → Fabrik (nur Orientierung:
     keine Transportkosten, keine Lieferzeiten)
     ========================================================== */
  function kmDistanz(idA, idB){
    const a = ORT[idA], b = ORT[idB]; if (!a || !b) return 0;
    const rad = x => x*Math.PI/180, dLat = rad(b[1]-a[1]), dLon = rad(b[0]-a[0]);
    const q = Math.sin(dLat/2)**2 + Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dLon/2)**2;
    return 6371*2*Math.atan2(Math.sqrt(q), Math.sqrt(1-q));
  }
  // Was den Weg bestimmt; Cache für beispielKette und den Lieferweg.
  const wegStand = () => JSON.stringify([
    tutorialLaeuft() ? S.tutorial : -1,
    Object.keys(S.minen).sort(), Object.keys(S.raff).sort(),
    S.fabriken.map(f => [f.produkt, f.land, f.restbau===0 ? 0 : 1])
  ]);
  let ketteStand = "", ketteWert = null;
  function beispielKette(){
    const stand = wegStand();
    if (stand === ketteStand) return ketteWert;
    ketteStand = stand;
    ketteWert = (() => {
      if (tutorialLaeuft()) return null;
      const fabrik = S.fabriken.find(f => f.restbau === 0); if (!fabrik) return null;
      const fabId = "f_" + fabrik.land; if (!ORT[fabId]) return null;
      const rezept = Object.keys(PRODUKT[fabrik.produkt].rezept);
      const mineIds = offeneMinen().filter(id => rezept.includes(MINEN.find(x => x.id === id)?.mat)), raffIds = Object.keys(S.raff);
      if (!mineIds.length || !raffIds.length) return null;
      let best = null;
      for (const mineId of mineIds){
        const mat = MINEN.find(x => x.id === mineId).mat;
        for (const raffId of raffIds){
          const bonus = (RAFF_SPEZIAL[raffId]||[]).includes(mat) ? 0.85 : 1, d1 = kmDistanz(mineId, raffId), d2 = kmDistanz(raffId, fabId), score = (d1+d2)*bonus;
          if (!best || score < best.score) best = {mineId, raffId, fabId, mat, d1, d2, score, fabrik};
        }
      }
      return best;
    })();
    return ketteWert;
  }
  const kette = () => { try { return beispielKette(); } catch (e){ return null; } };

  function lieferwegRoh(){
    const svg = document.querySelector("svg.weltkarte"); if (!svg) return;
    svg.querySelector("#didaktik-lieferweg")?.remove();
    let note = document.getElementById("didaktik-route-note");
    if (!note){
      note = document.createElement("div"); note.id = "didaktik-route-note";
      note.style.cssText = "position:absolute;left:10px;bottom:calc(var(--dockh) + 10px);z-index:12;max-width:min(310px,calc(100vw - 82px));background:#fffaf0ee;color:#241c14;border:1px solid #d9c9aa;border-radius:14px;padding:8px 10px;box-shadow:0 3px 12px #0002;font-size:var(--f0);font-weight:700;line-height:1.3;pointer-events:none";
      document.getElementById("sicht")?.appendChild(note);
    }
    const r = beispielKette(), sichtbar = !!r && aktiveSeite === "karte" && !offenesBlatt; note.hidden = !sichtbar; if (!sichtbar) return;
    const [x1,y1] = px(r.mineId), [x2,y2] = px(r.raffId), [x3,y3] = px(r.fabId);
    const g = document.createElementNS(NS, "g");
    g.id = "didaktik-lieferweg"; g.setAttribute("pointer-events", "none");
    const linie = (a,b,c,d) => { const l = document.createElementNS(NS, "line"); l.setAttribute("x1",a); l.setAttribute("y1",b); l.setAttribute("x2",c); l.setAttribute("y2",d); l.setAttribute("stroke","#f08c2e"); l.setAttribute("stroke-width","4"); l.setAttribute("stroke-dasharray","9 7"); l.setAttribute("opacity",".72"); return l; };
    g.appendChild(linie(x1,y1,x2,y2)); g.appendChild(linie(x2,y2,x3,y3)); svg.appendChild(g);
    const mine = MINEN.find(x => x.id === r.mineId), raff = RAFF_ORTE.find(x => x.id === r.raffId), km = (Math.round((r.d1+r.d2)/100)*100).toLocaleString("de-CH");
    note.innerHTML = `<b>Beispielweg auf der Karte</b><br>${mine.ort} → ${raff.ort} → ${LAND[r.fabrik.land].name} · ca. ${km} km<br><span style="font-weight:600;color:#6b5f50">Die Entfernung dient der geografischen Orientierung. Transportkosten und Lieferzeiten werden nicht berechnet.</span>`;
  }
  let lieferwegStand = "";
  function lieferwegZeichnen(){
    const stand = wegStand() + "|" + aktiveSeite + "|" + (offenesBlatt ? `${offenesBlatt.art}:${offenesBlatt.id}` : "-");
    if (stand === lieferwegStand) return;
    lieferwegStand = stand;
    lieferwegRoh();
  }

  /* ---------- Transportweg LKW → Schiff → LKW ---------- */
  const punktZwischen = (a, b, t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t];
  function kurvenPfad(a, b, bogen = .11){
    const dx = b[0]-a[0], dy = b[1]-a[1], len = Math.max(1, Math.hypot(dx, dy));
    const mx = (a[0]+b[0])/2, my = (a[1]+b[1])/2;
    const nx = -dy/len, ny = dx/len;
    const offset = Math.min(46, len*bogen);
    const cx = mx+nx*offset, cy = my+ny*offset;
    return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  function lastwagen(){
    const g = svgEl("g", {class:"didaktik-truck"});
    g.appendChild(svgEl("ellipse", {cx:0, cy:8, rx:15, ry:3, fill:"#000", opacity:.16}));
    const body = svgEl("g", {transform:"translate(0 0)"});
    body.appendChild(svgEl("rect", {x:-14, y:-7, width:18, height:10, rx:2.5, fill:"#f08c2e", stroke:"#7f461b", "stroke-width":1.4}));
    body.appendChild(svgEl("rect", {x:4, y:-5, width:8, height:8, rx:2, fill:"#f5b73d", stroke:"#7f461b", "stroke-width":1.4}));
    body.appendChild(svgEl("path", {d:"M6 -5h4l2 4H6Z", fill:"#bfe0f0", stroke:"#7f461b", "stroke-width":.8}));
    body.appendChild(svgEl("rect", {x:-12, y:-4.8, width:14, height:5.8, rx:1.2, fill:"#d96937", opacity:.95}));
    for (const x of [-9, 7]){
      const rad = svgEl("g", {transform:`translate(${x} 4)`});
      rad.appendChild(svgEl("circle", {r:3.3, fill:"#24313a", stroke:"#fffaf0", "stroke-width":1}));
      rad.appendChild(svgEl("circle", {r:1.15, fill:"#a9b4bd"}));
      const speiche = svgEl("path", {d:"M-2.1 0H2.1M0-2.1V2.1", stroke:"#dce2e6", "stroke-width":.7, "stroke-linecap":"round"});
      speiche.appendChild(svgEl("animateTransform", {attributeName:"transform", type:"rotate", from:"0 0 0", to:"360 0 0", dur:".7s", repeatCount:"indefinite"}));
      rad.appendChild(speiche); body.appendChild(rad);
    }
    body.appendChild(svgEl("animateTransform", {attributeName:"transform", type:"translate", values:"0 0;0 -1;0 0", dur:".9s", repeatCount:"indefinite"}));
    g.appendChild(body);
    return g;
  }
  function schiff(){
    const g = svgEl("g", {class:"didaktik-ship"});
    g.appendChild(svgEl("ellipse", {cx:0, cy:9, rx:17, ry:3, fill:"#000", opacity:.13}));
    const boot = svgEl("g");
    boot.appendChild(svgEl("path", {d:"M-18 1H18L12 9H-12Z", fill:"#2f6f8f", stroke:"#143b51", "stroke-width":1.5, "stroke-linejoin":"round"}));
    boot.appendChild(svgEl("rect", {x:-8, y:-7, width:9, height:8, rx:1.6, fill:"#f4f0e7", stroke:"#143b51", "stroke-width":1.1}));
    boot.appendChild(svgEl("rect", {x:-6.2, y:-5.2, width:5.4, height:2.4, rx:.5, fill:"#9fd3eb"}));
    const farben = ["#f08c2e","#d94a80","#2fbe7e","#f5b73d"];
    [-2, 5].forEach((x, reihe) => [-9, -3, 3, 9].forEach((cx, i) => boot.appendChild(svgEl("rect", {x:cx, y:-1-reihe*3.4, width:5, height:2.8, rx:.45, fill:farben[(i+reihe)%farben.length], stroke:"#ffffff80", "stroke-width":.35}))));
    boot.appendChild(svgEl("path", {d:"M-20 10q5 3 10 0t10 0t10 0t10 0", fill:"none", stroke:"#ffffff", "stroke-width":1.4, opacity:.72, "stroke-linecap":"round"}));
    boot.appendChild(svgEl("animateTransform", {attributeName:"transform", type:"translate", values:"0 -1.2;0 1.2;0 -1.2", dur:"1.8s", repeatCount:"indefinite"}));
    g.appendChild(boot);
    return g;
  }
  const fahrzeug = art => art === "ship" ? schiff() : lastwagen();
  function fahrt(eltern, art, pfad, dauer, start){
    const ikon = fahrzeug(art);
    ikon.setAttribute("opacity", ".98");
    ikon.appendChild(svgEl("animateMotion", {path:pfad, dur:`${dauer}s`, begin:`${start}s`, repeatCount:"indefinite", rotate:"auto", calcMode:"spline", keyTimes:"0;0.08;0.92;1", keyPoints:"0;0.03;0.97;1", keySplines:"0.22 0.61 0.36 1;0.2 0.8 0.2 1;0.22 0.61 0.36 1"}));
    ikon.appendChild(svgEl("animate", {attributeName:"opacity", values:"0;1;1;0", keyTimes:"0;0.08;0.9;1", dur:`${dauer}s`, begin:`${start}s`, repeatCount:"indefinite"}));
    eltern.appendChild(ikon);
  }
  /* Bei «Animationen: ruhig» nur der erste Punkt je Wegstück und stille Knoten –
     nicht beim ersten Zeichnen während des Ladens: Das geschah früher, bevor
     performance-pass.js die ruhige Fassung einsetzte, und der Weg bleibt so stehen,
     bis er sich ändert (Cache). */
  let ruhigMoeglich = false;
  let punktPfad = "", punktZahl = 0;
  function flusspunkt(eltern, pfad, dauer, start, farbe, groesse = 3.2){
    if (ruhigMoeglich){
      if (pfad !== punktPfad){ punktPfad = pfad; punktZahl = 0; }
      punktZahl++;
      if (OPT.anim === 1 && punktZahl > 1) return;
    }
    const c = svgEl("circle", {r:groesse, fill:farbe, opacity:.9});
    c.appendChild(svgEl("animateMotion", {path:pfad, dur:`${dauer}s`, begin:`${start}s`, repeatCount:"indefinite", rotate:"auto"}));
    c.appendChild(svgEl("animate", {attributeName:"opacity", values:"0;.9;.9;0", keyTimes:"0;.1;.88;1", dur:`${dauer}s`, begin:`${start}s`, repeatCount:"indefinite"}));
    eltern.appendChild(c);
  }
  function route(eltern, pfad, farbe, breite = 4){
    eltern.appendChild(svgEl("path", {d:pfad, fill:"none", stroke:"#fff3c7", "stroke-width":10, "stroke-linecap":"round", opacity:.20}));
    const basis = svgEl("path", {d:pfad, fill:"none", stroke:farbe, "stroke-width":breite, "stroke-linecap":"round", "stroke-dasharray":"12 10", opacity:.78});
    basis.appendChild(svgEl("animate", {attributeName:"stroke-dashoffset", from:"0", to:"-44", dur:"2.4s", repeatCount:"indefinite"}));
    eltern.appendChild(basis);
  }
  /* Knoten: pulsierender Ring; bei «ruhig» ein stiller, blasser Ring. */
  function knoten(eltern, p, farbe){
    const g = svgEl("g", {transform:`translate(${p[0]} ${p[1]})`});
    if (ruhigMoeglich && OPT.anim === 1){
      g.appendChild(svgEl("circle", {r:7, fill:"none", stroke:farbe, "stroke-width":1.6, opacity:.35}));
    } else {
      const ring = svgEl("circle", {r:8, fill:"none", stroke:farbe, "stroke-width":2, opacity:.52});
      ring.appendChild(svgEl("animate", {attributeName:"r", values:"7;13;7", dur:"2.2s", repeatCount:"indefinite"}));
      ring.appendChild(svgEl("animate", {attributeName:"opacity", values:".6;.05;.6", dur:"2.2s", repeatCount:"indefinite"}));
      g.appendChild(ring);
    }
    g.appendChild(svgEl("circle", {r:3.2, fill:farbe, stroke:"#fffaf0", "stroke-width":1.5}));
    eltern.appendChild(g);
  }
  function stehendesFahrzeug(eltern, art, a, b, t){
    const p = punktZwischen(a, b, t), ikon = fahrzeug(art);
    ikon.setAttribute("transform", `translate(${p[0]} ${p[1]})`);
    eltern.appendChild(ikon);
  }
  function legende(sichtbar){
    let el = document.getElementById("didaktik-transport-legende");
    if (!el){
      el = document.createElement("div");
      el.id = "didaktik-transport-legende";
      el.style.cssText = "position:absolute;right:10px;bottom:calc(var(--dockh) + 10px);z-index:12;background:#0b3648e8;color:white;border:1px solid #ffffff30;border-radius:13px;padding:7px 9px;box-shadow:0 3px 12px #0003;font-size:var(--f0);font-weight:800;line-height:1.25;pointer-events:none;max-width:205px;backdrop-filter:blur(6px)";
      document.getElementById("sicht")?.appendChild(el);
    }
    el.hidden = !sichtbar;
    if (sichtbar) el.innerHTML = "<b>Transportweg</b><br><span style='font-weight:700'>LKW → Schiff → LKW</span><br><span style='font-weight:600;opacity:.78'>Darstellung ohne Transportkosten und Lieferzeiten</span>";
  }
  function routenNotiz(r){
    const note = document.getElementById("didaktik-route-note");
    if (!note || note.hidden || !r) return;
    const mineDef = MINEN.find(x => x.id === r.mineId), raffDef = RAFF_ORTE.find(x => x.id === r.raffId);
    if (!mineDef || !raffDef) return;
    note.innerHTML = `<b>Beispiel einer Lieferkette</b><br>LKW ${mineDef.ort} → Schiff ${raffDef.ort} → LKW ${LAND[r.fabrik.land].name}<br><span style="font-weight:600;color:#6b5f50">Die Entfernung dient der geografischen Orientierung. Transportkosten und Lieferzeiten werden nicht berechnet.</span>`;
  }
  let transportStand = "";
  function transportZeichnen(){
    const svg = document.querySelector("svg.weltkarte");
    if (!svg) return;
    const r = beispielKette();
    const sichtbar = !!r && aktiveSeite === "karte" && !offenesBlatt && !tutorialLaeuft();
    legende(sichtbar);
    if (!sichtbar){
      svg.querySelector("#didaktik-transport")?.remove();
      transportStand = "";
      return;
    }
    const still = OPT.anim === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stand = [r.mineId, r.raffId, r.fabId, r.mat, still?1:0, OPT.anim].join("|");
    routenNotiz(r);
    if (stand === transportStand && svg.querySelector("#didaktik-transport")) return;
    transportStand = stand;
    svg.querySelector("#didaktik-transport")?.remove();

    const g = svgEl("g", {id:"didaktik-transport", "pointer-events":"none"});
    const mine = px(r.mineId), raff = px(r.raffId), fab = px(r.fabId);
    const umschlag = punktZwischen(raff, fab, .76);
    const p1 = kurvenPfad(mine, raff, .08), p2 = kurvenPfad(raff, umschlag, .14), p3 = kurvenPfad(umschlag, fab, -.08);
    route(g, p1, "#f08c2e", 4.2);
    route(g, p2, "#6fb8e0", 4.5);
    route(g, p3, "#f08c2e", 4.2);
    knoten(g, mine, "#f08c2e");
    knoten(g, raff, "#5b8f7a");
    knoten(g, fab, "#b5703c");
    if (still){
      stehendesFahrzeug(g, "truck", mine, raff, .52);
      stehendesFahrzeug(g, "ship", raff, umschlag, .52);
      stehendesFahrzeug(g, "truck", umschlag, fab, .52);
    } else {
      fahrt(g, "truck", p1, 7.2, 0);
      fahrt(g, "ship", p2, 10.4, 1.15);
      fahrt(g, "truck", p3, 4.6, 2.35);
      [0, 1.35, 2.7].forEach(d => flusspunkt(g, p1, 6.4, d, "#ffd17a", 2.7));
      [0.5, 2.3, 4.1].forEach(d => flusspunkt(g, p2, 8.8, d, "#d7f0ff", 3.0));
      [0.4, 1.7].forEach(d => flusspunkt(g, p3, 4.1, d, "#ffd17a", 2.7));
    }
    svg.appendChild(g);
  }
  const transportNeu = () => { transportStand = ""; transportZeichnen(); };

  /* ---------- Lieferfluss: Von jeder fördernden Quelle zur nächsten Raffinerie,
     von dort zu jeder laufenden Fabrik. Steht die Zeit, steht die Ware. ---------- */
  const abstand = (a, b) => { const p = px(a), q = px(b); return Math.hypot(p[0]-q[0], p[1]-q[1]); };
  function bogen(a, b, k){
    const p = px(a), q = px(b);
    const dx = q[0]-p[0], dy = q[1]-p[1], len = Math.max(1, Math.hypot(dx, dy));
    const off = Math.min(40, len * k);
    const cx = (p[0]+q[0])/2 - dy/len*off, cy = (p[1]+q[1])/2 + dx/len*off;
    return {d:`M ${p[0].toFixed(1)} ${p[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`, len};
  }
  const beispielSichtbar = () => aktiveSeite !== "karte" || offenesBlatt || tutorialLaeuft() ? null : kette();
  function flussVerbindungen(){
    const links = [];
    const beispiel = beispielSichtbar();
    const raffAlle = Object.keys(S.raff || {});
    const raffAktiv = raffAlle.filter(id => S.raff[id].arbeiter > 0);
    if (ebenen.mine && ebenen.raff && raffAlle.length){
      const kandidaten = raffAktiv.length ? raffAktiv : raffAlle;
      for (const def of MINEN){
        const m = S.minen[def.id];
        if (!m || !(m.arbeiter > 0) || m.stillBis > S.tag) continue;
        let best = null, bestWert = Infinity;
        for (const rid of kandidaten){
          const wert = abstand(def.id, rid) * ((RAFF_SPEZIAL[rid] || []).includes(def.mat) ? .85 : 1);
          if (wert < bestWert){ bestWert = wert; best = rid; }
        }
        if (!best || (beispiel && beispiel.mineId === def.id && beispiel.raffId === best)) continue;
        links.push({von:def.id, nach:best, farbe:MATERIAL[def.mat].farbe, k:.12});
      }
    }
    if (ebenen.raff && ebenen.fab){
      const laender = [...new Set((S.fabriken || []).filter(f => !f.restbau && f.arbeiter > 0).map(f => f.land))];
      for (const rid of raffAktiv) for (const land of laender){
        if (beispiel && beispiel.raffId === rid && beispiel.fabId === "f_" + land) continue;
        links.push({von:rid, nach:"f_" + land, farbe:"#5b8f7a", k:-.1});
      }
    }
    return links;
  }
  let flussStand = "";
  function lieferflussZeichnen(){
    const svg = document.querySelector("svg.weltkarte");
    if (!svg) return;
    const links = flussVerbindungen();
    const still = reduziert();
    const schnell = tempo >= 4 ? 1.8 : 1;
    const stand = JSON.stringify([links.map(l => l.von + ">" + l.nach), still, schnell]);
    if (svg.pauseAnimations){ tempo === 0 ? svg.pauseAnimations() : svg.unpauseAnimations(); }
    if (stand === flussStand && svg.querySelector("#lieferfluss")) return;
    flussStand = stand;
    svg.querySelector("#lieferfluss")?.remove();
    if (!links.length) return;
    const g = svgEl("g", {id:"lieferfluss", "pointer-events":"none"});
    for (const l of links){
      const {d, len} = bogen(l.von, l.nach, l.k);
      g.appendChild(svgEl("path", {d, fill:"none", stroke:"#0b3648", "stroke-width":4.2, "stroke-linecap":"round", opacity:.18}));
      g.appendChild(svgEl("path", {d, fill:"none", stroke:l.farbe, "stroke-width":2.2, "stroke-linecap":"round", "stroke-dasharray":"1.5 6", opacity:.85}));
      if (still) continue;
      const dauer = Math.min(9, Math.max(2.4, len / 55)) / schnell;
      const anzahl = len > 120 ? 3 : 2;
      for (let i = 0; i < anzahl; i++){
        const punkt = svgEl("circle", {r:3.6, fill:l.farbe, stroke:"#fffaf0", "stroke-width":1.3, opacity:0});
        const start = (i * dauer / anzahl).toFixed(2);
        punkt.appendChild(svgEl("animateMotion", {path:d, dur:dauer.toFixed(2) + "s", begin:start + "s", repeatCount:"indefinite"}));
        punkt.appendChild(svgEl("animate", {attributeName:"opacity", values:"0;1;1;0", keyTimes:"0;.12;.86;1", dur:dauer.toFixed(2) + "s", begin:start + "s", repeatCount:"indefinite"}));
        g.appendChild(punkt);
      }
    }
    const transport = svg.querySelector("#didaktik-transport");
    if (transport) svg.insertBefore(g, transport); else svg.appendChild(g);
  }

  /* ---------- Lieferweg als kleiner Knopf unter «Verlauf»; Antippen zeigt die Erklärung ---------- */
  let lwKnopf = null;
  function lieferwegKnopf(){
    const r = kette();
    const sichtbar = !!r && aktiveSeite === "karte" && !offenesBlatt;
    if (!lwKnopf){
      lwKnopf = document.createElement("button");
      lwKnopf.type = "button";
      lwKnopf.id = "lieferweg-knopf";
      lwKnopf.setAttribute("aria-expanded", "false");
      lwKnopf.addEventListener("click", ev => {
        ev.stopPropagation();
        const offen = lwKnopf.classList.toggle("offen");
        lwKnopf.setAttribute("aria-expanded", String(offen));
      });
      document.addEventListener("click", ev => {
        if (lwKnopf.classList.contains("offen") && !ev.target.closest("#lieferweg-knopf")){
          lwKnopf.classList.remove("offen"); lwKnopf.setAttribute("aria-expanded", "false");
        }
      });
      (document.getElementById("sicht") || document.body).appendChild(lwKnopf);
    }
    lwKnopf.hidden = !sichtbar;
    if (!sichtbar){ lwKnopf.classList.remove("offen"); return; }
    const mine = MINEN.find(x => x.id === r.mineId), raff = RAFF_ORTE.find(x => x.id === r.raffId);
    const km = Math.round(((r.d1 || 0) + (r.d2 || 0)) / 100) * 100;
    const inhalt = `<span class="lw-ikon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M2.6 6.6h10.9v9H2.6z"/><path d="M13.5 9.4h4.1l3 3.3v2.9h-7.1"/><circle cx="6.8" cy="17.3" r="1.8"/><circle cx="17" cy="17.3" r="1.8"/></svg></span><span>Lieferweg<small>≈ ${km.toLocaleString("de-CH")} km</small>`
      + `<span class="lw-mehr">${mine?.ort || ""} → ${raff?.ort || ""} → ${LAND[r.fabrik.land]?.name || ""}. LKW, Schiff, LKW. `
      + `Nur zur Orientierung: Transportkosten und Lieferzeiten rechnet das Spiel nicht.</span></span>`;
    if (lwKnopf.dataset.inhalt !== inhalt){ lwKnopf.innerHTML = inhalt; lwKnopf.dataset.inhalt = inhalt; }
  }

  /* ==========================================================
     Fokus: Aufgabenkarte und Meldungen führen zum Ort
     ========================================================== */
  const zielSvg = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor"/><circle cx="12" cy="12" r="7.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const klein = s => String(s||"").toLocaleLowerCase("de-CH").replace(/\s+/g, " ").trim();
  const ziel = (kind, id, vorschlag = false) => ({kind, id:String(id), suggestion:!!vorschlag});
  const pinZu = t => document.querySelector(`#welt .pin[data-pin="${CSS.escape(t.kind)}"][data-id="${CSS.escape(t.id)}"]`);
  const ausPin = (pin, vorschlag = false) => pin?.dataset?.pin && pin?.dataset?.id ? ziel(pin.dataset.pin, pin.dataset.id, vorschlag) : null;

  function ortAusText(roh){
    const text = klein(roh); if (!text) return null;
    const mine = MINEN.find(d => d?.ort && text.includes(klein(d.ort)));
    if (mine) return ziel("mine", mine.id);
    const raff = RAFF_ORTE.find(d => d?.ort && text.includes(klein(d.ort)));
    if (raff) return ziel("raff", raff.id);
    if (/(fabrik|fertigung|produktion|produziert|bau)/.test(text)){
      const land = FAB_ORTE.find(id => LAND[id]?.name && text.includes(klein(LAND[id].name)));
      if (land) return ziel("fab", land);
    }
    return null;
  }
  // Eine ausgeblendete Ebene wieder zeigen; die Chips folgen im nächsten Frame.
  function ebeneAn(kind){
    if (!(kind in ebenen) || ebenen[kind]) return;
    ebenen[kind] = true;
    zeichnen();
  }
  function fokusRing(pin, vorschlag){
    if (!pin) return;
    pin.querySelectorAll(".map-focus-ring,.map-focus-suggestion").forEach(e => e.remove());
    const r = document.createElement("span"); r.className = "map-focus-ring";
    pin.querySelector(".knopf")?.appendChild(r);
    setTimeout(() => r.remove(), 1050);
    if (vorschlag){
      const label = document.createElement("span"); label.className = "map-focus-suggestion"; label.textContent = "Vorschlag";
      pin.appendChild(label); setTimeout(() => label.remove(), 2400);
    }
  }
  function kameraAuf(t){
    ebeneAn(t.kind);
    if (aktiveSeite !== "karte") seiteWechseln("karte");
    else if (offenesBlatt) blattZu();
    const los = () => {
      const pin = pinZu(t); if (!pin) return false;
      const pxx = pin.offsetLeft + pin.offsetWidth/2;
      const pyy = pin.offsetTop + Math.min(28, pin.offsetHeight/2);
      const zoom = Math.max(Math.max(sicht.clientWidth/KARTE_B, .95), 1.72);
      const hud = document.getElementById("hud")?.offsetHeight || 56;
      const dock = document.getElementById("dock")?.offsetHeight || 86;
      const oben = hud + 8, unten = Math.max(oben + 80, sicht.clientHeight - dock - 8);
      const cy = oben + (unten - oben) * .48;
      ansicht.z = zoom;
      ansicht.x = sicht.clientWidth*.5 - pxx*zoom;
      ansicht.y = cy - pyy*zoom;
      welt.classList.add("map-focus-moving");
      ansichtAnwenden();
      setTimeout(() => welt.classList.remove("map-focus-moving"), 650);
      fokusRing(pin, t.suggestion);
      return true;
    };
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!los()) setTimeout(los, 80); }));
  }
  function freierOrt(kind){
    if (kind === "mine"){ const d = MINEN.find(x => !S.minen?.[x.id]); if (d) return ziel("mine", d.id, true); }
    if (kind === "raff"){ const d = RAFF_ORTE.find(x => !S.raff?.[x.id]); if (d) return ziel("raff", d.id, true); }
    if (kind === "fab"){ const id = FAB_ORTE.find(x => !S.fabriken?.some(f => f.land === x)); if (id) return ziel("fab", id, true); }
    return null;
  }
  function eigenerOrt(kind){
    if (kind === "mine"){
      const id = Object.keys(S.minen||{}).find(id => S.minen[id].stillBis > S.tag || S.minen[id].arbeiter <= 0) || Object.keys(S.minen||{})[0];
      if (id) return ziel("mine", id);
    }
    if (kind === "raff"){
      const id = Object.keys(S.raff||{}).find(id => S.raff[id].arbeiter <= 0) || Object.keys(S.raff||{})[0];
      if (id) return ziel("raff", id);
    }
    if (kind === "fab"){
      const f = (S.fabriken||[]).find(f => f.restbau > 0 || f.arbeiter <= 0) || (S.fabriken||[])[0];
      if (f) return ziel("fab", f.land);
    }
    return null;
  }
  /* Wohin führt die Aufgabenkarte? Leuchtender Pin, blinkender Reiter, sonst
     aus dem Text der Karte (auch aus versteckten Teilen). */
  function questAction(){
    const direkt = ausPin(document.querySelector("#welt .pin.wink:not(.blass)") || document.querySelector("#welt .pin.wink"));
    if (direkt) return {type:"map", target:direkt};
    const reiter = document.querySelector("#dock button.wink");
    if (reiter?.dataset?.seite) return {type:"dock", seite:reiter.dataset.seite};
    const text = klein(document.getElementById("quest")?.textContent);
    const ort = ortAusText(text); if (ort) return {type:"map", target:ort};

    if (/verkauf|markt/.test(text)) return {type:"dock", seite:"markt"};
    if (/einstellen|team|weitere personen|personal einstellen/.test(text) && !/zuweisen|besetzen/.test(text)) return {type:"dock", seite:"team"};

    if (/rohstoffquelle|mine|förder/.test(text)){
      const neu = /eröff|öffne|sichere|keine rohstoffquelle|noch keine/.test(text);
      const t = neu ? freierOrt("mine") : (eigenerOrt("mine") || freierOrt("mine"));
      if (t) return {type:"map", target:t};
    }
    if (/raffiner/.test(text)){
      const neu = /bau|keine raffiner|noch keine/.test(text);
      const t = neu ? freierOrt("raff") : (eigenerOrt("raff") || freierOrt("raff"));
      if (t) return {type:"map", target:t};
    }
    if (/fabrik|fertigung|material fehlt|produktion/.test(text)){
      const neu = /bau|keine fabrik|noch keine/.test(text);
      const t = neu ? freierOrt("fab") : (eigenerOrt("fab") || freierOrt("fab"));
      if (t) return {type:"map", target:t};
    }
    if (/personal|zuweisen|besetzen/.test(text)){
      const p = [...document.querySelectorAll("#welt .pin.inaktiv-status")].find(pin => pin.querySelector(".pin-state-badge")?.textContent?.includes("0 P"));
      const t = ausPin(p); if (t) return {type:"map", target:t};
      return {type:"dock", seite:"team"};
    }
    return null;
  }
  function ausfuehren(a){
    if (!a) return false;
    if (a.type === "map" && a.target){ kameraAuf(a.target); return true; }
    if (a.type === "dock" && a.seite){ seiteWechseln(a.seite); return true; }
    return false;
  }

  const quest = document.getElementById("quest");
  if (!quest.dataset.mapFocusBound){
    quest.dataset.mapFocusBound = "1";
    quest.addEventListener("click", e => {
      if (e.target.closest("button,a,input,select,textarea")) return;
      const a = questAction(); if (!a) return;
      e.preventDefault(); ausfuehren(a);
    });
  }

  /* Meldungen mit Ortsbezug: Ziel-Symbol, als Knopf bedienbar (Klick, Enter, Leertaste). */
  function meldungenVerknuepfen(){
    const logs = S.log || [];
    for (const d of document.querySelectorAll("#toasts .toast:not([data-map-focus-ready])")){
      d.dataset.mapFocusReady = "1";
      const text = (d.textContent||"").replace(/\s+/g, " ").trim();
      const eintrag = logs.find(e => klein(nurText(e.text)) === klein(text));
      const t = ortAusText(eintrag?.text || text);
      if (!t) continue;
      d.classList.add("map-link");
      d.dataset.focusKind = t.kind; d.dataset.focusId = t.id;
      const cue = document.createElement("span"); cue.className = "toast-map-cue"; cue.innerHTML = zielSvg(); d.appendChild(cue);
      d.setAttribute("role", "button"); d.tabIndex = 0;
      d.setAttribute("aria-label", `${text}. Standort auf Karte anzeigen`);
      const hin = () => kameraAuf(ziel(d.dataset.focusKind, d.dataset.focusId));
      d.addEventListener("click", hin);
      d.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); hin(); } });
    }
  }
  const aufgabeVerknuepfen = () => window.__erzweltAufgabe?.verknuepfen();

  /* ---------- Tastatur und Chips, im nächsten Frame abgeglichen ----------
     Ebenen-Chips zeigen den wahren Stand, wenn der Fokus eine Ebene wieder
     eingeschaltet hat; die verknüpfte Aufgabenkarte ist ein Knopf. */
  function chipsAbgleichen(){
    for (const b of document.querySelectorAll("[data-ebene]")){
      const k = b.dataset.ebene;
      if (!(k in ebenen)) continue;
      b.setAttribute("aria-pressed", String(!!ebenen[k]));
    }
  }
  function questZugang(){
    const verknuepft = !quest.hidden && quest.classList.contains("map-link");
    if (verknuepft){
      quest.setAttribute("role", "button");
      quest.tabIndex = 0;
    } else {
      quest.removeAttribute("role");
      quest.removeAttribute("tabindex");
      const label = quest.getAttribute("aria-label") || "";
      if (label.endsWith("· Ziel anzeigen")) quest.removeAttribute("aria-label");
    }
  }
  let abgleichFrame = 0;
  function abgleichen(){
    if (abgleichFrame) return;
    abgleichFrame = requestAnimationFrame(() => { abgleichFrame = 0; chipsAbgleichen(); questZugang(); });
  }
  document.addEventListener("click", e => {
    if (e.target.closest("#toasts .toast.map-link,#quest.map-link")) abgleichen();
  });
  document.addEventListener("keydown", e => {
    if (e.target === quest && quest.classList.contains("map-link") && (e.key === "Enter" || e.key === " ")){
      e.preventDefault();
      quest.click();
      return;
    }
    if (e.target.closest?.("#toasts .toast.map-link") && (e.key === "Enter" || e.key === " ")) abgleichen();
  });
  new MutationObserver(abgleichen).observe(quest, {attributes:true, attributeFilter:["class", "hidden"]});

  /* ==========================================================
     Filter-Knopf: die Ebenen stecken im Knopf über + und −; ein Punkt zeigt,
     wenn nicht alle Orte sichtbar sind.
     ========================================================== */
  function filterKnopfBauen(){
    const zoom = document.getElementById("zoom"), ebenenEl = document.getElementById("ebenen");
    if (!zoom || !ebenenEl) return;
    if (!ebenenEl.querySelector(".filter-titel")){
      const titel = document.createElement("p");
      titel.className = "filter-titel";
      titel.textContent = "Auf der Karte zeigen";
      ebenenEl.prepend(titel);
    }
    filterKnopf = document.createElement("button");
    filterKnopf.type = "button";
    filterKnopf.id = "filterknopf";
    filterKnopf.setAttribute("aria-expanded", "false");
    filterKnopf.setAttribute("aria-controls", "ebenen");
    filterKnopf.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6.2 7.4V18l-3.6 2v-7.6Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg><span class="filter-punkt" hidden></span>`;
    zoom.prepend(filterKnopf);
    filterKnopf.addEventListener("click", ev => {
      ev.stopPropagation();
      const offen = document.body.classList.toggle("filter-offen");
      filterKnopf.setAttribute("aria-expanded", String(offen));
    });
    document.addEventListener("click", ev => {
      if (ev.target.closest("[data-ebene]")){ setTimeout(filterPunkt, 0); return; }
      if (!document.body.classList.contains("filter-offen")) return;
      if (ev.target.closest("#ebenen, #filterknopf")) return;
      document.body.classList.remove("filter-offen");
      filterKnopf.setAttribute("aria-expanded", "false");
    });
  }

  /* ==========================================================
     Hooks und Laden
     ========================================================== */
  Erzwelt.nachZeichnen(() => {
    lieferwegZeichnen();
    transportZeichnen();
    statusZeigen();
    Erzwelt.pinStatusGezeigt();
    stillstandZeigen();
    lieferflussZeichnen();
    lieferwegKnopf();
  });
  Erzwelt.nachMeldungen(() => { meldungenVerknuepfen(); aufgabeVerknuepfen(); });
  Erzwelt.nachHinweisen(() => aufgabeVerknuepfen());
  Erzwelt.nachTempo(() => lieferflussZeichnen());
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change", transportNeu);

  lieferwegRoh();
  transportZeichnen();
  ruhigMoeglich = true;
  statusZeigen();
  stillstandZeigen();
  meldungenVerknuepfen();
  abgleichen();
  filterKnopfBauen();
  filterPunkt();
  lieferflussZeichnen();

  window.__erzweltKarte = {
    version: 1,
    transportNeu,
    stillstand: {ursache, rest: restText, ikon: {schild: IKON_SCHILD, pause: IKON_PAUSE, stopp: IKON_STOPP}}
  };
  window.__erzweltWorldStatus = {version:1, realConstruction:["fabrik"], instantSetup:["mine","raffinerie"]};
  window.__erzweltMapFocusNavigation = {version:1, features:["clickable-location-notifications","quest-context-focus","suggested-purchase-location","smooth-camera-focus"],
    questAction, zielSymbol: zielSvg};
  window.__erzweltInteractionFocusFinalFix = {version:1, features:["layer-chip-sync","keyboard-quest-focus"]};
})();
