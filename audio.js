"use strict";
/* ============================================================
   AUDIO: Hintergrundmusik und Soundeffekte (SFX)

   Bereich «Audio» in den Einstellungen (im Spiel) und im Hauptmenü:
   - Hintergrundmusik: an/aus, Lautstärke, Auswahl Musik 1–3.
   - Soundeffekte (SFX): an/aus (OPT.ton, Töne aus erfolg-feier.js),
     Lautstärke, dazu Vibration, wo das Gerät es kann.
   Alles steht in OPT und wird lokal gespeichert.

   Datenverkehr:
   - Beim Laden wird keine Musik angefordert. Der Player bekommt die Adresse
     erst beim Abspielen, und nur die der gewählten Fassung.
   - Die Dateien tragen einen Prüfwert im Namen und werden ein Jahr im
     Browser behalten (vercel.json); ein zweiter Besuch lädt nichts neu.
   - Die Originale (OGG/Vorbis) werden unverändert ausgeliefert. Nur Browser
     ohne OGG (Safari vor 18.4) bekommen eine MP3-Ersatzdatei.
   - Ist die Seite im Hintergrund, pausiert die Musik.

   Lautstärke: iPads lassen die Lautstärke eines Audio-Elements nicht setzen.
   Dort läuft die Musik über Web Audio mit eigenem Lautstärkeregler.
   ============================================================ */
