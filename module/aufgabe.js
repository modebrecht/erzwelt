/* Erzwelt · module/aufgabe.js – die Aufgabenkarte (#quest)
   ---------------------------------------------------------------
   Einziger Besitzer von `questZeichnen`: Diese Datei zeichnet die Karte oben
   (Einführung, Wissens-Quest, Hinweis) mit allem, was dazugehört – Phasen,
   «Ziel zeigen», «Ansehen», Engpass-Kasten, kompakte Zeile, Karten-
   Verknüpfung, Rohstoff-Kürzel. Kein anderes Modul umhüllt `questZeichnen`
   oder bearbeitet die Karte danach. Früher entstand sie in zwölf Schichten
   (Kern, didactic-should, performance-pass, tutorial-enhance,
   map-focus-navigation, knowledge-quest-flow, objective-guide,
   sek-b-klarheit, handy-layout, erfolg-feier, premium-spielgefuehl,
   aufgabe-kompakt).

   Ablauf von questZeichnen (die Reihenfolge ist die der früheren Schichten
   und zählt: «Karten-Verknüpfung» liest den Text der Karte, wie er zu diesem
   Zeitpunkt dasteht, und die Höhe wird vor dem Anhängen der Kürzel gemessen):
     1. Wissens-Spielstand anlegen          (__erzweltKnowledgeQuestFlow.zustand)
     2. Grundkarte: Kopf, Titel, Text, Punkte, Sichtbarkeit, «breit»
        – nur neu, wenn sich Seite, Blatt, Einführungsschritt oder Hinweis
          geändert haben (früher Cache in performance-pass.js)
     3. Einführung: Phasen-Leiste, Phasenname, «Zusammenhang», Text, der den
        Lagerstand kennt – nur neu, wenn sich Schritt, Text oder Seite ändern
     4. Karten-Verknüpfung: «map-link», Ziel-Symbol, aria-label
     5. Wissens-Quest: Kopf «Neues Wissen» / «Wissens-Quest n/6», Punkte,
        «Ansehen», Wissen-Reiter blinkt
     6. «Ziel zeigen»
     7. Engpass-Kasten (nur während einer Wissens-Quest)
     8. kompakte Zeile auf anderen Reitern
     9. Phase in einer Zeile, Höhe messen (--questh)
    10. Rohstoff-Kürzel im Text («Kupfer (Cu)», je Rohstoff einmal)
    11. Erzwelt.nachAufgabe-Hooks (module/basis.js), z. B. Erfolg feiern

   Bausteine von anderen Modulen (beim Zeichnen abgefragt, nicht beim Laden):
     __erzweltTutorialEnhance.phasen, .phase(id), .text(t), .toastLayout(q, t)
                               Phasen, Text mit Lagerstand, Meldungen unter der
                               Karte (module/einfuehrung.js)
     __erzweltKnowledgeQuestFlow.zustand(), .quest(), .fertig(def), .liste,
       .active(), .nextGeologyTarget()
                               Wissens-Quests (module/wissen.js)
     __erzweltMapFocusNavigation.questAction(), .zielSymbol()
                               Ziel der Karte ermitteln (map-focus-navigation.js)
     __erzweltSekBKlarheit.engpass(), .engpassOeffnen(e)
                               Engpass und wohin er führt (sek-b-klarheit.js)
     __erzweltStil.ikon.warnung

   Bedienung der Karte:
     – hier: «Ziel zeigen», «Engpass» (je Knopf, Klick geht nicht weiter),
       Antippen der kompakten Zeile ohne Ziel (Capture-Listener auf #quest:
       klappt auf, stoppt den Klick), nach Klicks ausserhalb der Karte
       «Ziel zeigen» im nächsten Frame abgleichen.
     – Hooks, die bewusst woanders bleiben:
       map-focus-navigation.js: Klick auf die Karte führt zum Ziel (Listener
         auf #quest samt data-map-focus-bound) und ruft nach Meldungen und
         nach hinweiseSetzen `verknuepfen()` dieses Moduls auf;
       interaction-focus-final-fix.js: role/tabindex und Enter/Leertaste
         (im nächsten Frame, gemeinsam mit den Ebenen-Chips);
       module/wissen.js: «Ansehen» (Klick über document) und das
         Mitzählen von Lohn, Markt, Ziel, Rohstoffstandorten;
       module/einfuehrung.js: Rückmeldung nach einem Schritt (tutorialPruefen);
         ruft danach `tutorialNeu()` und questZeichnen.
   Markierungen: window.__erzweltAufgabe, __erzweltObjectiveGuide (Tests),
   __erzweltAufgabeKompakt. */
