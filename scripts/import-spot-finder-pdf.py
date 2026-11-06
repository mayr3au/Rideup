"""
Import « intelligent » du référentiel Spot Finder (PDF RideUp_Spot_Finder, 844 fiches) dans le catalogue.

Entrées : /tmp/pdf_rows.json (sortie de parse du PDF), communes France (/tmp/geo/communes.json), catalogue existant
(supabase/seed_spots.sql, src/lib/spot-catalogue.ts, src/lib/spot-catalogue-fr.ts).

Sorties :
  - supabase/migrations/0008_spot_finder_referentiel.sql  (colonnes + mises à jour + nouveaux spots)
  - src/lib/spot-referentiel.ts                             (mêmes données pour l'import depuis l'admin / mode démo)
  - scripts/spot-finder-rapport.md                          (ce qui a été rattaché, ajouté, exclu, à pointer)

Règles (p. 1, 81-82, 97 du PDF) :
  - une fiche = un id ; la dernière correction par id prime (les revues viennent après le référentiel) ;
  - D (documenté) / T (confirmé terrain) attestent la pratique → sport activé ;
  - P (piste) / W (wing à vérifier) / ? restent informatifs → pas de sport activé, statut conservé ;
  - X écarte la discipline sur ce départ → sport retiré ;
  - restrictions et conflits de sources priment sur la météo → stockées dans `rules`, affichées avant toute recommandation.
"""
import json, math, re, unicodedata
from collections import defaultdict

ROWS = json.load(open("/tmp/pdf_rows.json"))
COMMUNES = json.load(open("/tmp/geo/communes.json"))

def strip(s):
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()

def norm(s):
    s = strip(s.replace("’", "'").replace("'", " ")).lower()
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()

SUFFIX = re.compile(r"-(plage|plages|ocean|sur-mer|les-bains|les-plages|les-pins|les-flots|bord-de-mer)$")
def ctokens(s):
    """Tokens en gardant les noms composés (Vieux-Boucau ≠ Boucau), sans les suffixes -Plage / -sur-Mer."""
    s = strip(s.replace("’", "'").replace("'", " ")).lower()
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"\s[-–/·]\s", " ", s)
    s = re.sub(r"[^a-z0-9-]+", " ", s)
    out = set()
    for t in s.split():
        t = SUFFIX.sub("", t.strip("-"))
        if t and t not in STOP and len(t) > 1: out.add(t)
    return out

STOP = {"de", "du", "des", "la", "le", "les", "l", "d", "plage", "secteur", "a", "au", "aux", "et", "sur", "en", "base", "nautique",
        "centre", "entree", "generale", "principale", "departs", "depart", "mer", "pointe", "anse", "baie", "lac", "etang", "port"}
def tokens(s):
    return ctokens(s)

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", strip(s).lower()).strip("-")

def km(a, b):
    R = 6371; p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    return 2 * R * math.asin(math.sqrt(math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))

# ───────── 1. fusion des fiches (dernière correction par id) ─────────
fiches = {}
for r in ROWS:
    f = fiches.setdefault(r["id"], dict(id=r["id"], names=[], alias=[], kite=None, wing=None, surf=None, conds=[], sources=[], regions=[], ref=None))
    if r["name"] not in f["names"]: f["names"].append(r["name"])
    for a in r["alias"]:
        if a not in f["alias"]: f["alias"].append(a)
    for k in ("kite", "wing", "surf"):
        if r[k] is not None: f[k] = r[k]
    if r["cond"] and r["cond"] not in f["conds"]: f["conds"].append(r["cond"])
    for s in r["sources"]:
        if s not in f["sources"]: f["sources"].append(s)
    if r["region"] and r["region"] not in f["regions"]: f["regions"].append(r["region"])
    f["ref"] = f["ref"] or r["ref"]

REGION_FIX = {789: "Provence - Bouches-du-Rhône", 790: "Provence - Bouches-du-Rhône", 791: "Provence - Bouches-du-Rhône", 792: "Provence - Bouches-du-Rhône",
              793: "Landes - Hossegor, Seignosse, Capbreton", 794: "Provence - Bouches-du-Rhône", 795: "Var - Côte d'Azur", 796: "Provence - Bouches-du-Rhône"}
