"use strict";
/* Erfolg feiern: Ist eine Aufgabe erledigt (Tutorial-Schritt oder
   Wissens-Quest), gibt es einen kurzen Erfolgston und Funken.
   - Ton: kurz und leise, mit Web Audio erzeugt (keine Datei). In den
     Einstellungen unter «Töne» abschaltbar.
   - Funken: nutzt die bestehende Funken-Ebene; «Animationen: aus» schaltet
     sie ab.
   Nur Rückmeldung: keine Änderung an Spielstand oder Wirtschaft. */
(function(){
  const VERSION = 1;
  if (typeof OPT !== "undefined" && OPT.ton === undefined) OPT.ton = 1;
  const tonAn = () => typeof OPT === "undefined" || OPT.ton !== 0;

  /* ---------- Ton ---------- */
  let ctx = null;
  function audio(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e){ return null; }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  // Handys geben Ton erst nach einer Berührung frei – darum beim ersten Tippen vorbereiten.
  document.addEventListener("pointerdown", () => { if (tonAn()) audio(); }, {capture:true, passive:true});

  function erfolgTon(gross){
    if (!tonAn()) return;
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + 0.02;
    const master = a.createGain();
    master.gain.value = 0.16;
    master.connect(a.destination);
    const noten = gross ? [523.25, 659.25, 783.99, 1046.5] : [783.99, 1174.66];
    noten.forEach((f, i) => {
      const s = t0 + i * (gross ? 0.1 : 0.09);
      const dauer = gross && i === noten.length - 1 ? 0.7 : 0.32;
      for (const [typ, faktor, laut] of [["triangle", 1, 1], ["sine", 2, 0.25]]){
        const o = a.createOscillator(), g = a.createGain();
        o.type = typ;
        o.frequency.value = f * faktor;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(laut, s + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, s + dauer);
        o.connect(g); g.connect(master);
        o.start(s); o.stop(s + dauer + 0.05);
      }
    });
  }

  /* ---------- Funken ---------- */
  function feierFunken(gross){
    if (typeof funken !== "function") return;
    const quelle = document.getElementById("tutorial-lernfeedback")
      || (!document.getElementById("quest")?.hidden && document.getElementById("quest"));
    let x = innerWidth / 2, y = Math.min(innerHeight * 0.25, 180);
    if (quelle){
      const r = quelle.getBoundingClientRect();
      if (r.width && r.height){ x = r.left + r.width / 2; y = r.top + r.height / 2; }
    }
    const farben = ["#f5b73d", "#ffe9a8", "#2fbe7e", "#6fb8e0", "#fff"];
    funken(x, y, farben, gross ? 34 : 22);
    if (gross){
      setTimeout(() => funken(innerWidth * 0.25, y + 40, farben, 22), 180);
      setTimeout(() => funken(innerWidth * 0.75, y + 40, farben, 22), 320);
    }
  }

  function feiern(gross){
    erfolgTon(gross);
    requestAnimationFrame(() => feierFunken(gross));
  }

  /* ---------- Auslöser: Tutorial-Schritt erledigt ---------- */
  if (typeof tutorialPruefen === "function"){
    const vorher = tutorialPruefen;
    tutorialPruefen = function(){
      const davor = S.tutorial;
      const out = vorher.apply(this, arguments);
      if (S.tutorial > davor) feiern(S.tutorial >= TUTORIAL.length);
      return out;
    };
  }

  /* ---------- Auslöser: Wissens-Quest abgeschlossen ---------- */
  const anzahlWissen = () => Object.keys(S?.wissenQuestFlow?.collected || {}).length;
  let wissenBisher = anzahlWissen();
  if (typeof questZeichnen === "function"){
    const vorherQuest = questZeichnen;
    questZeichnen = function(){
      const out = vorherQuest.apply(this, arguments);
      const jetzt = anzahlWissen();
      if (jetzt > wissenBisher) feiern(false);
      wissenBisher = jetzt;
      return out;
    };
  }

  /* ---------- Einstellung «Töne» ---------- */
  if (typeof einstFuellen === "function"){
    const vorherEinst = einstFuellen;
    einstFuellen = function(){
      const out = vorherEinst.apply(this, arguments);
      const anim = document.getElementById("r-anim")?.closest(".reglerzeile");
      if (anim && !document.getElementById("r-ton") && typeof regler === "function"){
        anim.insertAdjacentHTML("afterend", regler("ton", "Töne",
          "Kurzer Ton, wenn eine Aufgabe erledigt ist. Im Schulzimmer: Kopfhörer oder aus.",
          0, 1, 1, tonAn() ? 1 : 0, tonAn() ? "an" : "aus"));
      }
      return out;
    };
  }
  document.addEventListener("input", e => {
    const r = e.target.closest?.('[data-regler="ton"]');
    if (!r) return;
    OPT.ton = +r.value;
    const anzeige = document.getElementById("w-ton");
    if (anzeige) anzeige.textContent = OPT.ton ? "an" : "aus";
    if (typeof optSpeichern === "function") optSpeichern();
    if (OPT.ton) erfolgTon(false);   // kurz anspielen, damit man hört, wie es klingt
  });

  window.__erzweltErfolgFeier = {version:VERSION, feiern, tonStatus: () => ctx ? ctx.state : "kein Ton bisher"};
})();
