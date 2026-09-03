from pathlib import Path

path = Path("erzwelt.html")
text = path.read_text(encoding="utf-8")


def once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, found {count}")
    text = text.replace(old, new, 1)
    print(f"ok: {label}")


def all_(old, new, label, minimum=1):
    global text
    count = text.count(old)
    if count < minimum:
        raise SystemExit(f"{label}: expected at least {minimum} match(es), found {count}")
    text = text.replace(old, new)
    print(f"ok: {label} ({count})")


# ---------------------------------------------------------------------------
# A) One vocabulary for the whole learning model: Rohstoff -> Material.
#    Internal state names such as S.erz stay untouched; only student-facing text changes.
# ---------------------------------------------------------------------------
once('rohstoff:"Zinkerz (Indium als Nebenprodukt)"', 'rohstoff:"Zinkerz (Nebenprodukt)"', "indium source label")

for old, new, label in [
    ('<small>Spiel-Ergiebigkeit</small><b>${def.ergiebigkeit} Erz</b>', '<small>Ergiebigkeit</small><b>${def.ergiebigkeit} Rohstoff</b>', "mine yield label"),
    ('<small>Roherz im Lager</small>', '<small>Rohstoff im Lager</small>', "refinery stock label"),
    ('<div class="notiz">Aus 1 Erz wird je nach Material unterschiedlich viel: Silizium 70 %, Gold nur 8 %. Der Rest ist Abraum.</div>', '<div class="notiz">Aus 1 Einheit Rohstoff wird je nach Material unterschiedlich viel nutzbares Material. Die Ausbeute ist im Spiel vereinfacht.</div>', "refinery conversion note"),
    ('"+" + Math.round(menge) + " Erz"', '"+" + Math.round(menge) + " Rohstoff"', "floating extraction label"),
    ('<small style="color:var(--grau);font-weight:600">+ ${Math.round(S.erz[k]||0)} Erz</small>', '<small style="color:var(--grau);font-weight:600">+ ${Math.round(S.erz[k]||0)} Rohstoff</small>', "goal stock label"),
    ('Aus der Mine kommt <b>Roherz</b> – ein Gemisch aus Gestein und dem, was du eigentlich willst.', 'Aus der Rohstoffquelle kommt ein <b>Ausgangsrohstoff</b>. Erst die Raffinerie macht daraus das nutzbare Material.', "supply-chain knowledge wording"),
    ('Die <b>Ergiebigkeit</b> im Spiel sagt, wie viel Roherz ein Mensch pro Tag aus dem Berg holt.', 'Die <b>Ergiebigkeit</b> im Spiel sagt, wie viel Rohstoff pro Person und Tag gewonnen wird.', "geology yield wording"),
    ('Weniger Fehlschläge, mehr Erz pro Schicht.', 'Weniger Fehlschläge, mehr Rohstoff pro Schicht.', "geology perk wording"),
    ('id:"chemie", titel:"Chemie & Raffination", farbe:"#5b8f7a", ikon:"kolben",\n    kurz:"Aus Erz wird Material – und der grösste Teil ist Abraum."', 'id:"chemie", titel:"Chemie & Raffination", farbe:"#5b8f7a", ikon:"kolben",\n    kurz:"Aus Rohstoff wird Material – Raffination trennt und verarbeitet."', "chemistry subtitle"),
    ('Die <b>Ausbeute</b> sagt, wie viel Material aus einer Einheit Roherz entsteht.', 'Die <b>Ausbeute</b> sagt im Spiel, wie viel Material aus einer Einheit Rohstoff entsteht.', "chemistry yield wording"),
    ('holen mehr aus demselben Erz.', 'holen mehr aus demselben Rohstoff.', "chemistry perk wording"),
    ('["Material aus Erz","Erz × Ausbeute"]', '["Material aus Rohstoff","Rohstoff × Ausbeute"]', "model formula wording"),
]:
    once(old, new, label)


