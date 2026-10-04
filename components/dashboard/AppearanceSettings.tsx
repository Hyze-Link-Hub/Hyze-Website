"use client";

import GlassPanel from "@/components/GlassPanel";
import { avatarInitials } from "@/lib/avatar";
import { hoverLift, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import type { ProfileTheme } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import { Lock, Music, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type DragEvent, type ReactNode } from "react";

const fonts: { value: string; label: string }[] = [
  { value: "sans", label: "Inter" },
  { value: "serif", label: "Playfair Display" },
  { value: "mono", label: "Space Mono" },
];

const backgroundTypes: { value: ProfileTheme["background_type"]; label: string }[] = [
  { value: "color", label: "Solid Color" },
  { value: "media", label: "Image/Video (Pro)" },
  { value: "live_sync", label: "Live Sync" },
];

const priorities: { value: ProfileTheme["live_sync_priority"]; label: string }[] = [
  { value: "spotify", label: "React to Spotify First" },
  { value: "discord", label: "React to Discord First" },
];

const fieldClass =
  "field-input";

const labelClass =
  "field-label";

const panelClass =
  "relative overflow-hidden rounded-[28px] p-4 shadow-glass sm:p-5";

function hexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#0a0a0a";
}

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function LockedProPlaceholders() {
  return (
    <div className="mt-5 grid gap-3">
      {(
        [
          {
            title: "Custom background",
            detail: "Image and video backgrounds for your public page.",
            icon: Upload,
          },
          {
            title: "Profile audio",
            detail: "A soundtrack that plays on your public page.",
            icon: Music,
          },
        ] as const
      ).map(({ title, detail, icon: Icon }) => (
        <div
          key={title}
          className="rounded-2xl border border-dashed border-accent-cyan/30 bg-surface-base/50 px-4 py-4 opacity-80"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/35 bg-amber-300/10 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.3)]">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                {title}
                <Lock className="h-3.5 w-3.5 text-white/45" strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">Locked</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/40">{detail}</p>
            </div>
          </div>
        </div>
      ))}
      <motion.div whileHover={hoverLift} whileTap={tapPress}>
        <Link href="/pricing" className="btn-primary w-full">
          Locked - Upgrade to Pro
        </Link>
      </motion.div>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <GlassPanel className={panelClass}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(54,214,255,0.08),transparent_60%)]" aria-hidden="true" />
      <div className="relative">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs text-white/40">{hint}</p>
        {children}
      </div>
    </GlassPanel>
  );
}