for fid, reg in REGION_FIX.items():
    if fid in fiches: fiches[fid]["regions"] = [reg] + [r for r in fiches[fid]["regions"] if r != "Saint-Pierre-et-Miquelon"]

# ───────── 2. catalogue existant ─────────
existing = []
seed = open("supabase/seed_spots.sql").read()
for m in re.finditer(r"\('([^']+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(?:'((?:[^']|'')*)'|null),\s*(-?\d+\.\d+),\s*(-?\d+\.\d+),\s*(\d+)", seed):
    existing.append(dict(id=m[1], name=m[2].replace("''", "'"), country=m[3], region=(m[4] or "").replace("''", "'"), lat=float(m[5]), lng=float(m[6]), bearing=int(m[7]), sports=["kitesurf", "wingfoil", "foil"]))
base = open("src/lib/spot-catalogue.ts").read()
for m in re.finditer(r'id: "([^"]+)", name: "([^"]+)", country: "([^"]+)", region: "([^"]+)", lat: (-?[\d.]+), lng: (-?[\d.]+), sea_bearing: (\d+)', base):
    existing.append(dict(id=m[1], name=m[2], country=m[3], region=m[4], lat=float(m[5]), lng=float(m[6]), bearing=int(m[7]), sports=["kitesurf", "wingfoil", "foil"]))
for line in open("src/lib/spot-catalogue-fr.ts"):
    if line.startswith("  {"):
        o = json.loads(line.strip().rstrip(","))
        existing.append(dict(id=o["id"], name=o["name"], country=o["country"], region=o["region"], lat=o["lat"], lng=o["lng"], bearing=o["sea_bearing"], sports=o["sports"]))
ex_by_id = {e["id"]: e for e in existing}
for e in existing:
    e["tok"] = tokens(e["name"]); e["n"] = norm(e["name"])

# ───────── 3. rattachement fiche ↔ spot existant ─────────
def candidates(f):
    # les noms d'abord, les alias (parfois d'anciens rattachements erronés) seulement si rien ne correspond
    best, score = _candidates(f["names"])
    if best: return best, score
    best, score = _candidates(f["alias"])
    return (best, score) if score == 100 else (None, 0)

def _candidates(names):
    best, score = None, 0
    for e in existing:
        for nm in names:
            n, t = norm(nm), tokens(nm)
            s = 0
            if n == e["n"]: s = 100
            elif t and e["tok"] and (t <= e["tok"] or e["tok"] <= t): s = 80 + min(len(t), len(e["tok"]))
            if s > score: best, score = e, s
    return (best, score) if score >= 80 else (None, 0)

matched, unmatched = {}, []
for f in fiches.values():
    e, s = candidates(f)
    if e and s >= 80:
        matched[f["id"]] = (e, s)
    else:
        unmatched.append(f)

# ───────── 4. extraction règles / restrictions ─────────
RULE_RE = re.compile(r"(interdit|exclu|écart|réserv|arrêté|réserve naturelle|natura|nidification|herbier|zonex|300 m|saison|du \d|au \d|mars|avril|mai|juin|juillet|août|septembre|octobre|balisage|chenal|zone|autoris|prefect|préfect|parc|club seulement|encadré|hors classement|offshore|vent de terre)", re.I)
def extract_rules(conds):
    out = []
    for c in conds:
        for sent in re.split(r"(?<=[.!?])\s+", c):
            if RULE_RE.search(sent) and sent not in out:
                out.append(sent.strip())
    return " ".join(out)[:700] or None

def status_json(f):
    d = {}
    if f["kite"]: d["kitesurf"] = f["kite"]
    if f["wing"]: d["wingfoil"] = f["wing"]
    if f["surf"]: d["surf"] = f["surf"]
    return d

def best_cond(f):
    # texte le plus récent (revues) en premier, sans les phrases génériques
    conds = [c for c in reversed(f["conds"]) if not c.startswith(("Pratique(s) repérée(s)", "Aucune source", "Source de localisation"))]
    return (" ".join(conds) if conds else " ".join(f["conds"]))[:600] or None

