"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import { Check, Ghost, Sparkles } from "lucide-react";
import { useState } from "react";

const FREE_PERKS = ["Custom username / slug", "Custom links & social icons", "Public bio-link page"];

const PRO_PERKS = [
  "Remove Hazy watermark",
  "Premium themes & media backgrounds",
  "Custom domains (coming soon)",
  "Lifetime access — pay once",
];

export default function SubscriptionStatusCard() {
  const isPremium = useProfileStore((state) => state.profile.is_premium);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgradeToLifetime() {
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const body = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!response.ok || !body?.url) {
        throw new Error(body?.error ?? "Checkout is unavailable right now.");
      }

      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  if (isPremium) {
    return (
      <GlassPanel className="relative overflow-hidden rounded-[28px] p-5 shadow-glass sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(167,139,250,0.16),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <p className="label-mono text-emerald-300/80">Subscription</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-200 shadow-[0_0_22px_rgba(52,211,153,0.35)]">
              <Ghost className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              Plan: Pro (Lifetime)
            </span>
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-syne)] text-xl font-semibold tracking-tight text-white sm:text-2xl">
            You&apos;re unlocked for life
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
            You have permanent lifetime access. All pro features and branding controls are unlocked.
          </p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="relative overflow-hidden rounded-[28px] p-5 shadow-glass sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(54,214,255,0.08),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <p className="label-mono text-accent-cyan/70">Subscription</p>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
            Plan: Free Tier
          </span>
        </div>
        <h2 className="mt-3 font-[family-name:var(--font-syne)] text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Upgrade to Lifetime Pro
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
          Keep the free basics, or unlock watermark removal, premium themes, and permanent Pro
          access with one payment.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="label-mono text-white/35">Free includes</p>
            <ul className="mt-3 space-y-2.5">
              {FREE_PERKS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-mono text-accent-ice/70">Pro unlocks</p>
            <ul className="mt-3 space-y-2.5">
              {PRO_PERKS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/75">
                  <Sparkles
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-cyan"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-7">
          <motion.button
            type="button"
            onClick={() => void upgradeToLifetime()}
            disabled={pending}
            whileHover={pending ? undefined : hoverLift}
            whileTap={pending ? undefined : tapPress}
            className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 sm:w-auto sm:min-w-[16rem]"
          >
            {pending ? "Opening checkout…" : "Upgrade to Lifetime Pro"}
          </motion.button>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-rose-300">
              {error}
            </p>
          ) : (
            <p className="label-mono mt-3 text-white/30">One payment. Lifetime access.</p>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
