"use strict";
/* ============================================================
   SEK-B-KLARHEIT

   Verständlichkeit und Bedienung auf dem Handy. Keine neue Wirtschaft.
   1. Schwierigkeitsdialog ohne Fachjargon, Einfach empfohlen.
   2. Tutorial-Karte: eine Fortschrittsanzeige weniger.
   3. «Ziel zeigen»: Ziel landet unter der Aufgabenkarte, nicht dahinter.
   4. «Schritt abgeschlossen» überdeckt kein offenes Blatt mehr.
   5. Einheiten: pro Person, pro Tag, pro Monat, pro Stück.
   6. Tutorial-Raffinerie zeigt die Kabel-Rohstoffe statt Seltener Erden.
   7. Konkrete Engpass-Hinweise: welcher Ort braucht was.
   8. Weniger «Spielmodell»-Vorbehalte in Blättern und Seiten.
   Gelb: Tutorial-Prüfung = Text, «Das Spielmodell» ohne Formeln,
   Zeit steht bei Kauf-Entscheiden.
   Aufgabe auf anderen Seiten nur als schmale Zeile.
   ============================================================ */

(function(){
  const ziele = (window.__erzweltLogikFixes && window.__erzweltLogikFixes.ziele) || {einfach:500000, mittel:3000000, schwer:3000000};
  const kurzChf = n => (n >= 1e6 ? textVon("sekbklarheit.chf-mio", {p1:((n/1e6).toLocaleString("de-CH"))}) : chf(n)).replace(/ /g, "&nbsp;");
  const ersetze = (html, alt, neu) => html.split(alt).join(neu);

  /* ---------- 1. Schwierigkeit ---------- */
  SCHWIERIGKEIT.einfach.effekt = textVon("sekbklarheit.verkauf-bringt-mehr");
  SCHWIERIGKEIT.mittel.effekt  = textVon("sekbklarheit.normale-verkaufspreise");
  SCHWIERIGKEIT.schwer.effekt  = textVon("sekbklarheit.verkauf-bringt-weniger");

  /* Schwierigkeitswahl: ersetzt die Fassung des Kerns (Reihenfolge: module/einfuehrung.js) */
  (window.__erzweltEinfuehrungTeile ||= {}).schwierigkeitWahl = function(){
    modalOffen = true; tempoSetzen(0);
    $("#d-art").textContent = textVon("sekbklarheit.neue-runde");
    $("#d-titel").textContent = textVon("sekbklarheit.waehle-die-schwierigkeit");
    $("#d-text").innerHTML = textVon("sekbklarheit.die-schwierigkeit-bestimmt-wie");
    const optionen = [
      ["einfach","🌱",textVon("sekbklarheit.einfach"),textVon("sekbklarheit.verkauf-bringt-mehr-ziel", {p1:(kurzChf(ziele.einfach))}),false,textVon("sekbklarheit.empfohlen")],
      ["mittel","⚙️",textVon("sekbklarheit.mittel"),textVon("sekbklarheit.normale-verkaufspreise-ziel", {p1:(kurzChf(ziele.mittel))}),false,""],
      ["schwer","🔥",textVon("sekbklarheit.schwer"),textVon("sekbklarheit.verkauf-bringt-weniger-ziel", {p1:(kurzChf(ziele.schwer))}),!META.mittelGeschafft,textVon("sekbklarheit.erst-mittel-schaffen")]
    ];
    $("#d-wahlen").innerHTML = "";
    optionen.forEach(([id,icon,name,klein,gesperrt,status])=>{
      const b = document.createElement("button");
      b.className = "wahl schwierigkeit"; b.disabled = gesperrt;
      const badge = id === "einfach" ? ` <span class="empfohlen">${status}</span>` : "";
      const sperre = gesperrt ? `<br><span class="sperre">${status}</span>` : "";
      b.innerHTML = `<span class="schwierigkeitsicon">${icon}</span><span><b>${name}${badge}</b><small>${klein}${sperre}</small></span>`;
      if (!gesperrt) b.onclick = () => {
        S.schwierigkeit = id; S.etappe = 1; S.etappeStartEingenommen = S.eingenommen; S.etappeStartAusgegeben = S.ausgegeben; S.ende = null;
        modalOffen = false; $("#schleier").hidden = true;
        notiz(textVon("sekbklarheit.schwierigkeit-gewaehlt", {p1:(icon), p2:(name), p3:(SCHWIERIGKEIT[id].effekt)}), "gut");
        speichern(); tempoSetzen(1); zeichnen();
      };
      $("#d-wahlen").appendChild(b);
      if (id === "einfach") setTimeout(()=>b.focus(), 60);
    });
    $("#schleier").hidden = false; zeichnen();
  };

  /* ---------- 5. Einheiten und 8. weniger Vorbehalte ---------- */
  const proTag = v => v >= 10 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toLocaleString("de-CH");

  /* Texte der Blätter: Einheiten statt Fachwörter (Reihenfolge: module/blatt.js) */
  const blattTeile = (window.__erzweltBlattTeile ||= {});
  blattTeile.mineTexte = function(html, id){
    const def = MINEN.find(x => x.id === id);
    if (!def) return html;
    const land = LAND[def.land];
    html = ersetze(html, textVon("sekbklarheit.ergiebigkeit-rohstoff", {p1:(def.ergiebigkeit)}),
      textVon("sekbklarheit.foerderung-pro-person-pro", {p1:(proTag(def.ergiebigkeit))}));
    html = ersetze(html, textVon("sekbklarheit.plaetze", {p1:(def.plaetze)}), textVon("sekbklarheit.arbeitsplaetze", {p1:(def.plaetze)}));
    html = ersetze(html, textVon("sekbklarheit.ueblicher-lohn", {p1:(chf(land.lohn))}),
      textVon("sekbklarheit.ueblicher-lohn-pro-person", {p1:(chf(land.lohn))}));
    html = html.replace(/(<small>Förderung<\/small><b>[^<]*)\/Tag<\/b>/, textVon("sekbklarheit.pro-tag"));
    html = html.replace(/(<small>Lohnkosten<\/small><b>[^<]*)<\/b>/, textVon("sekbklarheit.pro-monat"));
    html = ersetze(html, textVon("sekbklarheit.spielmodell-mengen-und-loehne"), "");
    return html;
  };

  blattTeile.raffTexte = function(html, id){
    const def = RAFF_ORTE.find(x => x.id === id);
    if (!def) return html;
    const land = LAND[def.land];
    const spezial = (def.spezial||[]).map(k => MATERIAL[k] && MATERIAL[k].name).filter(Boolean);
    const alteKarte = textVon("sekbklarheit.spezialisierung-im-spiel-durchsatz", {p1:(spezial.join(" · ")||"keine Spezialisierung")});
    const neueKarte = tutorialLaeuft() ? "" : textVon("sekbklarheit.spezialisierung-diese-rohstoffe-verarbeitet", {p1:(spezial.join(" · ")||"keine Spezialisierung")});
    html = ersetze(html, alteKarte, neueKarte);
    html = ersetze(html, textVon("sekbklarheit.kapazitaet-tag", {p1:(def.kapazitaet)}),
      textVon("sekbklarheit.verarbeitet-bis-zu-rohstoff", {p1:(def.kapazitaet)}));
    html = ersetze(html, textVon("sekbklarheit.plaetze", {p1:(def.plaetze)}), textVon("sekbklarheit.arbeitsplaetze", {p1:(def.plaetze)}));
    html = ersetze(html, textVon("sekbklarheit.lohn", {p1:(chf(land.lohn))}),
      textVon("sekbklarheit.lohn-pro-person-und", {p1:(chf(land.lohn))}));
    html = ersetze(html, textVon("sekbklarheit.betrieb-mt", {p1:(chf(9000))}),
      textVon("sekbklarheit.betriebskosten-pro-monat", {p1:(chf(9000))}));
    html = html.replace(/<small>Durchsatz<\/small><b>(\d+)\/Tag<\/b>/, textVon("sekbklarheit.verarbeitet-rohstoff-pro-tag"));
    html = ersetze(html, textVon("sekbklarheit.der-rest-steht-im"), "Der Rest ist Abraum: Gestein und Abfall.");
    return html;
  };

  /* Raffinerie-Szene in der Einführung mit dem Start-Rohstoff: module/blatt.js */

  blattTeile.fabTexte = function(html, land){
    html = ersetze(html, textVon("sekbklarheit.fabrikstandort-lohn-monat", {p1:(chf(LAND[land].lohn))}), textVon("sekbklarheit.fabrikstandort-lohn-pro-person", {p1:(chf(LAND[land].lohn))}));
    html = ersetze(html, textVon("sekbklarheit.vereinfachtes-rezept-spielmodell"), textVon("sekbklarheit.rezept-material-pro-stueck"));
    const e = engpass();
    const tipp = e && e.fab === land ? e.text : textVon("sekbklarheit.sichere-dafuer-eine-eigene");
    html = ersetze(html, textVon("sekbklarheit.zukaufen-geht-nicht-sichere"), tipp);
    return html;
  };

  /* Texte im Team- und Markt-Reiter (Reihenfolge: module/seiten.js) */
  const seitenTeile = (window.__erzweltSeitenTeile ||= {});
  seitenTeile.teamTexte = function(html){
    html = ersetze(html, textVon("sekbklarheit.lohnkosten-im-spielmodell"), textVon("sekbklarheit.personal-einstellen-und-auf"));
    html = ersetze(html, `<div class="notiz blau"><b>Spielmodell:</b> Die Lohnwerte sind vereinfacht und keine aktuelle Lohnstatistik.</div>`, "");
    return html;
  };

  seitenTeile.marktTexte = function(html){
    html = ersetze(html, "Rohstoffpreise am Weltmarkt werden nicht berechnet. Die Rohstoffe stammen im Spiel aus eigenen Quellen und werden anschliessend raffiniert.",
      "Die Quelle liefert Rohstoff, die Raffinerie macht Material daraus.");
    return html;
  };

  /* Fabrik-Materialliste: «Kupfer 303/2» → «Kupfer: 303 da · 2 pro Stück». */
  function materiallisteKlaeren(){
    document.querySelectorAll(".prozess-materialliste span:not([data-klar])").forEach(sp => {
      const m = sp.textContent.match(/^(.+?) (\d+)\/(\d+)$/);
      if (!m) return;
      sp.dataset.klar = "1";
      sp.innerHTML = textVon("sekbklarheit.da-pro-stueck", {p1:(m[1]), p2:(m[2]), p3:(m[3])});
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
      const titel = textVon("sekbklarheit.fehlt-fuer", {p1:(mat.name), p2:(def.name)});
      const mineId = materialMine(knapp);
      if (!mineId){
        const frei = freieQuelleFuer(knapp);
        const d = frei && MINEN.find(x => x.id === frei);
        return {titel, text: d ? textVon("sekbklarheit.du-hast-noch-keine", {p1:(mat.name), p2:(d.ort)}) : textVon("sekbklarheit.du-hast-noch-keine-2", {p1:(mat.name)}),
                ziel: frei ? {art:"mine", id:frei} : null, fab:f.land};
      }
      const m = S.minen[mineId], d = MINEN.find(x => x.id === mineId);
      if (m.stillBis > S.tag)
        return {titel, text:textVon("sekbklarheit.steht-gerade-still-oeffne", {p1:(d.ort)}), ziel:{art:"mine", id:mineId}, fab:f.land};
      const raffIds = Object.keys(S.raff || {});
      if ((S.erz[knapp]||0) > 150 && raffIds.length){
        const rid = raffIds.find(id => S.raff[id].arbeiter < RAFF_ORTE.find(x => x.id === id).plaetze) || raffIds[0];
        const rd = RAFF_ORTE.find(x => x.id === rid);
        return {titel, text:`Es liegt viel Rohstoff bereit, aber die Raffinerie ${rd.ort} schafft zu wenig. Setze dort mehr Personal ein (jetzt ${S.raff[rid].arbeiter} von ${rd.plaetze}).`, ziel:{art:"raff", id:rid}, fab:f.land};
      }
      if (m.arbeiter < d.plaetze)
        return {titel, text:`Setze in ${d.ort} mehr Personal ein (jetzt ${m.arbeiter} von ${d.plaetze}).`, ziel:{art:"mine", id:mineId}, fab:f.land};
      return {titel, text:textVon("sekbklarheit.ist-voll-besetzt-baue", {p1:(d.ort), p2:(mat.name)}), ziel:{art:"mine", id:mineId}, fab:f.land};
    }
    const kraft = verkaufsKraft(), lager = warenLager();
    if (produktion > 0 && lager > Math.max(40, kraft * 6) && kraft < produktion * 0.9){
      return {titel:textVon("sekbklarheit.dein-lager-wird-voll"),
              text:textVon("sekbklarheit.deine-fabriken-schaffen-etwa", {p1:(produktion), p2:(kraft)}),
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

  /* Engpass als nächster Schritt, solange keine Wissens-Quest läuft; sonst null (module/wissen.js) */
  const wissenTeile = (window.__erzweltWissenTeile ||= {});
  wissenTeile.engpassSchritt = function(){
    const api = window.__erzweltKnowledgeQuestFlow;
    const quest = api && typeof api.active === "function" ? api.active() : null;
    if (!quest){
      const e = engpass();
      if (e) return [e.titel, e.text];
    }
    return null;
  };

  /* Während einer Wissens-Quest erscheint der Engpass als kleiner Kasten in der Karte. */
  function engpassKasten(){
    const q = document.getElementById("quest");
    if (!q) return;
    q.querySelector(".engpass-kasten")?.remove();
    if (q.hidden || !q.classList.contains("wissen-quest")) return;
    const e = engpass();
    if (!e) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "engpass-kasten";
    const warn = window.__erzweltStil ? window.__erzweltStil.ikon.warnung : "⚠";
    b.innerHTML = `<b>${warn} ${e.titel}</b><span>${e.text}</span>`;
    b.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); engpassOeffnen(e); });
    const vor = q.querySelector(".objective-guide-action") || document.getElementById("q-punkte");
    if (vor) vor.insertAdjacentElement("beforebegin", b); else q.appendChild(b);
    if (typeof questHoeheMessen === "function") questHoeheMessen();
  }

  /* Nach jedem Zeichnen der Aufgabenkarte (module/quest.js) */
  Object.assign((window.__erzweltQuestTeile ||= {}), {engpassKasten, questKompakt});

  /* Aufgabe auf anderen Seiten als der Karte nur als schmale Zeile – ausser
     die Aufgabe wird genau auf dieser Seite erledigt (Tutorial: Team, Markt;
     Wissensauftrag: Wissen) oder ein Wissen ist zum Ansehen bereit. Antippen führt wie bisher zum Ziel; ohne Ziel
     klappt die Zeile auf. */
  let aufgeklapptAuf = null;
  function questGehoertZuSeite(q){
    const t = tutorialSchritt();
    if (t) return t.ziel() === "dock:" + aktiveSeite;
    // «Ansehen» geht überall; ausserhalb von Wissen als schmale Zeile mit Knopf (aufgabe-kompakt.js)
    if (q.classList.contains("wissen-bereit")){
      return aktiveSeite === "wissen" || !window.matchMedia("(max-width:819px)").matches;
    }
    return q.classList.contains("wissen-quest") && aktiveSeite === "wissen";
  }
  function questKompakt(){
    const q = document.getElementById("quest");
    if (!q) return;
    if (aufgeklapptAuf !== aktiveSeite) aufgeklapptAuf = null;
    const kompakt = !q.hidden && aktiveSeite !== "karte" && aufgeklapptAuf === null && !questGehoertZuSeite(q);
    q.classList.toggle("kompakt", kompakt);
    if (typeof questHoeheMessen === "function") questHoeheMessen();
  }
  document.getElementById("quest")?.addEventListener("click", ev => {
    const q = ev.currentTarget;
    if (!q.classList.contains("kompakt") || q.classList.contains("map-link") || ev.target.closest("button")) return;
    ev.preventDefault(); ev.stopPropagation();
    aufgeklapptAuf = aktiveSeite;
    questKompakt();
  }, true);
  /* Zeigt das Tutorial auf einen Knopf der Leiste unten (z. B. Team),
     endet das Blatt über der Leiste, damit der Knopf antippbar bleibt. */
  const dockHinweis = () => document.body.classList.toggle("dock-hinweis",
    tutorialLaeuft() && !!document.querySelector("#dock button.wink"));
  const dockEl = document.getElementById("dock");
  if (dockEl) new MutationObserver(dockHinweis).observe(dockEl, {subtree:true, attributes:true, attributeFilter:["class"]});
  /* Nach jedem Zeichnen (module/karte.js) */
  Object.assign((window.__erzweltKarteTeile ||= {}), {materialliste:materiallisteKlaeren, dockHinweis});

  /* ---------- 3. «Ziel zeigen» nicht hinter der Aufgabenkarte ----------
     map-focus-navigation rechnet mit der Ecke des Pins statt mit seinem
     sichtbaren Kopf. Hier wird der Ziel-Pin berechnet und so platziert,
     dass er mittig und unterhalb der Aufgabenkarte erscheint. */
  /* Kamera zum Ziel-Pin: umfasst die Ansicht aus performance-pass.js (module/karte.js) */
  (window.__erzweltKarteTeile ||= {}).ansichtFokus = function(vorherAnsicht){
    let zuletzt = 0;
    return function(){
      const fokus = welt.classList.contains("map-focus-moving");
      if (!fokus || Date.now() - zuletzt < 700 || aktiveSeite !== "karte") return vorherAnsicht();
      zuletzt = Date.now();
      const W = sicht.clientWidth;
      const hud = document.getElementById("hud")?.offsetHeight || 56;
      const dock = document.getElementById("dock")?.offsetHeight || 86;
      const oben = hud + 8, unten = Math.max(oben + 80, sicht.clientHeight - dock - 8);
      const alt = oben + (unten - oben) * .48;
      // Ziel-Pin aus der Kamera-Formel zurückrechnen.
      const px = (W * .5 - ansicht.x) / ansicht.z, py = (alt - ansicht.y) / ansicht.z;
      const pin = [...document.querySelectorAll("#welt .pin")].find(p =>
        Math.abs(p.offsetLeft + p.offsetWidth / 2 - px) < 3 && Math.abs(p.offsetTop + Math.min(28, p.offsetHeight / 2) - py) < 3);
      const kopf = pin && (pin.querySelector(".knopf") || pin);
      if (!kopf) return vorherAnsicht();

      let zielY = alt;
      const q = document.getElementById("quest");
      const s = sicht.getBoundingClientRect();
      if (q && !q.hidden && !q.classList.contains("breit")){
        const r = q.getBoundingClientRect();
        const kartenUnten = r.bottom - s.top;
        const deckt = r.left - s.left < W / 2 + 40 && r.right - s.left > W / 2 - 40 && kartenUnten > alt - 50;
        if (deckt && kartenUnten + 70 < unten) zielY = kartenUnten + (unten - kartenUnten) * .42;
      }
      // Sichtbaren Pin-Kopf berechnen: Der Pin hängt an seinem unteren
      // Mittelpunkt (offsetLeft/offsetTop) und wird mit s = k/z skaliert.
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
      clearTimeout(window.__zielFokusTimer);
      window.__zielFokusTimer = setTimeout(() => document.body.classList.remove("ziel-fokus"), 2600);
      return vorherAnsicht();
    };
  };

  /* ---------- Gelb: kleine Unstimmigkeiten ---------- */
  /* «Das Modell im Code» → «Das Spielmodell», Zusammenhänge in Worten statt Formeln. */
  const modellSeg = WISSEN.find(seg => seg.id === "modell");
  if (modellSeg){
    modellSeg.titel = textVon("sekbklarheit.das-spielmodell");
    modellSeg.formeln = null;
    modellSeg.fakten = [textVon("didacticcomple.ortsinfos-sind-fuer-den"), textVon("sekbklarheit.die-hintergrundinfos-wurden-geprueft")];
    const REGELN = [
      [textVon("sekbklarheit.foerderung"), "Mehr Personal und zufriedenere Leute holen mehr Rohstoff aus der Quelle."],
      [textVon("tutorialenhanc.raffination"), textVon("sekbklarheit.aus-rohstoff-wird-material")],
      [textVon("sekbklarheit.fabrik"), "Das knappste Material bestimmt, wie viele Produkte entstehen."],
      [textVon("didacticmodel.nachfrage"), textVon("sekbklarheit.saison-ereignisse-und-dein")],
      [textVon("sekbklarheit.preis"), "Ein volles Lager senkt den Preis. Der Dollarkurs kann ihn heben oder senken."]
    ];
    /* Lupe «Modell»: Regeln als Tabelle (Reihenfolge: module/wissen.js) */
    wissenTeile.modellRegeln = function(segId){
      if (segId === "modell"){
        const merken = [...document.querySelectorAll("#lupeinhalt .karte > h3")].find(h => h.textContent.trim() === "Zum Merken");
        const karte = document.createElement("div");
        karte.className = "karte modell-regeln";
        karte.innerHTML = textVon("sekbklarheit.so-haengt-es-zusammen", {p1:(REGELN.map(([a, t]) => `<tr><td><b>${a}</b></td><td>${t}</td></tr>`).join(""))});
        if (merken) merken.closest(".karte").before(karte);
        else document.getElementById("lupeinhalt")?.appendChild(karte);
      }
    };
  }

  /* Kauf-Entscheide in Ruhe: Solange ein Blatt für einen noch nicht gekauften
     Standort offen ist, steht die Zeit. Nach dem Kauf oder Schliessen läuft
     sie im vorherigen Tempo weiter. Eigene Standorte laufen weiter, damit
     Bau und Produktion sichtbar bleiben. */
  let kaufPauseVon = null, eigenerAufruf = false;
  const kaufBlatt = (art, id) => art === "mine" ? !S.minen[id]
    : art === "raff" ? !S.raff[id]
    : art === "fab" ? !(S.fabriken || []).some(f => f.land === id) : false;
  /* Vor jedem tempoSetzen (module/meldungen.js) */
  (window.__erzweltMeldungenTeile ||= {}).tempoVor = function(){
    if (!eigenerAufruf) kaufPauseVon = null;   // jemand anderes bestimmt das Tempo
  };
  const tempoIntern = v => { eigenerAufruf = true; try { tempoSetzen(v); } finally { eigenerAufruf = false; } };
  const fortsetzen = () => {
    if (kaufPauseVon === null) return;
    const v = kaufPauseVon; kaufPauseVon = null;
    if (!S.ende && !modalOffen && tempo === 0) tempoIntern(v);
  };
  /* Kaufblatt: Bild flacher, Kaufknopf klebt unten im Blatt und ist ohne
     Scrollen sichtbar. Der Pause-Hinweis steht direkt über dem Knopf. */
  const PAUSE_TEXT = textVon("sekbklarheit.die-zeit-steht-solange");
  function kaufLayout(kauf, pausiert){
    const inhalt = document.getElementById("blattinhalt");
    if (!inhalt) return;
    inhalt.classList.toggle("kaufblatt", !!kauf);
    inhalt.querySelectorAll(":scope > .kaufpause").forEach(n => n.remove());
    if (!kauf) return;
    const svg = inhalt.querySelector(":scope > .szene svg.buehne");
    if (svg){
      svg.setAttribute("preserveAspectRatio", textVon("sekbklarheit.xmidymax-slice"));
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
  /* Nach dem Füllen eines Blatts und beim Schliessen (module/blatt.js) */
  blattTeile.kaufPause = function(art, id){
    const kauf = kaufBlatt(art, id) && !S.ende && !modalOffen && S.schwierigkeit;
    if (kauf && kaufPauseVon === null && tempo > 0){ kaufPauseVon = tempo; tempoIntern(0); }
    else if (!kauf) fortsetzen();
    kaufLayout(kauf, !!kauf && kaufPauseVon !== null);
  };
  blattTeile.kaufPauseEnde = fortsetzen;

  /* ---------- 2./4. Stil ---------- */
  const style = document.createElement("style");
  style.id = "erzwelt-sek-b-klarheit-style";
  style.textContent = `
    #quest.tutorial-aktiv #q-punkte{display:none}
    #quest.breit.kompakt{padding:7px 46px 8px 12px!important;cursor:pointer}
    #quest.kompakt > :not(.kopf):not(#q-titel):not(.quest-map-cue){display:none!important}
    #quest.kompakt .kopf{font-size:11px}
    #quest.kompakt #q-titel{font-size:var(--f1);margin:1px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #quest.kompakt .quest-map-cue{top:50%;transform:translateY(-50%)}
    #quest.kompakt:not(.map-link)::after{content:"";position:absolute;right:16px;top:50%;width:9px;height:9px;
      border:solid var(--grau);border-width:0 2.5px 2.5px 0;transform:translateY(-70%) rotate(45deg)}
    #quest .tutorial-phase span{display:none}
    body.ziel-fokus #toasts{opacity:.12;transition:opacity .2s}
    body.fensterauf #tutorial-lernfeedback{top:calc(env(safe-area-inset-top) + 4px);padding:6px 12px;font-size:var(--f0)}
    .wahl.schwierigkeit .empfohlen{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:99px;background:#e0f2e8;color:#1f6b4e;font-size:var(--f0);vertical-align:middle}
    .wahl.schwierigkeit .sperre{font-weight:800}
    .wert small.einheit{display:block;font-size:var(--f0);opacity:.7;margin-top:2px;font-weight:700;line-height:1.1}
    .prozess-materialliste span b{font-weight:900}
    #quest .engpass-kasten{display:block;width:100%;margin-top:8px;padding:7px 9px;border-radius:10px;text-align:left;
      background:#fff4e5;border:1.5px solid #e6a23c;color:#6b4206;font-size:var(--f0);line-height:1.25;cursor:pointer}
    #blatt{bottom:calc(var(--dockh) + 14px);max-height:calc(76% + 16px)}
    @media (max-width:819px){
      /* Handy: Blatt reicht über die Leiste unten bis an den Rand.
         Oben bleiben Kasse, Team und Tag sichtbar. */
      #blatt{bottom:0;max-height:calc(100% - 64px - env(safe-area-inset-top));padding-bottom:calc(env(safe-area-inset-bottom) + 4px)}
      body.dock-hinweis #blatt{bottom:calc(var(--dockh) + 14px);max-height:calc(100% - var(--dockh) - 78px - env(safe-area-inset-top));padding-bottom:10px}
    }
    #blattinhalt .kaufpause{margin:6px 0 4px;padding:7px 12px;border-radius:12px;background:#eef4fb;color:#24506f;font-size:var(--f0);font-weight:700;line-height:1.3}
    #blattinhalt.kaufblatt .szene svg.buehne{height:clamp(84px,15vh,118px)}
    #blattinhalt .kaufleiste{position:sticky;bottom:-14px;z-index:5;margin:12px -16px -14px;padding:8px 16px 14px;
      background:var(--papier);box-shadow:0 -12px 14px -10px rgba(0,0,0,.22)}
    #blattinhalt .kaufleiste .cta{margin-top:0}
    #blattinhalt .kaufpause-text{text-align:center;color:#24506f;font-size:var(--f0);font-weight:700;margin:0 0 7px;line-height:1.3}
    .modell-regeln td{vertical-align:top;padding:6px 6px 6px 0}
    .modell-regeln td:first-child{white-space:nowrap}
    #quest .engpass-kasten b{display:block;font-family:"Baloo 2",sans-serif;font-size:var(--f1);color:#8a4b00;margin-bottom:2px}
  `;
  document.head.appendChild(style);

  /* Der Startdialog wurde schon vom Kern gezeigt: mit der neuen Fassung ersetzen. */
  if (!$("#schleier").hidden && $("#d-titel").textContent === "Wähle die Schwierigkeit") schwierigkeitZeigen();

  window.__erzweltSekBKlarheit = {version:1, engpass};
  seitenStand = ""; blattStand = "";
  if (typeof questZeichnen === "function") questZeichnen();
})();