DOC = ("D", "T")
def documented_sports(f):
    s = []
    if f["kite"] in DOC: s += ["kitesurf", "foil"]
    if f["wing"] in DOC: s += ["wingfoil"] + (["foil"] if "foil" not in s else [])
    if f["surf"] in DOC: s.append("surf")
    return s
def excluded_sports(f):
    s = []
    if f["kite"] == "X": s.append("kitesurf")
    if f["wing"] == "X": s.append("wingfoil")
    if f["surf"] == "X": s.append("surf")
    return s

# ───────── 5. mises à jour des spots existants ─────────
updates = {}  # spot id → données
dup_report = []
for fid, (e, s) in matched.items():
    f = fiches[fid]
    u = updates.get(e["id"])
    if u:
        dup_report.append((fid, f["names"][0], e["name"], u["ref_id"]))
    sports = set(u["sports"] if u else e["sports"])
    sports |= set(documented_sports(f))
    sports -= set(excluded_sports(f))
    if "foil" in sports and not ({"kitesurf", "wingfoil"} & sports): sports.discard("foil")
    st = status_json(f)
    if u:
        for k, v in st.items():
            if v in DOC or k not in u["practice"]: u["practice"][k] = v
        u["sports"] = sorted(sports)
        if f["ref"] is None and u["ref_id"] != fid: u["alias_ids"].append(fid)
        rl = extract_rules(f["conds"])
        if rl and rl not in (u["rules"] or ""): u["rules"] = ((u["rules"] or "") + " " + rl).strip()[:700]
        u["sources"] = sorted(set(u["sources"]) | set(f["sources"]))
        continue
    updates[e["id"]] = dict(ref_id=fid, alias_ids=[], practice=st, sports=sorted(sports), rules=extract_rules(f["conds"]),
                            sources=sorted(set(f["sources"])), notes_add=best_cond(f), name=e["name"], fiche=f["names"][0], score=s)

# ───────── 6. nouveaux spots (fiches D/T non rattachées) ─────────
OVERSEAS = {
    # repères connus (centre de la commune / du lagon) pour les territoires absents du fichier communes
    "le gosier": (16.205, -61.49), "sainte anne": (16.225, -61.38), "saint francois": (16.25, -61.27), "le moule": (16.33, -61.35),
    "capesterre": (16.04, -61.56), "sainte rose": (16.33, -61.70), "deshaies": (16.30, -61.79), "port louis": (16.42, -61.53),
    "le vauclin": (14.55, -60.84), "le francois": (14.61, -60.90), "sainte luce": (14.47, -60.92), "le diamant": (14.47, -61.03),
    "les anses d arlet": (14.49, -61.08), "le robert": (14.68, -60.94), "tartane": (14.76, -60.90), "trinite": (14.74, -60.96),
    "saint leu": (-21.17, 55.29), "saint pierre": (-21.34, 55.48), "saint gilles": (-21.05, 55.22), "etang sale": (-21.27, 55.34),
    "saint paul": (-21.01, 55.27), "la saline": (-21.10, 55.24), "trois bassins": (-21.10, 55.25),
    "noumea": (-22.27, 166.44), "mont dore": (-22.28, 166.57), "ouano": (-21.83, 165.82), "poe": (-21.62, 165.41), "bourail": (-21.57, 165.49),
    "papeete": (-17.53, -149.57), "punaauia": (-17.63, -149.61), "paea": (-17.68, -149.59), "papara": (-17.75, -149.54), "teahupoo": (-17.85, -149.27),
    "moorea": (-17.53, -149.83), "raiatea": (-16.83, -151.44), "bora bora": (-16.50, -151.74), "huahine": (-16.73, -151.0), "taiarapu": (-17.78, -149.30),
    "orient bay": (18.09, -63.02), "le galion": (18.07, -63.01), "grand cul de sac": (17.92, -62.82), "saint barthelemy": (17.90, -62.83), "saint martin": (18.07, -63.05),
    "kourou": (5.16, -52.65), "remire montjoly": (4.90, -52.27), "cayenne": (4.93, -52.33),
    "mamoudzou": (-12.78, 45.23), "bandrele": (-12.90, 45.19), "dzaoudzi": (-12.79, 45.26), "sada": (-12.85, 45.10), "bouéni": (-12.90, 45.10),
    "saint pierre et miquelon": (46.78, -56.17), "miquelon": (47.10, -56.38),
}
DEPTS = [("pyrénées-orientales", {"66"}), ("aude", {"11"}), ("hérault", {"34"}), ("gard", {"30"}), ("bouches-du-rhône", {"13"}), ("var", {"83"}),
         ("côte d'azur", {"06", "83"}), ("alpes-maritimes", {"06"}), ("corse", {"2A", "2B"}), ("landes", {"40"}), ("pays basque", {"64"}), ("pyrénées-atlantiques", {"64"}),
         ("gironde", {"33"}), ("médoc", {"33"}), ("arcachon", {"33"}), ("charente", {"17"}), ("vendée", {"85"}), ("loire-atlantique", {"44"}), ("morbihan", {"56"}),
         ("finistère", {"29"}), ("côtes-d'armor", {"22"}), ("ille-et-vilaine", {"35"}), ("normandie", {"50", "14", "76", "27", "61"}), ("cotentin", {"50"}),
         ("hauts-de-france", {"59", "62", "80"}), ("somme", {"80"}), ("côte d'opale", {"62", "59"}), ("occitanie", {"66", "11", "34", "30"}),
         ("provence", {"13", "83", "06", "84"}), ("méditerranée", {"66", "11", "34", "30", "13", "83", "06", "2A", "2B"}),
         ("atlantique", {"64", "40", "33", "17", "85", "44"}), ("bretagne", {"22", "29", "35", "56"}), ("manche", {"50", "14", "76", "62", "59", "80", "22", "35"}),
         ("alpes", {"73", "74", "38", "05", "04"}), ("sud-est", {"73", "74", "38", "05", "04", "83", "13", "84"}), ("grand est", {"55", "54", "57", "67", "68", "51", "52", "10", "08", "88"}),
         ("île-de-france", {"77", "78", "91", "92", "93", "94", "95", "75"})]
