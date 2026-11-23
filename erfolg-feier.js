"use strict";
/* Erfolg feiern: Ist eine Aufgabe erledigt (Tutorial-Schritt oder
   Wissens-Quest), gibt es einen kurzen Erfolgston und Funken.
   - Ton: kurz und leise, mit Web Audio erzeugt (keine Datei). In den
     Einstellungen unter «Töne» abschaltbar.
   - Kaufen und selbst verkaufen haben je einen eigenen, kurzen Ton.
     (Der tägliche Verkauf durch das Team bleibt still – sonst klingelt es
     ständig.)
   - Vibration (Android): kurz bei Kauf, Verkauf und Erfolg. In den
     Einstellungen unter «Vibration» abschaltbar.
   - Funken: nutzt die bestehende Funken-Ebene; «Animationen: aus» schaltet
     sie ab.
   Nur Rückmeldung: keine Änderung an Spielstand oder Wirtschaft. */
(function(){
  const VERSION = 1;
  if (typeof OPT !== "undefined" && OPT.ton === undefined) OPT.ton = 1;
  if (typeof OPT !== "undefined" && OPT.vib === undefined) OPT.vib = 1;
  const tonAn = () => typeof OPT === "undefined" || OPT.ton !== 0;
  const kannVibrieren = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  const vibAn = () => kannVibrieren && (typeof OPT === "undefined" || OPT.vib !== 0);
  function vibrieren(muster){
    if (!vibAn()) return;
    try { navigator.vibrate(muster); } catch (e){}
  }

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

  /* Kurze Tonfolge: noten = [[Frequenz, Start (s), Dauer (s)], …] */
  function spielen(noten, laut, klang){
    if (!tonAn()) return;
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + 0.02;
    const master = a.createGain();
    master.gain.value = laut;
    master.connect(a.destination);
    for (const [f, start, dauer] of noten){
      const s = t0 + start;
      for (const [typ, faktor, l] of klang){
        const o = a.createOscillator(), g = a.createGain();
        o.type = typ;
        o.frequency.value = f * faktor;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(l, s + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, s + dauer);
        o.connect(g); g.connect(master);
        o.start(s); o.stop(s + dauer + 0.05);
      }
    }
  }
  const WARM = [["triangle", 1, 1], ["sine", 2, 0.25]];
  const HELL = [["sine", 1, 1], ["sine", 2.76, 0.18]];
  function erfolgTon(gross){
    spielen(gross
      ? [[523.25, 0, .32], [659.25, .1, .32], [783.99, .2, .32], [1046.5, .3, .7]]
      : [[783.99, 0, .32], [1174.66, .09, .32]], 0.16, WARM);
  }
  // Kaufen: kurzes, tiefes «Plopp-plopp»
  const kaufTon = () => spielen([[392, 0, .12], [523.25, .07, .16]], 0.12, WARM);
  // Selbst verkaufen: helles Münz-«Kling-kling»
  const verkaufTon = () => spielen([[1318.5, 0, .22], [1975.5, .08, .3]], 0.09, HELL);

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
    vibrieren(gross ? [30, 60, 30, 60, 80] : 22);
    requestAnimationFrame(() => feierFunken(gross));
  }

  /* Auslöser «Einführungsschritt erledigt»: tutorialPruefen in module/einfuehrung.js
     ruft feiern() über window.__erzweltErfolgFeier auf. */

  /* ---------- Auslöser: Kaufen und selbst verkaufen ---------- */
  let vorAus = 0, vorEin = 0;
  document.addEventListener("click", e => {
    if (!e.target.closest?.("[data-tun]")) return;
    vorAus = S.ausgegeben; vorEin = S.eingenommen;
  }, true);
  document.addEventListener("click", e => {
    const knopf = e.target.closest?.("[data-tun]");
    if (!knopf) return;
    if (knopf.dataset.tun === "handverkauf" && S.eingenommen > vorEin){ verkaufTon(); vibrieren([12, 40, 12]); }
    else if (S.ausgegeben > vorAus){ kaufTon(); vibrieren(14); }
  });

  /* ---------- Auslöser: Wissens-Quest abgeschlossen ----------
     Nach jedem Zeichnen der Aufgabenkarte (Hook aus module/basis.js). */
  const anzahlWissen = () => Object.keys(S?.wissenQuestFlow?.collected || {}).length;
  let wissenBisher = anzahlWissen();
  Erzwelt.nachAufgabe(() => {
    const jetzt = anzahlWissen();
    if (jetzt > wissenBisher) feiern(false);
    wissenBisher = jetzt;
  });

  /* ---------- Einstellung «Töne» ---------- */
  if (typeof einstFuellen === "function"){
    const vorherEinst = einstFuellen;
    einstFuellen = function(){
      const out = vorherEinst.apply(this, arguments);
      const anim = document.getElementById("r-anim")?.closest(".reglerzeile");
      if (anim && !document.getElementById("r-ton") && typeof regler === "function"){
        anim.insertAdjacentHTML("afterend", regler("ton", "Töne",
          "Kurze Töne bei Kauf, eigenem Verkauf und erledigter Aufgabe. Im Schulzimmer: Kopfhörer oder aus.",
          0, 1, 1, tonAn() ? 1 : 0, tonAn() ? "an" : "aus")
          + (kannVibrieren ? regler("vib", "Vibration",
          "Kurzes Vibrieren bei Kauf, eigenem Verkauf und erledigter Aufgabe.",
          0, 1, 1, vibAn() ? 1 : 0, vibAn() ? "an" : "aus") : ""));
      }
      return out;
    };
  }
  document.addEventListener("input", e => {
    const r = e.target.closest?.('[data-regler="ton"], [data-regler="vib"]');
    if (!r) return;
    const art = r.dataset.regler;
    OPT[art] = +r.value;
    const anzeige = document.getElementById("w-" + art);
    if (anzeige) anzeige.textContent = OPT[art] ? "an" : "aus";
    if (typeof optSpeichern === "function") optSpeichern();
    // kurz anspielen, damit man hört bzw. spürt, wie es ist
    if (art === "ton" && OPT.ton) erfolgTon(false);
    if (art === "vib" && OPT.vib) vibrieren(22);
  });

  window.__erzweltErfolgFeier = {version:VERSION, feiern, kaufTon, verkaufTon, kannVibrieren, tonStatus: () => ctx ? ctx.state : "kein Ton bisher"};
})();
