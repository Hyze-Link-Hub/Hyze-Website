"use client";

import { hoverLift, tapPress } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Bot,
  ChartColumn,
  Check,
  Eye,
  ShieldCheck,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type PointerEvent } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const featureGrid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const featureItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const NAV_LINKS = [
  { href: "/leaders", label: "Leaderboard" },
  { href: "/pricing", label: "Pricing" },
];

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Bot,
    title: "Discord Bot Sync",
    description:
      "Automatically track roles and activity to unlock exclusive badges.",
  },
  {
    icon: Trophy,
    title: "Gamified Showcases",
    description: "Pin your rarest achievements to your public showcase.",
  },
  {
    icon: ChartColumn,
    title: "Secure Analytics",
    description:
      "Track your unique daily visitors with our anti-spam view engine.",
  },
];

type Showcase = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

const SHOWCASES: Showcase[] = [
  {
    eyebrow: "Analytics",
    title: "The Anti-Spam Fortress.",
    description:
      "Every view is verified. Visitor IPs are hashed before they ever touch our database, so refresh spam and bot farms can't inflate your numbers, and nobody's address is ever stored.",
    points: [
      "IP-hashed unique visitor tracking",
      "One counted view per visitor, per day",
      "Dark-mode analytics dashboard with daily trends",
    ],
    image: "/images/analytics-preview.png",
    imageAlt: "Hazy.tech analytics dashboard preview",
  },
  {
    eyebrow: "Badges",
    title: "Gamified Badge Library.",
    description:
      "Connect your Discord and let the Hazy bot do the grinding. Roles, boosts, and server activity sync automatically, unlocking badges you can't get anywhere else.",
    points: [
      "Real-time Discord bot synchronization",
      "Rare and limited-edition badge drops",
      "Pin your best unlocks to your public showcase",
    ],
    image: "/images/badges-preview.png",
    imageAlt: "Hazy.tech badge library preview",
    reverse: true,
  },
  {
    eyebrow: "Community",
    title: "The Live Guestbook.",
    description:
      "A terminal-style feed where visitors leave their mark in real time. Moderate what shows up and pin the signatures that matter most to the top of your profile.",
    points: [
      "Terminal-inspired live community feed",
      "Pin your favorite signatures",
      "Built-in moderation controls",
    ],
    image: "/images/guestbook-preview.png",
    imageAlt: "Hazy.tech guestbook preview",
  },
];

const MOCK_BADGES = [
  { icon: Sparkles, label: "Early Adopter" },
  { icon: Trophy, label: "Top 1%" },
  { icon: ShieldCheck, label: "Verified" },
  { icon: Bot, label: "Server Booster" },
];

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(54,214,255,0.22),transparent_65%),radial-gradient(ellipse_45%_35%_at_85%_45%,rgba(142,243,255,0.08),transparent_70%),radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(54,214,255,0.08),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-[1400px] bg-[linear-gradient(rgba(142,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(142,243,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black,transparent_75%)]" />
      <motion.div
        className="absolute left-1/2 top-[600px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent-cyan/10 blur-[120px]"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
    </div>
  );
}

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setIsAuthenticated(Boolean(data.user));
    });

    return () => {
      active = false;
    };
  }, []);

  const ctaHref = isAuthenticated ? "/dashboard" : "/login";
  const ctaLabel = isAuthenticated ? "Dashboard" : "Login";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-subtle bg-surface-base/70 backdrop-blur-2xl">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <Link
          href="/"
          className="justify-self-start inline-flex items-center gap-2.5 font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-gradient-brand"
        >
          <Image
            src="/logo.png"
            alt="Hazy Logo"
            width={32}
            height={32}
            className="rounded-lg shadow-[0_0_12px_rgba(157,123,255,0.35)]"
          />
          Hazy.tech
        </Link>

        <div className="flex items-center gap-6 sm:gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative text-sm font-medium tracking-tight text-white/55 transition-colors hover:text-accent-ice"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent-cyan shadow-glow-cyan transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <motion.div whileHover={hoverLift} whileTap={tapPress} className="justify-self-end">
          <Link
            href={ctaHref}
            className="inline-flex rounded-full border border-subtle bg-surface-raised/70 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-accent-cyan/40 hover:text-white hover:shadow-glow-cyan"
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}

function ClaimProfileButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claimProfile() {
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={claimProfile}
        disabled={pending}
        whileHover={hoverLift}
        whileTap={tapPress}
        className="group relative inline-flex h-16 items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-accent-cyan to-accent-ice px-10 text-lg font-bold tracking-tight text-surface-base shadow-glow-cyan-lg outline-none ring-1 ring-inset ring-white/40 transition-shadow hover:shadow-[0_0_55px_0px_rgba(54,214,255,0.95),0_0_120px_-10px_rgba(142,243,255,0.7)] focus-visible:ring-4 focus-visible:ring-accent-ice/50 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[72px] sm:px-14 sm:text-xl"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.65)_50%,transparent_75%)] transition-transform duration-700 group-hover:translate-x-full" />
        <DiscordIcon className="relative h-6 w-6" />
        <span className="relative">{pending ? "Connecting…" : "Claim Your Profile"}</span>
        <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>
      {error ? (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      ) : (
        <p className="label-mono text-white/35">Free forever · Sign in with Discord</p>
      )}
    </div>
  );
}

function ProfileShowcase() {
  const reduceMotion = useReducedMotion();
  const tiltX = useMotionValue(8);
  const tiltY = useMotionValue(-6);
  const rotateX = useSpring(tiltX, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 150, damping: 18 });

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(8 - py * 16);
    tiltY.set(-6 + px * 20);
  }

  function onPointerLeave() {
    tiltX.set(8);
    tiltY.set(-6);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.6, ease: EASE }}
      className="relative mx-auto mt-20 w-full max-w-md [perspective:1200px]"
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <motion.div
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative rounded-[28px] border border-white/[0.12] bg-surface-raised/60 p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95),0_0_70px_-24px_rgba(54,214,255,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_40%,transparent_60%,rgba(54,214,255,0.1)_100%)]" />

          <div className="relative flex items-center gap-4" style={{ transform: "translateZ(40px)" }}>
            <div className="relative h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-accent-cyan to-accent-ice p-[2px] shadow-glow-cyan">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-raised font-[family-name:var(--font-syne)] text-xl font-bold text-accent-ice">
                NX
              </div>
              <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface-raised bg-emerald-400" />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-white">
                neonxyz
              </p>
              <p className="font-mono text-xs text-white/40">hazy.tech/neonxyz</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-subtle bg-surface-base/60 px-2.5 py-1 font-mono text-xs tabular-nums text-white/70">
              <Eye className="h-3.5 w-3.5 text-accent-cyan" />
              12.4k
            </div>
          </div>

          <div
            className="relative mt-5 flex items-center gap-3 rounded-2xl border border-subtle bg-surface-base/50 px-4 py-3 text-left"
            style={{ transform: "translateZ(25px)" }}
          >
            <DiscordIcon className="h-5 w-5 shrink-0 text-accent-ice" />
            <div className="min-w-0">
              <p className="label-mono text-white/35">Playing</p>
              <p className="truncate text-sm text-white/80">Valorant — Ranked · Radiant</p>
            </div>
          </div>

          <div className="relative mt-5" style={{ transform: "translateZ(30px)" }}>
            <p className="label-mono mb-2.5 text-left text-white/35">Showcase</p>
            <div className="grid grid-cols-4 gap-2.5">
              {MOCK_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  title={label}
                  className="flex aspect-square items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.07] shadow-[0_0_18px_-8px_rgba(54,214,255,0.9)]"
                >
                  <Icon className="h-5 w-5 text-accent-ice" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute -bottom-10 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-accent-cyan/20 blur-2xl" aria-hidden="true" />
    </motion.div>
  );
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      whileHover={hoverLift}
      className="relative aspect-video w-full overflow-hidden rounded-2xl border border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_-12px_rgba(54,214,255,0.25)] md:w-1/2"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(54,214,255,0.18),transparent_60%),linear-gradient(135deg,var(--surface-raised)_0%,var(--surface-base)_60%,var(--surface-overlay)_100%)]" />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="label-mono text-accent-ice/30">
            Hazy.tech
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06]" />
    </motion.div>
  );
}

