#!/usr/bin/env python3
"""Verschiebt sichtbare Texte aus JS-Code nach texte.de.js.

  python3 scripts/texte_migration.py <datei> [...]     (im Repo-Ordner)

Ersetzt Zeichenketten und Template-Literale mit deutschem Text durch
textVon("schluessel") bzw. textVon("schluessel", {p1:(ausdruck), …}).
Der Text wird roh (mit allen Escapes) in texte.de.js übernommen, damit
textVon genau dieselbe Zeichenkette liefert. Verschachtelte Literale in
${…} bleiben im Ausdruck und werden beim nächsten Lauf umgestellt.
Für erzwelt-core.html wird nur der Inhalt der <script>-Blöcke bearbeitet."""
import re, sys, os, unicodedata

UML = "äöüÄÖÜß"
WORT = re.compile(r"[A-Za-z" + UML + r"]{2,}")

# ---------- Lexer: findet Literale auf oberster Ebene ----------
def literale(code):
    """Liefert (start, ende, art) für Strings/Templates im Code (nicht in Kommentaren/Regex)."""
    aus = []
    i, n = 0, len(code)
    letztes = ""          # letztes bedeutsames Zeichen / Wort
    def regex_moeglich():
        if not letztes: return True
        if letztes[-1] in "(,=:[!&|?{};+-*%<>~^": return True
        return letztes in ("return", "typeof", "case", "in", "of", "delete", "void", "throw", "new", "else", "do")
    while i < n:
        c = code[i]
        if c in " \t\r\n": i += 1; continue
        if code.startswith("//", i):
            j = code.find("\n", i); i = n if j < 0 else j; continue
        if code.startswith("/*", i):
            j = code.find("*/", i + 2); i = n if j < 0 else j + 2; continue
        if c in "\"'":
            j = i + 1
            while j < n and code[j] != c:
                if code[j] == "\\": j += 2; continue
                if code[j] == "\n": break
                j += 1
            aus.append((i, j + 1, "str")); i = j + 1; letztes = "x"; continue
        if c == "`":
            j = template_ende(code, i)
            aus.append((i, j, "tpl")); i = j; letztes = "x"; continue
        if c == "/" and regex_moeglich():
            j = i + 1; klasse = False
            while j < n:
                if code[j] == "\\": j += 2; continue
                if code[j] == "[": klasse = True
                elif code[j] == "]": klasse = False
                elif code[j] == "/" and not klasse: break
                elif code[j] == "\n": break
                j += 1
            j += 1
            while j < n and code[j].isalpha(): j += 1
            i = j; letztes = "x"; continue
        m = re.match(r"[A-Za-z_$][\w$]*", code[i:])
        if m: letztes = m.group(0); i += len(letztes); continue
        letztes = c; i += 1
    return aus

def template_ende(code, i):
    """Index nach dem schliessenden Backtick des Templates ab i."""
    j = i + 1; n = len(code)
    while j < n:
        if code[j] == "\\": j += 2; continue
        if code[j] == "`": return j + 1
        if code.startswith("${", j):
            j = ausdruck_ende(code, j + 2) + 1; continue
        j += 1
    raise ValueError("Template ohne Ende")

def ausdruck_ende(code, j):
    """Index der schliessenden } eines ${…}-Ausdrucks ab j."""
    tiefe = 0; n = len(code)
    while j < n:
        c = code[j]
        if c in "\"'":
            k = j + 1
            while k < n and code[k] != c:
                k += 2 if code[k] == "\\" else 1
            j = k + 1; continue
        if c == "`": j = template_ende(code, j); continue
        if code.startswith("//", j):
            k = code.find("\n", j); j = n if k < 0 else k; continue
        if code.startswith("/*", j):
            k = code.find("*/", j + 2); j = k + 2; continue
        if c == "{": tiefe += 1
        elif c == "}":
            if tiefe == 0: return j
            tiefe -= 1
        j += 1
    raise ValueError("${ ohne Ende")

def teile_template(roh):
    """roh = Inhalt zwischen Backticks -> (textteile, ausdruecke)."""
    texte, ausdruecke = [], []
    j = 0; start = 0; n = len(roh)
    while j < n:
        if roh[j] == "\\": j += 2; continue
        if roh.startswith("${", j):
            e = ausdruck_ende(roh, j + 2)
            texte.append(roh[start:j]); ausdruecke.append(roh[j + 2:e])
            j = e + 1; start = j; continue
        j += 1
    texte.append(roh[start:])
    return texte, ausdruecke

# ---------- Ist das sichtbarer Text? ----------
TASTEN = {"Escape", "Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Home", "End",
          "Backspace", "Delete", "PageUp", "PageDown", "Error", "Baloo", "Nunito", "UTF", "JSON", "Node", "Object"}
def sichtbar(text):
    roh = text.strip()
    if re.fullmatch(r"[a-z]+(-[a-z0-9]+)+|[a-z]{2}-[A-Z]{2}|NF[CD]|NFK[CD]|[A-Za-z]-[A-Za-z].*-.*", roh): return False
    t = re.sub(r"<[^>]*>", " ", text)
    t = re.sub(r"&[a-z#0-9]+;", " ", t)
    t = re.sub(r"\\[nt]", " ", t)
    if "://" in t or t.strip().startswith(("./", "/", "data:", "#", ".", "[")): return False
    if re.search(r"[{};]\s*$", t.strip()) or re.search(r"[\w-]+\s*:\s*[^;]+;", t): return False   # CSS
    woerter = WORT.findall(t)
    if not woerter: return False
    if len(woerter) == 1:
        w = woerter[0]
        if w in TASTEN or not (w[0].isupper() or any(ch in UML for ch in w)) or len(w) < 3: return False
        if re.search(r"[#.\[\]=()]", t) and " " not in t.strip(): return False
        if t.strip() != w and not re.fullmatch(r"[\W\d]*" + re.escape(w) + r"[\W\d]*", t.strip()): return False
    else:
        if re.fullmatch(r"[\w\-.#\[\]=\"'(): >*+~,]+", t.strip()) and not any(ch in UML for ch in t) and \
           re.search(r"[#.\[]", t): return False     # Selektor
        if all(w.islower() for w in woerter) and not any(ch in UML for ch in t) and \
           not re.search(r"\b(und|der|die|das|ist|nicht|mit|für|im|auf|ein|eine|zu|von|noch|oder)\b", t): return False
    return True