(function(){
  const VERSION = 1;
  if (typeof OPT === "undefined") return;

  const MUSIK = [
    {ogg:"audio/musik-1-aad43401.ogg", mp3:"audio/musik-1-45062946.mp3"},
    {ogg:"audio/musik-2-02f4f4e1.ogg", mp3:"audio/musik-2-5133313c.mp3"},
    {ogg:"audio/musik-3-35041a2c.ogg", mp3:"audio/musik-3-71ba292e.mp3"}
  ];

  /* ---------- Einstellungen mit Standardwerten ---------- */
  const ganz = (v, min, max, std) => Number.isInteger(v) && v >= min && v <= max ? v : std;
  OPT.musik = ganz(OPT.musik, 0, 1, 0);           // aus, bis jemand sie einschaltet
  OPT.musikWahl = ganz(OPT.musikWahl, 1, 3, 1);   // Musik 1 vorausgewählt
  OPT.musikLaut = ganz(OPT.musikLaut, 0, 100, 40);
  OPT.sfxLaut = ganz(OPT.sfxLaut, 0, 100, 100);
  // Lautstärke nach Gehör: halber Regler klingt etwa halb so laut
  const kurve = prozent => Math.pow(prozent / 100, 2);
  const speichern = () => { if (typeof optSpeichern === "function") optSpeichern(); };

  /* ---------- Player ---------- */
  let player = null, ac = null, regelung = null, geladen = 0, status = "aus", wartet = false, imHintergrund = false;
  let format = null;
  function dateiformat(){
    if (format) return format;
    const probe = document.createElement("audio");
    format = probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"') ? "ogg" : "mp3";
    return format;
  }
  // Kann das Gerät die Lautstärke des Elements setzen? (iPad: nein)
  function lautstaerkeSetzbar(el){
    try { el.volume = .5; const ok = Math.abs(el.volume - .5) < .01; el.volume = 1; return ok; }
    catch (e){ return false; }
  }
  function playerHolen(){
    if (player) return player;
    player = new Audio();
    player.preload = "none";
    player.loop = true;
    player.addEventListener("playing", () => statusSetzen("spielt"));
    player.addEventListener("waiting", () => statusSetzen("laedt"));
    player.addEventListener("error", () => { if (player.getAttribute("src")) statusSetzen("fehler"); });
    if (!lautstaerkeSetzbar(player)){
      const AC = window.AudioContext || window.webkitAudioContext;
      try {
        if (navigator.audioSession) navigator.audioSession.type = "playback";
        ac = new AC();
        regelung = ac.createGain();
        ac.createMediaElementSource(player).connect(regelung);
        regelung.connect(ac.destination);
      } catch (e){ ac = null; regelung = null; }
    }
    return player;
  }
  function lautSetzen(){
    if (!player) return;
    const v = kurve(OPT.musikLaut);
    if (regelung) regelung.gain.value = v;
    else player.volume = v;
  }
  // Startet die gewählte Fassung; muss aus einer Nutzeraktion heraus kommen.
  function starten(){
    if (!OPT.musik || imHintergrund) return;
    const p = playerHolen();
    if (ac && ac.state === "suspended") ac.resume().catch(() => {});
    if (geladen !== OPT.musikWahl){
      p.pause();
      p.src = MUSIK[OPT.musikWahl - 1][dateiformat()];
      geladen = OPT.musikWahl;
      statusSetzen("laedt");
    }
    lautSetzen();
    wartet = false;
    const versuch = p.play();
    if (versuch && versuch.catch) versuch.catch(e => {
      if (e && e.name === "NotAllowedError"){ wartet = true; statusSetzen("bereit"); }
      else if (e && e.name !== "AbortError") statusSetzen("fehler");
    });
  }
  function anhalten(){
    wartet = false;
    if (player) player.pause();
    statusSetzen("aus");
  }

  // Gespeicherte Musik setzt beim nächsten bewussten Tippen auf einen Knopf ein.
  function nutzerAktion(e){
    if (!OPT.musik || (player && !player.paused && !wartet)) return;
    if (!e.target.closest?.("button, [role=button], input, select, a")) return;
    starten();
  }
  document.addEventListener("click", nutzerAktion, true);
  document.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") nutzerAktion(e); }, true);

  // Im Hintergrund pausieren (spart Akku und Datenverkehr)
  document.addEventListener("visibilitychange", () => {
    imHintergrund = document.hidden;
    if (!player || !OPT.musik) return;
    if (imHintergrund) player.pause();
    else if (geladen) { const v = player.play(); if (v && v.catch) v.catch(() => { wartet = true; }); }
  });

  /* ---------- Anzeige ---------- */
  function statusSetzen(neu){
    status = neu;
    for (const el of document.querySelectorAll(".musik-status")){
      el.textContent = textVon("audio.status." + (OPT.musik ? neu : "aus"), {nr:OPT.musikWahl});
    }
  }
  const anAus = wert => textVon(wert ? "audio.an" : "audio.aus");
  function wahlKnoepfe(){
    return [1, 2, 3].map(nr => `<button type="button" role="radio" class="cta${nr === OPT.musikWahl ? "" : " still"}"
      data-musik-wahl="${nr}" aria-checked="${nr === OPT.musikWahl}">${textVon("audio.musikName", {nr})}</button>`).join("");
  }
  // Der Bereich steht nur an einer Stelle zugleich (Einstellungen oder Hauptmenü).
  function bereich(){
    document.querySelectorAll(".audio-bereich").forEach(el => el.remove());
    const vib = window.__erzweltErfolgFeier?.kannVibrieren;
    const vibAn = vib && OPT.vib !== 0;
    return `<section class="karte audio-bereich" aria-labelledby="audio-titel">
      <h3 id="audio-titel">${textVon("audio.titel")}</h3>
      <h4>${textVon("audio.musikTitel")}</h4>
      ${regler("musik", textVon("audio.musik"), textVon("audio.musikHilfe"), 0, 1, 1, OPT.musik, anAus(OPT.musik))}
      ${regler("musikLaut", textVon("audio.musikLaut"), textVon("audio.musikLautHilfe"), 0, 100, 5, OPT.musikLaut, OPT.musikLaut + " %")}
      <div class="reglerzeile">
        <div class="kopf"><b id="musik-wahl-titel">${textVon("audio.wahl")}</b></div>
        <div class="musik-wahl" role="radiogroup" aria-labelledby="musik-wahl-titel">${wahlKnoepfe()}</div>
        <small class="musik-status" aria-live="polite"></small>
      </div>
      <h4>${textVon("audio.sfxTitel")}</h4>
      ${regler("ton", textVon("audio.sfx"), textVon("audio.sfxHilfe"), 0, 1, 1, OPT.ton !== 0 ? 1 : 0, anAus(OPT.ton !== 0))}
      ${regler("sfxLaut", textVon("audio.sfxLaut"), textVon("audio.sfxLautHilfe"), 0, 100, 5, OPT.sfxLaut, OPT.sfxLaut + " %")}
      ${vib ? regler("vib", textVon("erfolgfeier.vibration"), textVon("audio.vibHilfe"), 0, 1, 1, vibAn ? 1 : 0, anAus(vibAn)) : ""}
    </section>`;
  }
  function bereitMachen(){
    if (player && !player.paused) statusSetzen("spielt");
    else if (!OPT.musik) statusSetzen("aus");
    else statusSetzen(status === "fehler" || status === "laedt" ? status : "bereit");
  }

  /* Nach einstFuellen: Bereich «Audio» vor «Intro erneut ansehen» (module/meldungen.js) */
  (window.__erzweltMeldungenTeile ||= {}).audio = function(){
    const ziel = document.querySelector('#einstinhalt [data-tun="intro-wiederholung"]');
    if (!ziel) return;
    ziel.insertAdjacentHTML("beforebegin", bereich());
    bereitMachen();
  };

  /* ---------- Bedienung ---------- */
  function wertSetzen(art, wert, anzeige){
    OPT[art] = wert;
    const el = document.getElementById("w-" + art);
    if (el) el.textContent = anzeige;
    const r = document.getElementById("r-" + art);
    if (r) r.style.setProperty("--p", (wert / (+r.max || 1) * 100).toFixed(1) + "%");
    speichern();
  }
  document.addEventListener("input", e => {
    const r = e.target.closest?.('[data-regler="musik"], [data-regler="musikLaut"], [data-regler="sfxLaut"]');
    if (!r) return;
    const art = r.dataset.regler, wert = +r.value;
    if (art === "musik"){
      wertSetzen("musik", wert ? 1 : 0, anAus(wert));
      wert ? starten() : anhalten();
      bereitMachen();
    } else if (art === "musikLaut"){
      wertSetzen("musikLaut", wert, wert + " %");
      lautSetzen();   // wirkt sofort, ohne Neustart
    } else {
      wertSetzen("sfxLaut", wert, wert + " %");
    }
  });
  // Nach dem Loslassen kurz anspielen, damit man die neue SFX-Lautstärke hört
  document.addEventListener("change", e => {
    if (e.target.closest?.('[data-regler="sfxLaut"]') && OPT.ton !== 0) window.__erzweltErfolgFeier?.kaufTon();
  });
  document.addEventListener("click", e => {
    const knopf = e.target.closest?.("[data-musik-wahl]");
    if (!knopf) return;
    const nr = +knopf.dataset.musikWahl;
    if (nr === OPT.musikWahl && OPT.musik && player && !player.paused) return;
    OPT.musikWahl = nr;
    for (const b of document.querySelectorAll("[data-musik-wahl]")){
      const gewaehlt = +b.dataset.musikWahl === nr;
      b.classList.toggle("still", !gewaehlt);
      b.setAttribute("aria-checked", String(gewaehlt));
    }
    // Wer eine Musik antippt, will sie hören: Musik einschalten (Schalter mitziehen).
    if (!OPT.musik){
      const r = document.getElementById("r-musik");
      if (r) r.value = "1";
      wertSetzen("musik", 1, anAus(1));
    } else speichern();
    starten();
    bereitMachen();
  });

  const stil = document.createElement("style");
  stil.id = "erzwelt-audio-style";
  stil.textContent = `
    .audio-bereich{margin-top:14px}
    .audio-bereich h4{margin:14px 0 2px;font:800 var(--f2)/1.2 "Baloo 2",sans-serif;color:#a56d0c;letter-spacing:.01em}
    .audio-bereich h3 + h4{margin-top:6px}
    .musik-wahl{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 4px}
    .musik-wahl .cta{margin:0;min-height:44px;padding:8px 6px}
    .spielmenue-audio{text-align:left}
    .spielmenue-audio .audio-bereich{margin:0;background:#faf3e4;color:#192f36;border-radius:16px;padding:14px 16px}
    .spielmenue-audio .audio-bereich h3{display:none}
    .spielmenue-audio .audio-bereich h4{margin-top:4px}
    .spielmenue-audio .audio-bereich h4 ~ h4{margin-top:16px}
    .spielmenue-audio .reglerzeile small{color:#394e52}
    #spielmenue .musik-wahl .cta.still{background:#fff;color:#192f36;border:1px solid #d8cbb0}`;
  document.head.append(stil);

  window.__erzweltAudio = {version:VERSION, bereich, bereitMachen, starten, anhalten, sfxFaktor:() => kurve(OPT.sfxLaut),
    element:() => player,
    zustand:() => ({status, wartet, format:dateiformat(), geladen, laeuft:!!player && !player.paused,
      quelle:player?.getAttribute("src") || null, webAudio:!!regelung})};
})();