# ---------------------------------------------------------------------------
# B) Safety is its own decision. Wage icons/text must not smuggle safety back in.
# ---------------------------------------------------------------------------
once('/* Lohnstufe: 1 / 2 / 3 Münzen, ab Stufe «fair» mit Helm & Schutz */',
     '/* Lohnstufe: 1 / 2 / 3 Münzen. Sicherheit wird separat angezeigt. */',
     "wage icon comment")

# The first patch left a helmet on the fair-wage icon. Remove it completely.
once('''  const schutz = stufe === 2
    ? `<path d="M4.4 7.2a4.6 4.6 0 0 1 9.2 0z" fill="${aktiv?"#2fbe7e":"#b8c9bd"}" transform="translate(13 -2)"/>
       <rect x="15.4" y="4.9" width="11.6" height="1.8" rx=".9" fill="${aktiv?"#2fbe7e":"#b8c9bd"}"/>` : "";''',
'''  const schutz = "";''',
"remove helmet from wage icon")

# Knowledge does not auto-secure every mine. It makes local safety improvements cheaper.
once('''      {id:"leute1", titel:"Sicherheitsstandard", kosten:80000,
       text:"Helm, Gurt, Beleuchtung und regelmässige Schulung werden in allen bestehenden und künftigen Minen Standard.",
       wirkung:["Sicherheitsstandard in allen Minen","Zufriedenheit +5"], plus:{zufrieden:5}},''',
'''      {id:"leute1", titel:"Sicherheitsplanung", kosten:80000,
       text:"Schulung und klare Standards helfen dir, Sicherheitsmassnahmen in einzelnen Minen günstiger umzusetzen.",
       wirkung:["Sicherheitsausbau CHF 20'000 günstiger","Zufriedenheit +5"], plus:{zufrieden:5}},''',
"safety knowledge perk")

once('const perkHat = id => !!S.perks[id];',
'''const perkHat = id => !!S.perks[id];
const sicherheitsKosten = () => perkHat("leute1") ? 40000 : 60000;''',
"safety cost helper")

once('sicherheit:S.perks.leute1?1:0, audit:S.perks.ruf2?true:false',
     'sicherheit:0, audit:S.perks.ruf2?true:false',
     "new mines do not auto-secure")

once('      if (e2.perk.id === "leute1") Object.values(S.minen).forEach(m => { m.sicherheit = 1; });\n',
     '',
     "knowledge does not auto-secure existing mines")

once('''      <h3>Sicherheit</h3>
      <div class="ort">Unabhängig vom Lohn: Ausrüstung und Schulung bestimmen den Sicherheitsstandard.</div>
      <div class="zeile"><span>Standard</span><b style="color:${m.sicherheit?"var(--gruen)":"var(--warn)"}">${m.sicherheit?"geschult & ausgerüstet":"Grundstandard · erhöhtes Risiko"}</b></div>
      ${m.sicherheit ? `<div class="notiz">Schutzstandard aktiv. Ein hoher Lohn ersetzt Sicherheit nicht – und umgekehrt.</div>`
        : `<button class="cta" data-tun="sicherheit" data-id="${id}" ${S.kasse>=60000?"":"disabled"}>${S.kasse>=60000?IK.schild:""}Sicherheitsstandard · ${chf(60000)}</button>`}''',
'''      <h3>Sicherheit</h3>
      <div class="ort">Sicherheit ist unabhängig vom Lohn.</div>
      <div class="zeile"><span>Standard</span><b style="color:${m.sicherheit?"var(--gruen)":"var(--warn)"}">${m.sicherheit?"verbessert":"Basis · erhöhtes Risiko"}</b></div>
      ${m.sicherheit ? ""
        : `<button class="cta" data-tun="sicherheit" data-id="${id}" ${S.kasse>=sicherheitsKosten()?"":"disabled"}>${S.kasse>=sicherheitsKosten()?IK.schild:""}Sicherheit verbessern · ${chf(sicherheitsKosten())}</button>`}''',
"simple safety card")