LIEUX = {  # lieux-dits sans commune dans le nom → commune
    "belharra": "Urrugne", "hossegor": "Soorts-Hossegor", "moliets": "Moliets-et-Maa", "lespecier": "Mimizan", "labenne": "Labenne",
    "petit bec": "Les Portes-en-Ré", "donnant": "Bangor", "pors carn": "Penmarch", "tronoen": "Saint-Jean-Trolimon", "trestraou": "Perros-Guirec",
    "carolles": "Carolles", "serignan": "Sérignan", "salses-leucate": "Leucate", "etang de salses": "Leucate", "annecy": "Annecy", "santa lucia": "Saint-Raphaël",
    "issambres": "Roquebrune-sur-Argens", "port-camargue": "Le Grau-du-Roi", "lac du der": "Giffaumont-Champaubert", "vassiviere": "Peyrat-le-Château",
    "ganguise": "Belflou", "laffrey": "Laffrey", "salagou": "Clermont-l'Hérault", "vailhes": "Celles", "port leucate": "Leucate", "huveaune": "Marseille",
    "canet": "Canet-en-Roussillon", "val de saire": "Réville", "le vicq": "Réville", "gautrelle": "Saint-Georges-d'Oléron", "plaisance": "Saint-Georges-d'Oléron",
    "ch noue": "Les Sables-d'Olonne", "petit port": "Annecy", "jouarres": "Olonzac", "madine": "Nonsard-Lamarche", "monteynard": "Treffort", "serre-poncon": "Savines-le-Lac",
    "bourget": "Aix-les-Bains", "sainte-croix": "Bauduen", "beauduc": "Arles", "piemanson": "Arles", "almanarre": "Hyères", "espiguette": "Le Grau-du-Roi",
    "couronne": "Martigues", "laurons": "Martigues", "carro": "Martigues", "cavaou": "Fos-sur-Mer", "crozon": "Crozon", "quiberon": "Quiberon",
    "gruissan": "Gruissan", "leucate": "Leucate", "biguglia": "Biguglia", "figari": "Figari", "pinarello": "Zonza",
}
MANUAL = {"sables d olonne": (46.497, -1.783), "grenettes": (46.148, -1.32), "souffleur": (16.37, -61.44), "helleux": (16.22, -61.36), "anse bertrand": (16.47, -61.51),
          "chapelle": (16.48, -61.52), "ch noue": (46.497, -1.783)}
