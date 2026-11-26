#!/usr/bin/env python3
"""python3 scripts/texte_zurueck.py <schluessel>...: setzt textVon("k") wieder als Literal ein und löscht k."""
import re, sys, glob
s = open("texte.de.js", encoding="utf-8").read()
dateien = [f for f in glob.glob("*.js") + glob.glob("module/*.js") + ["erzwelt-core.html"] if f != "texte.de.js"]
for k in sys.argv[1:]:
    m = re.search(r'\n\s*"' + re.escape(k) + r'":\s*("(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`),?', s)
    wert = m.group(1)
    assert "{p" not in wert, k
    s = s[:m.start()] + s[m.end():]
    for f in dateien:
        t = open(f, encoding="utf-8").read()
        if 'textVon("%s")' % k in t:
            open(f, "w", encoding="utf-8").write(t.replace('textVon("%s")' % k, wert))
s = re.sub(r",(\s*\n\s*/\* -+ [^*]+ -+ \*/)(\s*\n\}\);)", r"\2", s)   # leerer letzter Abschnitt
s = re.sub(r",(\s*\n\}\);)", r"\1", s)
open("texte.de.js", "w", encoding="utf-8").write(s)
