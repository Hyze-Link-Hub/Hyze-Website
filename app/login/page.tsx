"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift, tapPress } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function defaultUsername(userId: string) {
  return `user_${userId.replace(/-/g, "").slice(0, 12)}`;
}

async function ensureProfile(userId: string) {
  const supabase = createClient();
  const { data: existing, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) return error.message;
  if (existing) return null;

  const username = defaultUsername(userId);
  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    username,
    display_name: username,
  });

  return insertError?.message ?? null;
}

const fieldClass =
  "field-input";

const labelClass = "field-label";

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

export default function LoginPage() {
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  async function continueWithDiscord() {
    setError(null);
    setNotice(null);
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const supabase = createClient();
    const nextEmail = email.trim();

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: nextEmail,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setPending(false);
        return;
      }

      if (!data.session || !data.user) {
        setNotice("Check your email to confirm your account, then log in.");
        setPending(false);
        return;
      }

      const profileError = await ensureProfile(data.user.id);
      if (profileError) {
        setError(profileError);
        setPending(false);
        return;
      }

      router.push("/dashboard");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: nextEmail,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Could not log in.");
      setPending(false);
      return;
    }

    const profileError = await ensureProfile(data.user.id);
    if (profileError) {
      setError(profileError);
      setPending(false);
      return;
    }

    router.push("/dashboard");
  }

  function switchMode() {
    setMode(isSignup ? "login" : "signup");
    setError(null);
    setNotice(null);
  }

  return (
    <main className="relative flex h-full min-h-full items-center justify-center overflow-hidden px-6 py-10">
      <div className="starfield" aria-hidden="true">
        <div className="starfield__glow" />
        <div className="starfield__stars starfield__stars--far" />
        <div className="starfield__stars starfield__stars--near" />
        <div className="starfield__dust" />
      </div>

      <GlassPanel className="relative w-full max-w-md rounded-[28px] px-6 py-8 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.9),0_0_80px_-30px_rgba(54,214,255,0.45)] sm:px-8 sm:py-10">
        <p className="label-mono text-accent-cyan/70">
          Hazy
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-[-0.03em] text-gradient-subtle">
          {isSignup ? "Create your page" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {isSignup
            ? "Sign up to start building your profile."
            : "Sign in to edit your profile."}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <motion.button
            type="button"
            onClick={continueWithDiscord}
            disabled={pending}
            whileHover={pending ? undefined : hoverLift}
            whileTap={pending ? undefined : tapPress}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#5865F2] px-6 text-sm font-bold tracking-tight text-white shadow-[0_0_40px_-10px_rgba(88,101,242,0.85)] ring-1 ring-white/25 ring-inset outline-none transition-colors hover:bg-[#4752C4] focus-visible:ring-2 focus-visible:ring-[#5865F2]/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <DiscordIcon className="h-5 w-5" />
            Continue with Discord
          </motion.button>

          <button
            type="button"
            onClick={() => {
              setShowEmail((prev) => !prev);
              setError(null);
              setNotice(null);
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-subtle bg-surface-overlay/60 px-6 text-sm font-medium text-white/70 outline-none transition hover:border-strong hover:bg-surface-overlay hover:text-white focus-visible:ring-2 focus-visible:ring-accent-ice/60"
          >
            {showEmail ? "Hide email sign-in" : "Continue with Email"}
          </button>
        </div>

        {showEmail ? (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 border-t border-subtle pt-6">
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
                required
                className={fieldClass}
              />
            </label>

            {error ? (
              <p role="alert" className="text-sm text-rose-300">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="text-sm text-accent-ice">
                {notice}
              </p>
            ) : null}

            <motion.button
              type="submit"
              disabled={pending}
              whileHover={pending ? undefined : hoverLift}
              whileTap={pending ? undefined : tapPress}
              className="btn-primary mt-2"
            >
              {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
            </motion.button>

            <p className="text-center text-sm text-white/45">
              {isSignup ? "Already have an account?" : "Need a page?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-accent-ice outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-accent-ice/60"
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>
          </form>
        ) : error ? (
          <p role="alert" className="mt-4 text-sm text-rose-300">
            {error}
          </p>
        ) : null}

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-white/35 outline-none transition hover:text-white/70 focus-visible:ring-2 focus-visible:ring-accent-ice/60"
          >
            Back home
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
