"use client";

import { hoverLift, tapPress } from "@/lib/motion";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const cardGrid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.12 } },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const NAV_LINKS = [
  { href: "/leaders", label: "Leaderboard" },
  { href: "/pricing", label: "Pricing" },
];

const FREE_FEATURES = [
  "3 Pinned Badges",
  "Standard Analytics",
  "Basic Discord Sync",
  "Terminal Guestbook access",
];

const PRO_FEATURES = [
  "5 Pinned Badges",
  "Exclusive Pro Profile Cosmetic Triggers",
  "Priority Leaderboard Placement",
  "Advanced Analytics Tracking",
  "Early access to future updates",
];

const FAQS = [
  {
    question: "Is this a monthly subscription?",
    answer:
      "No. Lifetime Pro is a single $9 payment. You keep the tier for as long as Hazy.tech exists — no renewals, no surprise charges.",
  },
  {
    question: "How do my Discord roles sync?",
    answer:
      "Connect Discord once and the Hazy bot watches your roles, boosts, and server activity. Matching badges unlock automatically and show up in your showcase.",
  },
  {
    question: "Can I change my username later?",
    answer:
      "Yes. Your public handle can be updated from the dashboard. Old links stop resolving once the new username is saved, so pick carefully before you share it.",
  },
  {
    question: "What happens to my profile if I stay on Free?",
    answer:
      "Nothing disappears. Free keeps your profile, three pinned badges, standard analytics, basic Discord sync, and the terminal guestbook. Pro only adds the extra flex.",
  },
];

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(54,214,255,0.22),transparent_65%),radial-gradient(ellipse_45%_35%_at_85%_45%,rgba(142,243,255,0.08),transparent_70%),radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(54,214,255,0.08),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-[1400px] bg-[linear-gradient(rgba(142,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(142,243,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black,transparent_75%)]" />
      <motion.div
        className="absolute left-1/2 top-[420px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent-cyan/10 blur-[120px]"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-subtle bg-surface-base/70 backdrop-blur-2xl">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <Link
          href="/"
          className="justify-self-start font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-gradient-brand"
        >
          Hazy.tech
        </Link>

        <div className="flex items-center gap-6 sm:gap-8">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/pricing";
            return (
              <Link
                key={href}
                href={href}
                className={`group relative text-sm font-medium tracking-tight transition-colors hover:text-accent-ice ${
                  active ? "text-accent-ice" : "text-white/55"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-accent-cyan shadow-glow-cyan transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <motion.div whileHover={hoverLift} whileTap={tapPress} className="justify-self-end">
          <Link
            href="/login"
            className="inline-flex rounded-full border border-subtle bg-surface-raised/70 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-accent-cyan/40 hover:text-white hover:shadow-glow-cyan"
          >
            Log in
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}

function UnlockProButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlockPro() {
    posthog.capture("clicked_unlock_pro");
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

  return (
    <div className="mt-8">
      <motion.button
        type="button"
        onClick={unlockPro}
        disabled={pending}
        whileHover={hoverLift}
        whileTap={tapPress}
        className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-accent-cyan to-accent-ice text-base font-bold tracking-tight text-surface-base shadow-glow-cyan-lg outline-none ring-1 ring-inset ring-white/40 transition-shadow hover:shadow-[0_0_55px_0px_rgba(54,214,255,0.95),0_0_100px_-8px_rgba(142,243,255,0.75)] focus-visible:ring-4 focus-visible:ring-accent-ice/50 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.55)_50%,transparent_75%)] transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative">{pending ? "Opening checkout…" : "Unlock Pro"}</span>
        <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>
      {error ? (
        <p role="alert" className="mt-3 text-center text-sm text-rose-300">
          {error}
        </p>
      ) : (
        <p className="label-mono mt-3 text-center text-white/35">One payment. Lifetime access.</p>
      )}
    </div>
  );
}

function FeatureList({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="mt-8 space-y-3.5 border-t border-subtle pt-8">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-white/75 sm:text-[15px]">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              accent
                ? "border-accent-cyan/50 bg-accent-cyan/15"
                : "border-strong bg-surface-overlay/60"
            }`}
          >
            <Check className={`h-3 w-3 ${accent ? "text-accent-ice" : "text-white/60"}`} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-base text-white">
      <Background />
      <Navbar />

      <main className="relative z-10 pt-16">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-20 text-center sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="label-mono mx-auto inline-flex items-center gap-2 rounded-full border border-accent-cyan/25 bg-surface-raised/60 px-4 py-1.5 text-accent-ice shadow-glow-cyan backdrop-blur-2xl">
              <Sparkles className="h-3.5 w-3.5" />
              Lifetime access
            </p>
            <h1 className="mt-8 font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-7xl">
              Investment in{" "}
              <span className="text-gradient-brand drop-shadow-[0_0_35px_rgba(54,214,255,0.4)]">
                Your Brand
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg">
              Unlock the ultimate tier of customization, rare showcases, and priority
              placement on Hazy.tech.
            </p>
          </motion.div>
        </section>

        <motion.section
          variants={cardGrid}
          initial="hidden"
          animate="show"
          className="mx-auto grid max-w-5xl items-stretch gap-6 px-6 pb-24 pt-10 md:grid-cols-2 md:gap-8 md:pt-14"
        >
          <motion.article
            variants={cardItem}
            whileHover={hoverLift}
            className="glass-frost flex flex-col rounded-[28px] p-8 transition-colors hover:border-strong sm:p-10"
          >
            <p className="label-mono text-white/40">The Starter</p>
            <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight">
              Free Tier
            </h2>
            <p className="mt-6 flex items-end gap-2">
              <span className="font-[family-name:var(--font-syne)] text-6xl font-extrabold tabular-nums tracking-[-0.04em]">
                $0
              </span>
              <span className="label-mono mb-2.5 text-white/40">/ forever</span>
            </p>
            <p className="mt-3 text-sm text-white/50">
              Everything you need to claim a profile and start flexing.
            </p>
            <FeatureList items={FREE_FEATURES} />
            <div className="mt-auto pt-8">
              <motion.div whileHover={hoverLift} whileTap={tapPress}>
                <Link
                  href="/dashboard"
                  className="inline-flex h-14 w-full items-center justify-center rounded-full border border-subtle bg-surface-overlay/60 text-base font-semibold tracking-tight text-white/55 transition hover:border-strong hover:text-white/85"
                >
                  Current Plan
                </Link>
              </motion.div>
            </div>
          </motion.article>

          <motion.article
            variants={cardItem}
            whileHover={hoverLift}
            className="relative flex flex-col rounded-[28px] border border-accent-cyan/50 bg-surface-raised/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_60px_-16px_rgba(54,214,255,0.45)] ring-1 ring-inset ring-accent-cyan/20 backdrop-blur-2xl sm:p-10"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(54,214,255,0.14),transparent_70%)]"
              aria-hidden="true"
            />
            <span className="label-mono absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-accent-cyan/40 bg-surface-overlay px-4 py-1 text-accent-ice shadow-glow-cyan">
              Most Popular
            </span>
            <p className="label-mono relative text-accent-cyan">The Flex</p>
            <h2 className="relative mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight">
              Lifetime Pro
            </h2>
            <p className="relative mt-6 flex items-end gap-2">
              <span className="font-[family-name:var(--font-syne)] text-6xl font-extrabold tabular-nums tracking-[-0.04em] text-gradient-brand drop-shadow-[0_0_24px_rgba(54,214,255,0.3)]">
                $9
              </span>
              <span className="label-mono mb-2.5 text-accent-ice/75">/ one-time</span>
            </p>
            <p className="relative mt-3 text-sm text-white/50">
              The full cosmetic kit, deeper analytics, and a permanent spot ahead of the pack.
            </p>
            <div className="relative">
              <FeatureList items={PRO_FEATURES} accent />
            </div>
            <div className="relative mt-auto">
              <UnlockProButton />
            </div>
          </motion.article>
        </motion.section>

        <section className="mx-auto max-w-5xl px-6 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="label-mono text-accent-cyan">Questions</p>
            <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-5xl">
              Before you commit.
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {FAQS.map(({ question, answer }, index) => (
              <motion.article
                key={question}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (index % 2) * 0.08, ease: EASE }}
                whileHover={hoverLift}
                className="glass-frost rounded-3xl p-7 transition-colors hover:border-strong"
              >
                <span className="label-mono text-accent-cyan/70">
                  Q.{String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight">
                  {question}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{answer}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-subtle bg-surface-base/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-white/40 sm:flex-row">
          <p className="label-mono">© 2026 Hazy.tech. All rights reserved.</p>
          <nav className="flex gap-6">
            {["Terms", "Privacy", "Contact"].map((label) => (
              <a key={label} href="#" className="transition hover:text-accent-ice">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
