"use strict";
/* Blatt einer eigenen Rohstoffquelle: Lohn direkt unter der Belegschaft.
   - Reihenfolge: Werte → Belegschaft → Lohnstufe → Zufriedenheit → Ausbau →
     Sicherheit → Herkunftsnachweis. So sieht man Personal, Lohn und ihre
     Wirkung zusammen, statt drei Bildschirme auseinander.
   - Jede Lohnstufe zeigt, was sie bewirkt: Lohnkosten pro Monat für die
     aktuelle Belegschaft und die Förderung pro Tag, sobald sich die
     Zufriedenheit eingependelt hat.
   - Ändert sich Lohn, Belegschaft oder Ausbau, steigen kurz rote/grüne
     Prozent-Zeichen auf (z. B. «Lohnkosten +45 %», «Förderung −23 %») und
     verschwinden nach 6 Sekunden.
   - Die doppelten Überschriften «Lohn → Zufriedenheit → Streik» und
     «Sicherheit → Unfallrisiko» entfallen (stehen in den Karten selbst).
   Nur Darstellung, keine Spiellogik. */
(function(){
  const VERSION = 1;
  const style = document.createElement("style");
  style.id = "erzwelt-blatt-ordnung-style";
  style.textContent = `
    #blattinhalt .segment button .lohn-vorschau{display:block;margin-top:3px;font-size:10.5px;font-weight:700;line-height:1.25;
      color:var(--grau);font-family:system-ui,sans-serif;white-space:nowrap}
    #blattinhalt .segment button .lohn-vorschau span{display:block}
    #blattinhalt .segment button[aria-pressed="true"] .lohn-vorschau{color:inherit;opacity:.85}
    #delta-ebene{position:fixed;inset:0;z-index:60;pointer-events:none}
    .delta-chip{position:absolute;transform:translateX(-100%);white-space:nowrap;padding:4px 9px;border-radius:99px;
      font:800 13px/1.2 "Baloo 2",sans-serif;box-shadow:0 4px 12px #0003;animation:deltaSteigt 6s ease-out forwards}
    .delta-chip.gut{background:#2fbe7e;color:#fff}
    .delta-chip.schlecht{background:#e0504a;color:#fff}
    @keyframes deltaSteigt{0%{opacity:0;transform:translate(-100%,8px)}8%{opacity:1;transform:translate(-100%,0)}
      75%{opacity:1;transform:translate(-100%,-22px)}100%{opacity:0;transform:translate(-100%,-30px)}}
    body[data-anim="0"] .delta-chip{animation:deltaRuhig 6s step-end forwards}
    @keyframes deltaRuhig{0%{opacity:1}100%{opacity:0}}
    #blattinhalt .lohn-hinweis{margin:6px 0 2px;font-size:var(--f0);color:var(--grau);font-weight:600}
  `;
  document.head.appendChild(style);

  const karte = (inhalt, titel) => [...inhalt.children].find(k => k.querySelector(":scope > h3")?.textContent.trim().startsWith(titel));

  function foerderung(id, stufe){
    const m = S.minen[id], def = MINEN.find(x => x.id === id);
    const zuf = Math.max(0, Math.min(100, LOHNSTUFE[stufe].ziel - (LAND[def.land].risiko - 1) * 8 + perkPlus("zufrieden")));
    return m.arbeiter * def.ergiebigkeit * perkMult("foerderung") * ausbauFaktor(m.ausbau) * (0.55 + zuf / 100 * 0.6);
  }

  function ordnen(id){
    const inhalt = document.getElementById("blattinhalt");
    if (!inhalt) return;
    const beleg = karte(inhalt, textVon("blattordnung.belegschaft")), lohn = karte(inhalt, textVon("blattordnung.lohnstufe")),
          zuf = karte(inhalt, textVon("blattordnung.zufriedenheit"));
    if (beleg && lohn && beleg.nextElementSibling !== lohn) beleg.after(lohn);
    if (lohn && zuf && lohn.nextElementSibling !== zuf) lohn.after(zuf);
    inhalt.querySelector(":scope > .mine-ursachen")?.remove();

    if (!lohn) return;
    const m = S.minen[id], def = MINEN.find(x => x.id === id);
    for (const b of lohn.querySelectorAll('.segment button[data-tun="lohn"]')){
      const st = +b.dataset.stufe;
      const kosten = Math.round(m.arbeiter * LAND[def.land].lohn * LOHNSTUFE[st].faktor);
      const html = `<span>${chf(kosten)}/Mt.</span><span>≈ ${Math.round(foerderung(id, st))} pro Tag</span>`;
      let v = b.querySelector(".lohn-vorschau");
      if (!v){ v = document.createElement("small"); v.className = "lohn-vorschau"; b.appendChild(v); }
      if (v.innerHTML !== html) v.innerHTML = html;
    }
    if (!lohn.querySelector(".lohn-hinweis")){
      const h = document.createElement("div");
      h.className = "lohn-hinweis";
      h.textContent = textVon("blattordnung.kosten-fuer-deine-belegschaft");
      lohn.querySelector(".segment")?.after(h);
    }
  }

  /* ---------- Delta-Anzeige ---------- */
  let letzter = null;
  const kostenVon = id => { const m = S.minen[id], def = MINEN.find(x => x.id === id); return m.arbeiter * LAND[def.land].lohn * LOHNSTUFE[m.stufe].faktor; };
  function prozent(vor, nach){
    if (!vor) return nach ? "neu" : "";
    const p = Math.round((nach - vor) / vor * 100);
    return p ? (p > 0 ? "+" : "−") + Math.abs(p) + " %" : "";
  }
  function chip(text, gut, x, y){
    let ebene = document.getElementById("delta-ebene");
    if (!ebene){ ebene = document.createElement("div"); ebene.id = "delta-ebene"; document.body.appendChild(ebene); }
    const c = document.createElement("span");
    c.className = "delta-chip " + (gut ? "gut" : "schlecht");
    c.textContent = text;
    c.style.left = x + "px"; c.style.top = y + "px";
    ebene.appendChild(c);
    setTimeout(() => c.remove(), 6100);
  }
  function deltaPruefen(id){
    const m = S.minen[id];
    const jetzt = {id, stufe:m.stufe, arbeiter:m.arbeiter, ausbau:m.ausbau || 0, kosten:kostenVon(id), foerd:foerderung(id, m.stufe)};
    const vor = letzter;
    letzter = jetzt;
    if (!vor || vor.id !== id) return;
    if (vor.stufe === jetzt.stufe && vor.arbeiter === jetzt.arbeiter && vor.ausbau === jetzt.ausbau) return;
    const inhalt = document.getElementById("blattinhalt");
    const ziel = vor.stufe !== jetzt.stufe ? karte(inhalt, textVon("blattordnung.lohnstufe"))
      : vor.arbeiter !== jetzt.arbeiter ? karte(inhalt, textVon("blattordnung.belegschaft")) : karte(inhalt, textVon("blattordnung.ausbau"));
    const blatt = document.getElementById("blatt").getBoundingClientRect();
    const r = (ziel || inhalt).getBoundingClientRect();
    const x = Math.min(r.right, blatt.right) - 12;
    let y = Math.max(r.top, blatt.top + 40) + 10;
    const dk = prozent(vor.kosten, jetzt.kosten), df = prozent(vor.foerd, jetzt.foerd);
    if (df){ chip(textVon("blattordnung.foerderung", {p1:(df)}), jetzt.foerd >= vor.foerd, x, y); y += 30; }
    if (dk) chip(textVon("blattordnung.lohnkosten", {p1:(dk)}), jetzt.kosten <= vor.kosten, x, y);
  }

  /* Nach jedem Füllen (module/blatt.js) */
  (window.__erzweltBlattTeile ||= {}).ordnen = function(art, id){
    if (art === "mine" && S.minen[id]){ ordnen(id); deltaPruefen(id); }
    else letzter = null;
  };
  window.__erzweltBlattOrdnung = {version:VERSION};
})();
