import Image from "next/image";
import Link from "next/link";
import { DEFAULT_SETTINGS, PLANS } from "@/lib/plans";
import { SITE_PHOTOS, SPORT_PHOTOS, SPORT_PHOTO_POS } from "@/lib/photos";
import { SPORT_IDS, SPORTS } from "@/lib/sports";
import { COURSES } from "@/lib/courses";
import { LESSONS } from "@/lib/lessons";
import { Reveal } from "@/components/reveal";
import { Tilt } from "@/components/tilt";
import { PhoneScreens } from "@/components/phone-screens";
import { SampleReport } from "@/components/sample-report";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Sports />
      <Steps />
      <Coachs />
      <Features />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}

/* Icônes simples, trait arrondi */
function Icon({ name, className = "h-6 w-6" }: { name: "video" | "camera" | "cut" | "check" | "chart" | "pin" | "book" | "arrow"; className?: string }) {
  const paths = {
    video: <path d="M4 7h11v10H4zM15 10.5l5-3v9l-5-3" />,
    camera: <path d="M4 8h3l2-2.5h6L17 8h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />,
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

/* ───────────── 1. Hero : fond blanc, gros titre, l'appli dans un téléphone ───────────── */
function Hero() {
  const d = (v: number) => ({ "--d": `${v}s` }) as React.CSSProperties;
  return (
    <section className="relative -mt-[8.25rem] overflow-hidden bg-white pt-[8.25rem]">
      {/* halos qui respirent */}
      <div aria-hidden="true" className="breathe pointer-events-none absolute -right-48 -top-48 h-[640px] w-[640px] rounded-full bg-brand-light blur-3xl" />
      <div aria-hidden="true" className="breathe pointer-events-none absolute -bottom-56 -left-40 h-[480px] w-[480px] rounded-full bg-brand-light/60 blur-3xl [animation-delay:-7s]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-28 pt-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:gap-8 lg:gap-14 lg:pb-40 lg:pt-20">
        <div>
          <span className="tag rise" style={d(0)}>
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Coachs diplômés d&apos;État · 5 sports
          </span>
          <h1 className="mt-6 text-[3rem] leading-[0.98] sm:text-6xl lg:text-[5rem]">
            <span className="rise block" style={d(0.08)}>Chaque session</span>
            <span className="rise block" style={d(0.18)}>mérite un vrai</span>
            <span className="rise block" style={d(0.28)}>
              <span className="relative inline-block">
                <em className="italic text-brand">coach</em>
                {/* trait de pinceau sous le mot */}
                <svg aria-hidden="true" viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-4 w-full text-brand/35 sm:-bottom-3">
                  <path d="M3 17 C 70 5, 150 4, 297 12" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
                </svg>
              </span>
              .
            </span>
          </h1>
          <p className="rise mt-7 max-w-xl text-lg text-slate sm:text-xl" style={d(0.4)}>
            Kite, wing, foil, surf, wake. Envoie la vidéo de ta figure : un coach diplômé d&apos;État la décortique image par
            image et te dit exactement quoi corriger, et quoi bosser à la prochaine session.
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={d(0.5)}>
            <Link href="/inscription" className="btn btn-primary group">
              Essayer gratuitement
              <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link href="#analyse" className="btn btn-ghost">
              Comment ça marche
            </Link>
          </div>

          {/* les 5 sports en pastilles photo */}
          <div className="rise mt-8 flex items-center gap-3" style={d(0.6)}>
            <div className="flex -space-x-3">
              {SPORT_IDS.map((sp) => (
                <span key={sp} className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white">
                  <Image src={SPORT_PHOTOS[sp]} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: SPORT_PHOTO_POS[sp] }} />
                </span>
              ))}
            </div>
            <p className="text-sm text-slate">
              <span className="font-bold text-deep">1 analyse offerte</span>
              <br />
              Sans carte bancaire
            </p>
          </div>

          <dl className="rise mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6" style={d(0.7)}>
            {[
              ["1 vidéo", "suffit"],
              ["24 à 72 h", "pour ton retour"],
              ["5", "sports couverts"],
            ].map(([n, l]) => (
              <div key={n}>
                <dt className="text-2xl font-extrabold tracking-tight sm:text-3xl">{n}</dt>
                <dd className="text-sm text-slate">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rise relative" style={d(0.3)}>
          <PhoneMock />
          {/* notifications qui flottent autour du téléphone */}
          <div className="pop-in absolute -left-6 top-[30%] hidden sm:block xl:-left-28" style={d(1.1)}>
            <div className="float flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 text-deep shadow-[0_20px_40px_-18px_rgba(14,42,71,0.45)] ring-1 ring-line" style={d(0.5)}>
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold">Retour du coach reçu</span>
                <span className="block text-xs text-slate">Backroll · il y a 2 min</span>
              </span>
            </div>
          </div>
          <div className="pop-in absolute right-0 bottom-20 hidden lg:block xl:-right-10" style={d(1.5)}>
            <div className="float flex items-center gap-2.5 rounded-2xl bg-brand px-3.5 py-2.5 text-white shadow-[0_20px_40px_-14px_rgba(22,136,200,0.75)]" style={d(1.8)}>
              <span aria-hidden="true" className="text-xl">🔥</span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold">+2 points</span>
                <span className="block text-xs font-semibold text-white/85">sur ton appel</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* vagues qui défilent en bas de l'accroche */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden lg:h-32">
        <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="wave-drift-slow absolute bottom-0 h-full w-[200%] text-brand-light">
          <path fill="currentColor" d="M0 60 Q 180 20 360 60 T 720 60 T 1080 60 T 1440 60 T 1800 60 T 2160 60 T 2520 60 T 2880 60 V120 H0Z" />
        </svg>
        <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="wave-drift absolute bottom-0 h-[70%] w-[200%] text-white">
          <path fill="currentColor" d="M0 70 Q 240 30 480 70 T 960 70 T 1440 70 T 1920 70 T 2400 70 T 2880 70 V120 H0Z" />
        </svg>
      </div>
    </section>
  );
}

/*
 * iPhone de l'accueil : vraie photo de l'appareil (public/iphone-mockup.png, écran découpé)
 * et l'écran de l'appli en HTML, projeté dans la perspective de la photo (matrix3d calculée
 * à partir des 4 coins de l'écran). La scène fait 591 × 1314 px, puis est mise à l'échelle.
 */
const PHONE_STAGE = { w: 591, h: 1314 };
const SCREEN = { w: 300, h: 650, transform: "matrix3d(1.53435,-0.126206,0,-0.000196392,0,1.80862,0,0,0,0,1,0,30,67.6,0,1)" };

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] [--s:0.4738] lg:w-[330px] lg:[--s:0.5584]">
      {/* ombre au sol */}
      <div aria-hidden="true" className="absolute -bottom-10 left-1/2 h-7 w-[70%] -translate-x-1/2 rounded-[50%] bg-deep/30 blur-xl" />

      <Tilt>
        <div className="float relative" style={{ aspectRatio: `${PHONE_STAGE.w} / ${PHONE_STAGE.h}` }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: PHONE_STAGE.w, height: PHONE_STAGE.h, transform: "scale(var(--s))" }}>
            {/* écran de l'appli, dans la perspective de la photo */}
            <div
              className="absolute left-0 top-0 overflow-hidden bg-salt text-deep"
              style={{ width: SCREEN.w, height: SCREEN.h, transformOrigin: "0 0", transform: SCREEN.transform }}
            >
              <div className="relative z-10 flex h-12 items-center justify-between px-7 pt-1 text-[0.74rem] font-semibold">
                <span>9:41</span>
                <span aria-hidden="true" className="flex items-center gap-1">
                  <svg viewBox="0 0 18 12" className="h-2.5 w-4" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
                  <svg viewBox="0 0 26 12" className="h-2.5 w-5" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="22" height="11" rx="3" opacity="0.4" /><rect x="2" y="2" width="16" height="8" rx="1.8" fill="currentColor" stroke="none" /><path d="M24.5 4v4" strokeLinecap="round" opacity="0.4" /></svg>
                </span>
              </div>
              <PhoneScreens />
              <div className="flex justify-center bg-white/90 pb-2">
                <span aria-hidden="true" className="h-[5px] w-28 rounded-full bg-deep" />
              </div>
              {/* reflet de la vitre */}
              <div aria-hidden="true" className="screen-glare pointer-events-none absolute inset-0 z-20" />
            </div>
            {/* l'appareil par-dessus : cadre, bordure noire et Dynamic Island */}
            <Image src="/iphone-mockup.png" alt="" width={PHONE_STAGE.w} height={PHONE_STAGE.h} priority unoptimized className="pointer-events-none absolute inset-0 select-none" />
          </div>
        </div>
      </Tilt>
    </div>
  );
}

