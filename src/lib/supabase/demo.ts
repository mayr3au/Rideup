import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { AnalysisResult } from "@/lib/types";

/**
 * MODE DÉMO (développement local sans Supabase uniquement).
 * Faux client Supabase en mémoire : un compte Elite déjà rempli (analyses, progression, chat, programme)
 * et les spots du fichier seed_spots.sql. Les écritures (profil, favoris, figures validées…) marchent
 * tant que le serveur tourne. Jamais actif en production.
 */

type Row = Record<string, unknown>;
type Store = Record<string, Row[]>;

const DEMO_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_USER = { id: DEMO_ID, email: "demo@rideup.fr" };

const g = globalThis as unknown as { __rideupDemo?: Store };

function store(): Store {
  if (!g.__rideupDemo) g.__rideupDemo = seed();
  return g.__rideupDemo;
}

/* ─────────────────────────── Données de départ ─────────────────────────── */

const daysAgo = (d: number, h = 15) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, 0, 0, 0);
  return t.toISOString();
};

function analysis(
  id: string,
  sport: string,
  trick: string,
  days: number,
  r: Omit<AnalysisResult, "sport" | "figure_id" | "visibilite" | "securite"> & { securite?: string | null },
): Row {
  return {
    id,
    user_id: DEMO_ID,
    sport,
    trick,
    notes: null,
    video_path: null,
    clip_hash: null,
    seg_start: 3.2,
    seg_end: 14.8,
    depth: "approfondie",
    cache_key: null,
    reused_from: null,
    counted: true,
    status: "termine",
    result: { sport, figure_id: trick, visibilite: "bonne", securite: null, ...r },
    error: null,
    model: "claude-sonnet-5-5",
    cost_usd: 0.055,
    created_at: daysAgo(days),
  };
}

