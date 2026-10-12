"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RichText } from "./rich-text";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Pourquoi je retombe toujours sur les fesses en saut ?",
  "Quelle taille de kite pour 18 nœuds, je fais 75 kg ?",
  "Comment je prépare mon premier backroll ?",
];

export function CoachChat({ initial, clearAction }: { initial: Msg[]; clearAction: () => Promise<void> }) {
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
        body: JSON.stringify({ message }),
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
    <div className="panel flex h-[70dvh] min-h-[480px] flex-col">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="text-xl font-bold">Ton coach</h2>
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
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-sm border border-line px-4 py-2 text-left text-[0.95rem] hover:border-deep">
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
        {pending && <p className="text-slate">Le coach réfléchit…</p>}
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
