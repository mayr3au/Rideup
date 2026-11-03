"""Génère src/lib/roadmaps.ts depuis scripts/roadmaps.txt (les figures « =id » reprennent celles de src/lib/roadmaps.ts ou sports.ts)."""
import json, re, sys
LV = {"deb": "debutant", "int": "intermediaire", "ava": "avance", "exp": "expert"}
src = open("src/lib/sports.ts").read()
try: src += open("src/lib/roadmaps.ts").read()
except FileNotFoundError: pass
existing = {}
for m in re.finditer(r'\{\s*"?id"?:\s*"([^"]+)",\s*"?name"?:\s*"([^"]+)",\s*"?level"?:\s*"(\w+)",\s*"?summary"?:\s*"([^"]+)",\s*"?keys"?:\s*\[([^\]]*)\]', src):
    existing[m[1]] = {"id": m[1], "name": m[2], "level": m[3], "summary": m[4], "keys": re.findall(r'"([^"]+)"', m[5])}
out, sport, seen = {}, None, set()
for line in open("scripts/roadmaps.txt"):
    line = line.strip()
    if not line or line.startswith("#") and not line.startswith("## "): continue
    if line.startswith("## "): sport = line[3:]; out[sport] = []; continue
    if line.startswith("="):
        t = existing[line[1:]]
    else:
        i, n, l, s, k = line.split("|")
        t = {"id": i, "name": n, "level": LV[l], "summary": s, "keys": [x.strip() for x in k.split(";")]}
    assert t["id"] not in seen, t["id"]; seen.add(t["id"]); out[sport].append(t)
# Aucune figure existante ne doit disparaître
old_ids = set(re.findall(r'\{ id: "([^"]+)", name:', open("src/lib/sports.ts").read()))
missing = old_ids - seen
assert not missing, missing
order = ["debutant", "intermediaire", "avance", "expert"]
lines = ["// Généré par scripts/build-roadmaps.py depuis scripts/roadmaps.txt — modifier le .txt puis relancer le script.",
         'import type { SportId, Trick } from "./sports";', "",
         "export const ROADMAPS: Record<SportId, Omit<Trick, \"sport\">[]> = {"]
for sp, ts in out.items():
    ts.sort(key=lambda t: order.index(t["level"]))  # stable : garde l'ordre du fichier à l'intérieur d'un niveau
    lines.append(f"  {sp}: [")
    for t in ts: lines.append("    " + json.dumps(t, ensure_ascii=False) + ",")
    lines.append("  ],")
    from collections import Counter
    c = Counter(t["level"] for t in ts)
    print(sp, len(ts), dict(c))
lines.append("};\n")
open("src/lib/roadmaps.ts", "w").write("\n".join(lines))
