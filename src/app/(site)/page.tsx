import Image from "next/image";
import Link from "next/link";
import { DEFAULT_SETTINGS, PLANS } from "@/lib/plans";
import { PHOTOS, SPORT_PHOTOS } from "@/lib/photos";
import { SPORT_IDS, SPORTS } from "@/lib/sports";

export default function Home() {
  return (
    <>
      <Hero />
      <Sports />
      <Steps />
      <Result />
      <Features />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}

/* Icônes simples, trait arrondi */
function Icon({ name, className = "h-6 w-6" }: { name: "video" | "cut" | "check" | "chart" | "pin" | "book" | "arrow"; className?: string }) {
  const paths = {
    video: <path d="M4 7h11v10H4zM15 10.5l5-3v9l-5-3" />,
    cut: <path d="M4 12h16M8 8v8M16 8v8" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    chart: <path d="M4 19V11M10 19V5M16 19v-6M3 19h18" />,
    pin: <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
    book: <path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM17 20h2V7" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ───────────── 1. Hero : la photo pleine hauteur, le message en bas ───────────── */
function Hero() {
  return (
    <section className="relative -mt-16 flex min-h-[100svh] flex-col justify-end overflow-hidden text-white">
      <Image
        src="/hero-surf.jpg"
        alt="Surfeur dans le tube d'une vague, montagnes dans la brume"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[52%_75%]"
      />
      {/* Voile : léger en haut pour l'en-tête, dense en bas pour le texte */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <div className="rise relative mx-auto w-full max-w-6xl px-5 pb-14 pt-40 sm:px-6 sm:pb-20">
        <p className="eyebrow text-white/80">Coach IA · kite, wing, foil, surf, wake</p>
        <h1 className="mt-3 max-w-3xl text-[2.6rem] leading-[1.02] sm:text-5xl lg:text-7xl">
          Progresse à chaque session, même sans moniteur.
        </h1>
        <p className="mt-5 max-w-xl text-[1.05rem] text-white/85 sm:text-xl">
          Envoie 20 secondes de ta figure. En une minute, tu sais exactement quoi corriger, et quoi bosser à la prochaine
          session.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/inscription" className="btn btn-kite">
            Essayer gratuitement
            <Icon name="arrow" className="h-5 w-5" />
          </Link>
          <Link href="#analyse" className="btn btn-glass">
            Voir comment ça marche
          </Link>
        </div>
        <p className="mt-4 text-sm text-white/75">1 analyse offerte · sans carte bancaire · sans engagement</p>
      </div>
    </section>
  );
}

/* ───────────── 1 bis. Les sports ───────────── */
const SPORT_TAGLINE: Record<(typeof SPORT_IDS)[number], string> = {
  kitesurf: "Du water start au kiteloop",
  wingfoil: "Du premier vol au jibe",
  foil: "Kitefoil : vol, jibe, tack",
  surf: "Take-off, bottom, cutback",
  wakeboard: "Au téléski : kickers et modules",
};

function Sports() {
  return (
    <section id="sports" className="mx-auto max-w-6xl scroll-mt-20 pt-10 sm:px-6 sm:pt-14">
      <p className="eyebrow px-5 sm:px-0">Cinq sports</p>
      <h2 className="mt-2 px-5 text-3xl sm:px-0 sm:text-4xl">Un seul coach, qui connaît ta discipline</h2>
      <ul className="snap-row mt-4 flex scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {SPORT_IDS.map((sp) => (
          <li key={sp} className="w-[42vw] max-w-[200px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <div className="photo-card relative aspect-[3/4] overflow-hidden">
              <Image src={SPORT_PHOTOS[sp]} alt="" fill sizes="(min-width: 640px) 220px, 42vw" className="object-cover" />
              <div className="photo-veil absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-lg font-bold leading-tight">{SPORTS[sp].name}</p>
                <p className="text-xs text-white/85">{SPORT_TAGLINE[sp]}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── 2. Comment ça marche : 3 étapes illustrées ───────────── */
function Steps() {
  return (
    <section id="analyse" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-14 sm:px-6 sm:pt-20">
      <p className="eyebrow">Comment ça marche</p>
      <h2 className="mt-2 text-3xl sm:text-4xl">Trois étapes, depuis ton téléphone, sur la plage</h2>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Étape 1 */}
        <li className="panel overflow-hidden">
          <div className="flex h-36 items-center justify-center bg-raised">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-brand shadow-lg">
              <Icon name="video" className="h-10 w-10" />
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm font-bold text-brand">Étape 1</p>
            <h3 className="mt-1 text-xl">Importe ta vidéo</h3>
            <p className="mt-1 text-[0.95rem] text-slate">Filmée par un pote depuis la plage, avec n&apos;importe quel téléphone.</p>
          </div>
        </li>

        {/* Étape 2 : mini maquette de la sélection */}
        <li className="panel overflow-hidden">
          <div className="flex h-36 flex-col justify-center gap-3 bg-raised px-6">
            <div className="relative h-10 rounded-xl bg-white shadow-inner">
              <div className="absolute inset-y-0 left-[28%] right-[34%] rounded-lg border-[3px] border-brand bg-brand/15" />
              <div className="absolute inset-y-[-4px] left-[28%] w-2 -translate-x-1/2 rounded-full bg-brand" />
              <div className="absolute inset-y-[-4px] right-[34%] w-2 translate-x-1/2 rounded-full bg-brand" />
            </div>
            <p className="text-center text-sm font-semibold text-deep">0:12 → 0:24 · 12 s</p>
          </div>
          <div className="p-5">
            <p className="text-sm font-bold text-brand">Étape 2</p>
            <h3 className="mt-1 text-xl">Garde ta figure</h3>
            <p className="mt-1 text-[0.95rem] text-slate">Fais glisser le curseur pour garder le moment de la figure, 20 secondes maximum.</p>
          </div>
        </li>

        {/* Étape 3 : mini résultat */}
        <li className="panel overflow-hidden">
          <div className="flex h-36 items-center justify-center bg-raised px-6">
            <div className="w-full max-w-[220px] rounded-2xl bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="font-bold">Backroll</p>
                <p className="font-extrabold text-brand">6/10</p>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" /> Regard trop tôt vers l&apos;avant
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Bon envoi du kite
              </p>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm font-bold text-brand">Étape 3</p>
            <h3 className="mt-1 text-xl">Reçois ta correction</h3>
            <p className="mt-1 text-[0.95rem] text-slate">Une note, tes erreurs et quoi faire différemment à ta prochaine session.</p>
          </div>
        </li>
      </ol>
    </section>
  );
}

/* ───────────── 3. Exemple de résultat complet ───────────── */
function Result() {
  return (
    <section className="mx-auto max-w-6xl px-3 pt-14 sm:px-6 sm:pt-20">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="px-2 sm:px-0">
          <p className="eyebrow">L&apos;analyse</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Un vrai retour de coach, pas un résumé</h2>
          <p className="mt-3 max-w-md text-slate">
            Voici à quoi ressemble une analyse. Chaque erreur vient avec une consigne simple à appliquer sur l&apos;eau.
          </p>
          <ul className="mt-5 space-y-2.5">
            {["Une note pour chaque phase de la figure", "Les erreurs, de la plus importante à la moins importante", "Les exercices à faire à ta prochaine session"].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative" aria-label="Exemple de résultat d'analyse">
          <div className="photo-card relative h-56 overflow-hidden sm:h-72">
            <Image src={PHOTOS.splash} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div className="panel relative mx-2 -mt-14 p-5 sm:mx-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-bold">Backroll</p>
                <p className="text-sm text-slate">Exemple d&apos;analyse</p>
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
            <div className="mt-4 rounded-2xl border border-line p-3">
              <p className="text-sm font-bold text-danger">À corriger</p>
              <p className="mt-1 font-semibold">Ton regard reste devant pendant la rotation</p>
              <p className="mt-0.5 text-[0.95rem] text-slate">Tourne la tête vers ton épaule arrière dès que tu quittes l&apos;eau.</p>
            </div>
            <div className="mt-3 rounded-2xl bg-brand-light p-3">
              <p className="text-sm font-bold text-lagoon">À ta prochaine session</p>
              <p className="mt-0.5 text-[0.95rem]">5 petits sauts en tournant juste la tête, sans chercher la rotation.</p>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ───────────── 4. Le reste de l'appli : liste claire ───────────── */
function Features() {
  const items = [
    {
      icon: "chart" as const,
      title: "Suivi de ta progression",
      text: "Tes erreurs qui reviennent, tes figures maîtrisées, et la priorité de ta prochaine session.",
      photo: PHOTOS.waves,
    },
    {
      icon: "pin" as const,
      title: "Spot Finder",
      text: "Le spot où aller selon le vent ou la houle prévus, ton niveau et ton matériel. Avec la taille d'aile à sortir.",
      photo: PHOTOS.blue,
      href: "/week-end",
      link: "Voir les spots du week-end",
    },
    {
      icon: "book" as const,
      title: "Cours figure par figure",
      text: "Pour chaque sport : les étapes, les erreurs courantes, les exercices.",
      photo: PHOTOS.sunset,
      href: "/cours",
      link: "Lire les cours",
    },
  ];
  return (
    <section id="spots" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-14 sm:px-6 sm:pt-20">
      <p className="eyebrow">Entre deux sessions</p>
      <h2 className="mt-2 text-3xl sm:text-4xl">Et aussi dans l&apos;appli</h2>
      <ul className="mt-6 grid gap-4 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.title} className="panel flex gap-4 p-3 lg:flex-col lg:p-0">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl lg:h-44 lg:w-full lg:rounded-b-none lg:rounded-t-[22px]">
              <Image src={it.photo} alt="" fill sizes="(min-width: 1024px) 360px, 96px" className="object-cover" />
            </div>
            <div className="min-w-0 py-1 pr-1 lg:px-5 lg:pb-5">
              <p className="flex items-center gap-2 font-bold">
                <Icon name={it.icon} className="h-5 w-5 text-brand" />
                {it.title}
              </p>
              <p className="mt-1 text-[0.92rem] leading-snug text-slate">{it.text}</p>
              {it.href && (
                <Link href={it.href} className="mt-2 inline-flex min-h-8 items-center text-sm font-semibold text-lagoon">
                  {it.link}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── 5. Formules ───────────── */
function PricingTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-6 sm:pt-20">
      <p className="eyebrow">Tarifs</p>
      <h2 className="mt-2 text-3xl sm:text-4xl">Combien ça coûte</h2>
      <p className="mt-2 text-slate">Ta première analyse est gratuite. Ensuite, deux formules sans engagement.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => {
          const plan = PLANS[key];
          const elite = key === "elite";
          const n = DEFAULT_SETTINGS[key].monthly_analyses;
          return (
            <div key={key} className={`panel p-5 ${elite ? "ring-2 ring-brand" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl">{plan.name}</h3>
                {elite && <span className="tag tag-solid">Le plus complet</span>}
              </div>
              <p className="mt-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate"> / mois</span>
              </p>
              <p className="mt-2 rounded-xl bg-raised px-3 py-2 text-[0.95rem]">
                <span className="font-bold">{n} analyses par mois</span>
                <span className="text-slate"> · environ {Math.round(n / 4.3)} par semaine</span>
              </p>
              <p className="mt-3 text-[0.95rem] text-slate">
                {elite
                  ? "Analyse plus poussée, comparaison de tes tentatives, programme personnalisé et alertes conditions sur tes spots."
                  : "Analyse vidéo, suivi de progression, coach et Spot Finder."}
              </p>
            </div>
          );
        })}
      </div>
      <Link href="/tarifs" className="btn btn-ghost mt-5 w-full sm:w-auto">
        Voir le détail des formules
      </Link>
    </section>
  );
}

/* ───────────── 6. Questions ───────────── */
function Faq() {
  const items = [
    {
      q: "Il faut quel genre de vidéo ?",
      a: "Un téléphone suffit. Filme de côté, à une trentaine de mètres, en gardant le rider (et son aile ou son kite) dans le cadre.",
    },
    {
      q: "Pourquoi 20 secondes maximum ?",
      a: "Une figure dure quelques secondes. En gardant juste l'approche, la figure et la réception, l'analyse se concentre sur ce qui compte.",
    },
    {
      q: "Ça remplace un moniteur ?",
      a: "Non. Pour débuter, prends des cours dans une école. RIDE'UP t'aide à progresser entre les sessions une fois autonome.",
    },
    {
      q: "Je peux arrêter quand je veux ?",
      a: "Oui, en deux clics depuis ton espace. Tu gardes l'accès jusqu'à la fin du mois payé.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-5 pt-14 sm:px-6 sm:pt-20">
      <p className="eyebrow">FAQ</p>
      <h2 className="mt-2 text-3xl sm:text-4xl">Questions fréquentes</h2>
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

/* ───────────── 7. Dernier appel ───────────── */
function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-3 pb-12 pt-14 sm:px-6 sm:pt-20">
      <div className="photo-card relative overflow-hidden">
        <Image src={PHOTOS.wing} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#0e2a47]/60" />
        <div className="relative px-6 py-14 text-center text-white sm:py-20">
          <h2 className="text-3xl sm:text-5xl">Ta prochaine session commence ici</h2>
          <p className="mx-auto mt-3 max-w-sm text-white/90">Crée ton compte et analyse ta première figure gratuitement.</p>
          <Link href="/inscription" className="btn btn-kite mt-7 w-full sm:w-auto">
            Essayer gratuitement
          </Link>
          <p className="mt-4 text-sm text-white/85">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-white underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