byname = defaultdict(list)
for code, c in COMMUNES.items():
    byname[norm(c["nom"])].append(((c["lat"], c["lng"]), code[:2]))

def region_depts(f):
    region = " ".join(f["regions"]).lower()
    out = set()
    for k, d in DEPTS:
        if k in region: out |= d
    return out

def find_commune(n, depts):
    """n normalisé → (lat,lng) si une seule commune correspond (dans les départements de la région si connus)."""
    def pick(cands):
        if depts:
            c2 = [c for c in cands if c[1] in depts]
            if c2: cands = c2
        return cands[0] if len(cands) == 1 else None
    for cand in (n, re.sub(r"^(le|la|les|l) ", "", n), "le " + n, "la " + n, "les " + n):
        if cand in byname:
            p = pick(byname[cand])
            if p: return p
    # contenance : « hossegor » dans « soorts hossegor », « moliets » dans « moliets et maa »
    cands = [c for nom, cs in byname.items() for c in cs if re.search(r"(^| )" + re.escape(n) + r"( |$)", nom)]
    return pick(cands) if cands else None

# Repères connus pour les spots célèbres (bord de l'eau, ± 1 km) : mieux que le centre de la commune, toujours à pointer.
KNOWN = {
    31: (43.672, -1.443), 32: (43.662, -1.441), 33: (43.666, -1.442), 34: (43.681, -1.445), 35: (43.646, -1.448), 41: (43.636, -1.449), 43: (43.642, -1.448),
    36: (43.700, -1.448), 45: (43.598, -1.465), 51: (43.853, -1.390), 52: (43.845, -1.392), 57: (44.170, -1.300),
    4: (43.495, -1.545), 5: (43.502, -1.546), 6: (43.507, -1.548), 7: (43.513, -1.550), 784: (43.520, -1.551),
    12: (43.486, -1.558), 13: (43.490, -1.560), 14: (43.470, -1.570), 15: (43.460, -1.575), 18: (43.452, -1.580), 19: (43.440, -1.595),
    21: (43.424, -1.610), 22: (43.418, -1.620), 23: (43.410, -1.630), 25: (43.395, -1.660), 29: (43.400, -1.720),
    98: (46.150, -1.330), 100: (46.240, -1.460), 139: (47.520, -3.150), 159: (47.330, -3.230), 162: (47.800, -4.350), 163: (47.840, -4.330),
    181: (48.210, -4.550), 182: (48.220, -4.560), 187: (48.340, -4.620), 179: (48.010, -4.550), 241: (48.750, -1.570), 254: (49.320, 0.000), 256: (49.500, 0.100),
    305: (43.330, 5.060), 308: (43.330, 5.050), 324: (41.950, 8.600), 595: (42.860, 3.000), 665: (42.860, 3.000), 603: (43.370, 4.870),
    766: (43.510, 4.130), 768: (48.560, 4.780), 770: (45.800, 1.870), 771: (43.320, 1.850), 772: (45.020, 5.770), 774: (43.650, 3.370), 781: (42.860, 3.050),
    789: (43.340, 5.040), 791: (43.330, 5.070), 794: (43.260, 5.370), 796: (43.420, 4.950), 797: (49.610, -1.260), 798: (49.670, -1.260), 799: (48.610, -2.150),
    800: (47.600, -3.140), 801: (47.260, -2.170), 804: (42.680, 3.040), 805: (42.660, 3.040), 806: (43.500, 3.860), 807: (51.050, 2.450), 812: (49.520, -1.280),
    811: (49.570, -1.270), 810: (49.620, -1.240), 817: (45.980, -1.310), 819: (44.640, -1.110), 820: (43.400, 3.700), 821: (43.410, 3.680), 824: (43.290, 3.450),
    825: (43.280, 3.500), 830: (43.440, 3.690), 832: (48.390, -4.430), 836: (43.730, 6.180), 838: (45.910, 6.160), 839: (43.300, 2.740), 840: (43.650, 3.330),
    841: (49.050, 1.660), 843: (48.670, -3.920), 221: (48.820, -3.450), 223: (48.640, -2.110), 224: (48.635, -2.080),
}

