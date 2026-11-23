/* Erzwelt · module/seiten.js – Seiten Markt, Team, Ziel und Wissen-Übersicht
   ---------------------------------------------------------------
   Einziger Besitzer von `seiteMarkt`, `seiteTeam`, `seiteZiel` und
   `seiteWissen`: Jede Funktion schreibt das endgültige HTML direkt. Niemand
   umhüllt sie danach, niemand ersetzt Text darin.

   Bausteine von anderen Modulen (beim Zeichnen abgefragt, nicht beim Laden):
     __erzweltBelegschaftRegler.regler("vcrew", null, wert, plaetze)
                                     Regler Verkaufsteam (belegschaft-regler.js)
     __erzweltEinfuehrung.bedarfHinweis()
                                     Bedarfsliste im Team-Reiter (einfuehrung.js)
     __erzweltLogikFixes.zielGewinn(), .etappenInvestitionen(),
       .nachweisDurchPerk(), .geprueft(), .NACHWEIS_KOSTEN
                                     Ziel-Werte, Investitionen, Nachweise (logik-fixes.js)
     __erzweltZielPositiv.heldKarte()
                                     Laufendes Geschäft, Verlauf, Prognose (ziel-positiv.js)
     __erzweltCertificate.karte()    PDF-Karte im Ziel-Reiter (abschluss-zertifikat.js)
     __erzweltStil.ikon.pause        Pause-Symbol im Wissen (stil.js)
   Bedienung und Zustand bleiben, wo sie sind: Regler ziehen und Einstellen
   (belegschaft-regler.js), «anstellbar» in der Einführung (einfuehrung.js),
   Monatsverlauf mitschreiben (ziel-positiv.js), PDF-Formular (abschluss-
   zertifikat.js), Einstell-Regler «Wie viele?» beim Ziehen (Kern,
   belegschaft-regler.js «einmalig», stil.js Knopftext).

   Nach dem Einsetzen bearbeiten den Seiteninhalt noch (über seiteFuellen):
   kurztexte.js (kürzere Sätze, Rohstoff-Tabelle, ohne Meldungen),
   stil.js («Al»).

   Texte gegenüber dem Kern (früher per Ersetzung in didactic-ui.js,
   sek-b-klarheit.js, belegschaft-regler.js, einfuehrung.js, logik-fixes.js,
   ziel-positiv.js, stil.js):
   Markt mit Kette «Produkt → Verkauf → Geld», Rohstoffquellen statt
   Weltpreisen, Verkaufsteam als Regler; Team ohne «Spielmodell», Knopf
   «… Personen einstellen · … einmalig» mit Monatskosten, in der Einführung
   die Bedarfsliste statt Einstellen; Ziel mit Hauptzahl, Ziel pro
   Schwierigkeit, Investitionen und Nachweis-Zähler; Wissen mit Pause-Symbol. */
