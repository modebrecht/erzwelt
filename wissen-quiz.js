"use strict";
/* ============================================================
   WISSENS-QUIZ

   Jedes Wissensfeld: zuerst die Theorie, darunter eine Frage mit vier
   Antworten (eine richtig). Erst nach der richtigen Antwort lassen sich die
   Verbesserungen dieses Feldes finanzieren.
   - Richtig beim ersten Versuch: 20 % Rabatt auf alle Verbesserungen im Feld.
   - Falsch: alle vier Antworten wackeln rot, man kann es nochmals versuchen,
     der Rabatt ist dann aber weg.
   Stand in S.wissenQuiz[feld]: 0 = falsch versucht, 1 = sofort richtig,
   2 = richtig nach Fehlversuch (wird mit dem Spielstand gespeichert).
   Fragen und Antworten: texte.de.js (quiz.<feld>.frage, .a1 … .a4);
   die Antworten stehen im Theorie-Teil desselben Feldes.
   ============================================================ */
(function(){
  const VERSION = 1;
  const RABATT = 0.2;
  const RICHTIG = {kette:2, geologie:3, leute:1, chemie:4, fabrik:2, markt:3, ruf:1, modell:4};
  const t = (k, w) => textVon("quiz." + k, w);
  const stand = segId => (S.wissenQuiz || {})[segId];
  const setzen = (segId, wert) => { (S.wissenQuiz ||= {})[segId] = wert; };

  perkFrei = segId => !RICHTIG[segId] || stand(segId) >= 1;
  perkKosten = perk => {
    const e = PERK_INDEX[perk.id];
    return e && stand(e.seg.id) === 1 ? Math.round(perk.kosten * (1 - RABATT) / 100) * 100 : perk.kosten;
  };

  function karte(segId){
    const s = stand(segId), geloest = s >= 1;
    const antworten = [1, 2, 3, 4].map(nr => {
      const richtig = geloest && nr === RICHTIG[segId];
      return `<button type="button" class="quiz-antwort${richtig ? " richtig" : ""}" data-quiz="${segId}" data-nr="${nr}"
        ${geloest ? "disabled" : ""} aria-pressed="${richtig}">${t(segId + ".a" + nr)}</button>`;
    }).join("");
    const rueckmeldung = s === 1 ? t("sofort") : s === 2 ? t("spaeter") : s === 0 ? t("falsch") : t("einleitung");
    return `<section class="karte quiz-karte${geloest ? " geloest" : ""}" aria-labelledby="quiz-frage-${segId}">
      <h3>${t("titel")}</h3>
      <p class="quiz-frage" id="quiz-frage-${segId}">${t(segId + ".frage")}</p>
      <div class="quiz-antworten">${antworten}</div>
      <p class="quiz-rueckmeldung ${s === 0 ? "falsch" : geloest ? "gut" : ""}" role="status">${rueckmeldung}</p>
    </section>`;
  }

  /* Nach dem Füllen des Wissensfelds (Theorie oben, Frage vor den Verbesserungen) */
  const vorher = lupeFuellen;
  lupeFuellen = function(segId){
    vorher(segId);
    if (!RICHTIG[segId] || tutorialLaeuft()) return;
    const inhalt = document.getElementById("lupeinhalt");
    inhalt.querySelector(".quiz-karte")?.remove();
    const perk = inhalt.querySelector(".perkkarte");
    const html = karte(segId);
    if (perk) perk.insertAdjacentHTML("beforebegin", html);
    else inhalt.insertAdjacentHTML("beforeend", html);
    // Rabatt am Knopf zeigen
    const knopf = inhalt.querySelector("[data-tun='perk']");
    if (knopf && stand(segId) === 1 && !knopf.disabled) knopf.insertAdjacentHTML("beforeend", ` <span class="quiz-rabatt">${t("rabatt")}</span>`);
  };

  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-quiz]");
    if (!b || b.disabled) return;
    const segId = b.dataset.quiz, nr = +b.dataset.nr;
    if (stand(segId) >= 1) return;
    if (nr === RICHTIG[segId]){
      setzen(segId, stand(segId) === 0 ? 2 : 1);
      speichern();
      lupeFuellen(segId);
      const neu = document.querySelector(`.quiz-antwort[data-quiz="${segId}"][data-nr="${nr}"]`);
      if (neu && typeof funkenAn === "function") funkenAn(neu, ["#2fbe7e", "#82e2b4", "#f5b73d", "#fff"], 24);
      window.__erzweltErfolgFeier?.kaufTon?.();
      return;
    }
    if (stand(segId) === undefined){ setzen(segId, 0); speichern(); }
    const karteEl = b.closest(".quiz-karte");
    const alle = karteEl.querySelectorAll(".quiz-antwort");
    alle.forEach(x => { x.classList.remove("wackeln"); void x.offsetWidth; x.classList.add("wackeln"); });
    const rm = karteEl.querySelector(".quiz-rueckmeldung");
    rm.textContent = t("falsch"); rm.className = "quiz-rueckmeldung falsch";
    if (navigator.vibrate && OPT.vib !== 0) try { navigator.vibrate([40, 40, 40]); } catch (err) {}
    setTimeout(() => alle.forEach(x => x.classList.remove("wackeln")), 650);
  });

  const stil = document.createElement("style");
  stil.id = "erzwelt-wissen-quiz-style";
  stil.textContent = `
    .quiz-karte{border:2px solid #f5b73d66}
    .quiz-karte.geloest{border-color:#2fbe7e66}
    .ueberlage p.quiz-frage{font-weight:800;font-size:var(--f2);margin:4px 0 10px;line-height:1.3}
    .quiz-antworten{display:grid;gap:8px}
    .quiz-antwort{min-height:48px;padding:10px 14px;border-radius:12px;border:2px solid #e3d7bf;background:#fff;
      color:#192f36;font:700 var(--f1)/1.3 Nunito,sans-serif;text-align:left;box-shadow:0 3px 0 #e3d7bf;cursor:pointer}
    .quiz-antwort:active{transform:translateY(2px);box-shadow:0 1px 0 #e3d7bf}
    .quiz-antwort:disabled{cursor:default;opacity:.55;box-shadow:none}
    .quiz-antwort.richtig,.quiz-antwort.richtig:disabled{opacity:1;background:#e3f6ec;border-color:#2fbe7e;box-shadow:0 3px 0 #2a9e6b;color:#155c3b}
    .quiz-antwort.wackeln{background:#fde8e6;border-color:#e0504a;box-shadow:0 3px 0 #b23a2f;color:#8a2a22;animation:quizWackeln .6s ease}
    @keyframes quizWackeln{0%,100%{transform:none}15%,55%{transform:translateX(-7px)}35%,75%{transform:translateX(7px)}}
    @media (prefers-reduced-motion:reduce){.quiz-antwort.wackeln{animation:none}}
    body[data-anim="0"] .quiz-antwort.wackeln{animation:none}
    .ueberlage p.quiz-rueckmeldung{font-size:var(--f0);margin:10px 0 0;color:var(--grau)}
    .ueberlage p.quiz-rueckmeldung.falsch{color:#b23a2f;font-weight:800}
    .ueberlage p.quiz-rueckmeldung.gut{color:#1f7a4a;font-weight:800}
    .quiz-rabatt{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:99px;background:#2fbe7e;color:#fff;font-size:.85em}
  `;
  document.head.append(stil);

  window.__erzweltWissenQuiz = {version:VERSION, richtig:RICHTIG, stand};
})();