def commune_lookup(f):
    if f["id"] in KNOWN: return KNOWN[f["id"]], None
    names = f["names"] + f["alias"]
    parts = []
    for nm in names:
        parts += [p.strip() for p in re.split(r"\s[-/–·]\s", nm)]
        parts.append(nm)
    region = (f["regions"][0] if f["regions"] else "").lower()
    overseas = any(k in region for k in ("guadeloupe", "martinique", "réunion", "calédonie", "polynésie", "guyane", "mayotte", "saint-martin", "miquelon", "autres îles"))
    depts = region_depts(f)
    for p in parts:
        n = norm(p)
        for k, v in MANUAL.items():
            if k in n: return v, None
        if overseas:
            for k, v in OVERSEAS.items():
                if k in n or n in k: return v, None
            continue
        p2 = find_commune(n, depts)
        if p2: return p2
        n2 = SUFFIX.sub("", n.replace(" ", "-")).replace("-", " ")
        if n2 != n:
            p2 = find_commune(n2, depts)
            if p2: return p2
        for key, commune in LIEUX.items():
            if re.search(r"(^| )" + re.escape(key.replace("-", " ")) + r"( |$)", n):
                p2 = find_commune(norm(commune), set())
                if p2: return p2
    return None, None

DEPT_NAMES = {"06": "Alpes-Maritimes", "11": "Aude", "13": "Bouches-du-Rhône", "14": "Calvados", "17": "Charente-Maritime", "22": "Côtes-d'Armor", "29": "Finistère",
              "2A": "Corse-du-Sud", "2B": "Haute-Corse", "30": "Gard", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine", "38": "Isère", "40": "Landes", "44": "Loire-Atlantique",
              "50": "Manche", "51": "Marne", "52": "Haute-Marne", "55": "Meuse", "56": "Morbihan", "59": "Nord", "62": "Pas-de-Calais", "64": "Pyrénées-Atlantiques", "66": "Pyrénées-Orientales",
              "73": "Savoie", "74": "Haute-Savoie", "76": "Seine-Maritime", "78": "Yvelines", "77": "Seine-et-Marne", "80": "Somme", "83": "Var", "84": "Vaucluse", "85": "Vendée", "87": "Haute-Vienne",
              "05": "Hautes-Alpes", "04": "Alpes-de-Haute-Provence", "48": "Lozère", "12": "Aveyron", "01": "Ain", "27": "Eure", "61": "Orne", "23": "Creuse", "19": "Corrèze", "95": "Val-d'Oise"}
def region_label(f, dept=None, p=None):
    if dept and dept in DEPT_NAMES: return DEPT_NAMES[dept]
    if p:
        nb = nearest_bearing(p, None)
        if nb and nb[0] <= 40 and nb[2]: return nb[2]
    r = f["regions"][0] if f["regions"] else ""
    return r.replace(" - ", " · ")

def nearest_bearing(p, water):
    best = None
    for e in existing:
        d = km(p, (e["lat"], e["lng"]))
        if best is None or d < best[0]: best = (d, e["bearing"], e["region"])
    return best

