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

  const originalEtappeWeiter = etappeWeiter;
  etappeWeiter = function(...args){
    S.investStartWert = investitionswert();
    return originalEtappeWeiter.apply(this, args);
  };

  rundeBeenden = function(grund){
    if (S.ende) return;
    const vorherTempo = tempo > 0 ? tempo : 1;
    const gewinn = etappenGewinn();
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
    if (grund === "insolvenz"){
      dialogZeigen({
        art:"Insolvenz", titel:"Die Firma ist zahlungsunfähig",
        text:`Deine Kasse ist unter −CHF 800’000 gefallen. Die laufende Reise endet an Tag ${S.tag}.`,
        wahlen:[{text:"Neue Runde starten", klein:"Schwierigkeit neu wählen", tun:()=>{ setTimeout(zuruecksetzen,0); }}]
      });
      return;
    }

    const freischaltText = mittelUnlock
      ? `<br><br><b>Schwer freigeschaltet!</b> Du kannst Schwer ab der nächsten neuen Runde wählen.` : "";
    const bonusAngebot = !geschafft && S.schwierigkeit === "einfach" && !S.hilfsBonus;
    const wahlen = [
      {text:`Weiter · Etappe ${(S.etappe||1)+1}`, klein:`Nochmals ${ZIEL_TAGE} Tage mit derselben Firma`, tun:()=>{ etappeWeiter(vorherTempo); }}
    ];
    if (bonusAngebot) wahlen.push({
      text:"✨ Weiter mit Bonus",
      klein:"Gleicher Run · Verkaufserlöse ab jetzt +50 %",
      tun:()=>{ etappeWeiter(vorherTempo, true); }
    });
    wahlen.push({text:"Neue Runde starten", klein:"Speicherplatz und Schwierigkeit wählen", tun:()=>{ setTimeout(zuruecksetzen,0); }});
    dialogZeigen({
      art:`Etappe ${S.etappe} · ${ZIEL_TAGE} Tage`,
      titel: geschafft ? "Etappenziel erreicht" : "Etappenziel verfehlt",
      text: `Etappengewinn: ${chf(gewinn)} (Ziel ${chf(ziel)}) · Ruf: ${Math.round(S.ruf)} (Ziel ${ZIEL_RUF}).<br>`
          + `Schwierigkeit: ${schwierigkeitInfo().icon} <b>${schwierigkeitInfo().name}</b> · ${verkaufsEffektText()}.<br><br>`
          + (geschafft
              ? "Du hast Geld verdient <b>und</b> den Ruf gehalten. Du kannst jetzt weiterbauen und dich der nächsten gleich langen Etappe stellen."
              : (gewinn >= ziel
                 ? "Der Gewinn stimmt, aber der Ruf nicht. Du darfst trotzdem weiterspielen und es in der nächsten Etappe erneut versuchen."
                 : "Der Gewinn reicht noch nicht. Du darfst trotzdem weiterspielen und deine Lieferkette in der nächsten Etappe verbessern."))
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
      p1.text = "Ein Transparenzbericht dokumentiert die Herkunft aller deiner Rohstoffquellen. Er stärkt auch Ruf und Nachfrage.";
      p1.wirkung = ["Herkunftsnachweise für alle Quellen", "Ruf sofort +8", "Nachfrage +5 %"];
    }
    if (p2){
      p2.text = "Unabhängige Stellen prüfen alle Rohstoffquellen. Das stärkt die Nachfrage und dämpft Rufverluste.";
      p2.wirkung = ["Herkunftsnachweise zertifiziert", "Nachfrage +10 %", "Rufverluste −40 %"];
    }
  }

  function nachweisKarte(id){
    const m = S.minen[id];
    if (!m || tutorialLaeuft()) return "";
    const perk = nachweisDurchPerk();
    const ok = !!(perk || m.nachweis);
    const status = perk ? `${perk} (Transparenzbericht)` : m.nachweis ? "geprüft" : "fehlt";
    const genug = S.kasse >= NACHWEIS_KOSTEN;
    return `<div class="karte nachweiskarte ${ok ? "sicher" : "offen"}">
      <h3>Herkunftsnachweis</h3>
      <div class="ort">Eine Prüfung zeigt, woher dein Rohstoff kommt. Das Lieferkettengesetz verlangt das für <b>jede</b> Quelle.</div>
      <div class="zeile"><span>Status</span><b style="color:${ok ? "var(--gruen)" : "var(--warn)"}">${status}</b></div>
      ${ok ? "" : `<button class="cta gruen" data-didaktik="nachweis" data-id="${id}" ${genug ? "" : "disabled"}>${IK.schild}${genug ? "Herkunft prüfen lassen · " + chf(NACHWEIS_KOSTEN) : "Zu wenig Geld · " + chf(NACHWEIS_KOSTEN)}</button>`}
    </div>`;
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
    notiz(`<b>${MINEN.find(x => x.id === id).ort}</b>: Herkunft geprüft · ${g} von ${n} Rohstoffquellen haben einen Nachweis.`, "gut");
    speichern(); blattStand = ""; seitenStand = ""; zeichnen();
  }, true);

  /* Ziel-Reiter: Ziel pro Schwierigkeit, Investitionen, Nachweis-Zähler. */
  /* (Reihenfolge: module/seiten.js) */
  (window.__erzweltSeitenTeile ||= {}).zielEtappe = function(html){
    const gewinn = etappenGewinn(), ziel = zielGewinn();
    const invest = etappenInvestitionen();
    html = html.replace(/(<div class="leiste"><i style="width:)[\d.]+(%;background:var\(--gold\)"><\/i><\/div>)/,
      `$1${klemm(gewinn / ziel * 100, 0, 100)}$2`);
    html = html.replace(`Ziel ${chf(ZIEL_GEWINN)} · Gesamtgewinn`, `Ziel ${chf(ziel)} · Gesamtgewinn`);
    html = html.replace(/(Gesamtgewinn seit Start [^<]*<\/div>)/,
      `$1
      <div class="zeile" style="margin-top:8px"><span>Davon Investitionen</span><b>${chf(-invest)}</b></div>
      <div class="zeile"><span>Laufendes Geschäft</span><b style="color:${gewinn + invest >= 0 ? "var(--gruen)" : "var(--alarm)"}">${chf(gewinn + invest)}</b></div>
      <div class="ort">Investitionen: Standorte, Ausbau, Leute, Verbesserungen. Sie lohnen sich erst über Verkäufe.</div>`);

    const n = offeneMinen().length, g = geprueft(), perk = nachweisDurchPerk();
    const hilfe = perk
      ? `Der Transparenzbericht gilt für alle deine Rohstoffquellen.`
      : `Nachweis holen: Quelle öffnen → <b>«Herkunft prüfen lassen»</b> (${chf(NACHWEIS_KOSTEN)}). Oder im Reiter Wissen den <b>Transparenzbericht</b> finanzieren: gilt für alle.`;
    html = html.replace(
      '<div class="notiz">Nachweise entscheiden bei Lieferkettengesetzen. Dein Ruf ist davon getrennt und beeinflusst die Nachfrage.</div>',
      `${perk ? "" : `<div class="zeile"><span>Geprüfte Rohstoffquellen</span><b>${g} von ${n}</b></div>`}
      <div class="notiz">Das Lieferkettengesetz verlangt für jede Quelle einen Nachweis. ${hilfe}</div>`);
    return html;
  };

  const gesetz = EREIGNISSE.find(e => e.id === "lieferkettengesetz");
  if (gesetz){
    gesetz.bau = function(){
      const status = nachweisStatus();
      if (status.stufe === 0){
        const n = offeneMinen().length, fehlen = n - geprueft();
        S.kasse -= 180000; S.ausgegeben += 180000;
        return {passiv:true, text:`<b>Lieferkettengesetz</b> – für ${fehlen} von ${n} Rohstoffquellen fehlen Herkunftsnachweise. Busse: CHF 180'000.`, art:"alarm"};
      }
      for (const f of S.fabriken || []) S.nachfrageMod[f.produkt] = {faktor:1.3, bis:S.tag+90};
      return {passiv:true, text:`<b>Lieferkettengesetz</b> – deine Nachweise sind ${status.text}. Grosskunden bestellen 90 Tage lang 30 % mehr von deinen Produkten.`, art:"gut"};
    };
  }

  /* ---------- 3. Taiwan ohne Rohstoffpreis ---------- */
  const taiwan = EREIGNISSE.find(e => e.id === "taiwan");
  if (taiwan){
    taiwan.bau = function(){
      S.nachfrageMod.phone = {faktor:1.5, bis:S.tag+70};
      S.nachfrageMod.konsole = {faktor:1.5, bis:S.tag+70};
      return {passiv:true, text:"<b>Erdbeben bei Taiwan</b> – andere Firmen können weniger Elektronik liefern. Die Nachfrage nach Smartphones und Konsolen steigt 70 Tage lang um 50 %.", art:"warn"};
    };
  }

  /* ---------- 4. Recherche: Folge über den Ruf ---------- */
  const recherche = EREIGNISSE.find(e => e.id === "kinderarbeit");
  if (recherche){
    recherche.bau = function(id = offeneMinen().find(i => !S.minen[i].nachweis)){
      const def = MINEN.find(x => x.id === id);
      return {
        offenesEreignis:{id:recherche.id, mine:id},
        art:"Recherche", titel:"Fragen zu deiner Lieferkette", land:def.land,
        text:`Eine Recherche stellt Fragen zu den Arbeitsbedingungen in ${def.ort}. Deine Firma kann für diese Rohstoffquelle noch keine unabhängige Prüfung vorlegen.`,
        wahlen:[
          {text:"Unabhängige Prüfung beauftragen", klein:"CHF 90'000 · unter Zeitdruck teurer · Nachweis für diese Quelle",
           tun(){ S.kasse-=90000; S.ausgegeben+=90000; S.minen[id].nachweis=true; notiz(`${def.ort}: unabhängige Prüfung abgeschlossen.`,"gut"); }},
          {text:"Keine Prüfung vorlegen", klein:"Kostet nichts · Ruf sinkt deutlich · ein tiefer Ruf senkt die Nachfrage nach allen Produkten",
           tun(){ rufAendern(-18); notiz("Keine unabhängigen Nachweise vorgelegt. Dein Ruf sinkt.","alarm"); }}
        ]
      };
    };
  }

  const style = document.createElement("style");
  style.id = "erzwelt-logik-fixes-style";
  style.textContent = `.nachweiskarte.offen{border:2px solid #e6b450}.nachweiskarte.sicher{border:2px solid #75aa93}`;
  document.head.appendChild(style);

  window.__erzweltLogikFixes = {version:1, ziele:ZIEL_NACH_STUFE, zielGewinn, investitionswert, etappenInvestitionen, NACHWEIS_KOSTEN, abschlussZeigen};
  seitenStand = ""; blattStand = "";
})();
