"use client";

import { avatarInitials } from "@/lib/avatar";
import { hoverLift, tapPress } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

export type GuestbookSignature = {
  id: string;
  profile_id: string;
  author_id: string;
  author_username: string;
  author_avatar: string | null;
  message: string;
  is_pinned: boolean;
  created_at: string;
};

const feedList = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const feedItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
};

function isSignature(value: unknown): value is GuestbookSignature {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<GuestbookSignature>;
  return (
    typeof row.id === "string" &&
    typeof row.author_username === "string" &&
    typeof row.message === "string" &&
    typeof row.is_pinned === "boolean" &&
    typeof row.created_at === "string"
  );
}

export default function Guestbook({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [signatures, setSignatures] = useState<GuestbookSignature[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.user));
      setAuthReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;

    async function load() {
      const response = await fetch(`/api/guestbook?profile_id=${encodeURIComponent(profileId)}`);
      const body: unknown = await response.json().catch(() => null);
      if (!active) return;
      if (!response.ok || !Array.isArray(body)) {
        setError("Couldn’t load the guestbook.");
        setLoaded(true);
        return;
      }
      setSignatures(body.filter(isSignature));
      setError(null);
      setLoaded(true);
    }

    load().catch(() => {
      if (!active) return;
      setError("Couldn’t load the guestbook.");
      setLoaded(true);
    });

    return () => {
      active = false;
    };
  }, [open, profileId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!signedIn || !message || [...message].length > 280 || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, message }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok || !isSignature(body)) {
        const messageText =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Couldn’t sign the guestbook.";
        setError(messageText);
        return;
      }

      setSignatures((current) => {
        const next = [body, ...current.filter((entry) => entry.id !== body.id)];
        return next.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return b.created_at.localeCompare(a.created_at);
        });
      });
      setDraft("");
    } catch {
      setError("Couldn’t sign the guestbook.");
    } finally {
      setSubmitting(false);
    }
  }

  async function continueWithDiscord() {
    setError(null);
    setLoginPending(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoginPending(false);
    }
  }

  const countLabel = `${signatures.length} ${signatures.length === 1 ? "signature" : "signatures"}`;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open guestbook"
        whileHover={hoverLift}
        whileTap={tapPress}
        className="glass-frost fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full text-white/70 outline-none transition-colors hover:border-accent-cyan/40 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60 sm:right-6 sm:top-6"
      >
        <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </motion.button>

      <AnimatePresence>
        {open ? (
        <motion.div
          key="guestbook-backdrop"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-surface-base/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guestbook-title"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-subtle bg-surface-overlay/95 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-30px_rgba(54,214,255,0.6)] backdrop-blur-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
              <div>
                <h2
                  id="guestbook-title"
                  className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-gradient-subtle"
                >
                  Guestbook
                </h2>
                <p className="label-mono mt-1 text-accent-ice/60">{loaded ? countLabel : "Signatures"}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close guestbook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-subtle bg-surface-raised/60 text-white/50 transition hover:border-strong hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!loaded ? (
                <p className="label-mono py-6 text-center text-white/40">Loading signatures…</p>
              ) : signatures.length === 0 ? (
                <p className="label-mono py-6 text-center text-white/40">No messages yet.</p>
              ) : (
                <motion.ul
                  className="flex flex-col gap-1"
                  variants={feedList}
                  initial="hidden"
                  animate="visible"
                >
                  {signatures.map((entry) => (
                    <motion.li
                      key={entry.id}
                      variants={feedItem}
                      className={`flex items-start gap-2.5 rounded-xl border px-2.5 py-2 transition-colors ${
                        entry.is_pinned
                          ? "border-accent-cyan/25 bg-accent-cyan/10 shadow-[0_0_18px_-8px_rgba(54,214,255,0.9)]"
                          : "border-transparent hover:border-subtle hover:bg-surface-raised/60"
                      }`}
                    >
                      {entry.author_avatar ? (
                        <img
                          src={entry.author_avatar}
                          alt=""
                          className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-cyan/30 bg-surface-base/70 font-mono text-[8px] font-medium text-accent-ice">
                          {avatarInitials(entry.author_username)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs font-medium text-accent-ice">
                          @{entry.author_username}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/75">{entry.message}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>

            {error ? (
              <p role="alert" className="mt-3 shrink-0 text-xs text-rose-300">
                {error}
              </p>
            ) : null}

            <div className="mt-auto shrink-0 border-t border-subtle pt-4">
              {signedIn ? (
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="guestbook-message">
                    Guestbook message
                  </label>
                  <input
                    id="guestbook-message"
                    value={draft}
                    maxLength={280}
                    placeholder="Leave a signature…"
                    onChange={(event) => setDraft(event.target.value)}
                    className="h-10 min-w-0 flex-1 rounded-full border border-subtle bg-surface-base/70 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/25"
                  />
                  <motion.button
                    type="submit"
                    disabled={submitting || draft.trim().length === 0}
                    whileHover={hoverLift}
                    whileTap={tapPress}
                    className="label-mono h-10 shrink-0 rounded-full border border-accent-cyan/60 bg-accent-cyan/15 px-4 text-accent-ice shadow-glow-cyan transition-colors hover:bg-accent-cyan/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? "…" : "Sign"}
                  </motion.button>
                </form>
              ) : (
                <motion.button
                  type="button"
                  onClick={continueWithDiscord}
                  disabled={!authReady || loginPending}
                  whileHover={hoverLift}
                  whileTap={tapPress}
                  className="h-10 w-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-ice px-4 text-sm font-bold tracking-tight text-surface-base shadow-glow-cyan ring-1 ring-inset ring-white/40 transition disabled:cursor-wait disabled:opacity-60"
                >
                  {loginPending ? "Redirecting…" : "Login via Discord to sign"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