new_spots, to_point, used_ids = [], [], set(ex_by_id)
for f in sorted(unmatched, key=lambda x: x["id"]):
    if not documented_sports(f): continue
    p, dept = commune_lookup(f)
    name = f["names"][-1] if len(f["names"]) > 1 and "Alias" not in f["names"][-1] else f["names"][0]
    name = re.sub(r"\s*-\s*Alias.*$", "", name)
    if not p:
        to_point.append(f); continue
    region = " ".join(f["regions"]).lower()
    lake = any(k in region for k in ("lac", "plans d'eau", "grand est", "île-de-france")) or re.search(r"\b(lac|étang|etang|plan d'eau|base de loisirs)\b", name.lower()) and "mer" not in name.lower()
    sports = sorted(set(documented_sports(f)))
    water = "lac" if lake else ("vagues" if sports == ["surf"] else "chop")
    nb = nearest_bearing(p, water)
    bearing = nb[1] if nb and nb[0] <= 25 and not lake else 0
    twin = next((n for n in new_spots if (n["lat"], n["lng"]) == (round(p[0], 4), round(p[1], 4)) and (tokens(n["name"]) <= tokens(name) or tokens(name) <= tokens(n["name"]))), None)
    if twin:
        twin["sports"] = sorted(set(twin["sports"]) | set(sports))
        twin["sources"] = sorted(set(twin["sources"]) | set(f["sources"]))
        twin["alias_ids"].append(f["id"])
        dup_report.append((f["id"], name, twin["name"], twin["ref_id"]))
        continue
    sid = slug(name)
    while sid in used_ids: sid += "-2"
    used_ids.add(sid)
    notes = best_cond(f)
    pos_note = "Position approximative et orientation à pointer dans l'admin." if f["id"] in KNOWN else "Position approximative (centre de la commune) et orientation à pointer dans l'admin."
    new_spots.append(dict(id=sid, name=name.replace(" - ", " – "), sports=sorted(set(sports)), country="France", region=region_label(f, dept, p),
                          lat=round(p[0], 4), lng=round(p[1], 4), sea_bearing=bearing, water=water,
                          min_level="debutant" if lake else "intermediaire",
                          notes=((notes + " " if notes else "") + pos_note)[:700],
                          ref_id=f["id"], practice=status_json(f), rules=extract_rules(f["conds"]), sources=sorted(set(f["sources"])),
                          position_approx=True, alias_ids=[]))

# ───────── 7. sorties ─────────
q = lambda s: "null" if s is None else "'" + s.replace("'", "''") + "'"
arr = lambda xs: "'{" + ",".join('"' + x.replace('"', '') + '"' for x in xs) + "}'"
jsb = lambda d: "'" + json.dumps(d, ensure_ascii=False).replace("'", "''") + "'::jsonb"

sql = [
    "-- Référentiel Spot Finder (PDF RideUp_Spot_Finder, 844 fiches) : statuts par discipline, règles locales, sources.",
    "-- Supabase : SQL Editor → coller → Run. Idempotent (rejouable).",
    "alter table public.spots",
    "  add column if not exists ref_id integer,                       -- n° de fiche du référentiel",
    "  add column if not exists practice jsonb,                        -- statut par discipline : D documenté, T confirmé terrain, P piste, W wing à vérifier, X écarté, ? insuffisant",
    "  add column if not exists rules text,                            -- restrictions / règles locales (priment sur la météo)",
    "  add column if not exists sources text[],                        -- domaines des sources retenues",
    "  add column if not exists position_approx boolean not null default false;",
    "create index if not exists spots_ref_id on public.spots (ref_id);",
    "",
    f"-- {len(updates)} spots existants enrichis",
]
for sid, u in updates.items():
    notes_sql = f"case when coalesce(notes, '') = '' then {q(u['notes_add'])} when notes like '%' || {q(u['notes_add'][:40])} || '%' then notes else notes || ' — ' || {q(u['notes_add'])} end" if u["notes_add"] else "notes"
    sql.append(f"update public.spots set ref_id = {u['ref_id']}, practice = {jsb(u['practice'])}, sports = {arr(u['sports'])}, rules = {q(u['rules'])}, sources = {arr(u['sources'])}, notes = {notes_sql} where id = {q(sid)};")
sql.append("")
sql.append(f"-- {len(new_spots)} nouveaux spots (pratique documentée ou confirmée, position au centre de la commune : à pointer dans l'admin)")
sql.append("insert into public.spots (id, name, sports, country, region, lat, lng, sea_bearing, water, min_level, notes, ref_id, practice, rules, sources, position_approx) values")
rows = [f"  ({q(n['id'])}, {q(n['name'])}, {arr(n['sports'])}, 'France', {q(n['region'])}, {n['lat']}, {n['lng']}, {n['sea_bearing']}, '{n['water']}', '{n['min_level']}', {q(n['notes'])}, {n['ref_id']}, {jsb(n['practice'])}, {q(n['rules'])}, {arr(n['sources'])}, true)" for n in new_spots]
sql.append(",\n".join(rows) + "\non conflict (id) do nothing;\n")
open("supabase/migrations/0008_spot_finder_referentiel.sql", "w").write("\n".join(sql))

