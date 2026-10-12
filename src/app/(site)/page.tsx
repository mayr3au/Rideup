import Link from "next/link";
import { LEVELS, TRICKS } from "@/lib/tricks";
import { PLANS } from "@/lib/plans";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Roadmap />
      <PricingTeaser />
      <Faq />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ligne de kite : part du coin haut droit et descend jusqu'au rider */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          className="kite-line"
          style={{ ["--len" as string]: 1500 }}
          d="M 1130 70 C 960 120, 900 300, 760 380 S 470 520, 300 600"
          fill="none"
          stroke="var(--kite)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g className="kite-shape">
          <path d="M 1080 60 C 1110 20, 1170 20, 1190 70 L 1160 78 C 1150 55, 1120 55, 1108 80 Z" fill="var(--kite)" />
        </g>
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div>
          <h1 className="text-[clamp(2.6rem,6.5vw,5.2rem)] font-extrabold">
            Filme ta figure. On te dit exactement quoi corriger.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg text-slate">
            Envoie un clip de 20 secondes depuis la plage. Ton coach décortique la carre, l&apos;envoi du kite et ta
            position en l&apos;air, puis te donne les drills pour la prochaine session.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/inscription" className="btn btn-primary">
              Analyser mon premier clip
            </Link>
            <Link href="/tarifs" className="btn btn-ghost">
              Voir les tarifs
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate">Première analyse offerte, sans carte bancaire.</p>
        </div>

        <SampleAnalysis />
      </div>
    </section>
  );
}

function SampleAnalysis() {
  return (
    <figure className="panel relative p-6 sm:p-7" aria-label="Exemple de résultat d'analyse">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate">Analyse de ton clip</p>
          <p className="font-display text-2xl font-bold">Backroll</p>
        </div>
        <p className="rounded-full bg-salt px-3 py-1 font-display text-lg font-bold">6/10</p>
      </div>

      <div className="mt-5 border-l-4 border-kite pl-4">
        <p className="font-semibold">Tu regardes devant toi pendant la rotation</p>
        <p className="mt-1 text-slate">
          Tourne la tête vers l&apos;épaule arrière dès que tu quittes l&apos;eau : le corps suit le regard et la
          rotation se ferme toute seule.
        </p>
      </div>

      <div className="mt-4 border-l-4 border-kite pl-4">
        <p className="font-semibold">Le kite monte trop haut</p>
        <p className="mt-1 text-slate">Envoie-le jusqu&apos;à 11 h, pas au zénith, pour garder de la vitesse.</p>
      </div>

      <figcaption className="mt-6 border-t border-line pt-4 text-sm">
        <span className="font-semibold">Drill pour ta prochaine session :</span>{" "}
        <span className="text-slate">5 sauts simples en tournant uniquement la tête, sans chercher la rotation.</span>
      </figcaption>
    </figure>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Filme 20 secondes", text: "Un pote sur la plage, un téléphone, et ta figure du début à la réception." },
    { title: "Dis ce que tu tentes", text: "Choisis la figure et ce qui coince. Plus tu es précis, plus la correction l'est." },
    { title: "Repars avec un plan", text: "Ce qui marche, les erreurs dans l'ordre d'importance, et les drills à faire." },
  ];
  return (
    <section id="analyse" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 sm:px-6">
      <h2 className="max-w-2xl text-4xl font-bold sm:text-5xl">Une analyse vidéo, du clip à la session suivante</h2>
      <ol className="mt-12 grid gap-8 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="border-t-2 border-deep pt-5">
            <span className="font-display text-5xl font-extrabold text-lagoon">{i + 1}</span>
            <h3 className="mt-3 text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 text-slate">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Roadmap() {
  return (
    <section id="coach" className="scroll-mt-8 bg-deep text-salt">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-4xl font-bold sm:text-5xl">Un coach qui sait où tu en es</h2>
          <p className="mt-5 text-lg text-salt/75">
            Ta roadmap part de ton niveau réel. Valide une figure, la suivante se débloque. Une question entre deux
            sessions sur ton matériel, le vent ou une figure : le coach répond en connaissant ton historique.
          </p>
          <Link href="/inscription" className="btn btn-kite mt-8">
            Créer ma roadmap
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {LEVELS.map((level) => (
            <div key={level.id}>
              <h3 className="text-xl font-bold text-kite">{level.label}</h3>
              <ul className="mt-3 space-y-1.5">
                {TRICKS.filter((t) => t.level === level.id).map((t) => (
                  <li key={t.id} className="border-b border-salt/15 pb-1.5">
                    {t.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="text-4xl font-bold sm:text-5xl">Deux formules, sans engagement</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => {
          const plan = PLANS[key];
          return (
            <div key={key} className={`panel p-7 ${key === "premium" ? "border-2 !border-kite" : ""}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p>
                  <span className="font-display text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-slate"> / mois</span>
                </p>
              </div>
              <p className="mt-1 text-slate">{plan.tagline}</p>
              <ul className="mt-5 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-lagoon">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Link href="/tarifs" className="btn btn-primary mt-8">
        Choisir ma formule
      </Link>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "Quelle qualité de vidéo faut-il ?",
      a: "Un téléphone suffit. Filme de côté, à une trentaine de mètres, en gardant le rider et le kite dans le cadre si possible.",
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
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h2 className="text-4xl font-bold">Questions fréquentes</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((it) => (
          <details key={it.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
              {it.q}
              <span aria-hidden="true" className="text-2xl text-lagoon transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-slate">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
