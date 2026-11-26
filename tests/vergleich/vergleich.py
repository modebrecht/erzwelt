#!/usr/bin/env python3
"""Vergleicht zwei Aufnahmen des Prüfstands (aufnahme.cjs).

    python3 tests/vergleich/vergleich.py <referenz> <neu> [--zweite-referenz <ordner>] [--bild-toleranz 0.002]

Text, Klassen, Knöpfe und Spielstand müssen gleich sein. Screenshots dürfen nur
minimal abweichen (Anteil abweichender Pixel <= Toleranz, Standard 0,2 %).
Mit --zweite-referenz (zweite Aufnahme desselben Stands) gelten Stellen, die schon
zwischen den beiden Referenzen schwanken (Zeitabläufe: Rückmeldungen, kurze
Effekte), als instabil: sie werden gemeldet, zählen aber nicht als Unterschied.
Exit-Code 0 = gleich, 1 = Unterschiede.
"""
import json, sys, os, re
from PIL import Image, ImageChops

def lade(ordner):
    with open(os.path.join(ordner, "zustaende.json"), encoding="utf-8") as f:
        return json.load(f)

KLASSEN = re.compile(r'class="([^"]*)"')
def norm(t):
    # Reihenfolge der Klassen in class="…" ist kein sichtbares Verhalten
    return KLASSEN.sub(lambda m: 'class="' + " ".join(sorted(m.group(1).split())) + '"', t)

def unterschiede(a, b, pfad=""):
    if type(a) != type(b):
        yield pfad, a, b
    elif isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a or k not in b:
                yield f"{pfad}.{k}", a.get(k, "<fehlt>"), b.get(k, "<fehlt>")
            else:
                yield from unterschiede(a[k], b[k], f"{pfad}.{k}")
    elif isinstance(a, list):
        if len(a) != len(b):
            yield f"{pfad}[Länge]", len(a), len(b)
        for i, (x, y) in enumerate(zip(a, b)):
            yield from unterschiede(x, y, f"{pfad}[{i}]")
    elif isinstance(a, float) and isinstance(b, float):
        if abs(a - b) > 1e-6:
            yield pfad, a, b
    elif isinstance(a, str) and isinstance(b, str):
        if a != b and norm(a) != norm(b):
            yield pfad, a, b
    elif a != b:
        yield pfad, a, b

def bild_abweichung(p1, p2):
    if not os.path.exists(p1) and not os.path.exists(p2):
        return 0.0
    if not os.path.exists(p1) or not os.path.exists(p2):
        return 1.0
    a, b = Image.open(p1).convert("RGB"), Image.open(p2).convert("RGB")
    if a.size != b.size:
        return 1.0
    diff = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0)
    return sum(1 for v in (diff.get_flattened_data() if hasattr(diff, 'get_flattened_data') else diff.getdata()) if v) / (a.size[0] * a.size[1])

def main():
    argv = sys.argv[1:]
    tol, ref2 = 0.002, None
    if "--bild-toleranz" in argv:
        i = argv.index("--bild-toleranz"); tol = float(argv[i + 1]); del argv[i:i + 2]
    if "--zweite-referenz" in argv:
        i = argv.index("--zweite-referenz"); ref2 = argv[i + 1]; del argv[i:i + 2]
    ref, neu = argv[:2]
    A, B = lade(ref), lade(neu)
    instabil, bild_instabil = {}, set()
    if ref2:
        C = lade(ref2)["ergebnis"]
        for name, z in A["ergebnis"].items():
            if name not in C: continue
            instabil[name] = {p for p, _, _ in unterschiede(z, C[name])}
            if bild_abweichung(os.path.join(ref, name + ".png"), os.path.join(ref2, name + ".png")) > tol:
                bild_instabil.add(name)
    fehler = 0
    if B["fehler"]:
        print("SEITENFEHLER in neu:", *B["fehler"], sep="\n  ")
        fehler += 1
    za, zb = A["ergebnis"], B["ergebnis"]
    for name in sorted(set(za) | set(zb)):
        if name not in za or name not in zb:
            print(f"✗ {name}: nur in {'Referenz' if name in za else 'neu'}"); fehler += 1; continue
        alle = list(unterschiede(za[name], zb[name]))
        d = [x for x in alle if x[0] not in instabil.get(name, set())]
        anteil = bild_abweichung(os.path.join(ref, name + ".png"), os.path.join(neu, name + ".png"))
        bild_ok = anteil <= tol or name in bild_instabil
        if len(d) < len(alle) or (anteil > tol and bild_ok):
            print(f"~ {name}: instabil (auch zwischen den Referenzen), nicht gezählt")
        if d or not bild_ok:
            fehler += 1
            print(f"✗ {name}: {len(d)} Unterschiede, Bild {anteil*100:.2f} % abweichend")
            for pfad, a, b in d[:8]:
                print(f"    {pfad}\n      Referenz: {str(a)[:160]}\n      neu:      {str(b)[:160]}")
        else:
            print(f"✓ {name}" + (f" (Bild {anteil*100:.2f} %)" if anteil else ""))
    print(f"\n{len(za)} Zustände, {fehler} mit Unterschieden")
    sys.exit(1 if fehler else 0)

if __name__ == "__main__":
    main()
