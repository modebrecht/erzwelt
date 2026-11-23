/* Erzwelt · module/blaetter.js – Blätter für Rohstoffquelle, Raffinerie und Fabrik
   ---------------------------------------------------------------
   Einziger Besitzer von `blattMine`, `blattRaff` und `blattFab`: Jede Funktion
   schreibt das endgültige HTML direkt. Niemand umhüllt sie danach, niemand
   ersetzt Text darin.

   Bausteine von anderen Modulen (beim Zeichnen abgefragt, nicht beim Laden):
     __erzweltBelegschaftRegler.regler(tun, ref, wert, plaetze)
                                     Regler + Kostenkacheln (belegschaft-regler.js)
     __erzweltEinfuehrung.kaufSperre(art, id), .sperrHinweis()
                                     Kaufsperre in der Einführung (module/einfuehrung.js)
     __erzweltLogikFixes.nachweisKarte(id)
                                     Herkunftsnachweis (logik-fixes.js)
     __erzweltSekBKlarheit.engpass() Tipp bei fehlendem Material (sek-b-klarheit.js)
   Bedienung bleibt, wo sie ist: Regler ziehen und Einstellen beim Loslassen
   (belegschaft-regler.js), Kauf-Abfangen und «Zu …» (module/einfuehrung.js),
   Nachweis kaufen (logik-fixes.js), Sicherheit (didactic-*.js).

   Nach dem Einsetzen bearbeiten den Blattinhalt noch (über blattFuellen bzw.
   den Zeichnen-Hook): kurztexte.js (kürzere Sätze), stop-safety-visual.js
   (Stillstand-Karte, Sicherheitskopf, Ursachen), sek-b-klarheit.js
   (Kaufblatt-Leiste, Pause-Hinweis, Materialliste), stil.js («Al»).

   Texte gegenüber dem Kern (früher per Ersetzung in sek-b-klarheit.js):
   Einheiten «pro Tag / pro Monat / pro Person und Monat», «Arbeitsplätze»,
   «Rezept: Material pro Stück», Spezialisierung ohne «Spielmodell» (in der
   Einführung ausgeblendet), kein Spielmodell-Hinweis in der Quelle. */
