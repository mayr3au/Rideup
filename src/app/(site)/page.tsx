import Image from "next/image";
import Link from "next/link";
import { LEVELS, TRICKS } from "@/lib/tricks";
import { DEFAULT_SETTINGS, PLANS } from "@/lib/plans";
import { PHOTOS } from "@/lib/photos";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Result />
      <SpotsTeaser />
      <HowItWorks />
      <Roadmap />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}

/* ───────────── Hero : grande carte photo arrondie, verre dépoli ───────────── */
function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-3 pt-2 sm:px-6 sm:pt-4">
      <div className="photo-card relative flex min-h-[78svh] flex-col justify-end overflow-hidden sm:min-h-[620px]">
        <Image
          src={PHOTOS.heroJump}
          alt="Rider de kitesurf en plein saut"
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover object-[60%_35%]"
        />
        <div className="photo-veil absolute inset-0" />

        <div className="rise relative p-5 pb-6 sm:p-10">
          <span className="tag tag-glass">Coaching kitesurf par IA</span>
          <h1 className="mt-4 max-w-2xl text-[2.6rem] text-white sm:text-6xl">
            Filme ta figure. On te dit quoi corriger.
          </h1>
          <p className="mt-3 max-w-md text-white/85 sm:text-lg">
            Garde les 20 secondes de ta figure : appel, saut, réception, tout est décortiqué.
          </p>

          <div className="glass mt-6 grid grid-cols-3 rounded-2xl p-3 text-center sm:max-w-md">
            {[
              { v: "20 s", l: "par clip" },
              { v: "4", l: "phases notées" },
              { v: "1", l: "analyse offerte" },
            ].map((s) => (
              <div key={s.l} className="border-r border-white/25 last:border-0">
                <p className="text-xl font-extrabold">{s.v}</p>
                <p className="text-xs text-white/80">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:flex">
            <Link href="/inscription" className="btn btn-kite w-full sm:w-auto">
              Analyser mon premier clip
            </Link>
            <Link href="/tarifs" className="btn btn-glass w-full sm:w-auto">
              Voir les abonnements
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Fonctionnalités : carrousel de cartes photo ───────────── */
function Features() {
  const cards = [
    { id: "analyse", title: "Analyse vidéo", sub: "Appel, saut, réception", photo: PHOTOS.splash, href: "/inscription" },
    { id: "progression", title: "Ta progression", sub: "Erreurs suivies", photo: PHOTOS.waves, href: "/tarifs" },
    { id: "spots-carte", title: "Spot Finder", sub: "Vent, kite, créneau", photo: PHOTOS.blue, href: "/week-end" },
    { id: "cours", title: "Cours", sub: "Figure par figure", photo: PHOTOS.sunset, href: "/cours" },
  ];

  return (
    <section className="mx-auto max-w-6xl pt-12 sm:pt-16">
      <div className="px-5 sm:px-6">
        <h2 className="text-3xl sm:text-4xl">Tout pour progresser</h2>
        <div className="mt-3 flex gap-6 text-[0.95rem] font-semibold">
          <span className="text-brand">Populaire</span>
          <Link href="/cours" className="text-slate hover:text-deep">Cours</Link>
          <Link href="/week-end" className="text-slate hover:text-deep">Week-end</Link>
        </div>
      </div>
      <div className="snap-row mt-5 scroll-px-5 px-5 sm:scroll-px-6 sm:px-6">
        {cards.map((c) => (
          <Link
            key={c.id}
            id={c.id}
            href={c.href}
            className="photo-card relative flex aspect-[3/4] w-[62vw] max-w-[260px] scroll-mt-24 flex-col justify-end overflow-hidden sm:w-[240px]"
          >
            <Image src={c.photo} alt="" fill sizes="260px" className="object-cover" />
            <div className="photo-veil absolute inset-0" />
            <div className="relative p-4 text-white">
              <p className="text-lg font-bold leading-tight">{c.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/85">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/85" />
                {c.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Exemple de résultat : carte blanche qui chevauche une photo ───────────── */
function Result() {
  return (
    <section id="analyse" className="mx-auto max-w-6xl scroll-mt-20 px-3 py-6 sm:px-6 sm:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="px-2 sm:px-0">
          <span className="tag">Ce que tu reçois</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">Pas une description. Une vraie correction.</h2>
          <p className="mt-3 max-w-md text-slate">
            Note par phase, erreurs classées par importance, consigne précise pour chacune et exercices pour ta prochaine
            session.
          </p>
        </div>

        <figure className="relative" aria-label="Exemple de résultat d'analyse">
          <div className="photo-card relative h-64 overflow-hidden sm:h-72">
            <Image src={PHOTOS.splash} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            <span className="tag tag-glass absolute left-4 top-4">Ton clip · 8,4 s</span>
          </div>
          <div className="panel relative mx-2 -mt-16 p-5 sm:mx-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-bold">Backroll</p>
                <p className="text-sm text-slate">Analyse du 12 octobre</p>
              </div>
              <p className="text-3xl font-extrabold text-brand">
                6<span className="text-base font-semibold text-slate">/10</span>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["Approche", 8],
                ["Appel", 7],
                ["En l'air", 5],
                ["Réception", 6],
              ].map(([p, n]) => (
                <div key={p} className="rounded-xl bg-raised px-1 py-2">
                  <p className="text-lg font-extrabold">{n}</p>
                  <p className="text-[0.68rem] text-slate">{p}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3 text-[0.95rem]">
              <p>
                <span className="font-semibold">Ton regard reste devant pendant la rotation.</span>{" "}
                <span className="text-slate">Tourne la tête vers l&apos;épaule arrière dès que tu quittes l&apos;eau.</span>
              </p>
              <p>
                <span className="font-semibold">Le kite monte jusqu&apos;au zénith.</span>{" "}
                <span className="text-slate">Arrête l&apos;envoi à 11 h pour garder de la vitesse.</span>
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-brand-light p-3">
              <p className="text-sm">
                <span className="block font-bold text-lagoon">Prochaine session</span>
                5 sauts en tournant juste la tête
              </p>
              <span className="tag tag-solid shrink-0">Priorité</span>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ───────────── Spot Finder : liste de spots façon app ───────────── */
function SpotsTeaser() {
  const rows = [
    { name: "Almanarre", place: "Hyères, Var", wind: 18, kite: "12 m", window: "13h – 18h", photo: PHOTOS.blue, ok: true },
    { name: "Leucate", place: "Aude", wind: 24, kite: "9 m", window: "11h – 16h", photo: PHOTOS.waves, ok: true },
    { name: "Carnon", place: "Hérault", wind: 0, kite: "", window: "Vent offshore", photo: PHOTOS.sunset, ok: false },
  ];
  return (
    <section id="spots" className="scroll-mt-20 py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="tag">Spot Finder</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">Le bon spot, le bon kite, le bon créneau</h2>
          <p className="mt-3 max-w-md text-slate">
            Le vent prévu, son orientation sur chaque plage, ton niveau, ton poids et tes kites, dans le rayon que tu
            choisis.
          </p>
          <Link href="/week-end" className="btn btn-ghost mt-6 w-full sm:w-auto">
            Spots les plus ventés ce week-end
          </Link>
        </div>

        <ol className="space-y-4" aria-label="Exemple de résultats du Spot Finder">
          {rows.map((r) => (
            <li key={r.name} className="panel flex items-center gap-4 p-3 pr-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-lg">
                <Image src={r.photo} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{r.name}</p>
                <p className="text-sm text-slate">{r.place}</p>
                <span className={`mt-1.5 inline-block rounded-lg px-2 py-0.5 text-xs font-semibold ${r.ok ? "bg-brand-light text-lagoon" : "bg-raised text-slate"}`}>
                  {r.window}
                </span>
              </div>
              {r.ok ? (
                <div className="text-right">
                  <p className="text-2xl font-extrabold">
                    {r.wind}
                    <span className="text-sm font-semibold text-slate"> nds</span>
                  </p>
                  <p className="text-sm font-semibold text-lagoon">{r.kite}</p>
                </div>
              ) : (
                <span className="text-sm text-slate">Pas ridable</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────── Étapes ───────────── */
function HowItWorks() {
  const steps = [
    { title: "Importe ta session", text: "Un pote sur la plage et un téléphone suffisent." },
    { title: "Garde le bon passage", text: "Sélectionne au doigt les 20 secondes de ta figure." },
    { title: "Repars avec un plan", text: "Corrections concrètes et exercices pour ta prochaine session." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16">
      <h2 className="text-3xl sm:text-4xl">En trois étapes</h2>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-5">
        {steps.map((s, i) => (
          <li key={s.title} className="panel flex gap-4 p-5 sm:block">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-lg font-extrabold text-brand">
              {i + 1}
            </span>
            <div>
              <h3 className="text-lg sm:mt-4">{s.title}</h3>
              <p className="mt-1 text-[0.95rem] text-slate">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────── Roadmap : bloc océan ───────────── */
function Roadmap() {
  return (
    <section id="coach" className="mx-auto max-w-6xl scroll-mt-20 px-3 py-6 sm:px-6">
      <div className="photo-card relative overflow-hidden bg-gradient-to-br from-[#1688c8] to-[#0e2a47] p-6 text-white sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="tag tag-glass">Coach</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Un coach qui sait où tu en es</h2>
            <p className="mt-3 text-white/80">
              Ta roadmap part de ton vrai niveau. Valide une figure, la suivante se débloque. Le coach répond à tes
              questions en connaissant ton historique.
            </p>
            <Link href="/inscription" className="btn btn-kite mt-6 w-full sm:w-auto">
              Créer ma roadmap
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {LEVELS.map((level) => (
              <div key={level.id} className="glass rounded-2xl p-4">
                <h3 className="text-base">{level.label}</h3>
                <ul className="mt-2 space-y-1 text-sm text-white/85">
                  {TRICKS.filter((t) => t.level === level.id).map((t) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Formules ───────────── */
function PricingTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-16">
      <h2 className="text-3xl sm:text-4xl">Deux formules, sans engagement</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => {
          const plan = PLANS[key];
          const elite = key === "elite";
          return (
            <div key={key} className={`panel p-6 ${elite ? "ring-2 ring-brand" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl">{plan.name}</h3>
                {elite && <span className="tag tag-solid">Le plus complet</span>}
              </div>
              <p className="mt-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate"> / mois</span>
              </p>
              <p className="mt-1 font-semibold text-lagoon">{DEFAULT_SETTINGS[key].monthly_analyses} analyses vidéo par mois</p>
              <ul className="mt-4 space-y-2 text-[0.95rem]">
                {plan.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-brand">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Link href="/tarifs" className="btn btn-primary mt-6 w-full sm:w-auto">
        Comparer les formules
      </Link>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
function Faq() {
  const items = [
    {
      q: "Quelle qualité de vidéo faut-il ?",
      a: "Un téléphone suffit. Filme de côté, à une trentaine de mètres, en gardant le rider et le kite dans le cadre si possible.",
    },
    {
      q: "Pourquoi 20 secondes maximum ?",
      a: "Une figure dure quelques secondes. En gardant seulement l'approche, l'appel, le saut et la réception, l'analyse se concentre sur ce qui compte et reste précise.",
    },
    {
      q: "L'analyse remplace-t-elle un moniteur ?",
      a: "Non. Pour débuter, prends des cours dans une école. RIDE'UP t'aide à progresser entre les sessions une fois autonome.",
    },
    {
      q: "Je peux annuler quand je veux ?",
      a: "Oui, depuis ton espace, en deux clics. Tu gardes l'accès jusqu'à la fin de la période payée.",
    },
    {
      q: "Que devient ma vidéo ?",
      a: "Elle est stockée dans ton espace privé, visible par toi seul. Tu peux la supprimer à tout moment.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
      <h2 className="text-3xl sm:text-4xl">Questions fréquentes</h2>
      <div className="mt-6 space-y-3">
        {items.map((it) => (
          <details key={it.q} className="panel group px-5">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
              {it.q}
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-xl leading-none text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-5 text-[0.95rem] text-slate">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Dernier appel ───────────── */
function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-3 pb-12 pt-6 sm:px-6">
      <div className="photo-card relative overflow-hidden">
        <Image src={PHOTOS.wing} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#0e2a47]/55" />
        <div className="relative px-6 py-16 text-center text-white sm:py-20">
          <h2 className="text-3xl sm:text-5xl">T&apos;es prêt à progresser ?</h2>
          <p className="mx-auto mt-3 max-w-sm text-white/85">Ta première analyse est offerte. Il te faut juste une vidéo.</p>
          <Link href="/inscription" className="btn btn-kite mt-7 w-full sm:w-auto">
            Je commence
          </Link>
          <p className="mt-3 text-sm text-white/75">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-white underline">
              Connexion
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