once('''      if (S.kasse < 60000) return;
      S.kasse -= 60000; S.ausgegeben += 60000;''',
'''      const kosten = sicherheitsKosten();
      if (S.kasse < kosten) return;
      S.kasse -= kosten; S.ausgegeben += kosten;''',
"local safety purchase cost")


# ---------------------------------------------------------------------------
# C) Missing evidence must not mean low wage, unsafe work or a particular country.
# ---------------------------------------------------------------------------
once('''passt(){ return offeneMinen().some(id => !S.minen[id].audit && !S.perks.ruf2 && LAND[MINEN.find(x=>x.id===id).land].risiko >= 1.3) && S.tag > 90; },''',
'''passt(){ return offeneMinen().some(id => !S.minen[id].audit && !S.perks.ruf2) && S.tag > 90; },''',
"report trigger independent of country/wage")

once('''const id = offeneMinen().find(i => !S.minen[i].audit && !S.perks.ruf2 && LAND[MINEN.find(x=>x.id===i).land].risiko >= 1.3);''',
'''const id = offeneMinen().find(i => !S.minen[i].audit && !S.perks.ruf2);''',
"report target independent of country/wage")

once('''art:"Recherche", titel:"Reportage über deine Lieferkette", land:def.land,
        text:`Ein Recherche-Team veröffentlicht Bilder aus ${def.ort}: Jugendliche schleppen Säcke, ohne Helm, ohne Vertrag. Dein Name steht im Artikel. Kunden fragen nach.`,''',
'''art:"Recherche", titel:"Unklare Arbeitsbedingungen", land:def.land,
        text:`Ein Recherche-Team untersucht ${def.ort}. Für diese Mine fehlen unabhängige Nachweise zu Herkunft und Arbeitsbedingungen. Der Bericht wirft offene Fragen auf. Dein Name steht im Artikel.`,''',
"report wording")

once('''          {text:"Unabhängiges Audit bezahlen und Löhne anheben", klein:"CHF 90'000, Ruf steigt deutlich",
           tun(){ S.kasse -= 90000; S.ausgegeben += 90000; S.minen[id].audit = true; S.minen[id].sicherheit = 1;
                  S.minen[id].stufe = Math.max(1, S.minen[id].stufe); rufAendern(14);
                  notiz("Audit abgeschlossen: Nachweise, Sicherheitsmassnahmen und Korrekturplan umgesetzt.", "gut"); }},''',
'''          {text:"Unabhängiges Audit durchführen", klein:"CHF 90'000 · schafft überprüfbare Nachweise",
           tun(){ S.kasse -= 90000; S.ausgegeben += 90000; S.minen[id].audit = true; rufAendern(10);
                  notiz("Audit abgeschlossen: Herkunft und Arbeitsbedingungen sind dokumentiert.", "gut"); }},''',
"report audit choice")

once('''          {text:"Erklären, das sei ein Zulieferer gewesen", klein:"Kostet nichts, Ruf fällt, Nachfrage sinkt 60 Tage",
           tun(){ rufAendern(-22); S.nachfrageMod.phone = {faktor:.7, bis:S.tag+60}; notiz("Dementi veröffentlicht. Die Nachfrage nach dem Phone bricht ein.", "alarm"); }}''',
'''          {text:"Bericht zurückweisen", klein:"Kein Audit · Ruf fällt, Nachfrage sinkt 60 Tage",
           tun(){ rufAendern(-22); S.nachfrageMod.phone = {faktor:.7, bis:S.tag+60}; notiz("Bericht zurückgewiesen. Ohne Nachweise bleibt das Vertrauen beschädigt.", "alarm"); }}''',
"report denial choice")


# ---------------------------------------------------------------------------
# D) Student-facing language: Ruf -> Nachfrage; Nachweise -> Gesetz.
# ---------------------------------------------------------------------------
once('kurz:"Ruf beeinflusst Kundschaft. Nachweise entscheiden über Compliance."',
     'kurz:"Ruf beeinflusst Kundschaft. Nachweise zeigen, ob Regeln eingehalten werden."',
     "remove compliance jargon")