"use strict";
(function(){
  const api = name => window[name] || {};
  const tut = () => api("__erzweltTutorialEnhance");
  const wissen = () => api("__erzweltKnowledgeQuestFlow");
  const karte = () => api("__erzweltMapFocusNavigation");
  const sekB = () => api("__erzweltSekBKlarheit");
  const el = id => document.getElementById(id);
  const q = el("quest");

  let grundStand = "";       // 2. Grundkarte
  let tutorialStand = "";    // 3. Einführung
  let aufgeklapptAuf = null; // 8. auf welcher Seite die Zeile aufgeklappt wurde

  /* ---------- 2. Grundkarte ---------- */
  function grundkarte(t){
    const w = t ? null : naechsterSchritt();
    const stand = JSON.stringify([aktiveSeite, !!offenesBlatt, t ? [S.tutorial, t.id, t.titel, t.text] : w]);
    if (stand === grundStand) return;
    grundStand = stand;
    q.classList.toggle("breit", aktiveSeite !== "karte");
    if (t){
      el("q-emoji").innerHTML = IK[t.ikon] || IK.ziel;
      el("q-art").textContent = `Aufgabe ${S.tutorial+1}/${TUTORIAL.length}`;
      el("q-titel").textContent = t.titel;
      el("q-text").textContent = t.text;
      el("q-punkte").innerHTML = TUTORIAL.map((_,i) =>
        `<i class="${i < S.tutorial ? "ok" : i === S.tutorial ? "jetzt" : ""}"></i>`).join("");
      q.hidden = false;
      return;
    }
    if (!w || offenesBlatt){ q.hidden = true; return; }
    el("q-emoji").innerHTML = IK.pfeil;
    el("q-art").textContent = "Hinweis";
    el("q-titel").textContent = w[0];
    el("q-text").textContent = w[1];
    el("q-punkte").innerHTML = "";
    q.hidden = false;
  }

  /* ---------- 3. Einführung ---------- */
  function tutorialTeile(){
    let kette = q.querySelector(".tutorial-kette");
    if (!kette){
      kette = document.createElement("div"); kette.className = "tutorial-kette"; kette.setAttribute("aria-label", "Fortschritt in der Lieferkette");
      kette.innerHTML = tut().phasen.map(p => `<div class="tutorial-phase" data-phase="${p.id}"><b>${p.nr}</b><span>${p.label}</span></div>`).join("");
      const punkte = q.querySelector(".fortschritt");
      if (punkte) punkte.insertAdjacentElement("beforebegin", kette); else q.appendChild(kette);
    }
    let name = q.querySelector(".tutorial-phase-name");
    if (!name){ name = document.createElement("div"); name.className = "tutorial-phase-name"; kette.insertAdjacentElement("afterend", name); }
    let zusammenhang = q.querySelector(".tutorial-zusammenhang");
    if (!zusammenhang){
      zusammenhang = document.createElement("div"); zusammenhang.className = "tutorial-zusammenhang";
      const text = q.querySelector("#q-text");
      if (text) text.insertAdjacentElement("afterend", zusammenhang); else q.appendChild(zusammenhang);
    }
    return {kette, name, zusammenhang};
  }
  function einfuehrung(t){
    const T = tut();
    if (!t || q.hidden){
      q.classList.remove("tutorial-aktiv");
      q.querySelectorAll(".tutorial-kette,.tutorial-phase-name,.tutorial-zusammenhang").forEach(e => e.hidden = true);
      tutorialStand = "";
      T.toastLayout(q, null);
      return;
    }
    q.classList.add("tutorial-aktiv");
    const text = T.text(t);
    const stand = [S.tutorial, t.id, text, t.zusammenhang, aktiveSeite, !!offenesBlatt].join("|");
    if (stand === tutorialStand) return;
    tutorialStand = stand;
    const qText = el("q-text");
    if (qText.textContent !== text) qText.textContent = text;
    const {kette, name, zusammenhang} = tutorialTeile();
    kette.hidden = name.hidden = zusammenhang.hidden = false;
    const jetzt = T.phase(t.id);
    kette.querySelectorAll(".tutorial-phase").forEach((e, i) => { e.classList.toggle("erledigt", i < jetzt); e.classList.toggle("aktiv", i === jetzt); });
    name.textContent = `Phase ${jetzt+1}/4 · ${T.phasen[jetzt]?.label || "Lieferkette"}`;
    zusammenhang.innerHTML = `<b>Zusammenhang:</b> ${t.zusammenhang || ""}`;
    requestAnimationFrame(() => T.toastLayout(q, t));
  }

  /* ---------- 4. Karten-Verknüpfung ----------
     Das Ziel ermittelt map-focus-navigation.js aus Pins, Dock und dem Text der
     Karte, wie er jetzt dasteht (auch aus versteckten Teilen). */
  function verknuepfen(){
    if (q.hidden) return;
    const K = karte();
    const ziel = K.questAction();
    q.classList.toggle("map-link", !!ziel);
    q.dataset.contextAction = ziel ? "1" : "";
    let symbol = q.querySelector(".quest-map-cue");
    if (ziel && !symbol){ symbol = document.createElement("span"); symbol.className = "quest-map-cue"; symbol.innerHTML = K.zielSymbol(); q.appendChild(symbol); }
    if (!ziel && symbol) symbol.remove();
    if (ziel) q.setAttribute("aria-label", `${q.textContent.trim()} · Ziel anzeigen`);
  }

  /* ---------- 5. Wissens-Quest ---------- */
  function wissensQuest(){
    const W = wissen(), def = W.quest();
    q.querySelector(".wissen-quest-action")?.remove();
    q.classList.remove("wissen-quest", "wissen-bereit");
    document.querySelectorAll('[data-seite="wissen"]').forEach(b => b.classList.remove("wink"));
    if (!def || tutorialLaeuft() || offenesBlatt || q.hidden) return;

    const stand = W.zustand(), bereit = W.fertig(def), liste = W.liste, nr = liste.indexOf(def);
    q.classList.add("wissen-quest");
    q.classList.toggle("wissen-bereit", bereit);
    el("q-art").textContent = bereit ? "Neues Wissen" : `Wissens-Quest ${nr+1}/${liste.length}`;
    el("q-emoji").innerHTML = bereit ? (IK.gluehbirne || IK.wissen || IK.ziel) : (IK.wissen || IK.ziel);
    const punkte = el("q-punkte");
    punkte.innerHTML = liste.map((x, i) => `<i class="${stand.collected[x.id] ? "ok" : i === nr ? "jetzt" : ""}"></i>`).join("");
    if (bereit){
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "wissen-quest-action";
      knopf.dataset.wissenQuest = def.id;     // Klick: module/wissen.js
      knopf.textContent = "Ansehen";
      punkte.insertAdjacentElement("beforebegin", knopf);
      document.querySelectorAll('[data-seite="wissen"]').forEach(b => b.classList.add("wink"));
    }
  }

  /* ---------- 6. «Ziel zeigen» ---------- */
  const PFEIL = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function aktivesWissen(){
    if (tutorialLaeuft()) return null;
    return wissen().active();
  }
  function zielMoeglich(){
    if (q.hidden || offenesBlatt) return false;
    if (q.querySelector(".wissen-quest-action") || q.classList.contains("wissen-bereit")) return false;
    if (q.dataset.contextAction === "1") return true;
    return q.classList.contains("wissen-quest") && ["geologie", "ruf"].includes(aktivesWissen());
  }
  function geologieOeffnen(){
    const id = wissen().nextGeologyTarget();
    if (!id) return false;
    if (aktiveSeite !== "karte") seiteWechseln("karte");
    if (offenesBlatt) blattZu();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelector(`#welt .pin[data-pin="mine"][data-id="${CSS.escape(String(id))}"] .knopf`)?.click();
    }));
    return true;
  }
  function zielZeigen(){
    const id = aktivesWissen();
    if (q.classList.contains("wissen-quest") && id === "geologie" && geologieOeffnen()) return;
    if (q.classList.contains("wissen-quest") && id === "ruf"){ seiteWechseln("ziel"); return; }
    // Sonst derselbe Weg wie ein Antippen der Karte (map-focus-navigation.js).
    q.click();
  }
  function zielKnopf(){
    q.querySelector(".objective-guide-action")?.remove();
    if (!zielMoeglich()) return;
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "objective-guide-action";
    knopf.dataset.objectiveGuide = "1";
    knopf.innerHTML = `${PFEIL}<span>Ziel zeigen</span>`;
    knopf.setAttribute("aria-label", "Aktuelles Ziel anzeigen");
    knopf.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); zielZeigen(); });
    el("q-punkte").insertAdjacentElement("beforebegin", knopf);
    questHoeheMessen();
  }
  /* Ändert ein Klick ausserhalb der Karte das Ziel, stimmt der Knopf im nächsten Frame. */
  document.addEventListener("click", e => {
    if (e.target.closest("#quest")) return;
    requestAnimationFrame(zielKnopf);
  });

  /* ---------- 7. Engpass-Kasten ---------- */
  function engpassKasten(){
    q.querySelector(".engpass-kasten")?.remove();
    if (q.hidden || !q.classList.contains("wissen-quest")) return;
    const e = sekB().engpass();
    if (!e) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "engpass-kasten";
    const warn = window.__erzweltStil ? window.__erzweltStil.ikon.warnung : "⚠";
    b.innerHTML = `<b>${warn} ${e.titel}</b><span>${e.text}</span>`;
    b.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); sekB().engpassOeffnen(e); });
    (q.querySelector(".objective-guide-action") || el("q-punkte")).insertAdjacentElement("beforebegin", b);
  }

  /* ---------- 8. Kompakte Zeile ----------
     Auf anderen Seiten als der Karte nur eine schmale Zeile – ausser die Aufgabe
     wird genau dort erledigt (Einführung: Team, Markt; Wissens-Quest: Wissen).
     «Ansehen» bleibt in der Zeile sichtbar (stil.js). Antippen ohne Ziel klappt
     die Zeile auf dieser Seite auf. */
  function gehoertZuSeite(){
    const t = tutorialSchritt();
    if (t) return t.ziel() === "dock:" + aktiveSeite;
    if (q.classList.contains("wissen-bereit")) return aktiveSeite === "wissen";
    return q.classList.contains("wissen-quest") && aktiveSeite === "wissen";
  }
  function kompakt(){
    if (aufgeklapptAuf !== aktiveSeite) aufgeklapptAuf = null;
    q.classList.toggle("kompakt", !q.hidden && aktiveSeite !== "karte" && aufgeklapptAuf === null && !gehoertZuSeite());
  }
  q.addEventListener("click", ev => {
    if (!q.classList.contains("kompakt") || q.classList.contains("map-link")) return;
    ev.preventDefault(); ev.stopPropagation();
    aufgeklapptAuf = aktiveSeite;
    kompakt(); questHoeheMessen();
  }, true);

  /* ---------- 9. Phase in einer Zeile ---------- */
  function phaseZeile(){
    const kette = q.querySelector(".tutorial-kette"), name = q.querySelector(".tutorial-phase-name");
    if (!kette || !name) return;
    let zeile = kette.parentElement.classList.contains("phase-zeile") ? kette.parentElement : null;
    if (!zeile){
      zeile = document.createElement("div");
      zeile.className = "phase-zeile";
      kette.before(zeile);
      zeile.append(name, kette);
    }
    zeile.hidden = !!kette.hidden;
  }

  /* ---------- 10. Rohstoff-Kürzel ---------- */
  const BUCHSTABE = "A-Za-zÄÖÜäöüß";
  function kuerzel(){
    const text = el("q-text");
    if (text.dataset.kuerzel === text.textContent) return;
    let t = text.textContent;
    for (const m of Object.values(MATERIAL))
      t = t.replace(new RegExp(`(^|[^${BUCHSTABE}])${m.name}(?![${BUCHSTABE}]| \\()`), `$1${m.name} (${m.sym})`);
    if (t !== text.textContent) text.textContent = t;
    text.dataset.kuerzel = text.textContent;
  }

  questZeichnen = function(){
    wissen().zustand();
    const t = tutorialSchritt();
    grundkarte(t);
    einfuehrung(t);
    verknuepfen();
    wissensQuest();
    zielKnopf();
    engpassKasten();
    kompakt();
    phaseZeile();
    questHoeheMessen();
    kuerzel();
    Erzwelt.aufgabeGezeichnet();
  };

  window.__erzweltAufgabe = {
    version: 1,
    verknuepfen,
    tutorialNeu(){ tutorialStand = ""; }
  };
  window.__erzweltObjectiveGuide = {version: 3, label: "Ziel zeigen"};
  window.__erzweltAufgabeKompakt = {version: 1};
  questZeichnen();
})();