export default function AppearanceSettings() {
  const avatarInput = useRef<HTMLInputElement>(null);
  const profile = useProfileStore((state) => state.profile);
  const updateProfileLocally = useProfileStore((state) => state.updateProfileLocally);
  const uploadAvatar = useProfileStore((state) => state.uploadAvatar);
  const syncFromDiscord = useProfileStore((state) => state.syncFromDiscord);
  const [avatarStatus, setAvatarStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const theme = profile.theme;
  const initials = avatarInitials(profile.title || profile.username);

  function updateTheme(partial: Partial<ProfileTheme>) {
    updateProfileLocally({ theme: { ...theme, ...partial } });
  }

  async function setAvatarFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarStatus("uploading");
    try {
      await uploadAvatar(file);
      setAvatarStatus("idle");
    } catch {
      setAvatarStatus("error");
    }
  }

  async function uploadMedia(file: File) {
    if (!profile.is_premium) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setUploadError("Choose an image or video file.");
      return;
    }
    if (!profile.id) {
      setUploadError("Your profile is still loading.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const path = `${profile.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("backgrounds").upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from("backgrounds").getPublicUrl(path);
      const current = useProfileStore.getState().profile.theme;
      updateProfileLocally({
        theme: {
          ...current,
          background_type: isVideo ? "video" : "image",
          background_value: data.publicUrl,
          live_sync_enabled: false,
        },
      });
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function onMediaDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadMedia(file);
  }

  async function handleDiscordSync() {
    setIsSyncing(true);
    setSyncError(null);
    try {
      await syncFromDiscord(createClient());
    } catch (cause) {
      setSyncError(cause instanceof Error ? cause.message : "Discord sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Identity" hint="Avatar, name, and bio on your public page.">
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="group relative h-28 w-28 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white via-accent-ice to-accent-cyan p-[2px] shadow-[0_0_32px_-10px_rgba(54,214,255,0.7)]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface-raised">
                {profile.avatar_url ? (
                  <span
                    role="img"
                    aria-label="Profile image preview"
                    className="block h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${profile.avatar_url}")` }}
                  />
                ) : (
                  <span className="font-mono text-2xl font-bold tracking-wide text-accent-ice">
                    {initials}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={avatarStatus === "uploading"}
              onClick={() => avatarInput.current?.click()}
              className="absolute inset-x-1.5 bottom-1.5 rounded-full border border-strong bg-surface-base/75 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md outline-none transition hover:border-accent-cyan/50 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60 disabled:cursor-wait disabled:opacity-60"
            >
              {avatarStatus === "uploading" ? "Uploading…" : "Change Image"}
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                void setAvatarFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {avatarStatus === "error" ? (
              <p role="alert" className="absolute -bottom-6 inset-x-0 text-center text-[11px] text-rose-300">
                Upload failed
              </p>
            ) : null}
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-3">
            <label className="block">
              <span className={labelClass}>Display Name</span>
              <input
                value={profile.title}
                onChange={(event) => updateProfileLocally({ title: event.target.value })}
                placeholder="NOCTURNE"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Bio</span>
              <input
                value={profile.bio}
                onChange={(event) => updateProfileLocally({ bio: event.target.value })}
                placeholder="Creator • FPS Editor"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <div>
              <motion.button
                type="button"
                onClick={() => void handleDiscordSync()}
                disabled={isSyncing}
                whileHover={hoverLift}
                whileTap={tapPress}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-subtle bg-surface-overlay/70 px-4 text-xs font-medium text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md outline-none transition-colors hover:border-[#5865F2]/60 hover:text-white focus-visible:ring-2 focus-visible:ring-accent-ice/60 disabled:cursor-wait disabled:opacity-60"
              >
                {isSyncing ? (
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-white"
                    aria-hidden="true"
                  />
                ) : (
                  <DiscordMark />
                )}
                {isSyncing ? "Syncing..." : "Sync from Discord"}
              </motion.button>
              {syncError ? (
                <p role="alert" className="mt-2 text-[11px] text-rose-300">
                  {syncError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Typography" hint="Typeface used across your public page.">
        <label className="mt-5 block">
          <span className={labelClass}>Font</span>
          <select
            value={theme.font === "serif" || theme.font === "mono" ? theme.font : "sans"}
            onChange={(event) => updateTheme({ font: event.target.value })}
            className={fieldClass}
          >
            {fonts.map(({ value, label }) => (
              <option key={value} value={value} className="bg-surface-raised text-white">
                {label}
              </option>
            ))}
          </select>
        </label>
      </Panel>

      <Panel title="Background" hint="Solid color, media, or a live sync wash.">
        <label className="mt-5 block">
          <span className={labelClass}>Background Type</span>
          <select
            value={
              theme.background_type === "image" ||
              theme.background_type === "video" ||
              theme.background_type === "media"
                ? "media"
                : theme.background_type
            }
            onChange={(event) => {
              const choice = event.target.value;
              if (choice === "media") {
                if (!profile.is_premium) return;
                if (theme.background_type === "image" || theme.background_type === "video") return;
                updateTheme({ background_type: "media", live_sync_enabled: false });
                return;
              }
              const background_type = choice as ProfileTheme["background_type"];
              const nextValue = /^#[0-9a-fA-F]{6}$/.test(theme.background_value)
                ? theme.background_value
                : "#0a0a0a";
              updateTheme({
                background_type,
                live_sync_enabled: background_type === "live_sync",
                background_value:
                  background_type === "color" ? nextValue : theme.background_value,
              });
            }}
            className={fieldClass}
          >
            {backgroundTypes.map(({ value, label }) => (
              <option
                key={value}
                value={value}
                disabled={value === "media" && !profile.is_premium}
                className="bg-surface-raised text-white"
              >
                {label}
              </option>
            ))}
          </select>
        </label>

        {theme.background_type === "color" ? (
          <label className="mt-5 flex items-center justify-between gap-4">
            <span className="label-mono text-white/40">
              Color
            </span>
            <input
              type="color"
              value={hexColor(theme.background_value)}
              onChange={(event) => updateTheme({ background_value: event.target.value })}
              aria-label="Background color"
              className="h-11 w-16 cursor-pointer rounded-full border border-subtle bg-surface-base/70 p-1 transition hover:border-strong"
            />
          </label>
        ) : null}

        {profile.is_premium &&
        (theme.background_type === "media" ||
          theme.background_type === "image" ||
          theme.background_type === "video") ? (
          <div className="mt-5">
            <p className={labelClass}>Background media</p>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                if (!isUploading) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onMediaDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center outline-none transition focus-within:border-accent-cyan/60 focus-within:shadow-[0_0_22px_-6px_rgba(54,214,255,0.6)] ${
                dragOver
                  ? "border-accent-cyan/70 bg-accent-cyan/10"
                  : "border-strong bg-surface-base/50 hover:border-accent-cyan/40"
              } ${isUploading ? "pointer-events-none" : ""}`}
            >
              <input
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadMedia(file);
                  event.target.value = "";
                }}
              />
              {isUploading ? (
                <>
                  <span
                    className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white"
                    aria-hidden="true"
                  />
                  <span className="mt-3 text-sm font-medium text-white">Uploading…</span>
                </>
              ) : (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-ice shadow-glow-cyan">
                    <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="mt-3 text-sm font-medium text-white">
                    Drop an image or video
                  </span>
                  <span className="label-mono mt-1 text-white/35">PNG, JPG, WEBP, GIF, or MP4</span>
                </>
              )}
            </label>
            {uploadError ? (
              <p role="alert" className="mt-2 text-[11px] text-rose-300">
                {uploadError}
              </p>
            ) : null}
          </div>
        ) : null}

        {theme.background_type === "live_sync" ? (
          <fieldset className="mt-5">
            <legend className={labelClass}>Priority</legend>
            <div
              role="radiogroup"
              aria-label="Live sync priority"
              className="flex rounded-full border border-subtle bg-surface-base/70 p-1"
            >
              {priorities.map(({ value, label }) => {
                const selected = theme.live_sync_priority === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateTheme({ live_sync_priority: value })}
                    className={`min-w-0 flex-1 rounded-full px-3 py-2 text-center text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 sm:text-sm ${
                      selected
                        ? "bg-accent-cyan/20 text-white shadow-glow-cyan"
                        : "text-white/45 hover:text-white/75"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {!profile.is_premium ? <LockedProPlaceholders /> : null}
      </Panel>
    </div>
  );
}