/* Barre de garanties sous l'accroche : ce qui rassure avant de s'inscrire */
function TrustBar() {
  const items = [
    { icon: "check" as const, title: "Coachs diplômés d'État", text: "BPJEPS ou DEJEPS" },
    { icon: "video" as const, title: "Retour sous 24 à 72 h", text: "par e-mail, dans l'appli" },
    { icon: "book" as const, title: `5 sports, ${COURSES.length + LESSONS.length} cours`, text: "kite, wing, foil, surf, wake" },
    { icon: "arrow" as const, title: "Sans engagement", text: "1 analyse offerte" },
  ];
  return (
    <div className="border-y border-line bg-white">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-5 py-6 sm:px-6 lg:grid-cols-4">
        {items.map((it) => (
          <li key={it.title} className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Icon name={it.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[0.95rem] font-bold text-deep">{it.title}</span>
              <span className="block text-sm text-slate">{it.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
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
      <Reveal>
        <p className="eyebrow px-5 sm:px-0">Cinq sports</p>
        <h2 className="mt-2 px-5 text-3xl sm:px-0 sm:text-4xl">Un seul coach, qui connaît ta discipline</h2>
      </Reveal>
      <ul className="snap-row mt-4 flex scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {SPORT_IDS.map((sp, i) => (
          <Reveal as="li" key={sp} delay={i * 0.08} className="w-[42vw] max-w-[200px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <div className="photo-card lift relative aspect-[3/4] overflow-hidden">
              <Image src={SPORT_PHOTOS[sp]} alt="" fill sizes="(min-width: 640px) 480px, 80vw" quality={85} className="object-cover" style={{ objectPosition: SPORT_PHOTO_POS[sp] }} />
              <div className="photo-veil absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-lg font-bold leading-tight">{SPORTS[sp].name}</p>
                <p className="text-xs text-white/85">{SPORT_TAGLINE[sp]}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── 2. Comment ça marche : 3 étapes illustrées ───────────── */
function Steps() {
  return (
    <section id="analyse" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-14 sm:px-6 sm:pt-20">
      <Reveal>
        <p className="eyebrow">Comment ça marche</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Trois étapes, depuis ton téléphone, sur la plage</h2>
      </Reveal>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Étape 1 */}
        <Reveal as="li" delay={0} className="panel overflow-hidden">
          <div className="flex h-36 items-center justify-center bg-raised">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-brand shadow-lg">
              <Icon name="camera" className="h-10 w-10" />
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm font-bold text-brand">Étape 1</p>
            <h3 className="mt-1 text-xl">Importe ta vidéo</h3>
            <p className="mt-1 text-[0.95rem] text-slate">Filmée par un pote depuis la plage. Tu gardes juste le passage de ta figure.</p>
          </div>
        </Reveal>

        {/* Étape 2 : mini maquette de la sélection */}
        <Reveal as="li" delay={0.12} className="panel overflow-hidden">
          <div className="flex h-36 flex-col justify-center gap-3 bg-raised px-6">
            <div className="relative h-10 rounded-xl bg-white shadow-inner">
              <div className="absolute inset-y-0 left-[28%] right-[34%] rounded-lg border-[3px] border-brand bg-brand/15" />
              <div className="absolute inset-y-[-4px] left-[28%] w-2 -translate-x-1/2 rounded-full bg-brand" />
              <div className="absolute inset-y-[-4px] right-[34%] w-2 translate-x-1/2 rounded-full bg-brand" />
            </div>
            <p className="text-center text-sm font-semibold text-deep">« Premier saut, en l&apos;air »</p>
          </div>
          <div className="p-5">
            <p className="text-sm font-bold text-brand">Étape 2</p>
            <h3 className="mt-1 text-xl">Pose ta question</h3>
            <p className="mt-1 text-[0.95rem] text-slate">Ce que tu as voulu faire, et ce qui te bloque.</p>
          </div>
        </Reveal>

        {/* Étape 3 : mini résultat */}
        <Reveal as="li" delay={0.24} className="panel overflow-hidden">
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
            <h3 className="mt-1 text-xl">Reçois le retour du coach</h3>
            <p className="mt-1 text-[0.95rem] text-slate">Une note, tes erreurs et tes exercices, rédigés par un coach qui a vraiment regardé ta vidéo.</p>
          </div>
        </Reveal>
      </ol>
    </section>
  );
}

/* ───────────── 3 bis. Les coachs : diplômés d'État, retour structuré ───────────── */
function Coachs() {
  const proofs = [
    {
      title: "Diplômés d'État",
      text: "BPJEPS ou DEJEPS : le diplôme obligatoire en France pour enseigner les sports de glisse. Ceux qui donnent les cours dans les écoles.",
    },
    {
      title: "Spécialistes de ton sport",
      text: "Ta vidéo de kite part chez un moniteur de kite, ta vidéo de surf chez un moniteur de surf. Chacun connaît les figures qu'il analyse.",
    },
    {
      title: "Un vrai regard, pas un algorithme",
      text: "Ton coach regarde ta figure image par image, lit ta question, tient compte de ton niveau et de tes retours précédents.",
    },
    {
      title: "Un retour que tu peux appliquer",
      text: "Note par phase, erreurs dans l'ordre où les corriger, exercices et une seule priorité pour ta prochaine session.",
    },
  ];
  return (
    <section id="coachs" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-14 sm:px-6 sm:pt-20">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
        <div>
          <Reveal>
            <p className="eyebrow">Tes coachs</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">
              L&apos;œil d&apos;un moniteur diplômé d&apos;État, <em className="italic text-brand">sur chacune de tes figures</em>
            </h2>
            <p className="mt-3 max-w-xl text-lg text-slate">
              Un cours particulier coûte souvent plus de 60 € de l&apos;heure. Avec RIDE&apos;UP, un moniteur diplômé regarde tes
              figures toute l&apos;année, entre deux sessions.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[22px]">
            <Image src={SITE_PHOTOS.coach} alt="Un moniteur commente la vidéo d'un rider sur une tablette" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover object-[55%_40%]" />
            <span className="tag-glass absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold">Moniteur diplômé d&apos;État</span>
          </Reveal>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {proofs.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.08} className="panel p-5">
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Icon name="check" className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-lg">{p.title}</h3>
                <p className="mt-1 text-[0.95rem] text-slate">{p.text}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3}>
            <Link href="/inscription" className="btn btn-primary mt-8">
              Envoyer ma première vidéo
            </Link>
            <p className="mt-2 text-sm text-slate">1 analyse offerte. Sans carte bancaire.</p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <Tilt>
            <SampleReport />
          </Tilt>
          <p className="mt-3 text-center text-sm text-slate">Exemple de retour, tel que tu le reçois dans l&apos;appli.</p>
        </Reveal>
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
      photo: SITE_PHOTOS.progression,
    },
    {
      icon: "pin" as const,
      title: "Spot Finder",
      text: "Le spot où aller selon le vent ou la houle prévus, ton niveau et ton matériel. Avec la taille d'aile à sortir.",
      photo: SITE_PHOTOS.spots,
      href: "/week-end",
      link: "Voir les spots du week-end",
    },
    {
      icon: "book" as const,
      title: "Cours figure par figure",
      text: "Pour chaque sport : les étapes, les erreurs courantes, les exercices. Inclus dans Progress et Elite.",
      photo: SITE_PHOTOS.cours,
      href: "/cours",
      link: "Lire les cours",
    },
  ];
  return (
    <section id="spots" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-14 sm:px-6 sm:pt-20">
      <Reveal>
        <p className="eyebrow">Entre deux sessions</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Et aussi dans l&apos;appli</h2>
      </Reveal>
      <ul className="mt-6 grid gap-4 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal as="li" key={it.title} delay={i * 0.1} className="panel lift flex gap-4 p-3 lg:flex-col lg:p-0">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl lg:h-44 lg:w-full lg:rounded-b-none lg:rounded-t-[22px]">
              <Image src={it.photo} alt="" fill sizes="(min-width: 1024px) 400px, 200px" quality={85} className="object-cover" />
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
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── 5. Formules ───────────── */
function PricingTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-6 sm:pt-20">
      <Reveal>
        <p className="eyebrow">Tarifs</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Combien ça coûte</h2>
      </Reveal>
      <p className="mt-2 text-slate">Ta première analyse est gratuite. Ensuite, deux formules sans engagement.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((key) => {
          const plan = PLANS[key];
          const elite = key === "elite";
          const n = DEFAULT_SETTINGS[key].monthly_analyses;
          return (
            <Reveal key={key} delay={elite ? 0.12 : 0} className={`panel p-5 ${elite ? "ring-2 ring-brand" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl">{plan.name}</h3>
                {elite && <span className="tag tag-solid">Le plus complet</span>}
              </div>
              <p className="mt-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate"> / mois</span>
              </p>
              <p className="mt-2 rounded-xl bg-raised px-3 py-2 text-[0.95rem]">
                <span className="font-bold">{n} vidéo{n > 1 ? "s" : ""} analysée{n > 1 ? "s" : ""} par un coach</span>
                <span className="text-slate"> · chaque mois</span>
              </p>
              <p className="mt-3 text-[0.95rem] text-slate">
                {elite
                  ? "Retour du coach sous 24 h, comparaison de tes tentatives, programme personnalisé et alertes conditions sur tes spots."
                  : "Retour du coach sous 72 h, suivi de progression, coach IA et Spot Finder."}
              </p>
            </Reveal>
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
      a: "Un téléphone suffit. Fais-toi filmer de côté, à 20 ou 40 m, sans zoomer pendant la figure, avec ton aile ou ton kite dans le cadre. Tu choisis ensuite le passage à montrer (30 s max).",
    },
    {
      q: "Qui analyse ma vidéo ?",
      a: "Un coach RIDE'UP diplômé d'État (BPJEPS ou DEJEPS) et spécialiste de ton sport. Il regarde ta figure image par image, de l'approche à la réception, et te répond sous 72 h (24 h en Elite). Tu reçois un e-mail dès que son retour est prêt.",
    },
    {
      q: "Ça remplace un cours en école ?",
      a: "Pour débuter, prends des cours sur l'eau dans une école. Une fois autonome, RIDE'UP te donne l'œil d'un moniteur diplômé sur chaque figure, entre deux sessions, pour une fraction du prix d'un cours particulier.",
    },
    {
      q: "Je peux arrêter quand je veux ?",
      a: "Oui, en deux clics depuis ton espace. Tu gardes l'accès jusqu'à la fin du mois payé.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-5 pt-14 sm:px-6 sm:pt-20">
      <Reveal>
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Questions fréquentes</h2>
      </Reveal>
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
        <Image src="/hero-surf.jpg" alt="" fill sizes="100vw" className="object-cover object-[50%_45%]" />
        <div className="absolute inset-0 bg-[#0e2a47]/55" />
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