def schluesselname(text, praefix, vergeben):
    t = re.sub(r"<[^>]*>|\$\{[^}]*\}|\{p\d+\}|&[a-z]+;", " ", text)
    t = t.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("Ä", "Ae").replace("Ö", "Oe").replace("Ü", "Ue").replace("ß", "ss")
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    w = [x.lower() for x in re.findall(r"[A-Za-z]{2,}", t)][:4] or ["text"]
    basis = praefix + "." + "-".join(w)
    k, i = basis, 2
    while k in vergeben: k = f"{basis}-{i}"; i += 1
    return k

# ---------- Umstellen ----------
def umstellen(code, praefix, texte, schluessel_von):
    aus, pos = [], 0
    for a, b, art in literale(code):
        roh = code[a:b]
        davor = code[max(0, a - 40):a]
        danach = code[b:b + 20]
        if re.search(r"textVon\(\s*$", davor) or re.search(r"(RegExp|querySelector(All)?|closest|getElementById|matches|addEventListener|setAttribute|getAttribute|removeAttribute|hasAttribute|toggleAttribute)\(\s*$", davor):
            continue
        if re.match(r"\s*:", danach) and re.search(r"[{,]\s*$", davor): continue      # Objektschlüssel
        if re.search(r"\bcase\s*$", davor) or re.search(r"\buse strict", roh): continue
        if re.search(r"(===|!==|==|!=)\s*$", davor) or re.match(r"\s*(===|!==|==|!=)", danach): continue
        if re.search(r"\.(startsWith|endsWith|includes|indexOf)\(\s*$", davor): continue
        inhalt = roh[1:-1]
        if art == "str":
            if not sichtbar(inhalt): continue
            wert = roh if roh[0] == '"' else '"' + inhalt.replace('"', '\\"').replace("\\'", "'") + '"'
            ersatz_args = ""
        else:
            textteile, ausdruecke = teile_template(inhalt)
            nur_text = "".join(textteile)
            if not sichtbar(nur_text) or re.search(r"\{\w+\}", nur_text): continue
            if re.search(r"(?<![\w$.])(String\.raw|css|html)\s*$", davor): continue
            if not ausdruecke:
                wert = roh; ersatz_args = ""
            else:
                stuecke = [textteile[0]]
                for k, t in enumerate(textteile[1:], 1): stuecke += ["{p%d}" % k, t]
                wert = "`" + "".join(stuecke) + "`"
                ersatz_args = ", {" + ", ".join("p%d:(%s)" % (k, e.strip()) for k, e in enumerate(ausdruecke, 1)) + "}"
        if wert in schluessel_von: k = schluessel_von[wert]
        else:
            k = schluesselname(wert, praefix, texte)
            texte[k] = wert; schluessel_von[wert] = k
        aus.append(code[pos:a]); aus.append('textVon("%s"%s)' % (k, ersatz_args)); pos = b
    aus.append(code[pos:])
    return "".join(aus)

def praefix_von(datei):
    name = os.path.basename(datei).rsplit(".", 1)[0]
    return {"erzwelt-core": "kern"}.get(name, re.sub(r"[^a-z0-9]+", "", name.lower())[:14])

def lade_texte():
    s = open("texte.de.js", encoding="utf-8").read()
    texte, von = {}, {}
    for m in re.finditer(r'^\s*"([\w.\-]+)":\s*("(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)\s*,?\s*$', s, re.M):
        texte[m.group(1)] = m.group(2); von.setdefault(m.group(2), m.group(1))
    return s, texte, von

def main(dateien):
    quelle, texte, von = lade_texte()
    vorher = set(texte)
    neue_abschnitte = []
    for d in dateien:
        code = open(d, encoding="utf-8").read()
        p = praefix_von(d)
        anfang = set(texte)
        if d.endswith(".html"):
            teile = re.split(r"(<script\b[^>]*>)(.*?)(</script>)", code, flags=re.S)
            neu = []
            for i in range(0, len(teile)):
                neu.append(umstellen(teile[i], p, texte, von) if i % 4 == 2 and "src=" not in teile[i - 1] else teile[i])
            code_neu = "".join(neu)
        else:
            code_neu = umstellen(code, p, texte, von)
        neu_k = [k for k in texte if k not in anfang]
        if neu_k:
            neue_abschnitte.append((d, neu_k))
            open(d, "w", encoding="utf-8").write(code_neu)
        print(f"{d}: {len(neu_k)} neue Texte")
    if neue_abschnitte:
        zeilen = []
        for d, ks in neue_abschnitte:
            zeilen.append(f"\n  /* ---------- {os.path.basename(d)} ---------- */")
            zeilen += [f'  "{k}": {texte[k]},' for k in ks]
        block = "\n".join(zeilen).rstrip(",")
        ende = quelle.index("\n});")
        vor = quelle[:ende].rstrip()
        if not vor.endswith(","): vor += ","
        quelle = vor + "\n" + block + quelle[ende:]
        open("texte.de.js", "w", encoding="utf-8").write(quelle)

if __name__ == "__main__":
    main(sys.argv[1:])