"use strict";
(function(){
  const api = name => window[name] || {};
  const besetzung = (wert, plaetze) => api("__erzweltBelegschaftRegler").regler("vcrew", null, wert, plaetze);
  const bedarfHinweis = () => api("__erzweltEinfuehrung").bedarfHinweis();
  const logik = () => api("__erzweltLogikFixes");
  const heldKarte = () => api("__erzweltZielPositiv").heldKarte();
  const zertifikatKarte = () => { const c = api("__erzweltCertificate"); return typeof c.karte === "function" ? c.karte() : ""; };
  const pauseIkon = () => { const s = api("__erzweltStil"); return s.ikon && s.ikon.pause ? s.ikon.pause : "⏸"; };

  /* ---------- Markt ---------- */
  seiteMarkt = function(){
    const kraft = verkaufsKraft(), lager = warenLager();
    const heuteSchon = S.handverkaufTag === S.tag;
    const frei = freieArbeiter();
    let handStueck = 0;
    for (const p in PRODUKT) handStueck += Math.min(S.ware[p]||0, Math.round(nachfrage(p)));

    const prod = Object.keys(PRODUKT).map(p => {
      const l = S.ware[p]||0;
      return `<tr><td>${PRODUKT[p].name}</td><td class="n">${l}</td><td class="n">${Math.round(nachfrage(p))}</td><td class="n">${Math.round(warenPreis(p))}</td></tr>`;
    }).join("");
    const roh = Object.keys(MATERIAL).map(k => {
      const quellen = MINEN.filter(m=>m.mat===k && S.minen[m.id]);
      const quelle = quellen.length ? quellen.map(m=>m.ort).join(", ") : "–";
      return `<tr><td><i class="punkt" style="background:${MATERIAL[k].farbe}"></i> ${MATERIAL[k].name}</td><td>${quelle}</td><td class="n">${Math.round(S.mat[k]||0)}</td><td class="n">${Math.round(S.erz[k]||0)}</td></tr>`;
    }).join("");
    const eff = S.globalMod.filter(m => m.bis > S.tag);

    return `<h1>Markt &amp; Verkauf</h1><div class="unter">Fertige Produkte müssen verkauft werden</div>
    <div class="verkauf-kette-mini"><span>Produkt</span><b>→</b><span>Verkauf</span><b>→</b><span>Geld</span></div>
    <div class="karte" style="background:linear-gradient(#fffdf6,#fdf3dd)">
      <h3>Verkauf</h3><div class="ort">Im Lager liegen <b>${lager}</b> Stück</div>
      <button class="cta riesig ${(!heuteSchon&&handStueck>0)?"puls":""}" data-tun="handverkauf" ${(heuteSchon||handStueck<=0)?"disabled":""}>${IK.muenze}${handStueck<=0?"Nichts zu verkaufen":heuteSchon?"Heute schon verkauft":"Selbst verkaufen · "+handStueck+" Stück"}</button>
      <div class="notiz">Einmal pro Tag kannst du selbst verkaufen. Für den täglichen Verkauf setzt du Leute im Verkaufsteam ein.</div>
      <h3 style="margin-top:14px">Dein Verkaufsteam</h3><div class="ort">${frei} Personen frei · Lohn ${chf(VERKAUF_LOHN)} pro Person und Monat</div>
      ${besetzung(S.verkaeufer||0, VERKAUF_PLAETZE)}
      <div class="zeile"><span>Verkaufskapazität</span><b>${kraft} Stück/Tag</b></div><div class="zeile"><span>Lohnkosten</span><b>${chf((S.verkaeufer||0)*VERKAUF_LOHN)}/Mt.</b></div>
      ${frei<=0?`<div class="notiz rot">Niemand ist frei. Stelle im Team weitere Personen ein.<button class="cta" data-tun="zumteam">${IK.person}Zum Team</button></div>`:""}
    </div>
    <div class="karte"><h3>Deine Produkte</h3><table><tr><th>Produkt</th><th class="n">Lager</th><th class="n">Nachfr.</th><th class="n">CHF</th></tr>${prod}</table><div class="notiz">Produzierst du deutlich mehr als nachgefragt wird, füllt sich das Lager und der Verkaufspreis sinkt.</div></div>
    <div class="karte"><h3>Deine Rohstoffquellen</h3><table><tr><th>Material</th><th>Quelle</th><th class="n">Bereit</th><th class="n">Rohstoff</th></tr>${roh}</table><div class="notiz">Die Quelle liefert Rohstoff, die Raffinerie macht Material daraus.</div></div>
    ${eff.length?`<div class="karte"><h3>Aktuelle Einflüsse</h3>${eff.map(m=>`<div class="zeile"><span>${m.art==="dollar"?"US-Dollar / Fertigwaren":"Durchsatz im Hafen"}</span><b>${Math.round(m.wert*100)} % · ${m.bis-S.tag} T.</b></div>`).join("")}</div>`:""}`;
  };

  /* ---------- Team ---------- */
  /* Lohnspanne über alle Länder, z. B. «CHF 130–5'600» */
  const lohnSpanne = () => {
    const l = Object.values(LAND).map(x => x.lohn);
    return `${chf(Math.min(...l))}–${chf(Math.max(...l)).replace(/^CHF\s*/, "")}`;
  };

  seiteTeam = function(){
    const einfuehrung = tutorialLaeuft();
    // Der Regler «Wie viele?» kennt nur Fünferschritte ab 5 (früher in einfuehrung.js).
    if (!einfuehrung && (anstellMenge % 5 || anstellMenge < 5)) anstellMenge = 10;
    const rows = [];
    for (const id in S.minen){ const d = MINEN.find(x=>x.id===id);
      if (S.minen[id].arbeiter) rows.push([d.land, "Rohstoffquelle " + d.ort, S.minen[id].arbeiter, LAND[d.land].lohn*LOHNSTUFE[S.minen[id].stufe].faktor]); }
    for (const id in S.raff){ const d = RAFF_ORTE.find(x=>x.id===id);
      if (S.raff[id].arbeiter) rows.push([d.land, "Raffinerie " + d.ort, S.raff[id].arbeiter, LAND[d.land].lohn]); }
    S.fabriken.forEach(f => { if (f.arbeiter) rows.push([f.land, "Fabrik " + PRODUKT[f.produkt].name, f.arbeiter, LAND[f.land].lohn]); });
    if (S.verkaeufer) rows.push([null, "Verkauf", S.verkaeufer, VERKAUF_LOHN]);
    const menge = anstellbar();
    const kosten = menge * LOHN_PRO_KOPF;
    const geht = menge > 0 && S.kasse >= kosten;
    const frei = freieArbeiter();

    // In der Einführung wird an der Station eingestellt (einfuehrung.js), hier nur der Bedarf.
    const einstellen = einfuehrung ? `
      ${bedarfHinweis()}` : `${regler("anstell", "Wie viele?", "Einmalige Einstellungskosten: CHF " + LOHN_PRO_KOPF.toLocaleString("de-CH") + " pro Person.",
               5, 50, 5, anstellMenge, anstellMenge + " Personen")}
      <button class="cta riesig ${geht?"puls":""}" data-tun="anstellen" ${geht?"":"disabled"}>
        ${IK.person}${geht ? menge + " Personen einstellen · " + chf(kosten) + " einmalig" : "Zu wenig Geld · " + chf(kosten)}</button><div class="notiz monatskosten"><b>Danach jeden Monat Lohn:</b> je nach Land ${lohnSpanne()} pro Person,
      im Verkauf ${chf(VERKAUF_LOHN)}. Wer keine Aufgabe hat, kostet ${chf(200)}.</div>`;

    return `<h1>Dein Team</h1><div class="unter">Personal einstellen und auf die Stationen verteilen</div>

    <div class="karte" style="text-align:center;background:linear-gradient(#fffdf6,#fdf3dd)">
      <div style="display:flex;justify-content:center"><div style="width:min(300px,80%)">${ikonTeam(5, 96, .62)}</div></div>
      <h3 style="font-size:var(--f4);margin-top:6px">${einfuehrung ? "Dein Personal in der Einführung" : "Stelle mehr Personen ein"}</h3>
      <div class="ort">Ohne Personal fördert keine Rohstoffquelle und läuft keine Fabrik</div>
      ${einstellen}
      <button class="cta still" data-tun="entlassen" ${frei<5?"disabled":""}>−5 entlassen · nur freie Leute</button>
    </div>

    <div class="karte">
      <div class="werte">
        <div class="wert"><span class="wi">${IK.person}</span><span class="wt"><small>Angestellt</small><b>${S.arbeiterGesamt}</b></span></div>
        <div class="wert"><span class="wi">${IK.hacke}</span><span class="wt"><small>Ohne Aufgabe</small><b style="color:${frei>10?"var(--warn)":"inherit"}">${frei}</b></span></div>
        <div class="wert"><span class="wi">${IK.muenze}</span><span class="wt"><small>Lohnsumme</small><b>${chf(lohnsumme())}</b></span></div>
        <div class="wert"><span class="wi">${IK.kalender}</span><span class="wt"><small>Löhne pro Tag</small><b>${chf(lohnsumme()/30)}</b></span></div>
      </div>
      <div class="notiz">Nicht eingeteilte Leute kosten CHF 200 pro Monat. Stell nur so viele an, wie du beschäftigen kannst.</div>
    </div>

    <div class="karte"><h3>Wer arbeitet wo?</h3>
      ${rows.length ? `<table><tr><th>Ort</th><th class="n">Leute</th><th class="n">Lohn</th></tr>
        ${rows.map(r=>`<tr><td><span class="flz">${r[0]?flagge(r[0]):`<span style="width:1.7em;display:inline-block">${IK.muenze}</span>`}<span>${r[1]}</span></span></td>
          <td class="n">${r[2]}</td><td class="n">${Math.round(r[3]).toLocaleString("de-CH")}</td></tr>`).join("")}</table>`
      : `<p style="color:var(--grau)">Noch niemand eingeteilt.</p>`}</div>
    `;
  };

  /* ---------- Ziel ---------- */
  seiteZiel = function(){
    const l = logik();
    const gewinn = etappenGewinn(), ruf = Math.round(S.ruf), info = schwierigkeitInfo();
    const ziel = l.zielGewinn(), invest = l.etappenInvestitionen();
    const rest = Math.max(0, etappenEnde() - S.tag + 1);
    const n = offeneMinen().length, g = l.geprueft(), perk = l.nachweisDurchPerk();
    const hilfe = perk
      ? `Der Transparenzbericht gilt für alle deine Rohstoffquellen.`
      : `Nachweis holen: Quelle öffnen → <b>«Herkunft prüfen lassen»</b> (${chf(l.NACHWEIS_KOSTEN)}). Oder im Reiter Wissen den <b>Transparenzbericht</b> finanzieren: gilt für alle.`;
    return `<h1>Ziel · Etappe ${S.etappe||1}</h1><div class="unter">Alle ${ZIEL_TAGE} Tage kommt eine Abrechnung – danach kannst du weiterspielen</div>${heldKarte()}
    <div class="karte" style="background:linear-gradient(#fffdf6,#fdf3dd)">
      <div class="zeile"><span>Schwierigkeit</span><b>${info.icon} ${info.name}</b></div>
      <div class="ort">${verkaufsEffektText()}${S.schwierigkeit==="schwer"?" · auf Mittel freigeschaltet":""}</div>
      <div class="zeile" style="margin-top:10px"><span>Nächste Abrechnung</span><b>Tag ${etappenEnde()+1}</b></div>
      <div class="zeile"><span>Verbleibende Tage</span><b>${rest}</b></div>
    </div>
    <div class="karte">
      <div class="zeile"><span>Etappengewinn <small class="ziel-klein">mit Investitionen</small></span><b>${chf(gewinn)}</b></div>
      <div class="leiste"><i style="width:${klemm(gewinn / ziel * 100, 0, 100)}%;background:var(--gold)"></i></div>
      <div class="ort">Ziel ${chf(ziel)} · Gesamtgewinn seit Start ${chf(gesamtGewinn())}</div>
      <div class="zeile" style="margin-top:8px"><span>Davon Investitionen</span><b>${chf(-invest)}</b></div>
      <div class="zeile"><span>Laufendes Geschäft</span><b style="color:${gewinn + invest >= 0 ? "var(--gruen)" : "var(--alarm)"}">${chf(gewinn + invest)}</b></div>
      <div class="ort">Investitionen sind dein Aufbau: Standorte, Ausbau, Leute, Verbesserungen. Sie zahlen sich über das laufende Geschäft zurück.</div>
      <div class="zeile" style="margin-top:12px"><span>Ruf</span><b style="color:${ruf<40?"var(--alarm)":ruf<60?"var(--warn)":"var(--gruen)"}">${ruf}</b></div>
      <div class="leiste"><i style="width:${klemm(ruf/ZIEL_RUF*100,0,100)}%;background:var(--gruen)"></i></div>
      <div class="ort">Ziel ${ZIEL_RUF} · Ein niedriger Ruf senkt die Nachfrage nach allen deinen Produkten</div>
    </div>
    <div class="karte"><h3>Lager</h3>
      ${Object.keys(MATERIAL).filter(k=>(S.mat[k]||0)>.5||(S.erz[k]||0)>.5).map(k=>
        `<div class="zeile"><span><i class="punkt" style="background:${MATERIAL[k].farbe}"></i> ${MATERIAL[k].name}</span>
         <b>${Math.round(S.mat[k]||0)} <small style="color:var(--grau);font-weight:600">+ ${Math.round(S.erz[k]||0)} Rohstoff</small></b></div>`).join("")
        || `<p style="color:var(--grau)">Noch nichts gefördert.</p>`}</div>
    <div class="karte"><h3>Finanzierte Verbesserungen</h3>
      ${Object.keys(S.perks).length ? Object.keys(S.perks).map(id => { const e = PERK_INDEX[id]; return e
        ? `<div class="zeile"><span>${e.perk.titel}</span><b style="font-size:var(--f0);color:var(--grau)">${e.seg.titel}</b></div>` : ""; }).join("")
        : `<p style="color:var(--grau)">Noch keine Verbesserung finanziert. Im Reiter Wissen siehst du, welche Voraussetzungen noch fehlen.</p>`}</div>
    <div class="karte"><h3>Lieferkettennachweise</h3>
      <div class="zeile"><span>Status</span><b style="color:${nachweisStatus().stufe?"var(--gruen)":"var(--warn)"}">${nachweisStatus().text}</b></div>
      ${perk ? "" : `<div class="zeile"><span>Geprüfte Rohstoffquellen</span><b>${g} von ${n}</b></div>`}
      <div class="notiz">Das Lieferkettengesetz verlangt für jede Quelle einen Nachweis. ${hilfe}</div></div>
    <div class="karte"><h3>Meldungen</h3>
      ${S.log.slice(0,14).map(e=>`<div class="zeile"><span style="font-size:var(--f0)">${e.text}</span><b style="font-size:var(--f0);color:var(--grau)">T${e.tag}</b></div>`).join("")
        || `<p style="color:var(--grau)">Noch nichts passiert.</p>`}</div>
    ${zertifikatKarte()}<button class="cta still" data-tun="reset">Neue Runde starten</button>`;
  };

  /* ---------- Wissen: Übersicht der Segmente ---------- */
  seiteWissen = function(){
    const karten = WISSEN.map(seg => {
      const naechst = naechsterPerk(seg);
      return `<button class="segkarte" data-tun="segment" data-s="${seg.id}">
      <span class="sicon" style="background:${seg.farbe}22;color:${seg.farbe}">${IK[seg.ikon]||IK.wissen}</span>
      <span class="stxt">
        <h3>${seg.titel}</h3>
        <small>${seg.kurz}</small>
        <span class="perkleiste">${seg.perks.map(p=>`<i class="${S.perks[p.id]?"ok":""}"></i>`).join("")}</span>
        <small style="margin-top:4px">${naechst ? "Nächste Verbesserung: " + naechst.titel + " · " + chf(naechst.kosten) : "Alle Verbesserungen finanziert"}</small>
      </span>
      <span class="spfeil">${IK.pfeil}</span></button>`;
    }).join("");
    const gesamt = WISSEN.reduce((a,s)=>a+s.perks.length, 0), hat = Object.keys(S.perks).length;
    return `<h1>Wissen</h1><div class="unter">${pauseIkon()} Das Spiel pausiert hier automatisch. Beim Verlassen läuft es im vorherigen Tempo weiter.</div>
    <div class="karte" style="display:flex;align-items:center;gap:14px">
      <div style="width:52px;flex:none;color:var(--gold)">${IK.gluehbirne}</div>
      <div style="flex:1;min-width:0">
        <b style="font-family:'Baloo 2',sans-serif;font-size:var(--f3)">${hat} von ${gesamt} Verbesserungen finanziert</b>
        <div class="leiste"><i style="width:${(hat/gesamt*100).toFixed(0)}%;background:var(--gold)"></i></div>
        <small style="color:var(--grau);font-size:var(--f0)">Wissen ist frei zugänglich. Geld wird nur für Verbesserungen verwendet, deren Voraussetzung im Spiel bereits erfüllt ist.</small>
      </div>
    </div>
    ${karten}`;
  };

  seitenStand = "";
  window.__erzweltSeiten = {version: 1};
})();
