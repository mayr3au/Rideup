"""Étape 1 : pdftotext -layout RideUp_Spot_Finder.pdf /tmp/spots.txt, puis ce script → /tmp/pdf_rows.json. Étape 2 : scripts/import-spot-finder-pdf.py"""
import re, json
from collections import Counter

lines = open("/tmp/spots.txt", encoding="utf-8").read().replace("\f", "").split("\n")
rows, region, section = [], "", ""
cols = None          # (kite_col, cond_col, src_col, has_surf)
cur = None
row3 = re.compile(r"^(\s*)(\d{3})\s{2,}(\S.*?)\s{2,}([DTPWX?])\s+([DTPWX?])\s+([DTPWX?])(?:\s{2,}(.*))?$")
row2 = re.compile(r"^(\s*)(\d{3})\s{2,}(\S.*?)\s{2,}([DTPWX?])\s+([DTPWX?])(?:\s{2,}(.*))?$")
hdr_re = re.compile(r"^\s*ID\s+Spot.*?(Kite)\s+Wing\s+(Surf\s+)?(\S)")
page_hdr = re.compile(r"^\s*(RIDE’UP / |REVUE DU )")
SKIP_TITLE = ("D ·", "Cours ", "ID ", "Les conditions", "Identifiants", "Les directions", "Spots ajoutés")

def segments(line):
    return [(m.start(), m.group().strip()) for m in re.finditer(r"\S.*?(?=\s{3,}|$)", line)]

def split_rest(line, cols):
    kite_col, cond_col, src_col, _ = cols
    cond, src = [], []
    for pos, txt in segments(line):
        if not txt: continue
        if txt.startswith("[") or (src_col > 0 and pos >= src_col - 3): src.append(txt)
        elif pos >= cond_col - 3: cond.append(txt)
    return " ".join(cond), " ".join(src)

def flush():
    global cur
    if cur:
        name = re.sub(r"\s+", " ", cur["name"]).strip()
        alias = []
        if " Alias : " in name or name.startswith("Alias : "):
            name, _, al = name.partition("Alias : ")
            alias = [a.strip() for a in al.split(" / ") if a.strip()]
        ref = re.search(r"↗\s*(\d+)", name)
        cur["ref"] = int(ref[1]) if ref else None
        cur["name"] = re.sub(r"\s*↗\s*\d+", "", name).strip(" -")
        cur["alias"] = alias
        cur["cond"] = re.sub(r"\s+", " ", " ".join(cur["cond"])).strip()
        cur["sources"] = re.findall(r"\[\d+\]\s*([^\[]+?)(?=\s*\[|\s*$)", " ".join(cur["src"]))
        cur["sources"] = [s.strip() for s in cur["sources"]]
        del cur["src"]
        rows.append(cur)
    cur = None

after_page_hdr = []
for line in lines:
    if page_hdr.match(line):
        flush(); section = re.sub(r"\s{3,}.*", "", line.strip()); after_page_hdr = []; continue
    m = hdr_re.match(line)
    if m:
        flush()
        has_surf = bool(m.group(2))
        cols = (m.start(1), m.start(3), line.rfind("Sources"), has_surf)
        if cols[2] < cols[1] + 10: cols = (cols[0], cols[1], -1, has_surf)  # colonne Sources fusionnée avec Conditions
        titles = [t for ind, t in after_page_hdr if ind <= 2 and not t.startswith(SKIP_TITLE) and len(t) < 90 and not re.match(r"^\d{3}\s", t)]
        if titles: region = titles[-1]
        after_page_hdr = []
        continue
    if line.strip(): after_page_hdr.append((len(line) - len(line.lstrip()), line.strip()))
    if cols is None: continue
    m = row3.match(line) if cols[3] else None
    if not m: m = row2.match(line)
    if m:
        g = m.groups()
        if cols[3] and len(g) == 7:
            k, w, s, rest = g[3], g[4], g[5], g[6]
        else:
            k, w, s, rest = g[3], g[4], None, g[5]
        flush()
        cur = dict(id=int(g[1]), name=g[2], kite=k, wing=w, surf=s, cond=[], src=[], region=region, section=section)
        if rest:
            c, sr = split_rest(line, cols)
            if c: cur["cond"].append(c)
            if sr: cur["src"].append(sr)
        continue
    if cur is None or not line.strip(): continue
    segs = segments(line)
    if segs and 0 < segs[0][0] < cols[0] - 2 and not segs[0][1].startswith("["):
        cur["name"] += " " + segs[0][1]
        line = line[:segs[0][0]] + " " * len(segs[0][1]) + line[segs[0][0] + len(segs[0][1]):]
    c, sr = split_rest(line, cols)
    if c: cur["cond"].append(c)
    if sr: cur["src"].append(sr)
flush()

json.dump(rows, open("/tmp/pdf_rows.json", "w"), ensure_ascii=False, indent=1)
ids = [r["id"] for r in rows]
print(len(rows), "lignes ;", len(set(ids)), "ids distincts ; max id", max(ids))
print(Counter(r["section"] for r in rows))
missing = sorted(set(range(1, max(ids) + 1)) - set(ids))
print("ids absents :", len(missing), missing[:40])
print(Counter(r["region"] for r in rows).most_common(80))