ts = ["// Généré par scripts/import-spot-finder-pdf.py depuis le référentiel Spot Finder (PDF) — ne pas modifier à la main.",
      "// Enrichissements des spots existants + nouveaux spots documentés. Utilisé par l'admin (« Importer le référentiel ») et le mode démo.",
      'import type { PracticeStatus } from "./types";',
      "export type SpotReferentiel = { ref_id: number; practice: Record<string, PracticeStatus>; sports: string[]; rules: string | null; sources: string[]; notes_add: string | null };",
      'export type ReferentielSpot = { id: string; name: string; sports: string[]; country: string; region: string; lat: number; lng: number; sea_bearing: number; water: "flat" | "chop" | "vagues" | "lac"; min_level: "debutant" | "intermediaire" | "avance"; notes: string | null; ref_id: number; practice: Record<string, PracticeStatus>; rules: string | null; sources: string[]; position_approx: boolean; alias_ids: number[] };',
      "", "export const SPOT_REFERENTIEL: Record<string, SpotReferentiel> = {"]
for sid, u in updates.items():
    ts.append(f"  {json.dumps(sid)}: " + json.dumps(dict(ref_id=u["ref_id"], practice=u["practice"], sports=u["sports"], rules=u["rules"], sources=u["sources"], notes_add=u["notes_add"]), ensure_ascii=False) + ",")
ts.append("};\n")
ts.append("export const SPOT_REFERENTIEL_NOUVEAUX: ReferentielSpot[] = [")
for n in new_spots: ts.append("  " + json.dumps(n, ensure_ascii=False) + ",")
ts.append("];\n")
open("src/lib/spot-referentiel.ts", "w").write("\n".join(ts))

# rapport
docs = [f for f in fiches.values() if documented_sports(f)]
rep = ["# Import du référentiel Spot Finder (PDF du 5 novembre 2026)", "",
       f"- {len(fiches)} fiches lues, {len(docs)} avec une pratique documentée (D) ou confirmée (T).",
       f"- {len(matched)} fiches rattachées à un spot déjà présent ({len(updates)} spots enrichis : statuts, règles, sources, sports).",
       f"- {len(new_spots)} nouveaux spots créés (fiches D/T sans équivalent) : {sum(1 for n in new_spots if n['ref_id'] in KNOWN)} placés sur un repère connu du bord de l'eau, {sum(1 for n in new_spots if n['ref_id'] not in KNOWN)} au centre de leur commune — tous marqués **position à pointer dans l'admin**.",
       f"- {sum(1 for f in fiches.values() if excluded_sports(f))} fiches avec une discipline écartée (X) → sport retiré du spot.",
       f"- {len([f for f in unmatched if not documented_sports(f)])} fiches P / W / ? sans spot existant : non importées (pistes à valider), listées en bas.",
       f"- {len(to_point)} fiches D/T sans commune trouvée : à créer à la main (liste ci-dessous).", ""]
rep += ["## Fiches D/T à créer à la main (commune introuvable)", ""] + [f"- {f['id']} · {f['names'][0]} · {' / '.join(f['regions'][:1])} · K{f['kite']} W{f['wing']} S{f['surf']}" for f in to_point] + [""]
rep += ["## Rattachements (fiche → spot existant)", ""] + [f"- {u['ref_id']} · {u['fiche']} → **{u['name']}** (score {u['score']})" for u in updates.values()] + [""]
rep += ["## Plusieurs fiches sur le même spot", ""] + [f"- fiche {a} « {b} » → {c} (déjà fiche {d})" for a, b, c, d in dup_report] + [""]
rep += ["## Nouveaux spots", ""] + [f"- {n['ref_id']} · {n['name']} · {n['region']} · {', '.join(n['sports'])}" for n in new_spots] + [""]
rep += ["## Pistes non importées (P / W / ?)", ""] + [f"- {f['id']} · {f['names'][0]} · K{f['kite'] or '-'} W{f['wing'] or '-'} S{f['surf'] or '-'}" for f in sorted(unmatched, key=lambda x: x['id']) if not documented_sports(f)]
open("scripts/spot-finder-rapport.md", "w").write("\n".join(rep))
print("\n".join(rep[:9]))
