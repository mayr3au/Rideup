"""Génère src/lib/spot-catalogue-fr.ts et supabase/migrations/0006_spots_france.sql depuis scripts/spots-fr.txt."""
import json, math, re, unicodedata, sys

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def km(a, b):
    R = 6371; p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    return 2 * R * math.asin(math.sqrt(math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))

existing = []
seed = open("supabase/seed_spots.sql").read() + open("src/lib/spot-catalogue.ts").read()
for m in re.finditer(r"\('([^']+)',\s*'((?:[^']|'')*)'[^)]*?(-?\d+\.\d+),\s*(-?\d+\.\d+)", seed):
    existing.append((m[1], m[2], float(m[3]), float(m[4])))
for m in re.finditer(r'id: "([^"]+)", name: "([^"]+)".*?lat: (-?[\d.]+), lng: (-?[\d.]+)', seed):
    existing.append((m[1], m[2], float(m[3]), float(m[4])))
ids = {e[0] for e in existing}

W = {"f": "flat", "c": "chop", "v": "vagues", "l": "lac"}
L = {"d": "debutant", "i": "intermediaire", "a": "avance"}
S = {"K": "kitesurf", "W": "wingfoil", "F": "foil", "S": "surf"}
out, merged, region = [], [], ""
for line in open("scripts/spots-fr.txt"):
    line = line.rstrip("\n")
    if line.startswith("## "): region = line[3:]; continue
    if not line or line.startswith("#"): continue
    name, lat, lng, bearing, w, l, sp, note = line.split("|")
    p = (float(lat), float(lng))
    near = [e for e in existing if km(p, (e[2], e[3])) < 1.0] + [o for o in out if km(p, (o["lat"], o["lng"])) < 1.0]
    if near:
        n = near[0]; merged.append((name, n[1] if isinstance(n, tuple) else n["name"])); continue
    sid = slug(name)
    while sid in ids: sid += "-2"
    ids.add(sid)
    out.append(dict(id=sid, name=name, country="France", region=region, lat=p[0], lng=p[1], sea_bearing=int(bearing) % 360,
                    water=W[w], min_level=L[l], sports=[S[c] for c in sp], notes=note or None))

ts = ["// Généré par scripts/build-spots-fr.py depuis scripts/spots-fr.txt — ne pas modifier à la main.",
      'import type { CatalogueSpot } from "./spot-catalogue";', "", "export const SPOT_CATALOGUE_FR: CatalogueSpot[] = ["]
for o in out: ts.append("  " + json.dumps(o, ensure_ascii=False) + ",")
ts.append("];\n")
open("src/lib/spot-catalogue-fr.ts", "w").write("\n".join(ts))

q = lambda s: "null" if s is None else "'" + s.replace("'", "''") + "'"
sql = ["-- Spots France + outre-mer (" + str(len(out)) + "). Supabase : SQL Editor → coller → Run. N'écrase pas les spots existants.",
       "insert into public.spots (id, name, sports, country, region, lat, lng, sea_bearing, water, min_level, notes) values"]
rows = [f"  ({q(o['id'])}, {q(o['name'])}, '{{{','.join(o['sports'])}}}', 'France', {q(o['region'])}, {o['lat']}, {o['lng']}, {o['sea_bearing']}, '{o['water']}', '{o['min_level']}', {q(o['notes'])})" for o in out]
sql.append(",\n".join(rows) + "\non conflict (id) do nothing;\n")
open("supabase/migrations/0006_spots_france.sql", "w").write("\n".join(sql))
print(len(out), "spots ;", len(merged), "fusionnés avec un spot déjà présent :")
for a, b in merged: print("  ", a, "→", b)
