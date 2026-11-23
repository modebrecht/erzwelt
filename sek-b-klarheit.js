"use strict";
/* ============================================================
   SEK-B-KLARHEIT

   Verständlichkeit und Bedienung auf dem Handy. Keine neue Wirtschaft.
   1. Schwierigkeit: Wirkung ohne Fachjargon (Dialog: module/einfuehrung.js).
   2. Tutorial-Karte: eine Fortschrittsanzeige weniger.
   3. «Ziel zeigen»: Ziel landet unter der Aufgabenkarte (jetzt module/karte.js).
   4. «Schritt abgeschlossen» überdeckt kein offenes Blatt mehr.
   5. Einheiten: pro Person, pro Tag, pro Monat, pro Stück.
   6. Tutorial-Raffinerie zeigt die Kabel-Rohstoffe statt Seltener Erden.
   7. Konkrete Engpass-Hinweise: welcher Ort braucht was (Kasten in der
      Aufgabenkarte: module/aufgabe.js über engpass()/engpassOeffnen()).
   8. Weniger «Spielmodell»-Vorbehalte in Blättern und Seiten.
   Gelb: Tutorial-Prüfung = Text, Zeit steht bei Kauf-Entscheiden
   («Das Spielmodell» ohne Formeln: module/wissen.js).
   Aufgabe auf anderen Seiten nur als schmale Zeile (module/aufgabe.js).
   ============================================================ */

