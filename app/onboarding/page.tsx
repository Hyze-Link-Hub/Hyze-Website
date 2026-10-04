"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift, tapPress } from "@/lib/motion";
import { discordProviderId } from "@/lib/discord";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const fieldClass =
  "field-input";

const labelClass = "field-label";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const discordId = discordProviderId(user);
      if (discordId) {
        await supabase
          .from("profiles")
          .update({ discord_id: discordId })
          .eq("id", user.id)
          .is("discord_id", null);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }

      if (profile?.username && !profile.username.startsWith("user_")) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const nextUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(nextUsername)) {
      setError("Username must be 3–24 characters: letters, numbers, and underscores.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const nextAvatar = avatarUrl.trim() || null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: nextUsername,
        avatar_url: nextAvatar,
        display_name: nextUsername,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="relative flex h-full min-h-full items-center justify-center overflow-hidden px-6 py-10">
        <div className="starfield" aria-hidden="true">
          <div className="starfield__glow" />
          <div className="starfield__stars starfield__stars--far" />
          <div className="starfield__stars starfield__stars--near" />
          <div className="starfield__dust" />
        </div>
        <p className="relative text-sm text-white/45">Loading…</p>
      </main>
    );
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
          Almost there
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-[-0.03em] text-gradient-subtle">
          Complete Your Profile
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Claim a username and add a profile picture to finish setting up.
        </p>

        {avatarUrl ? (
          <div className="mt-6 flex justify-center">
            {/* External avatar URLs — next/image domains TBD */}
            <img
              src={avatarUrl}
              alt="Profile preview"
              className="h-20 w-20 rounded-full border border-strong object-cover ring-2 ring-accent-cyan/40 shadow-glow-cyan"
            />
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="block">
            <span className={labelClass}>Claim your Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="nocturne"
              autoComplete="username"
              autoFocus
              required
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Profile Picture URL</span>
            <input
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://…"
              className={fieldClass}
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          ) : null}

          <motion.button
            type="submit"
            disabled={pending}
            whileHover={pending ? undefined : hoverLift}
            whileTap={pending ? undefined : tapPress}
            className="btn-primary mt-2"
          >
            {pending ? "Saving…" : "Continue to Dashboard"}
          </motion.button>
        </form>
      </GlassPanel>
    </main>
  );
}