"use strict";
(function(){
  const api = name => window[name] || {};
  const regler = (tun, ref, wert, plaetze) => api("__erzweltBelegschaftRegler").regler(tun, ref, wert, plaetze);
  const kaufSperre = (art, id) => { const e = api("__erzweltEinfuehrung"); return typeof e.kaufSperre === "function" && e.kaufSperre(art, id); };
  const sperrHinweis = () => api("__erzweltEinfuehrung").sperrHinweis();
  const nachweisKarte = id => { const l = api("__erzweltLogikFixes"); return typeof l.nachweisKarte === "function" ? l.nachweisKarte(id) : ""; };
  const engpass = () => { const k = api("__erzweltSekBKlarheit"); return typeof k.engpass === "function" ? k.engpass() : null; };

  const proTag = v => v >= 10 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toLocaleString("de-CH");
  const einheit = t => `<small class="einheit">${t}</small>`;
  const wert = (ikon, titel, inhalt) =>
    `<div class="wert"><span class="wi">${ikon}</span><span class="wt"><small>${titel}</small>${inhalt}</span></div>`;
  const kopfZeile = (land, titel, ort) => `<div class="titelzeile">${flagge(land,"gross")}
    <div><h2>${titel}</h2><div class="ort">${ort}</div></div></div>`;

  /* Kaufsperre in der Einführung. Der Sperrhinweis steht an der Stelle der
     alten Tutorial-Notiz (wenn der Kern den Ort sperrt), sonst direkt unter dem Kopf. */
  function sperre(art, id, zu, alteNotiz){
    const s = kaufSperre(art, id);
    return {
      gesperrt: s,
      oben: s && !zu ? sperrHinweis() : "",
      notiz: zu ? (s ? sperrHinweis() : alteNotiz) : ""
    };
  }
  const nochNicht = (tun, attrs) => `<button class="cta" data-tun="${tun}" ${attrs} disabled>Noch nicht dran</button>`;

  /* ---------- Ausbau-Karte (Quelle wie Raffinerie) ----------
     Zehn Kästchen pro Reihe, das zehnte verdoppelt. Frisch gekaufte
     Stufen ploppen kurz auf (frischeStufe aus dem Kern). */
  function ausbauKarte(art, id, stufe, grundpreis, was){
    stufe = stufe || 0;
    const reihen  = Math.floor(stufe / AUSBAU_REIHE);
    const inReihe = stufe % AUSBAU_REIHE;
    const kosten  = ausbauKosten(grundpreis, stufe);
    const geht    = S.kasse >= kosten && stufe < AUSBAU_MAX;
    const doppelt = ausbauVerdoppelt(stufe);
    const frisch  = Date.now() - (frischeStufe[id] || 0) < 800;

    const kaesten = [...Array(AUSBAU_REIHE)].map((_,i) => {
      const voll = i < inReihe, letzte = i === AUSBAU_REIHE - 1;
      const naechst = i === inReihe && stufe < AUSBAU_MAX;
      return `<i class="${voll?"voll":""} ${letzte?"doppel":""} ${naechst?"naechst":""}
      ${voll && frisch && i === inReihe-1 ? "frisch" : ""}">${letzte ? "×2" : voll ? "✓" : ""}</i>`;
    }).join("");

    return `<div class="karte">
    <div class="ausbaukopf"><h3>Ausbau</h3>
      ${reihen ? `<span class="ausbaumarke">×${Math.pow(2,reihen)}</span>` : ""}</div>
    <div class="ort">Stufe ${stufe} · Reihe ${reihen+1} · ${was} ×${ausbauFaktor(stufe).toFixed(2)}</div>
    <div class="ausbaureihe">${kaesten}</div>
    <div class="zeile"><span>${doppelt ? "Nächste Stufe verdoppelt!" : "Nächste Stufe"}</span>
      <b>${stufe >= AUSBAU_MAX ? "voll ausgebaut" : "+" + Math.round((ausbauFaktor(stufe+1)/ausbauFaktor(stufe)-1)*100) + " %"}</b></div>
    ${stufe >= AUSBAU_MAX ? "" : `<button class="cta ${doppelt?"gruen":""} ${geht&&doppelt?"puls":""}"
      data-tun="ausbau" data-art="${art}" data-id="${id}" ${geht?"":"disabled"}>
      ${geht?IK.berg:""}${geht ? (doppelt ? "Verdoppeln · " : "Ausbauen · ") + chf(kosten) : "Zu wenig Geld · " + chf(kosten)}</button>`}
    <div class="notiz">Jede Stufe bringt +5 % und kostet mehr als die vorherige. Jede zehnte Stufe verdoppelt die Ausbringung.</div>
  </div>`;
  }

  /* ---------- Rohstoffquelle ---------- */
  blattMine = function(id){
    const def = MINEN.find(x=>x.id===id), m = S.minen[id];
    const mat = MATERIAL[def.mat], land = LAND[def.land];
    const kopf = kopfZeile(def.land, def.ort, `${land.name} · Rohstoffquelle`);
    const band = `<div class="erzband" style="background:${mat.farbe}"><span class="kugel">${mat.sym}</span>${rohstoffDerMine(def)} → ${mat.name}</div>`;

    if (!m){
      const zu = gesperrt("mine", id);
      const geht = S.kasse >= def.erschliessung && !zu;
      const sp = sperre("mine", id, zu, `<div class="notiz">${START_MATERIALIEN.includes(def.mat)
            ? `Für <b>${mat.name}</b> hast du bereits eine Mine. Im Tutorial genügt eine pro Material.`
            : `Im Tutorial eröffnest du zuerst die Minen für <b>Kupfer, Aluminium und Zinn</b> – die drei Rohstoffe deines Ladekabels. Danach werden alle Standorte frei.`}</div>`);
      return kopf + sp.oben + band + szeneMine(def, null) + sp.notiz
        + `<div class="werte">
        ${wert(IK.berg, "Förderung pro Person", `<b>≈ ${proTag(def.ergiebigkeit)} pro Tag</b>`)}
        ${wert(IK.person, "Arbeitsplätze", `<b>${def.plaetze}</b>`)}
        ${wert(IK.muenze, "Üblicher Lohn", `<b>${chf(land.lohn)}</b>${einheit("pro Person und Monat")}`)}
        ${wert(IK.gluehbirne, "Wofür", `<b style="font-size:var(--f0)">${mat.wofuer}</b>`)}
      </div>
      <div class="notiz">${def.info}</div>
      ${sp.gesperrt ? nochNicht("mine-auf", `data-id="${id}"`) : `<button class="cta ${geht?"puls":""}" data-tun="mine-auf" data-id="${id}" ${geht?"":"disabled"}>
        ${geht?IK.hacke:""}${zu ? SPERRTEXT : geht ? "Rohstoffquelle eröffnen · " + chf(def.erschliessung) : "Zu wenig Geld · " + chf(def.erschliessung)}</button>`}`;
    }

    const st = LOHNSTUFE[m.stufe], zuf = Math.round(m.zufriedenheit);
    const farbe = zuf < 32 ? "var(--alarm)" : zuf < 60 ? "var(--warn)" : "var(--gruen)";
    const still = m.stillBis > S.tag;
    const ertrag = still ? 0 : m.arbeiter * def.ergiebigkeit * (0.55 + zuf/100*0.6)
                               * (m.malusBis>S.tag ? m.malus : 1) * perkMult("foerderung")
                               * ausbauFaktor(m.ausbau);
    const leuteBild = ikonTeam(Math.max(1, Math.ceil(m.arbeiter / Math.max(1, def.plaetze/5))), 60, .34);
    const tutorial = tutorialLaeuft();
    const sicher = !!m.sicherheit;
    const sicherKosten = Math.max(20000, Math.round(SICHERHEIT_BASIS_KOSTEN * perkMult("sicherheit") / 1000) * 1000);
    const sicherheitsKarte = tutorial ? "" : `<div class="karte sicherheitskarte ${sicher?"sicher":"offen"}">
      <h3>Sicherheit</h3>
      <div class="ort">Sicherheitsmassnahmen senken das Unfallrisiko – unabhängig vom Lohn.</div>
      <div class="zeile"><span>Status</span><b style="color:${sicher?"var(--gruen)":"var(--warn)"}">${sicher?"verbessert":"nicht verbessert"}</b></div>
      ${sicher?"":`<button class="cta gruen" data-didaktik="sicherheit" data-id="${id}" ${S.kasse>=sicherKosten?"":"disabled"}>${IK.schild}${S.kasse>=sicherKosten?"Sicherheit verbessern · "+chf(sicherKosten):"Zu wenig Geld · "+chf(sicherKosten)}</button>`}
    </div>`;

    return kopf + band + szeneMine(def, m)
      + (still ? `<div class="notiz rot"><b>Die Rohstoffquelle steht still.</b>${m.stillBis-S.tag<900?" Noch "+(m.stillBis-S.tag)+" Tage.":""}</div>` : "")
      + `<div class="werte">
      ${wert(IK.berg, "Förderung", `<b>${ertrag.toFixed(1)} pro Tag</b>`)}
      ${wert(IK.muenze, "Lohnkosten", `<b>${chf(m.arbeiter*land.lohn*st.faktor)}</b>${einheit("pro Monat")}`)}
    </div>

    <div class="karte">
      <h3>Belegschaft</h3>
      <div class="ort">${m.arbeiter} von ${def.plaetze} Plätzen · ${freieArbeiter()} Personen frei im Team</div>
      <div style="display:flex;justify-content:center">${m.arbeiter?`<div style="width:min(190px,60%)">${leuteBild}</div>`:""}</div>
      ${regler("crew", id, m.arbeiter, def.plaetze)}
    </div>

    ${tutorial ? "" : ausbauKarte("mine", id, m.ausbau, def.erschliessung, "Förderung")}

    <div class="karte">
      <h3>Lohnstufe</h3>
      <div class="ort">Der Lohn beeinflusst die Zufriedenheit</div>
      <div class="segment">${LOHNSTUFE.map((s,i)=>
        `<button data-tun="lohn" data-id="${id}" data-stufe="${i}" aria-pressed="${i===m.stufe}">
           ${ikonLohn(i, i===m.stufe)}${s.label}</button>`).join("")}</div>
      <div class="zeile"><span>${st.name}</span><b>${chf(land.lohn*st.faktor)}/Mt.</b></div>
      <div class="zeile"><span>Zielwert Zufriedenheit</span><b>${Math.round(st.ziel - (land.risiko-1)*8 + perkPlus("zufrieden"))} %</b></div>
    </div>

    ${sicherheitsKarte}

    ${nachweisKarte(id)}<div class="karte zufriedenheitskarte">
      <h3>Zufriedenheit</h3>
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:64px;flex:none">${ikonZufrieden(zuf)}</div>
        <div style="flex:1;min-width:0">
          <div class="leiste"><i style="width:${zuf}%;background:${farbe}"></i></div>
          <div class="zeile" style="padding-top:4px"><span>${zuf<32?"Streik ist wahrscheinlich":zuf<60?"angespannt":"gut"}</span><b>${zuf} %</b></div>
        </div>
      </div>
    </div>

    <div class="notiz">${def.info}</div>
    `;
  };

  /* ---------- Raffinerie ---------- */
  blattRaff = function(id){
    const def = RAFF_ORTE.find(x=>x.id===id), r = S.raff[id], land = LAND[def.land];
    const kopf = kopfZeile(def.land, def.ort, `${land.name} · Raffinerie`);
    const spezial = (def.spezial||[]).map(k=>MATERIAL[k] && MATERIAL[k].name).filter(Boolean);
    const spezialKarte = tutorialLaeuft() ? "" : `<div class="karte"><h3>Spezialisierung</h3><div class="ort">${spezial.join(" · ")||"keine Spezialisierung"}</div><div class="notiz">Diese Rohstoffe verarbeitet die Raffinerie <b>25 % schneller</b>. Alle anderen Rohstoffe verarbeitet sie normal.</div></div>`;
    if (!r){
      const zu = gesperrt("raff");
      const geht = S.kasse >= def.bau && !zu;
      const sp = sperre("raff", id, zu, `<div class="notiz">Im Tutorial baust du zuerst nur <b>eine</b> Raffinerie.</div>`);
      return kopf + sp.oben + szeneRaff(def, null) + sp.notiz
        + `<div class="werte">
        ${wert(IK.kolben, "Verarbeitet bis zu", `<b>${def.kapazitaet}</b>${einheit("Rohstoff pro Tag, voll besetzt")}`)}
        ${wert(IK.person, "Arbeitsplätze", `<b>${def.plaetze}</b>`)}
        ${wert(IK.muenze, "Lohn", `<b>${chf(land.lohn)}</b>${einheit("pro Person und Monat")}`)}
        ${wert(IK.kalender, "Betriebskosten", `<b>${chf(9000)}</b>${einheit("pro Monat")}`)}
      </div>
      ${spezialKarte}
      <div class="notiz">${def.info}</div>
      ${sp.gesperrt ? nochNicht("raff-bau", `data-id="${id}"`) : `<button class="cta ${geht?"puls":""}" data-tun="raff-bau" data-id="${id}" ${geht?"":"disabled"}>
        ${geht?IK.kolben:""}${zu ? SPERRTEXT : geht ? "Raffinerie bauen · " + chf(def.bau) : "Zu wenig Geld · " + chf(def.bau)}</button>`}`;
    }
    const erzda = Object.values(S.erz).reduce((a,b)=>a+b,0);
    const durchsatz = Math.round(def.kapazitaet*ausbauFaktor(r.ausbau)*(r.arbeiter/def.plaetze)*globalWert("hafen")*perkMult("durchsatz"));
    return kopf + szeneRaff(def, r) + `
    <div class="werte">
      ${wert(IK.kolben, "Verarbeitet", `<b>${durchsatz}</b>${einheit("Rohstoff pro Tag")}`)}
      ${wert(IK.berg, "Rohstoff im Lager", `<b>${Math.round(erzda)}</b>`)}
    </div>
    ${spezialKarte}
    <div class="karte">
      <h3>Belegschaft</h3>
      <div class="ort">${freieArbeiter()} Personen frei im Team</div>
      ${regler("rcrew", id, r.arbeiter, def.plaetze)}
    </div>
    ${tutorialLaeuft() ? "" : ausbauKarte("raff", id, r.ausbau, def.bau, "Durchsatz")}
    <div class="notiz">Aus 1 Einheit Rohstoff wird je nach Material unterschiedlich viel nutzbares Material. Der Rest ist Abraum: Gestein und Abfall.</div>
    <div class="notiz blau">${def.info}</div>`;
  };

  /* ---------- Fabrikstandort ---------- */
  blattFab = function(land){
    const meine = S.fabriken.map((f,i)=>({f,i})).filter(o => o.f.land === land);
    const kopf = kopfZeile(land, LAND[land].name, `Fabrikstandort · Lohn ${chf(LAND[land].lohn)} pro Person und Monat`);
    const rezept = (def, fehlt) => `<div class="ort" style="margin-top:7px">Rezept: Material pro Stück</div>
      <div class="stueck">${Object.keys(def.rezept).map(k =>
        `<span ${fehlt ? `class="${fehlt.includes(k)?"fehlt":""}" ` : ""}style="background:${MATERIAL[k].farbe}">${MATERIAL[k].sym} ${def.rezept[k]}</span>`).join("")}</div>`;

    const laufend = meine.map(({f,i}) => {
      const def = PRODUKT[f.produkt];
      if (f.restbau > 0) return `<div class="karte"><h3>${def.name}</h3>
      <div class="ort">Im Bau – noch ${f.restbau} Tage</div>
      ${szeneFabrik(f, def)}
      <div class="leiste"><i style="width:${(100-f.restbau/def.bauzeit*100).toFixed(0)}%;background:var(--gold)"></i></div></div>`;
      let stueck = Math.floor(f.arbeiter * def.proArbeiter * perkMult("fabrik"));
      for (const k in def.rezept) stueck = Math.min(stueck, Math.floor((S.mat[k]||0)/def.rezept[k]));
      const fehlt = Object.keys(def.rezept).filter(k => (S.mat[k]||0) < def.rezept[k]);
      let tipp = "";
      if (fehlt.length){
        const e = engpass();
        tipp = e && e.fab === land ? e.text : "Sichere dafür eine eigene Rohstoffquelle oder setze dort mehr Personal ein.";
      }
      return `<div class="karte"><h3>${def.name}</h3>
      <div class="ort">Verkauf ${chf(warenPreis(f.produkt))} · Nachfrage ${Math.round(nachfrage(f.produkt))}/Tag</div>
      ${szeneFabrik(f, def)}
      ${rezept(def, fehlt)}
      ${regler("fcrew", i, f.arbeiter, def.plaetze)}
      <div class="zeile"><span>Produktion heute</span><b>${stueck} Stück</b></div>
      <div class="zeile"><span>Lager</span><b>${S.ware[f.produkt]||0} Stück</b></div>
      ${fehlt.length ? `<div class="notiz rot">Es fehlt: ${fehlt.map(k=>MATERIAL[k].name).join(", ")}.
        ${tipp}</div>` : ""}</div>`;
    }).join("");

    const zu = gesperrt("fab");
    const sp = meine.length ? {gesperrt:false, oben:"", notiz: zu ? `<div class="notiz">Im Tutorial baust du zuerst nur <b>eine</b> Fabrik. Danach stehen alle Produkte offen.</div>` : ""}
      : sperre("fab", land, zu, `<div class="notiz">Im Tutorial baust du zuerst nur <b>eine</b> Fabrik. Danach stehen alle Produkte offen.</div>`);
    const bauzeitF = perkMult("bauzeit");
    // In der Einführung gibt es nur das Ladekabel zu bauen.
    const auswahl = tutorialLaeuft() ? [START_PRODUKT] : Object.keys(PRODUKT);
    const neu = auswahl.map(p => {
      const def = PRODUKT[p], geht = S.kasse >= def.kosten && !zu;
      const tage = Math.max(3, Math.round(def.bauzeit * bauzeitF));
      return `<div class="karte"><h3>${def.name}</h3>
      <div class="ort">Verkaufspreis ${chf(def.preis)} · Bauzeit ${tage} Tage · ${def.plaetze} Plätze</div>
      ${rezept(def, null)}
      <div class="notiz">${def.info}</div>
      ${sp.gesperrt ? nochNicht("fab-bau", `data-p="${p}" data-l="${land}"`) : `<button class="cta gruen" data-tun="fab-bau" data-p="${p}" data-l="${land}" ${geht?"":"disabled"}>
        ${geht?IK.fabrik:""}${zu ? SPERRTEXT : geht ? "Hier bauen · " + chf(def.kosten) : "Zu wenig Geld · " + chf(def.kosten)}</button>`}</div>`;
    }).join("");

    return kopf + sp.oben + laufend + sp.notiz
      + `<h3 style="margin:18px 0 8px">${tutorialLaeuft() ? "Dein erstes Produkt" : "Neue Produktlinie"}</h3>` + neu;
  };

  window.__erzweltBlaetter = {version: 1, ausbauKarte};
  blattStand = "";
})();
