"use strict";
/* ============================================================
   LOGIK-FIXES (Sek B)

   1. Etappenziel passend zur Schwierigkeit: Einfach CHF 500'000,
      Mittel und Schwer CHF 3 Mio. Investitionen werden im
      Ziel-Reiter getrennt ausgewiesen, damit das Minus nach dem Bau
      nachvollziehbar ist.
   2. Herkunftsnachweise sind eine sichtbare Entscheidung pro
      Rohstoffquelle. Der Transparenzbericht nennt seine Nachweiswirkung.
   3. Taiwan-Ereignis: keine Rohstoffpreis-Behauptung mehr, weil
      Rohstoffpreise im Spiel nicht berechnet werden.
   4. Recherche-Ereignis: keine Strafe auf ein Produkt, das man
      vielleicht gar nicht herstellt. Die Folge läuft über den Ruf.
   ============================================================ */

(function(){
  /* ---------- 1. Etappenziel und Investitionen ---------- */
  /* Durchgerechnet mit dem Spielcode (Nov. 2026): Mit Ladekabeln allein
     sind höchstens rund 1.6 Mio (Etappe 1) bzw. 2.5 Mio (Etappe 2) möglich.
     Mittel/Schwer verlangen deshalb ein zweites Produkt, aber kein
     perfektes Timing mit hohen Schulden. */
  const ZIEL_NACH_STUFE = {einfach:500000, mittel:3000000, schwer:3000000};
  const zielGewinn = () => ZIEL_NACH_STUFE[S && S.schwierigkeit] ?? ZIEL_GEWINN;
  const START_TEAM = 10;   // ältere Spielstände; neue Runden: S.startTeam = 0 (einfuehrung.js)

  /* Wert aller bisherigen Investitionen, aus dem Spielstand berechnet:
     Erschliessung, Bau, Ausbau, Fabriken, Einstellungen, Verbesserungen. */
  function investitionswert(){
    let summe = 0;
    const ausbauSumme = (grund, stufen) => {
      let s = 0;
      for (let n = 0; n < (stufen || 0); n++) s += ausbauKosten(grund, n);
      return s;
    };
    for (const id in S.minen){
      const d = MINEN.find(x => x.id === id);
      if (d) summe += d.erschliessung + ausbauSumme(d.erschliessung, S.minen[id].ausbau);
    }
    for (const id in S.raff){
      const d = RAFF_ORTE.find(x => x.id === id);
      if (d) summe += d.bau + ausbauSumme(d.bau, S.raff[id].ausbau);
    }
    for (const f of S.fabriken || []) summe += (PRODUKT[f.produkt] || {}).kosten || 0;
    for (const id in S.perks || {}) summe += (PERK_INDEX[id] && PERK_INDEX[id].perk.kosten) || 0;
    summe += Math.max(0, (S.arbeiterGesamt || 0) - (S.startTeam ?? START_TEAM)) * LOHN_PRO_KOPF;
    return summe;
  }
  function etappenInvestitionen(){
    if (typeof S.investStartWert !== "number"){
      // Etappe 1 beginnt ohne Anlagen. Ältere Spielstände in späteren
      // Etappen starten die Zählung ab jetzt.
      S.investStartWert = (S.etappe || 1) > 1 ? investitionswert() : 0;
    }
    return Math.max(0, investitionswert() - S.investStartWert);
  }

  /* Was fürs Etappenziel zählt. Einfach: nur das laufende Geschäft
     (Investitionen in Standorte, Ausbau und Verbesserungen zählen nicht als Verlust).
     Mittel/Schwer: Etappengewinn mit Investitionen. */
  const ohneInvestitionen = () => S && S.schwierigkeit === "einfach";
  const zielWert = () => etappenGewinn() + (ohneInvestitionen() ? etappenInvestitionen() : 0);

  const originalEtappeWeiter = etappeWeiter;
  etappeWeiter = function(...args){
    S.investStartWert = investitionswert();
    return originalEtappeWeiter.apply(this, args);
  };

  rundeBeenden = function(grund){
    if (S.ende) return;
    const vorherTempo = tempo > 0 ? tempo : 1;
    const gewinn = zielWert();
    const ziel = zielGewinn();
    const geschafft = grund !== "insolvenz" && gewinn >= ziel && S.ruf >= ZIEL_RUF;
    const mittelUnlock = geschafft && S.schwierigkeit === "mittel" && !META.mittelGeschafft;
    if (mittelUnlock){ META.mittelGeschafft = true; metaSpeichern(); }
    S.ende = {grund:grund||"etappe", etappe:S.etappe||1, gewinn, ruf:Math.round(S.ruf), geschafft};
    tempoSetzen(0);
    abschlussZeigen(vorherTempo, mittelUnlock);
  };

  function abschlussZeigen(vorherTempo = 1, mittelUnlock = false){
    const {grund, gewinn, geschafft} = S.ende;
    const ziel = zielGewinn();
    // Auf Einfach verfehlt: neue Runde von vorn, wahlweise mit mehr Verkaufserlös
    const hilfeRunden = S.schwierigkeit === "einfach" && !geschafft && window.__erzweltSpielstaende
      ? [0, 40, 60].map(prozent => ({
          text: textVon(prozent ? "bonus.rundeMit" : "bonus.rundeOhne", {prozent}),
          klein: textVon(prozent ? "bonus.rundeMitKlein" : "bonus.rundeOhneKlein"),
          tun: () => { setTimeout(() => window.__erzweltSpielstaende.neueRundeEinfach(prozent), 0); }
        }))
      : null;
    if (grund === "insolvenz"){
      dialogZeigen({
        art:textVon("abschlusszerti.insolvenz"), titel:textVon("logikfixes.die-firma-ist-zahlungsunfaehig"),
        text:textVon("logikfixes.deine-kasse-ist-unter", {p1:(S.tag)})
          + (hilfeRunden ? "<br><br>" + textVon("bonus.frage") : ""),
        wahlen: hilfeRunden || [{text:textVon("logikfixes.neue-runde-starten"), klein:textVon("logikfixes.schwierigkeit-neu-waehlen"), tun:()=>{ setTimeout(zuruecksetzen,0); }}]
      });
      return;
    }

    const freischaltText = mittelUnlock
      ? textVon("logikfixes.schwer-freigeschaltet-du-kannst") : "";
    const wahlen = [
      {text:textVon("logikfixes.weiter-etappe", {p1:((S.etappe||1)+1)}), klein:textVon("logikfixes.nochmals-tage-mit-derselben", {p1:(ZIEL_TAGE)}), tun:()=>{ etappeWeiter(vorherTempo); }}
    ];
    if (hilfeRunden) wahlen.push(...hilfeRunden);
    else wahlen.push({text:textVon("logikfixes.neue-runde-starten"), klein:textVon("logikfixes.speicherplatz-und-schwierigkeit-waehlen"), tun:()=>{ setTimeout(zuruecksetzen,0); }});
    dialogZeigen({
      art:textVon("logikfixes.etappe-tage", {p1:(S.etappe), p2:(ZIEL_TAGE)}),
      titel: geschafft ? textVon("slot.zielErreicht") : textVon("abschlusszerti.etappenziel-verfehlt"),
      text: textVon(ohneInvestitionen() ? "logikfixes.laufend-ziel-ruf-ziel" : "logikfixes.etappengewinn-ziel-ruf-ziel", {p1:(chf(gewinn)), p2:(chf(ziel)), p3:(Math.round(S.ruf)), p4:(ZIEL_RUF)})
          + textVon("logikfixes.schwierigkeit", {p1:(schwierigkeitInfo().icon), p2:(schwierigkeitInfo().name), p3:(verkaufsEffektText())})
          + (geschafft
              ? textVon("logikfixes.du-hast-geld-verdient")
              : (gewinn >= ziel
                 ? textVon("logikfixes.der-gewinn-stimmt-aber")
                 : textVon("logikfixes.der-gewinn-reicht-noch")))
          + (hilfeRunden ? "<br><br>" + textVon("bonus.frageEtappe") : "")
          + freischaltText,
      wahlen
    });
  }

  /* ---------- 2. Herkunftsnachweise ---------- */
  const NACHWEIS_KOSTEN = 30000;
  const nachweisDurchPerk = () => perkHat("ruf2") ? "zertifiziert" : perkHat("ruf1") ? "dokumentiert" : "";
  const geprueft = () => offeneMinen().filter(id => S.minen[id] && S.minen[id].nachweis).length;

  const rufSeg = WISSEN.find(s => s.id === "ruf");
  if (rufSeg){
    const p1 = rufSeg.perks.find(p => p.id === "ruf1");
    const p2 = rufSeg.perks.find(p => p.id === "ruf2");
    if (p1){
      p1.text = textVon("logikfixes.ein-transparenzbericht-dokumentiert-die");
      p1.wirkung = [textVon("logikfixes.herkunftsnachweise-fuer-alle-quellen"), textVon("logikfixes.ruf-sofort"), textVon("logikfixes.nachfrage")];
    }
    if (p2){
      p2.text = textVon("logikfixes.unabhaengige-stellen-pruefen-alle");
      p2.wirkung = [textVon("logikfixes.herkunftsnachweise-zertifiziert"), textVon("logikfixes.nachfrage-2"), textVon("logikfixes.rufverluste")];
    }
  }

  function nachweisKarte(id){
    const m = S.minen[id];
    if (!m || tutorialLaeuft()) return "";
    const perk = nachweisDurchPerk();
    const ok = !!(perk || m.nachweis);
    const status = perk ? `${perk} (Transparenzbericht)` : m.nachweis ? textVon("logikfixes.geprueft") : "fehlt";
    const genug = S.kasse >= NACHWEIS_KOSTEN;
    return textVon("logikfixes.herkunftsnachweis-eine-pruefung-zeigt", {p1:(ok ? "sicher" : "offen"), p2:(ok ? "var(--gruen)" : "var(--warn)"), p3:(status), p4:(ok ? "" : `<button class="cta gruen" data-didaktik="nachweis" data-id="${id}" ${genug ? "" : "disabled"}>${IK.schild}${genug ? "Herkunft prüfen lassen · " + chf(NACHWEIS_KOSTEN) : "Zu wenig Geld · " + chf(NACHWEIS_KOSTEN)}</button>`)});
  }

  /* Rohstoffquelle: Nachweis-Karte vor der Zufriedenheit (Reihenfolge: module/blatt.js) */
  (window.__erzweltBlattTeile ||= {}).nachweis = function(html, id){
    const karte = nachweisKarte(id);
    if (!karte) return html;
    const marke = '<div class="karte zufriedenheitskarte">';
    return html.includes(marke) ? html.replace(marke, karte + marke) : html + karte;
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-didaktik='nachweis']");
    if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const id = b.dataset.id, m = S.minen[id];
    if (!m || m.nachweis || S.kasse < NACHWEIS_KOSTEN) return;
    S.kasse -= NACHWEIS_KOSTEN; S.ausgegeben += NACHWEIS_KOSTEN; m.nachweis = true;
    const n = offeneMinen().length, g = geprueft();
    notiz(textVon("logikfixes.herkunft-geprueft-von-rohstoffquellen", {p1:(MINEN.find(x => x.id === id).ort), p2:(g), p3:(n)}), "gut");
    speichern(); blattStand = ""; seitenStand = ""; zeichnen();
  }, true);

  /* Ziel-Reiter: Ziel pro Schwierigkeit, Investitionen, Nachweis-Zähler. */
  /* (Reihenfolge: module/seiten.js) */
  (window.__erzweltSeitenTeile ||= {}).zielEtappe = function(html){
    const gewinn = etappenGewinn(), ziel = zielGewinn();
    const invest = etappenInvestitionen();
    html = html.replace(/(<div class="leiste"><i style="width:)[\d.]+(%;background:var\(--gold\)"><\/i><\/div>)/,
      `$1${klemm(zielWert() / ziel * 100, 0, 100)}$2`);
    // Einfach: oben steht, was fürs Ziel zählt (laufendes Geschäft der Etappe)
    if (ohneInvestitionen()) html = html.replace(/<span>Etappengewinn<\/span><b>[^<]*<\/b>/,
      `<span>${textVon("logikfixes.laufend-etappe")}</span><b>${chf(zielWert())}</b>`);
    html = html.replace(textVon("logikfixes.ziel-gesamtgewinn", {p1:(chf(ZIEL_GEWINN))}), textVon("logikfixes.ziel-gesamtgewinn", {p1:(chf(ziel))}));
    html = html.replace(/(Gesamtgewinn seit Start [^<]*<\/div>)/,
      ohneInvestitionen()
        ? textVon("logikfixes.investiert-zaehlt-nicht", {p1:(chf(ziel)), p2:(chf(-invest)), p3:(chf(gewinn))})
        : textVon("logikfixes.davon-investitionen-laufendes-geschaeft", {p1:(chf(-invest)), p2:(gewinn + invest >= 0 ? "var(--gruen)" : "var(--alarm)"), p3:(chf(gewinn + invest))}));

    const n = offeneMinen().length, g = geprueft(), perk = nachweisDurchPerk();
    const hilfe = perk
      ? textVon("logikfixes.der-transparenzbericht-gilt-fuer")
      : textVon("logikfixes.nachweis-holen-quelle-oeffnen", {p1:(chf(NACHWEIS_KOSTEN))});
    html = html.replace(
      '<div class="notiz">Nachweise entscheiden bei Lieferkettengesetzen. Dein Ruf ist davon getrennt und beeinflusst die Nachfrage.</div>',
      textVon("logikfixes.das-lieferkettengesetz-verlangt-fuer", {p1:(perk ? "" : `<div class="zeile"><span>Geprüfte Rohstoffquellen</span><b>${g} von ${n}</b></div>`), p2:(hilfe)}));
    return html;
  };

  const gesetz = EREIGNISSE.find(e => e.id === "lieferkettengesetz");
  if (gesetz){
    gesetz.bau = function(){
      const status = nachweisStatus();
      if (status.stufe === 0){
        const n = offeneMinen().length, fehlen = n - geprueft();
        S.kasse -= 180000; S.ausgegeben += 180000;
        return {passiv:true, text:textVon("logikfixes.lieferkettengesetz-fuer-von-rohstoffquellen", {p1:(fehlen), p2:(n)}), art:"alarm"};
      }
      for (const f of S.fabriken || []) S.nachfrageMod[f.produkt] = {faktor:1.3, bis:S.tag+90};
      return {passiv:true, text:textVon("logikfixes.lieferkettengesetz-deine-nachweise-sind", {p1:(status.text)}), art:"gut"};
    };
  }

  /* ---------- 3. Taiwan ohne Rohstoffpreis ---------- */
  const taiwan = EREIGNISSE.find(e => e.id === "taiwan");
  if (taiwan){
    taiwan.bau = function(){
      S.nachfrageMod.phone = {faktor:1.5, bis:S.tag+70};
      S.nachfrageMod.konsole = {faktor:1.5, bis:S.tag+70};
      return {passiv:true, text:textVon("logikfixes.erdbeben-bei-taiwan-andere"), art:"warn"};
    };
  }

  /* ---------- 4. Recherche: Folge über den Ruf ---------- */
  const recherche = EREIGNISSE.find(e => e.id === "kinderarbeit");
  if (recherche){
    recherche.bau = function(id = offeneMinen().find(i => !S.minen[i].nachweis)){
      const def = MINEN.find(x => x.id === id);
      return {
        offenesEreignis:{id:recherche.id, mine:id},
        art:textVon("didacticevents.recherche"), titel:textVon("didacticevents.fragen-zu-deiner-lieferkette"), land:def.land,
        text:textVon("didacticevents.eine-recherche-stellt-fragen", {p1:(def.ort)}),
        wahlen:[
          {text:textVon("didacticevents.unabhaengige-pruefung-beauftragen"), klein:textVon("logikfixes.chf-unter-zeitdruck-teurer"),
           tun(){ S.kasse-=90000; S.ausgegeben+=90000; S.minen[id].nachweis=true; notiz(textVon("didacticevents.unabhaengige-pruefung-abgeschlossen", {p1:(def.ort)}),"gut"); }},
          {text:textVon("didacticevents.keine-pruefung-vorlegen"), klein:textVon("logikfixes.kostet-nichts-ruf-sinkt"),
           tun(){ rufAendern(-18); notiz(textVon("logikfixes.keine-unabhaengigen-nachweise-vorgelegt"),"alarm"); }}
        ]
      };
    };
  }

  const style = document.createElement("style");
  style.id = "erzwelt-logik-fixes-style";
  style.textContent = `.nachweiskarte.offen{border:2px solid #e6b450}.nachweiskarte.sicher{border:2px solid #75aa93}`;
  document.head.appendChild(style);

  window.__erzweltLogikFixes = {version:1, ziele:ZIEL_NACH_STUFE, zielGewinn, zielWert, investitionswert, etappenInvestitionen, NACHWEIS_KOSTEN, abschlussZeigen};
  seitenStand = ""; blattStand = "";
})();
