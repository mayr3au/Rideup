"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RichText } from "./rich-text";
import type { SportId } from "@/lib/sports";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Le coach termine ses questions par une ligne « [[choix: a | b | c]] » (voir coachRules dans lib/ai.ts).
 * On la retire du texte affiché et on la transforme en boutons de réponse rapide.
 */
export function splitQuickReplies(content: string): { text: string; options: string[] } {
  const re = /\[\[\s*choix\s*:\s*([^\]]*)\]\]/gi;
  let options: string[] = [];
  const text = content
    .replace(re, (_, list: string) => {
      options = list
        .split("|")
        .map((o) => o.trim())
        .filter(Boolean)
        .slice(0, 4);
      return "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return { text, options };
}

const SUGGESTIONS: Record<SportId, string[]> = {
  kitesurf: ["Pourquoi je retombe sur les fesses en saut ?", "Quelle taille de kite pour 18 nœuds, je fais 75 kg ?", "Comment je prépare mon premier backroll ?"],
  wingfoil: ["Je n'arrive pas à décoller, je fais quoi ?", "Quelle taille d'aile pour 15 nœuds, je fais 75 kg ?", "Comment réussir mon premier jibe en vol ?"],
  foil: ["Mon foil sort de l'eau sans arrêt, pourquoi ?", "Comment je tiens une hauteur de vol stable ?", "Comment préparer mon premier jibe en vol ?"],
  surf: ["Je me lève trop tard sur la vague, pourquoi ?", "Comment faire un bon bottom turn ?", "Quelle planche pour progresser après la mousse ?"],
  wakeboard: ["Comment aborder mon premier kicker ?", "Je tombe à chaque virage du câble, pourquoi ?", "Comment préparer un backroll sur kicker ?"],
};

/** Pendant l'écriture, on masque une ligne [[choix: …]] pas encore terminée. */
function visibleText(content: string, streaming: boolean) {
  const { text, options } = splitQuickReplies(content);
  return { text: streaming ? text.replace(/\[\[[^\]]*$/, "").trimEnd() : text, options };
}

export function CoachChat({
  initial,
  clearAction,
  sport,
  sportName,
  suggestions,
  remaining: initialRemaining,
  prefill,
  autoSend = false,
}: {
  initial: Msg[];
  clearAction: () => Promise<void>;
  sport: SportId;
  sportName: string;
  /** Questions proposées, adaptées aux figures en cours et à la dernière analyse */
  suggestions?: string[];
  /** Messages restants sur la période (null = inconnu) */
  remaining?: number | null;
  /** Question pré-remplie (lien « En parler au coach » depuis une analyse) */
  prefill?: string;
  /** Envoie tout de suite la question pré-remplie (venue de l'accueil) */
  autoSend?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState(prefill ?? "");
  const [streaming, setStreaming] = useState(false);
  const [remaining, setRemaining] = useState(initialRemaining ?? null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, pending]);

  // Zone de saisie qui grandit avec le texte (jusqu'à 6 lignes environ)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const autoSent = useRef(false);
  useEffect(() => {
    if (!prefill) return;
    if (autoSend && !autoSent.current) {
      autoSent.current = true;
      // On retire la question de l'adresse pour ne pas la renvoyer en rechargeant la page
      window.history.replaceState(null, "", "/coach?vue=chat");
      send(prefill);
    } else inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, autoSend]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setError(null);
    setPending(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    const fail = (err: { text: string; upgrade?: boolean }) => {
      setMessages((m) => (m.at(-1)?.role === "assistant" ? m.slice(0, -2) : m.slice(0, -1)));
      setInput(message);
      setError(err);
    };
    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sport }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        fail({ text: data.error ?? "Erreur inconnue.", upgrade: data.upgrade });
        return;
      }
      // Réponse au fil de l'écriture
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      setStreaming(true);
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        if (reply.includes("\u0000ERREUR")) {
          fail({ text: "Pas de réponse pour le moment. Réessaie dans un instant." });
          return;
        }
        const current = reply;
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: current }]);
      }
      if (!reply.trim()) {
        fail({ text: "Pas de réponse pour le moment. Réessaie dans un instant." });
        return;
      }
      setRemaining((r) => (r == null ? r : Math.max(0, r - 1)));
    } catch {
      fail({ text: "Connexion perdue. Vérifie ton réseau et renvoie le message." });
    } finally {
      setPending(false);
      setStreaming(false);
    }
  }

  return (
    <div className="panel flex h-[calc(100dvh-15rem)] min-h-[420px] flex-col lg:h-[70dvh]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-lagoon text-white shadow-md" aria-hidden="true">
            <AiIcon className="h-6 w-6" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 whitespace-nowrap text-lg font-bold leading-tight">
              Coach IA<span className="hidden sm:inline"> {sportName.toLowerCase()}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.7rem] font-bold text-emerald-800">En ligne 24/7</span>
            </h2>
            <p className="text-xs text-slate">
              Répond en quelques secondes
              {remaining != null && (
                <span className={remaining <= 5 ? "font-semibold text-danger" : ""}>
                  {" "}· {remaining} message{remaining > 1 ? "s" : ""} restant{remaining > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <form action={async () => { await clearAction(); setMessages([]); }}>
            <button className="text-sm text-slate hover:text-deep">Effacer</button>
          </form>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <div className="rounded-2xl bg-gradient-to-br from-brand-light to-white p-4 ring-1 ring-brand/15">
              <p className="font-bold text-deep">Ton coach de poche, jour et nuit.</p>
              <p className="mt-1 text-sm text-slate">
                Une IA entraînée pour coacher le {sportName.toLowerCase()} : technique, sécurité, matériel. Elle connaît ton niveau, ta
                roadmap et les retours de tes coachs.
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-[0.82rem] font-semibold text-deep">
                {[
                  ["🎯", "Débloquer une figure"],
                  ["🪁", "Choisir ta taille d'aile"],
                  ["🛟", "Rider en sécurité"],
                  ["📋", "Préparer ta session"],
                ].map(([e, t]) => (
                  <li key={t} className="flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-2 shadow-sm">
                    <span aria-hidden="true">{e}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-sm font-semibold text-slate">Essaie une de ces questions :</p>
            <div className="mt-2 flex flex-col items-start gap-2">
              {(suggestions?.length ? suggestions : SUGGESTIONS[sport]).map((s) => (
                <button key={s} onClick={() => send(s)} className="min-h-10 rounded-xl border border-line bg-spray px-4 py-2 text-left text-[0.95rem] hover:border-brand hover:bg-brand-light">
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate">
              Pour un avis sur ta vraie figure, filmée,{" "}
              <Link href="/analyse" className="font-semibold text-lagoon">
                envoie ta vidéo à un coach diplômé
              </Link>
              .
            </p>
          </div>
        )}
        {messages.map((m, i) => {
          if (m.role === "user")
            return (
              <div key={i} className="ml-auto max-w-[85%] rounded-lg rounded-br-md bg-brand px-4 py-2.5 text-white">
                {m.content}
              </div>
            );
          const isLast = i === messages.length - 1;
          const { text, options } = visibleText(m.content, isLast && streaming);
          if (!text) return null;
          return (
            <div key={i} className="max-w-[90%]">
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-brand">
                <AiIcon className="h-3.5 w-3.5" /> Coach IA
              </p>
              <div className="rounded-lg rounded-bl-md bg-salt px-4 py-3">
                <RichText text={text} />
              </div>
              {isLast && !pending && options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Réponses rapides">
                  {options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => send(o)}
                      className="min-h-10 rounded-full border border-brand bg-white px-4 py-2 text-[0.95rem] font-medium text-brand hover:bg-brand-light"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {pending && !(streaming && messages.at(-1)?.content) && (
          <div className="flex items-center gap-2 text-slate" aria-label="Réponse en cours">
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-salt px-3 py-2.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate/60" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            <span className="text-sm">Réponse en cours…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="mx-5 mb-2 text-danger">
          {error.text}{" "}
          {error.upgrade && (
            <Link href="/tarifs" className="font-semibold underline">
              Voir les formules
            </Link>
          )}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <label htmlFor="coach-input" className="sr-only">Ton message</label>
        <textarea
          ref={inputRef}
          id="coach-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Pose ta question au coach IA…"
          className="field max-h-40 flex-1 resize-none"
        />
        <button disabled={pending || !input.trim()} className="btn btn-primary self-end">
          Envoyer
        </button>
      </form>
    </div>
  );
}

function AiIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </svg>
  );
}