(function(){
  /* ---------- 1. Schwierigkeit ---------- */
  SCHWIERIGKEIT.einfach.effekt = "Verkauf bringt 20 % mehr";
  SCHWIERIGKEIT.mittel.effekt  = "normale Verkaufspreise";
  SCHWIERIGKEIT.schwer.effekt  = "Verkauf bringt 30 % weniger";

  /* Der Dialog «Wähle die Schwierigkeit» steht in module/einfuehrung.js. Die
     Wirkungstexte oben bleiben hier: Ziel-Seite und Etappen-Dialog nutzen sie auch. */

  /* ---------- 5. Einheiten und 8. weniger Vorbehalte ----------
     Blätter: direkt in module/blaetter.js, Seiten (Team, Markt): direkt in
     module/seiten.js. Die Tutorial-Raffinerie zeigt die Kabel-Rohstoffe (6.). */
  if (typeof szeneRaff === "function"){
    const vorherSzeneRaff = szeneRaff;
    szeneRaff = function(def, r){
      if (tutorialLaeuft() && def) return vorherSzeneRaff({...def, spezial:[START_MATERIALIEN[0]]}, r);
      return vorherSzeneRaff(def, r);
    };
  }

  /* HUD: «Frei» heisst freies Personal. */
  const hudLabel = document.querySelector("#hud .pille.crew small");
  if (hudLabel){ hudLabel.textContent = "Team frei"; hudLabel.parentElement.parentElement.title = "Freies Personal im Team / Personal insgesamt"; }

  /* Fabrik-Materialliste: «Kupfer 303/2» → «Kupfer: 303 da · 2 pro Stück». */
  function materiallisteKlaeren(){
    document.querySelectorAll(".prozess-materialliste span:not([data-klar])").forEach(sp => {
      const m = sp.textContent.match(/^(.+?) (\d+)\/(\d+)$/);
      if (!m) return;
      sp.dataset.klar = "1";
      sp.innerHTML = `${m[1]}: <b>${m[2]}</b> da · ${m[3]} pro Stück`;
    });
  }

  /* ---------- 7. Engpass erkennen ---------- */
  function freieQuelleFuer(k){
    const d = MINEN.find(x => x.mat === k && !S.minen[x.id]);
    return d ? d.id : null;
  }
  function engpass(){
    if (typeof tutorialLaeuft === "function" && tutorialLaeuft()) return null;
    let produktion = 0;
    for (const f of S.fabriken || []){
      if (f.restbau > 0 || f.arbeiter <= 0) continue;
      const def = PRODUKT[f.produkt];
      const cap = Math.max(1, Math.floor(f.arbeiter * def.proArbeiter * perkMult("fabrik")));
      produktion += cap;
      let knapp = null, quote = Infinity;
      for (const k in def.rezept){
        const q = (S.mat[k]||0) / (def.rezept[k] * cap);
        if (q < quote){ quote = q; knapp = k; }
      }
      if (!knapp || quote >= 1) continue;
      // Reicht der Rest nach der heutigen Produktion noch für ein weiteres Stück,
      // hat das Material nicht gebremst – knappes Lager bei abgestimmter Kette ist kein Engpass.
      if ((S.mat[knapp]||0) >= def.rezept[knapp]) continue;
      const mat = MATERIAL[knapp];
      const titel = `${mat.name} fehlt für ${def.name}`;
      const mineId = materialMine(knapp);
      if (!mineId){
        const frei = freieQuelleFuer(knapp);
        const d = frei && MINEN.find(x => x.id === frei);
        return {titel, text: d ? `Du hast noch keine Quelle für ${mat.name}. Eröffne zum Beispiel ${d.ort}.` : `Du hast noch keine Quelle für ${mat.name}.`,
                ziel: frei ? {art:"mine", id:frei} : null, fab:f.land};
      }
      const m = S.minen[mineId], d = MINEN.find(x => x.id === mineId);
      if (m.stillBis > S.tag)
        return {titel, text:`${d.ort} steht gerade still. Öffne die Rohstoffquelle und schau nach dem Grund.`, ziel:{art:"mine", id:mineId}, fab:f.land};
      const raffIds = Object.keys(S.raff || {});
      if ((S.erz[knapp]||0) > 150 && raffIds.length){
        const rid = raffIds.find(id => S.raff[id].arbeiter < RAFF_ORTE.find(x => x.id === id).plaetze) || raffIds[0];
        const rd = RAFF_ORTE.find(x => x.id === rid);
        return {titel, text:`Es liegt viel Rohstoff bereit, aber die Raffinerie ${rd.ort} schafft zu wenig. Setze dort mehr Personal ein (jetzt ${S.raff[rid].arbeiter} von ${rd.plaetze}).`, ziel:{art:"raff", id:rid}, fab:f.land};
      }
      if (m.arbeiter < d.plaetze)
        return {titel, text:`Setze in ${d.ort} mehr Personal ein (jetzt ${m.arbeiter} von ${d.plaetze}).`, ziel:{art:"mine", id:mineId}, fab:f.land};
      return {titel, text:`${d.ort} ist voll besetzt. Baue die Rohstoffquelle aus oder eröffne eine zweite Quelle für ${mat.name}.`, ziel:{art:"mine", id:mineId}, fab:f.land};
    }
    const kraft = verkaufsKraft(), lager = warenLager();
    if (produktion > 0 && lager > Math.max(40, kraft * 6) && kraft < produktion * 0.9){
      return {titel:"Dein Lager wird voll",
              text:`Deine Fabriken schaffen etwa ${produktion} Stück pro Tag, dein Verkaufsteam verkauft ${kraft}. Setze im Markt mehr Leute in den Verkauf.`,
              ziel:{art:"seite", id:"markt"}};
    }
    return null;
  }

  function engpassOeffnen(e){
    if (!e || !e.ziel) return;
    if (e.ziel.art === "seite"){ seiteWechseln(e.ziel.id); return; }
    if (aktiveSeite !== "karte") seiteWechseln("karte");
    blattFuellen(e.ziel.art, e.ziel.id);
  }

  const vorherNaechster = naechsterSchritt;
  naechsterSchritt = function(){
    const api = window.__erzweltKnowledgeQuestFlow;
    const quest = api && typeof api.active === "function" ? api.active() : null;
    if (!quest){
      const e = engpass();
      if (e) return [e.titel, e.text];
    }
    return vorherNaechster();
  };

  /* Zeigt das Tutorial auf einen Knopf der Leiste unten (z. B. Team),
     endet das Blatt über der Leiste, damit der Knopf antippbar bleibt. */
  const dockHinweis = () => document.body.classList.toggle("dock-hinweis",
    tutorialLaeuft() && !!document.querySelector("#dock button.wink"));
  const dockEl = document.getElementById("dock");
  if (dockEl) new MutationObserver(dockHinweis).observe(dockEl, {subtree:true, attributes:true, attributeFilter:["class"]});
  Erzwelt.nachZeichnen(() => { materiallisteKlaeren(); dockHinweis(); });

  /* ---------- 3. «Ziel zeigen» nicht hinter der Aufgabenkarte: module/karte.js (ansichtAnwenden) ---------- */

  /* ---------- Gelb: kleine Unstimmigkeiten ---------- */
  /* «Das Spielmodell» ohne Formeln, Zusammenhänge in Worten (Lupe): module/wissen.js. */

  /* Kauf-Entscheide in Ruhe: Solange ein Blatt für einen noch nicht gekauften
     Standort offen ist, steht die Zeit. Nach dem Kauf oder Schliessen läuft
     sie im vorherigen Tempo weiter. Eigene Standorte laufen weiter, damit
     Bau und Produktion sichtbar bleiben. */
  let kaufPauseVon = null, eigenerAufruf = false;
  const kaufBlatt = (art, id) => art === "mine" ? !S.minen[id]
    : art === "raff" ? !S.raff[id]
    : art === "fab" ? !(S.fabriken || []).some(f => f.land === id) : false;
  const vorherTempoSetzen = tempoSetzen;
  tempoSetzen = function(v){
    if (!eigenerAufruf) kaufPauseVon = null;   // jemand anderes bestimmt das Tempo
    return vorherTempoSetzen(v);
  };
  const tempoIntern = v => { eigenerAufruf = true; try { tempoSetzen(v); } finally { eigenerAufruf = false; } };
  const fortsetzen = () => {
    if (kaufPauseVon === null) return;
    const v = kaufPauseVon; kaufPauseVon = null;
    if (!S.ende && !modalOffen && tempo === 0) tempoIntern(v);
  };
  /* Kaufblatt: Bild flacher, Kaufknopf klebt unten im Blatt und ist ohne
     Scrollen sichtbar. Der Pause-Hinweis steht direkt über dem Knopf. */
  const PAUSE_TEXT = "❚❚ Die Zeit steht, solange du dich entscheidest.";
  function kaufLayout(kauf, pausiert){
    const inhalt = document.getElementById("blattinhalt");
    if (!inhalt) return;
    inhalt.classList.toggle("kaufblatt", !!kauf);
    inhalt.querySelectorAll(":scope > .kaufpause").forEach(n => n.remove());
    if (!kauf) return;
    const svg = inhalt.querySelector(":scope > .szene svg.buehne");
    if (svg){
      svg.setAttribute("preserveAspectRatio", "xMidYMax slice");
      const leer = [...svg.querySelectorAll("text")].find(t => /Noch niemand/.test(t.textContent));
      if (leer) leer.setAttribute("y", "68");
    }
    let leiste = inhalt.querySelector(":scope > .kaufleiste");
    const cta = inhalt.querySelector(':scope > .cta[data-tun="mine-auf"], :scope > .cta[data-tun="raff-bau"]');
    if (cta && !leiste){
      leiste = document.createElement("div");
      leiste.className = "kaufleiste";
      cta.before(leiste); leiste.appendChild(cta);
      // Betrag nie trennen: «CHF» und Zahl bleiben auf derselben Zeile
      for (const n of [...cta.childNodes]) if (n.nodeType === 3) n.textContent = n.textContent.replace(/CHF (?=\d)/g, "CHF\u00a0");
    }
    if (leiste){
      let h = leiste.querySelector(".kaufpause-text");
      if (pausiert && !h){
        h = document.createElement("div"); h.className = "kaufpause-text"; h.textContent = PAUSE_TEXT; leiste.prepend(h);
      } else if (!pausiert && h) h.remove();
    } else if (pausiert){
      const n = document.createElement("div");
      n.className = "kaufpause"; n.textContent = PAUSE_TEXT;
      const titel = inhalt.querySelector(".titelzeile");
      if (titel) titel.after(n); else inhalt.prepend(n);
    }
  }
  const vorherBlattFuellen = blattFuellen;
  blattFuellen = function(art, id){
    const out = vorherBlattFuellen(art, id);
    const kauf = kaufBlatt(art, id) && !S.ende && !modalOffen && S.schwierigkeit;
    if (kauf && kaufPauseVon === null && tempo > 0){ kaufPauseVon = tempo; tempoIntern(0); }
    else if (!kauf) fortsetzen();
    kaufLayout(kauf, !!kauf && kaufPauseVon !== null);
    return out;
  };
  const vorherBlattZu = blattZu;
  blattZu = function(){
    const out = vorherBlattZu();
    fortsetzen();
    return out;
  };

  /* Engpass-Kasten und kompakte Zeile der Aufgabenkarte: module/aufgabe.js. */
  window.__erzweltSekBKlarheit = {version:1, engpass, engpassOeffnen};
  seitenStand = ""; blattStand = "";
})();
