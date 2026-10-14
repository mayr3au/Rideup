"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RichText } from "./rich-text";
import type { SportId } from "@/lib/sports";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS: Record<SportId, string[]> = {
  kitesurf: ["Pourquoi je retombe sur les fesses en saut ?", "Quelle taille de kite pour 18 nœuds, je fais 75 kg ?", "Comment je prépare mon premier backroll ?"],
  wingfoil: ["Je n'arrive pas à décoller, je fais quoi ?", "Quelle taille d'aile pour 15 nœuds, je fais 75 kg ?", "Comment réussir mon premier jibe en vol ?"],
  foil: ["Mon foil sort de l'eau sans arrêt, pourquoi ?", "Comment je tiens une hauteur de vol stable ?", "Comment préparer mon premier jibe en vol ?"],
  surf: ["Je me lève trop tard sur la vague, pourquoi ?", "Comment faire un bon bottom turn ?", "Quelle planche pour progresser après la mousse ?"],
  wakeboard: ["Comment aborder mon premier kicker ?", "Je tombe à chaque virage du câble, pourquoi ?", "Comment préparer un backroll sur kicker ?"],
};

export function CoachChat({
  initial,
  clearAction,
  sport,
  sportName,
}: {
  initial: Msg[];
  clearAction: () => Promise<void>;
  sport: SportId;
  sportName: string;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, pending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setError(null);
    setPending(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sport }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => m.slice(0, -1));
        setInput(message);
        setError({ text: data.error ?? "Erreur inconnue.", upgrade: data.upgrade });
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((m) => m.slice(0, -1));
      setInput(message);
      setError({ text: "Connexion perdue. Vérifie ton réseau et renvoie le message." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel flex h-[calc(100dvh-15rem)] min-h-[420px] flex-col lg:h-[70dvh]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="text-xl font-bold">Ton coach · {sportName}</h2>
        {messages.length > 0 && (
          <form action={async () => { await clearAction(); setMessages([]); }}>
            <button className="text-sm text-slate hover:text-deep">Effacer la conversation</button>
          </form>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <p className="text-slate">Pose une question sur une figure, ton matériel ou ta progression.</p>
            <div className="mt-4 flex flex-col items-start gap-2">
              {SUGGESTIONS[sport].map((s) => (
                <button key={s} onClick={() => send(s)} className="min-h-10 rounded-xl border border-line bg-spray px-4 py-2 text-left text-[0.95rem] hover:border-brand hover:bg-brand-light">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-lg rounded-br-md bg-brand px-4 py-2.5 text-white">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-[90%] rounded-lg rounded-bl-md bg-salt px-4 py-3">
              <RichText text={m.content} />
            </div>
          ),
        )}
        {pending && (
          <div className="flex items-center gap-2 text-slate" aria-label="Le coach réfléchit">
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-salt px-3 py-2.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate/60" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            <span className="text-sm">Le coach réfléchit…</span>
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
          placeholder="Écris ta question…"
          className="field flex-1 resize-none"
        />
        <button disabled={pending || !input.trim()} className="btn btn-primary">
          Envoyer
        </button>
      </form>
    </div>
  );
}