once('Transparenzbericht oder Zertifizierung schaffen Compliance.',
     'Transparenzbericht oder Zertifizierung liefern die nötigen Nachweise.',
     "goal evidence wording")


# ---------------------------------------------------------------------------
# E) Model-value disclaimer once, not on every number.
# ---------------------------------------------------------------------------
for old, new, label in [
    ('<small>Modell-Lohn</small>', '<small>Lohn</small>', "mine wage label"),
    ('<small>Spiel-Kapazität</small>', '<small>Kapazität</small>', "refinery capacity label"),
    ('<div class="ort">Spielwerte: Verkaufspreis ${chf(def.preis)} · Bauzeit ${tage} Tage · ${def.plaetze} Plätze</div>', '<div class="ort">Verkaufspreis ${chf(def.preis)} · Bauzeit ${tage} Tage · ${def.plaetze} Plätze</div>', "factory value label"),
    ('<div class="ort"><b>Spielrezept</b> – vereinfachte Materialeinheiten pro Stück</div>', '<div class="ort">Rezept · Materialeinheiten pro Stück</div>', "factory recipe label"),
    ('<b>${chf(land.lohn*st.faktor)}/Mt. <small style="color:var(--grau)">Spielwert</small></b>', '<b>${chf(land.lohn*st.faktor)}/Mt.</b>', "wage row model tag"),
]:
    all_(old, new, label)

once('''      <div class="notiz">${def.info}</div>
      <div class="notiz"><b>Spielmodell:</b> Ergiebigkeit, Lohn und Erschliessungskosten sind vereinfachte Spielwerte. Der Infotext beschreibt den realen Kontext.</div>
      <button class="cta ${geht?"puls":""}" data-tun="mine-auf" data-id="${id}" ${geht?"":"disabled"}>''',
'''      <div class="notiz">${def.info}</div>
      <button class="cta ${geht?"puls":""}" data-tun="mine-auf" data-id="${id}" ${geht?"":"disabled"}>''',
"remove repetitive mine disclaimer")

# Keep exactly one compact disclaimer in the market, plus the dedicated model knowledge section.
once('''      <div class="notiz"><b>Spielmodell:</b> Mengen, Ausbeuten, Kosten, Löhne, Nachfrage und Produktrezepte sind vereinfachte Balancingwerte – keine 1:1-Realweltdaten.</div>''',
'''      <div class="notiz"><b>Spielmodell:</b> Mengen, Kosten, Löhne und Rezepte sind vereinfacht, damit die Zusammenhänge spielbar bleiben.</div>''',
"short model disclaimer")


# ---------------------------------------------------------------------------
# F) Final invariants for the five simple student relationships.
# ---------------------------------------------------------------------------
for forbidden in [
    "Compliance",
    "mit Schutzausrüstung",
    "Spiel-Ergiebigkeit",
    "Modell-Lohn",
    "Spiel-Kapazität",
    "Spielwerte: Verkaufspreis",
    "Jugendliche schleppen Säcke",
    "das sei ein Zulieferer gewesen",
    "sicherheit:S.perks.leute1?1:0",
    'if (e2.perk.id === "leute1") Object.values(S.minen).forEach(m => { m.sicherheit = 1; });',
]:
    if forbidden in text:
        raise SystemExit(f"forbidden student-facing coupling left: {forbidden}")

for required in [
    "Rohstoff →",
    "Sicherheit ist unabhängig vom Lohn.",
    "Sicherheit verbessern",
    "Lieferketten-Nachweise",
    "Gesetze prüfen Nachweise – nicht deinen Ruf.",
    "Unabhängiges Audit durchführen",
    "Spielmodell:",
]:
    if required not in text:
        raise SystemExit(f"required student-facing marker missing: {required}")

path.write_text(text, encoding="utf-8")
print("Student-facing MUST FIX simplification applied.")
