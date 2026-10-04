"use client";

import GlassPanel from "@/components/GlassPanel";
import { avatarInitials } from "@/lib/avatar";
import { hoverLift, listItem, listStagger, tapPress } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Signature = {
  id: string;
  author_username: string;
  author_avatar: string | null;
  message: string;
  is_pinned: boolean;
  created_at: string;
};

function isSignature(value: unknown): value is Signature {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<Signature>;
  return (
    typeof row.id === "string" &&
    typeof row.author_username === "string" &&
    typeof row.message === "string" &&
    typeof row.is_pinned === "boolean" &&
    typeof row.created_at === "string"
  );
}

const stamp = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function GuestbookTab() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setError("Sign in to manage your guestbook.");
          setLoading(false);
        }
        return;
      }

      const response = await fetch(`/api/guestbook?profile_id=${encodeURIComponent(user.id)}`);
      const body: unknown = await response.json().catch(() => null);
      if (!active) return;

      if (!response.ok || !Array.isArray(body)) {
        setError("Couldn’t load signatures.");
        setLoading(false);
        return;
      }

      setSignatures(body.filter(isSignature));
      setLoading(false);
    }

    load().catch(() => {
      if (!active) return;
      setError("Couldn’t load signatures.");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function runAction(signatureId: string, action: "pin" | "delete") {
    setPendingId(signatureId);
    setError(null);

    try {
      const response = await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_id: signatureId, action }),
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Couldn’t update that signature.";
        setError(message);
        return;
      }

      if (action === "delete") {
        setSignatures((current) => current.filter((entry) => entry.id !== signatureId));
        return;
      }

      const pinned =
        body && typeof body === "object" && "is_pinned" in body && typeof body.is_pinned === "boolean"
          ? body.is_pinned
          : null;

      setSignatures((current) => {
        const next = current.map((entry) =>
          entry.id === signatureId
            ? { ...entry, is_pinned: pinned ?? !entry.is_pinned }
            : entry,
        );
        return next.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return b.created_at.localeCompare(a.created_at);
        });
      });
    } catch {
      setError("Couldn’t update that signature.");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return <p className="label-mono text-white/40">Loading signatures…</p>;
  }

  return (
    <section aria-label="Guestbook signatures" className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Signatures
        </h2>
        <p className="label-mono text-accent-ice/60">
          {signatures.length} {signatures.length === 1 ? "signature" : "signatures"}
        </p>
      </div>

      {error ? (
        <p role="alert" className="px-1 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      {signatures.length === 0 ? (
        <GlassPanel className="rounded-2xl border-dashed px-4 py-10 text-center">
          <p className="label-mono text-white/45">No one has signed yet.</p>
        </GlassPanel>
      ) : (
        <motion.ul
          className="flex flex-col gap-2.5"
          variants={listStagger}
          initial="hidden"
          animate="visible"
        >
          {signatures.map((entry) => {
            const busy = pendingId === entry.id;
            return (
              <motion.li key={entry.id} variants={listItem} layout>
                <GlassPanel
                  className={`rounded-2xl px-3.5 py-3.5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.7)] transition-colors sm:px-4 ${
                    entry.is_pinned ? "ring-1 ring-accent-cyan/30" : "hover:border-strong"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {entry.author_avatar ? (
                      <img
                        src={entry.author_avatar}
                        alt=""
                        className="mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-cyan/25 bg-surface-overlay/80 font-mono text-[10px] font-semibold text-accent-ice">
                        {avatarInitials(entry.author_username)}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-mono text-sm font-medium text-white">@{entry.author_username}</p>
                        <p className="font-mono text-[11px] tabular-nums text-white/35">
                          {stamp.format(new Date(entry.created_at))}
                        </p>
                        {entry.is_pinned ? (
                          <span className="label-mono inline-flex items-center rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-0.5 text-accent-ice">
                            Pinned
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/70">{entry.message}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <motion.button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(entry.id, "pin")}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-subtle bg-surface-overlay/60 px-2.5 text-xs font-medium text-white/70 outline-none transition-colors hover:border-accent-cyan/40 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60 disabled:opacity-40"
                      >
                        <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {entry.is_pinned ? "Unpin" : "Pin"}
                      </motion.button>
                      <motion.button
                        type="button"
                        disabled={busy}
                        aria-label={`Delete signature from @${entry.author_username}`}
                        onClick={() => runAction(entry.id, "delete")}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-subtle bg-surface-overlay/60 text-rose-400 outline-none transition-colors hover:border-rose-300/40 hover:bg-rose-400/10 focus-visible:ring-2 focus-visible:ring-rose-300/50 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </motion.button>
                    </div>
                  </div>
                </GlassPanel>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </section>
  );
}