function seed(): Store {
  const profile: Row = {
    id: DEMO_ID,
    email: DEMO_USER.email,
    full_name: "Mayreau",
    sport: "kitesurf",
    sports: ["kitesurf", "wingfoil", "surf"],
    levels: { kitesurf: "avance", wingfoil: "intermediaire", surf: "debutant" },
    gear: { kitesurf: "9 et 12, twin-tip 138", wingfoil: "5", surf: "7'6 mousse" },
    stance: "regular",
    weight_kg: 75,
    goals: "Passer le kiteloop proprement et attaquer l'unhooked",
    home_label: "Nice, France",
    home_lat: 43.7,
    home_lng: 7.27,
    radius_km: 250,
    wind_alerts: true,
    onboarded: true,
    plan: "elite",
    plan_override: "elite",
    subscription_status: "active",
    current_period_start: daysAgo(12),
    current_period_end: daysAgo(-18),
    stripe_customer_id: null,
    is_admin: true,
    created_at: daysAgo(60),
  };

  const analyses: Row[] = [
    analysis("a0000001-0000-4000-8000-000000000001", "kitesurf", "backroll", 26, {
      figure: "Backroll",
      note: 5,
      resume: "Rotation lancée, mais l'envoi du kite est trop fort et tu sors de l'axe. La réception est subie.",
      phases: [
        { phase: "approche", note: 6, commentaire: "Bonne vitesse, carre un peu légère." },
        { phase: "appel", note: 5, commentaire: "Le kite part trop loin derrière." },
        { phase: "vol", note: 4, commentaire: "Le regard reste devant, la rotation s'arrête aux 3/4." },
        { phase: "reception", note: 5, commentaire: "Kite pas renvoyé, tu retombes en arrière." },
      ],
      points_forts: ["Vitesse d'approche correcte", "Tu engages la rotation sans hésiter"],
      erreurs: [
        { code: "regard", probleme: "Ton regard reste devant pendant la rotation", correction: "Tourne la tête vers ton épaule arrière dès que tu quittes l'eau.", gravite: "majeure" },
        { code: "envoi-kite-brutal", probleme: "Kite envoyé trop loin derrière", correction: "Arrête l'envoi à 11 h ou 13 h.", gravite: "moyenne" },
        { code: "kite-pas-renvoye", probleme: "Kite pas renvoyé pour la réception", correction: "Renvoie le kite dès que tu as fait le tour.", gravite: "moyenne" },
      ],
      drills: ["5 petits sauts en tournant juste la tête", "Backrolls au ras de l'eau sans envoyer le kite"],
      priorite_session: "Le regard : 5 sauts en ne travaillant que la tête vers l'épaule arrière.",
    }),
    analysis("a0000001-0000-4000-8000-000000000002", "kitesurf", "backroll", 17, {
      figure: "Backroll",
      note: 6,
      resume: "Le regard lance mieux la rotation. Il manque encore de la carre pour avoir de la hauteur.",
      phases: [
        { phase: "approche", note: 6, commentaire: "Carre trop légère avant l'appel." },
        { phase: "appel", note: 6, commentaire: "Envoi mieux dosé." },
        { phase: "vol", note: 6, commentaire: "Rotation complète, un peu lente." },
        { phase: "reception", note: 7, commentaire: "Kite renvoyé à temps." },
      ],
      points_forts: ["Regard qui guide la rotation", "Kite renvoyé à temps"],
      erreurs: [
        { code: "carre-faible", probleme: "Pas assez de carre avant l'appel", correction: "Charge le talon arrière sur les 3 derniers mètres.", gravite: "majeure" },
        { code: "regard", probleme: "Le regard arrive encore un peu tard", correction: "Lance la tête dès le décollage, pas au sommet.", gravite: "mineure" },
      ],
      drills: ["10 appels en ne travaillant que la carre", "Backrolls en comptant carre, envoi, tête"],
      priorite_session: "Plus de carre avant l'appel pour gagner de la hauteur.",
    }),
    analysis("a0000001-0000-4000-8000-000000000003", "kitesurf", "backroll", 8, {
      figure: "Backroll",
      note: 8,
      resume: "Backroll propre et contrôlé. Bonne hauteur, rotation fluide, réception sur la carre.",
      phases: [
        { phase: "approche", note: 8, commentaire: "Vitesse et carre bien dosées." },
        { phase: "appel", note: 8, commentaire: "Envoi franc, arrêté au bon moment." },
        { phase: "vol", note: 8, commentaire: "Rotation fluide, corps compact." },
        { phase: "reception", note: 7, commentaire: "Légèrement en arrière, mais tu repars." },
      ],
      points_forts: ["Carre et pop", "Rotation complète et fluide", "Kite stable pendant la rotation"],
      erreurs: [{ code: "reception-arriere", probleme: "Réception un peu en arrière", correction: "Abats la planche juste avant de toucher l'eau.", gravite: "mineure" }],
      drills: ["Backrolls en enchaînant directement une remontée au vent"],
      priorite_session: "Tu peux passer au kiteloop : commence petit, en vent modéré.",
    }),
    analysis("a0000001-0000-4000-8000-000000000004", "kitesurf", "kiteloop", 3, {
      figure: "Kiteloop",
      note: 5,
      resume: "Premier kiteloop engagé ! La boucle est lancée trop tard et la barre s'éloigne, donc tu es tiré vers l'avant.",
      phases: [
        { phase: "approche", note: 7, commentaire: "Bonne vitesse." },
        { phase: "appel", note: 6, commentaire: "Saut correct, un peu bas pour un kiteloop." },
        { phase: "vol", note: 4, commentaire: "Boucle lancée après le sommet." },
        { phase: "reception", note: 4, commentaire: "Arraché vers l'avant, réception à plat." },
      ],
      points_forts: ["Tu oses tirer franchement sur la barre", "Bonne vitesse d'approche"],
      erreurs: [
        { code: "envoi-kite-tardif", probleme: "Boucle lancée trop tard", correction: "Tire la barre dès que tu atteins le sommet du saut, pas après.", gravite: "majeure" },
        { code: "barre-loin", probleme: "Barre qui s'éloigne pendant la boucle", correction: "Garde la barre collée aux hanches.", gravite: "moyenne" },
      ],
      drills: ["Kiteloops sans sauter (downloops) pour sentir la traction", "Sauts en comptant 1-2 puis tirer"],
      priorite_session: "Downloops pour apprivoiser la traction avant de reboucler en l'air.",
      securite: "Kiteloop seulement avec beaucoup de place sous le vent et un vent régulier.",
    }),
    analysis("a0000001-0000-4000-8000-000000000005", "wingfoil", "wing-decollage", 10, {
      figure: "Décoller sur le foil",
      note: 6,
      resume: "Tu décolles, mais trop tôt et avec trop de pied arrière : le foil sort et retombe.",
      phases: [
        { phase: "approche", note: 6, commentaire: "Bonne prise de vitesse avec l'aile." },
        { phase: "appel", note: 5, commentaire: "Trop de pression sur le pied arrière." },
        { phase: "vol", note: 6, commentaire: "Vol court mais stable." },
        { phase: "reception", note: 7, commentaire: "Retour à l'eau contrôlé." },
      ],
      points_forts: ["Pompage de l'aile efficace"],
      erreurs: [{ code: "poids-arriere", probleme: "Trop de poids sur le pied arrière au décollage", correction: "Laisse la vitesse soulever la planche, puis reviens neutre.", gravite: "majeure" }],
      drills: ["10 décollages courts en revenant volontairement à l'eau"],
      priorite_session: "Décoller plus tard, avec plus de vitesse et moins de pied arrière.",
    }),
  ];

  const errors = analyses.flatMap((a) =>
    ((a.result as AnalysisResult).erreurs ?? []).map((e, i) => ({
      id: `${a.id}-${i}`,
      analysis_id: a.id,
      user_id: DEMO_ID,
      trick_id: a.trick,
      code: e.code,
      created_at: a.created_at,
    })),
  );

  const valid = ["fenetre-vent", "body-drag", "water-start", "navigation", "remonter-vent", "transition", "premier-saut", "toeside", "backroll", "wing-maniement", "wing-debout", "wing-bords"];

  return {
    profiles: [profile],
    plan_settings: [
      { plan: "free", monthly_analyses: 1, monthly_coach_messages: 10 },
      { plan: "progress", monthly_analyses: 20, monthly_coach_messages: 300 },
      { plan: "elite", monthly_analyses: 60, monthly_coach_messages: 600 },
    ],
    video_analyses: analyses,
    analysis_errors: errors,
    trick_progress: [
      ...valid.map((t) => ({ user_id: DEMO_ID, trick_id: t, status: "valide", updated_at: daysAgo(9) })),
      { user_id: DEMO_ID, trick_id: "kiteloop", status: "en-cours", updated_at: daysAgo(3) },
      { user_id: DEMO_ID, trick_id: "wing-decollage", status: "en-cours", updated_at: daysAgo(10) },
    ],
    coach_messages: [
      { id: "c1", user_id: DEMO_ID, role: "user", content: "Je me fais arracher vers l'avant sur mes kiteloops, je fais quoi ?", created_at: daysAgo(2, 18) },
      {
        id: "c2",
        user_id: DEMO_ID,
        role: "assistant",
        content:
          "Sur ta dernière analyse, tu lances la boucle après le sommet du saut : le kite tire quand tu redescends déjà, d'où l'arrachement.\n\n1. Tire la barre dès que tu arrives au sommet, pas après.\n2. Garde la barre collée aux hanches pendant toute la boucle.\n3. Avant de reboucler en l'air, fais 5 downloops en navigation pour sentir la traction.\n\nCommence en 15-18 nœuds réguliers avec ton 9 m.",
        created_at: daysAgo(2, 18),
      },
    ],
    programs: [
      {
        id: "p1",
        user_id: DEMO_ID,
        created_at: daysAgo(3),
        content: {
          sport: "kitesurf",
          focus: "Kiteloop contrôlé",
          diagnostic: "Ton backroll est acquis (8/10). Sur le kiteloop, le problème principal est le timing de la boucle, lancée trop tard, avec une barre qui s'éloigne.",
          sessions: [
            { titre: "Sentir la traction", objectif: "Apprivoiser la boucle sans sauter", exercices: ["5 downloops de chaque côté en navigation", "Barre collée aux hanches pendant toute la boucle"] },
            { titre: "Le timing", objectif: "Tirer au sommet du saut", exercices: ["Petits sauts en comptant 1-2 puis tirer", "Filmer 3 tentatives et les faire analyser"] },
            { titre: "Le kiteloop", objectif: "Boucle complète, réception sur la carre", exercices: ["Kiteloops en vent modéré (15-18 nœuds)", "Renvoyer le kite vers l'avant en sortie de boucle"] },
          ],
          criteres_reussite: ["Boucle lancée au sommet", "Réception sans être arraché", "Note de 7/10 ou plus sur une analyse"],
        },
      },
    ],
    usage_events: analyses.map((a, i) => ({ id: i + 1, user_id: DEMO_ID, kind: "analyse", ref: a.id, created_at: a.created_at })),
    ai_usage: analyses.map((a, i) => ({ id: i + 1, user_id: DEMO_ID, kind: "analyse", model: "claude-sonnet-5-5", input_tokens: 21000, output_tokens: 1300, cost_usd: 0.055, created_at: a.created_at })),
    spots: loadSpots(),
    favorite_spots: [{ user_id: DEMO_ID, spot_id: "almanarre", created_at: daysAgo(20) }],
    wind_alerts_sent: [],
  };
}