function ShowcaseBlock({ eyebrow, title, description, points, image, imageAlt, reverse }: Showcase) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-24 md:gap-16 md:py-32 ${
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="w-full md:w-1/2">
        <p className="label-mono text-accent-cyan">{eyebrow}</p>
        <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-5xl">
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">{description}</p>
        <ul className="mt-8 space-y-3 border-t border-subtle pt-8">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-white/75 sm:text-base">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10">
                <Check className="h-3 w-3 text-accent-ice" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <PreviewImage src={image} alt={imageAlt} />
    </motion.section>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-base text-white">
      <Background />
      <Navbar />

      <main className="relative z-10 pt-16">
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-16 text-center sm:pt-24">
          <motion.div variants={heroContainer} initial="hidden" animate="show">
            <motion.p
              variants={heroItem}
              className="label-mono mx-auto inline-flex items-center gap-2 rounded-full border border-accent-cyan/25 bg-surface-raised/60 px-4 py-1.5 text-accent-ice shadow-glow-cyan backdrop-blur-2xl"
            >
              <Sparkles className="h-3.5 w-3.5" />
              The Ultimate Cyber Profile
            </motion.p>

            <motion.h1
              variants={heroItem}
              className="mt-8 font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl"
            >
              Your Gaming Identity,{" "}
              <span className="text-gradient-brand drop-shadow-[0_0_35px_rgba(54,214,255,0.45)]">
                Forged in Neon.
              </span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg"
            >
              Sync your Discord. Unlock gamified badges. Track your views. Build
              the ultimate Hazy.tech profile.
            </motion.p>

            <motion.div variants={heroItem} className="mt-10">
              <ClaimProfileButton />
            </motion.div>
          </motion.div>

          <ProfileShowcase />
        </section>

        <div className="pt-8">
          {SHOWCASES.map((showcase) => (
            <ShowcaseBlock key={showcase.title} {...showcase} />
          ))}
        </div>

        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="label-mono text-accent-cyan">Core Mechanics</p>
            <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-5xl">
              Built for players who flex.
            </h2>
          </motion.div>

          <motion.div
            variants={featureGrid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <motion.article
                key={title}
                variants={featureItem}
                whileHover={hoverLift}
                className="glass-frost group relative overflow-hidden rounded-3xl p-7 transition-[border-color,box-shadow] duration-300 hover:border-accent-cyan/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_45px_-14px_rgba(54,214,255,0.6)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-cyan/0 blur-3xl transition-colors duration-500 group-hover:bg-accent-cyan/20" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-cyan/30 bg-accent-cyan/10 text-accent-ice shadow-glow-cyan transition group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="relative mt-6 font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-white/50">
                  {description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-accent-cyan/20 bg-surface-raised/60 px-6 py-20 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_80px_-30px_rgba(54,214,255,0.55)] backdrop-blur-2xl sm:px-12"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(54,214,255,0.18),transparent_70%)]"
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent-ice/50 to-transparent" aria-hidden="true" />
            <h2 className="relative font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
              Ready to{" "}
              <span className="text-gradient-brand">
                light up
              </span>
              ?
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
              Your username is waiting. Claim it before someone else does.
            </p>
            <div className="relative mt-10">
              <ClaimProfileButton />
            </div>
          </motion.div>
        </section>
      </main>

    </div>
  );
}
