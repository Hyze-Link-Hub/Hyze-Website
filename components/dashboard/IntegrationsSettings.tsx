"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function IntegrationsSettings() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfileLocally = useProfileStore((state) => state.updateProfileLocally);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectDiscord() {
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (linkError) {
      setError(linkError.message);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
    <GlassPanel className="relative overflow-hidden rounded-[28px] p-4 shadow-glass sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(54,214,255,0.08),transparent_60%)]" aria-hidden="true" />
      <div className="relative">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Discord
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Show what you&apos;re doing in Discord on your public page.
        </p>

        {profile.discord_id ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Show Live Discord Status</p>
                <p className="mt-1 text-xs text-white/40">
                  {profile.show_discord_status
                    ? "On — visitors see your live status."
                    : "Off — your status stays hidden."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.show_discord_status}
                aria-label="Show Live Discord Status"
                onClick={() =>
                  updateProfileLocally({ show_discord_status: !profile.show_discord_status })
                }
                className={`relative h-7 w-12 shrink-0 rounded-full border outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
                  profile.show_discord_status
                    ? "border-accent-cyan/50 bg-accent-cyan/25 shadow-glow-cyan"
                    : "border-subtle bg-surface-base/70 hover:border-strong"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition ${
                    profile.show_discord_status ? "translate-x-5" : "translate-x-0"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              Note: You must be in the Lanyard Discord server (discord.gg/lanyard) for your live
              status to display.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <motion.button
              type="button"
              onClick={() => void connectDiscord()}
              disabled={pending}
              whileHover={pending ? undefined : hoverLift}
              whileTap={pending ? undefined : tapPress}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#5865F2]/85 px-6 text-sm font-bold tracking-tight text-white shadow-[0_0_40px_-10px_rgba(88,101,242,0.8)] ring-1 ring-white/25 ring-inset outline-none transition-colors hover:bg-[#5865F2] focus-visible:ring-2 focus-visible:ring-[#8ea1ff]/70 disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Connecting…" : "Connect Discord"}
            </motion.button>
            {error ? (
              <p role="alert" className="mt-3 text-sm text-rose-300">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </GlassPanel>

    <GlassPanel className="relative overflow-hidden rounded-[28px] p-4 shadow-glass sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(54,214,255,0.08),transparent_60%)]" aria-hidden="true" />
      <div className="relative">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Last.fm
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Used when Discord isn&apos;t showing a Spotify track.
        </p>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Enable Last.fm Fallback</p>
            <p className="mt-1 text-xs text-white/40">
              {profile.show_lastfm
                ? "On — Last.fm can fill in when Discord has no Spotify track."
                : "Off — Last.fm stays hidden."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile.show_lastfm}
            aria-label="Enable Last.fm Fallback"
            onClick={() => updateProfileLocally({ show_lastfm: !profile.show_lastfm })}
            className={`relative h-7 w-12 shrink-0 rounded-full border outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
              profile.show_lastfm
                ? "border-accent-cyan/50 bg-accent-cyan/25 shadow-glow-cyan"
                : "border-subtle bg-surface-base/70 hover:border-strong"
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition ${
                profile.show_lastfm ? "translate-x-5" : "translate-x-0"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
        {profile.show_lastfm ? (
          <>
            <label className="mt-5 block">
              <span className="field-label">
                Last.fm Username
              </span>
              <input
                value={profile.lastfm_username ?? ""}
                onChange={(event) =>
                  updateProfileLocally({ lastfm_username: event.target.value || null })
                }
                placeholder="yourname"
                autoComplete="off"
                spellCheck={false}
                className="field-input"
              />
            </label>
            <p className="mt-2 text-xs text-white/45">
              Note: Direct Spotify integration is planned for next year! For now, connect your
              Last.fm username to display your live Spotify activity if you do not use Discord.
            </p>
          </>
        ) : null}
      </div>
    </GlassPanel>
    </div>
  );
}