/* ─────────────────────── Spots lus depuis seed_spots.sql ─────────────────────── */

function parseTuple(src: string): (string | number | null | string[])[] {
  const out: (string | number | null | string[])[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "'") {
      let s = "";
      i++;
      while (i < src.length) {
        if (src[i] === "'" && src[i + 1] === "'") {
          s += "'";
          i += 2;
        } else if (src[i] === "'") {
          i++;
          break;
        } else s += src[i++];
      }
      out.push(s.startsWith("{") && s.endsWith("}") ? s.slice(1, -1).split(",").filter(Boolean) : s);
    } else if (/[-\d]/.test(c)) {
      const m = /^-?\d+(\.\d+)?/.exec(src.slice(i))!;
      out.push(Number(m[0]));
      i += m[0].length;
    } else if (src.startsWith("null", i)) {
      out.push(null);
      i += 4;
    } else i++;
  }
  return out;
}

function loadSpots(): Row[] {
  let sql = "";
  try {
    sql = fs.readFileSync(path.join(process.cwd(), "supabase", "seed_spots.sql"), "utf8");
  } catch {
    return [];
  }
  const spots: Row[] = [];
  for (const line of sql.split(/\r?\n/)) {
    const m = /^\s*\((.*)\)\s*,?\s*$/.exec(line);
    if (!m) continue;
    const v = parseTuple(m[1]);
    const [id, name, country, region, lat, lng, sea_bearing, water, min_level] = v;
    const withSports = v.length === 11;
    spots.push({
      id,
      name,
      country,
      region,
      lat,
      lng,
      sea_bearing,
      water,
      min_level,
      sports: withSports ? v[9] : ["kitesurf", "wingfoil", "foil"],
      notes: withSports ? v[10] : v[9],
      active: true,
    });
  }
  const surf = /update public\.spots set sports = '\{([^}]*)\}'\s*where id in \(([^)]*)\)/.exec(sql);
  if (surf) {
    const sports = surf[1].split(",");
    const ids = [...surf[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    for (const s of spots) if (ids.includes(s.id as string)) s.sports = sports;
  }
  // Un téléski d'exemple pour voir le wakeboard dans le Spot Finder
  spots.push({
    id: "demo-teleski",
    name: "Téléski nautique (exemple)",
    country: "France",
    region: "Var",
    lat: 43.43,
    lng: 6.74,
    sea_bearing: 0,
    water: "lac",
    min_level: "debutant",
    sports: ["wakeboard"],
    notes: "Spot fictif du mode démo.",
    active: true,
  });
  return spots;
}

/* ─────────────────────────── Faux client Supabase ─────────────────────────── */

const KEYS: Record<string, string[]> = {
  trick_progress: ["user_id", "trick_id"],
  favorite_spots: ["user_id", "spot_id"],
  wind_alerts_sent: ["user_id", "spot_id", "day"],
  plan_settings: ["plan"],
};

function get(row: Row, col: string): unknown {
  const json = /^(\w+)->>(\w+)$/.exec(col);
  if (json) {
    const v = (row[json[1]] as Row | null)?.[json[2]];
    return v == null ? null : String(v);
  }
  return row[col];
}

const cmp = (a: unknown, b: unknown) => (a == null ? -1 : b == null ? 1 : a < b ? -1 : a > b ? 1 : 0);

class Query implements PromiseLike<{ data: unknown; error: unknown; count?: number | null }> {
  private filters: ((r: Row) => boolean)[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private max: number | null = null;
  private one: "single" | "maybe" | null = null;
  private countMode = false;
  private head = false;
  private op: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private payload: Row[] = [];
  private patch: Row = {};
  private join: string | null = null;

  constructor(private table: string) {}

  select(cols = "*", opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.countMode = true;
    if (opts?.head) this.head = true;
    const j = /(\w+)\(\*\)/.exec(cols);
    if (j) this.join = j[1];
    return this;
  }
  insert(rows: Row | Row[]) {
    this.op = "insert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  upsert(rows: Row | Row[]) {
    this.op = "upsert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  update(values: Row) {
    this.op = "update";
    this.patch = values;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }
  eq(c: string, v: unknown) {
    this.filters.push((r) => String(get(r, c)) === String(v));
    return this;
  }
  neq(c: string, v: unknown) {
    this.filters.push((r) => String(get(r, c)) !== String(v));
    return this;
  }
  gt(c: string, v: unknown) {
    this.filters.push((r) => cmp(get(r, c), v) > 0);
    return this;
  }
  gte(c: string, v: unknown) {
    this.filters.push((r) => cmp(get(r, c), v) >= 0);
    return this;
  }
  lt(c: string, v: unknown) {
    this.filters.push((r) => cmp(get(r, c), v) < 0);
    return this;
  }
  lte(c: string, v: unknown) {
    this.filters.push((r) => cmp(get(r, c), v) <= 0);
    return this;
  }
  in(c: string, vs: unknown[]) {
    const set = new Set(vs.map(String));
    this.filters.push((r) => set.has(String(get(r, c))));
    return this;
  }
  contains(c: string, vs: unknown[]) {
    this.filters.push((r) => {
      const arr = (get(r, c) as unknown[]) ?? [];
      return vs.every((v) => arr.includes(v));
    });
    return this;
  }
  is(c: string, v: null) {
    this.filters.push((r) => get(r, c) == v);
    return this;
  }
  not(c: string, op: string, v: unknown) {
    if (op === "is") this.filters.push((r) => get(r, c) != v);
    else if (op === "eq") this.filters.push((r) => String(get(r, c)) !== String(v));
    return this;
  }
  or() {
    return this;
  }
  ilike(c: string, pattern: string) {
    const re = new RegExp("^" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$", "i");
    this.filters.push((r) => re.test(String(get(r, c) ?? "")));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending !== false });
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }
  range(from: number, to: number) {
    this.max = to + 1;
    void from;
    return this;
  }
  single() {
    this.one = "single";
    return this;
  }
  maybeSingle() {
    this.one = "maybe";
    return this;
  }
  returns() {
    return this;
  }
  abortSignal() {
    return this;
  }

  private run() {
    const db = store();
    const table = (db[this.table] ??= []);
    const match = (r: Row) => this.filters.every((f) => f(r));
    let rows: Row[];

    if (this.op === "insert" || this.op === "upsert") {
      const keys = KEYS[this.table] ?? ["id"];
      rows = this.payload.map((p) => {
        const row: Row = { created_at: new Date().toISOString(), ...p };
        if (keys[0] === "id" && row.id == null) row.id = crypto.randomUUID();
        const existing = this.op === "upsert" ? table.find((r) => keys.every((k) => r[k] === row[k])) : undefined;
        if (existing) return Object.assign(existing, row);
        table.push(row);
        return row;
      });
    } else if (this.op === "update") {
      rows = table.filter(match);
      rows.forEach((r) => Object.assign(r, this.patch));
    } else if (this.op === "delete") {
      rows = table.filter(match);
      db[this.table] = table.filter((r) => !match(r));
    } else {
      rows = table.filter(match);
    }

    if (this.orders.length)
      rows = [...rows].sort((a, b) => {
        for (const o of this.orders) {
          const c = cmp(get(a, o.col), get(b, o.col));
          if (c) return o.asc ? c : -c;
        }
        return 0;
      });
    const count = rows.length;
    if (this.max != null) rows = rows.slice(0, this.max);

    if (this.join) {
      const other = db[this.join] ?? [];
      const fk = this.join.replace(/s$/, "") + "_id";
      rows = rows.map((r) => ({ ...r, [this.join!]: other.find((o) => o.id === r[fk]) ?? null }));
    }

    const copy = <T>(x: T): T => structuredClone(x);
    if (this.head) return { data: null, error: null, count };
    if (this.one) {
      if (!rows[0]) return this.one === "single" ? { data: null, error: { message: "Aucune ligne (démo)" } } : { data: null, error: null };
      return { data: copy(rows[0]), error: null, count };
    }
    return { data: copy(rows), error: null, count: this.countMode ? count : null };
  }

  then<A = { data: unknown; error: unknown; count?: number | null }, B = never>(
    ok?: ((v: { data: unknown; error: unknown; count?: number | null }) => A | PromiseLike<A>) | null,
    ko?: ((e: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve()
      .then(() => this.run())
      .then(ok, ko);
  }
}

export function demoClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({ data: { session: { user: DEMO_USER } }, error: null }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: {}, error: null }),
      signInWithPassword: async () => ({ data: { user: DEMO_USER }, error: null }),
      signUp: async () => ({ data: { user: DEMO_USER }, error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      admin: { deleteUser: async () => ({ error: null }) },
    },
    from: (table: string) => new Query(table),
    rpc: async (fn: string, args: Row) => {
      if (fn !== "reserve_usage") return { data: null, error: null };
      const db = store();
      const used = db.usage_events.filter(
        (e) => e.user_id === args.p_user && e.kind === args.p_kind && (!args.p_since || String(e.created_at) >= String(args.p_since)),
      ).length;
      if (used >= Number(args.p_limit)) return { data: false, error: null };
      db.usage_events.push({ id: db.usage_events.length + 1, user_id: args.p_user, kind: args.p_kind, ref: args.p_ref, created_at: new Date().toISOString() });
      return { data: true, error: null };
    },
    storage: {
      from: () => ({
        createSignedUrl: async () => ({ data: null, error: { message: "Pas de vidéo en mode démo" } }),
        createSignedUploadUrl: async () => ({ data: null, error: { message: "Pas d'envoi de vidéo en mode démo" } }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  };
}
