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
  const kurzChf = n => (n >= 1e6 ? `CHF ${(n/1e6).toLocaleString("de-CH")} Mio` : chf(n)).replace(/ /g, "&nbsp;");
  const ersetze = (html, alt, neu) => html.split(alt).join(neu);

  /* ---------- 1. Schwierigkeit ---------- */
  SCHWIERIGKEIT.einfach.effekt = "Verkauf bringt 20 % mehr";
  SCHWIERIGKEIT.mittel.effekt  = "normale Verkaufspreise";
  SCHWIERIGKEIT.schwer.effekt  = "Verkauf bringt 30 % weniger";

  schwierigkeitZeigen = function(){
    modalOffen = true; tempoSetzen(0);
    $("#d-art").textContent = "Neue Runde";
    $("#d-titel").textContent = "Wähle die Schwierigkeit";
    $("#d-text").innerHTML = `Die Schwierigkeit bestimmt, wie viel dir ein Verkauf einbringt und wie hoch dein Ziel ist. Für den Start empfehlen wir <b>Einfach</b>.`;
    const optionen = [
      ["einfach","🌱","Einfach",`Verkauf bringt 20&nbsp;% mehr<br>Ziel: ${kurzChf(ziele.einfach)}`,false,"Empfohlen"],
      ["mittel","⚙️","Mittel",`Normale Verkaufspreise<br>Ziel: ${kurzChf(ziele.mittel)}`,false,""],
      ["schwer","🔥","Schwer",`Verkauf bringt 30&nbsp;% weniger<br>Ziel: ${kurzChf(ziele.schwer)}`,!META.mittelGeschafft,"🔒 Erst Mittel schaffen"]
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
        notiz(`${icon} Schwierigkeit <b>${name}</b> gewählt · ${SCHWIERIGKEIT[id].effekt}.`, "gut");
        speichern(); tempoSetzen(1); zeichnen();
      };
      $("#d-wahlen").appendChild(b);
      if (id === "einfach") setTimeout(()=>b.focus(), 60);
    });
    $("#schleier").hidden = false; zeichnen();
  };

  /* ---------- 5. Einheiten und 8. weniger Vorbehalte ---------- */
  const proTag = v => v >= 10 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toLocaleString("de-CH");

  const vorherBlattMine = blattMine;
  blattMine = function(id){
    let html = vorherBlattMine(id);
    const def = MINEN.find(x => x.id === id);
    if (!def) return html;
    const land = LAND[def.land];
    html = ersetze(html, `<small>Ergiebigkeit</small><b>${def.ergiebigkeit} Rohstoff</b>`,
      `<small>Förderung pro Person</small><b>≈ ${proTag(def.ergiebigkeit)} pro Tag</b>`);
    html = ersetze(html, `<small>Plätze</small><b>${def.plaetze}</b>`, `<small>Arbeitsplätze</small><b>${def.plaetze}</b>`);
    html = ersetze(html, `<small>Üblicher Lohn</small><b>${chf(land.lohn)}</b>`,
      `<small>Üblicher Lohn</small><b>${chf(land.lohn)}</b><small class="einheit">pro Person und Monat</small>`);
    html = html.replace(/(<small>Förderung<\/small><b>[^<]*)\/Tag<\/b>/, "$1 pro Tag</b>");
    html = html.replace(/(<small>Lohnkosten<\/small><b>[^<]*)<\/b>/, `$1</b><small class="einheit">pro Monat</small>`);
    html = ersetze(html, `<div class="notiz blau"><b>Spielmodell:</b> Mengen und Löhne sind vereinfachte Spielwerte.</div>`, "");
    return html;
  };

  const vorherBlattRaff = blattRaff;
  blattRaff = function(id){
    let html = vorherBlattRaff(id);
    const def = RAFF_ORTE.find(x => x.id === id);
    if (!def) return html;
    const land = LAND[def.land];
    const spezial = (def.spezial||[]).map(k => MATERIAL[k] && MATERIAL[k].name).filter(Boolean);
    const alteKarte = `<div class="karte"><h3>Spezialisierung im Spiel</h3><div class="ort">${spezial.join(" · ")||"keine Spezialisierung"}</div><div class="notiz"><b>+25 % Durchsatz</b> für diese Rohstoffe. Alle anderen Rohstoffe können hier weiterhin normal verarbeitet werden. Die Spezialisierung ist eine Spielregel.</div></div>`;
    const neueKarte = tutorialLaeuft() ? "" : `<div class="karte"><h3>Spezialisierung</h3><div class="ort">${spezial.join(" · ")||"keine Spezialisierung"}</div><div class="notiz">Diese Rohstoffe verarbeitet die Raffinerie <b>25 % schneller</b>. Alle anderen Rohstoffe verarbeitet sie normal.</div></div>`;
    html = ersetze(html, alteKarte, neueKarte);
    html = ersetze(html, `<small>Kapazität</small><b>${def.kapazitaet}/Tag</b>`,
      `<small>Verarbeitet bis zu</small><b>${def.kapazitaet}</b><small class="einheit">Rohstoff pro Tag, voll besetzt</small>`);
    html = ersetze(html, `<small>Plätze</small><b>${def.plaetze}</b>`, `<small>Arbeitsplätze</small><b>${def.plaetze}</b>`);
    html = ersetze(html, `<small>Lohn</small><b>${chf(land.lohn)}</b>`,
      `<small>Lohn</small><b>${chf(land.lohn)}</b><small class="einheit">pro Person und Monat</small>`);
    html = ersetze(html, `<small>Betrieb</small><b>${chf(9000)}/Mt.</b>`,
      `<small>Betriebskosten</small><b>${chf(9000)}</b><small class="einheit">pro Monat</small>`);
    html = html.replace(/<small>Durchsatz<\/small><b>(\d+)\/Tag<\/b>/, `<small>Verarbeitet</small><b>$1</b><small class="einheit">Rohstoff pro Tag</small>`);
    html = ersetze(html, "Der Rest steht im Spielmodell für Abraum und Verluste.", "Der Rest ist Abraum: Gestein und Abfall.");
    return html;
  };

  if (typeof szeneRaff === "function"){
    const vorherSzeneRaff = szeneRaff;
    szeneRaff = function(def, r){
      if (tutorialLaeuft() && def) return vorherSzeneRaff({...def, spezial:[START_MATERIALIEN[0]]}, r);
      return vorherSzeneRaff(def, r);
    };
  }

  const vorherBlattFab = blattFab;
  blattFab = function(land){
    let html = vorherBlattFab(land);
    html = ersetze(html, `Fabrikstandort · Lohn ${chf(LAND[land].lohn)}/Monat`, `Fabrikstandort · Lohn ${chf(LAND[land].lohn)} pro Person und Monat`);
    html = ersetze(html, "Vereinfachtes Rezept · Spielmodell", "Rezept: Material pro Stück");
    const e = engpass();
    const tipp = e && e.fab === land ? e.text : "Sichere dafür eine eigene Rohstoffquelle oder setze dort mehr Personal ein.";
    html = ersetze(html, "Zukaufen geht nicht – sichere dafür eine eigene Rohstoffquelle.", tipp);
    return html;
  };

  const vorherTeam = seiteTeam;
  seiteTeam = function(){
    let html = vorherTeam();
    html = ersetze(html, `<div class="unter">Lohnkosten im Spielmodell</div>`, `<div class="unter">Personal einstellen und auf die Stationen verteilen</div>`);
    html = ersetze(html, `<div class="notiz blau"><b>Spielmodell:</b> Die Lohnwerte sind vereinfacht und keine aktuelle Lohnstatistik.</div>`, "");
    return html;
  };

  const vorherMarkt = seiteMarkt;
  seiteMarkt = function(){
    let html = vorherMarkt();
    html = ersetze(html, "Rohstoffpreise am Weltmarkt werden nicht berechnet. Die Rohstoffe stammen im Spiel aus eigenen Quellen und werden anschliessend raffiniert.",
      "Die Quelle liefert Rohstoff, die Raffinerie macht Material daraus.");
    return html;
  };

  /* HUD: «Frei» heisst freies Personal. */
  const hudLabel = document.querySelector("#hud .pille.crew small");
  if (hudLabel){ hudLabel.textContent = "Ohne Aufgabe"; hudLabel.parentElement.parentElement.title = "Leute ohne Aufgabe / Personal insgesamt"; }

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

  if (typeof questZeichnen === "function"){
    const vorherQuest = questZeichnen;
    questZeichnen = function(){ const out = vorherQuest(); engpassKasten(); questKompakt(); return out; };
  }

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
  const vorherZeichnen = zeichnen;
  /* Zeigt das Tutorial auf einen Knopf der Leiste unten (z. B. Team),
     endet das Blatt über der Leiste, damit der Knopf antippbar bleibt. */
  const dockHinweis = () => document.body.classList.toggle("dock-hinweis",
    tutorialLaeuft() && !!document.querySelector("#dock button.wink"));
  const dockEl = document.getElementById("dock");
  if (dockEl) new MutationObserver(dockHinweis).observe(dockEl, {subtree:true, attributes:true, attributeFilter:["class"]});
  zeichnen = function(){ const out = vorherZeichnen(); materiallisteKlaeren(); dockHinweis(); return out; };

  /* ---------- 3. «Ziel zeigen» nicht hinter der Aufgabenkarte ----------
     map-focus-navigation rechnet mit der Ecke des Pins statt mit seinem
     sichtbaren Kopf. Hier wird der Ziel-Pin berechnet und so platziert,
     dass er mittig und unterhalb der Aufgabenkarte erscheint. */
  if (typeof ansichtAnwenden === "function"){
    const vorherAnsicht = ansichtAnwenden;
    let zuletzt = 0;
    ansichtAnwenden = function(){
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
  }

  /* ---------- Gelb: kleine Unstimmigkeiten ---------- */
  /* «Das Modell im Code» → «Das Spielmodell», Zusammenhänge in Worten statt Formeln. */
  const modellSeg = WISSEN.find(seg => seg.id === "modell");
  if (modellSeg){
    modellSeg.titel = "Das Spielmodell";
    modellSeg.formeln = null;
    modellSeg.fakten = ["Ortsinfos sind für den Unterricht gekürzt und vereinfacht.", "Die Hintergrundinfos wurden 2026 geprüft."];
    const REGELN = [
      ["Förderung", "Mehr Personal und zufriedenere Leute holen mehr Rohstoff aus der Quelle."],
      ["Raffination", "Aus Rohstoff wird Material. Ein Teil bleibt als Abraum zurück."],
      ["Fabrik", "Das knappste Material bestimmt, wie viele Produkte entstehen."],
      ["Nachfrage", "Saison, Ereignisse und dein Ruf verändern, wie viel gekauft wird."],
      ["Preis", "Ein volles Lager senkt den Preis. Der Dollarkurs kann ihn heben oder senken."]
    ];
    const vorherLupe = lupeFuellen;
    lupeFuellen = function(segId){
      const out = vorherLupe(segId);
      if (segId === "modell"){
        const merken = [...document.querySelectorAll("#lupeinhalt .karte > h3")].find(h => h.textContent.trim() === "Zum Merken");
        const karte = document.createElement("div");
        karte.className = "karte modell-regeln";
        karte.innerHTML = `<h3>So hängt es zusammen</h3><table>${REGELN.map(([a, t]) => `<tr><td><b>${a}</b></td><td>${t}</td></tr>`).join("")}</table>`;
        if (merken) merken.closest(".karte").before(karte);
        else document.getElementById("lupeinhalt")?.appendChild(karte);
      }
      return out;
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
