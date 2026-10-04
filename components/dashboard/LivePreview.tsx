"use client";

import { AnimatePresence, motion } from "framer-motion";
import DynamicBackground from "@/components/DynamicBackground";
import DiscordStatus from "@/components/DiscordStatus";
import LiveStatus from "@/components/LiveStatus";
import ProfileBadges from "@/components/ProfileBadges";
import ProMark from "@/components/dashboard/ProMark";
import SpotifyStatus from "@/components/SpotifyStatus";
import { avatarInitials } from "@/lib/avatar";
import { useProfileStore } from "@/lib/store/useProfileStore";
import SocialIcons from "@/components/SocialIcons";
import ViewCounter from "@/components/ViewCounter";
import { channelVisual } from "@/lib/channels";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  Gamepad2,
  Monitor,
  Play,
  Radio,
  RefreshCw,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type PreviewMode = "mobile" | "desktop";

const modes: { id: PreviewMode; label: string; icon: typeof Smartphone }[] = [
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "desktop", label: "Desktop", icon: Monitor },
];

const springTransition = { type: "spring" as const, bounce: 0.15, duration: 0.5 };

const channelIcons = {
  clapperboard: Clapperboard,
  radio: Radio,
  gamepad: Gamepad2,
} as const;

function externalHref(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function DeviceToggle({
  mode,
  onChange,
}: {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Preview device"
      className="mt-4 flex rounded-full border border-subtle bg-surface-base/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
    >
      {modes.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
              active
                ? "bg-accent-cyan/20 text-white shadow-glow-cyan ring-1 ring-accent-cyan/50 ring-inset"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function MobileStatusBar() {
  return (
    <div className="relative flex items-center justify-between px-5 pt-2.5 text-[10px] font-medium text-white/80">
      <span>9:41</span>
      <span className="absolute left-1/2 top-2 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" />
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
        <span className="h-[7px] w-4 rounded-[2px] border border-white/50 p-px">
          <span className="block h-full w-2/3 rounded-[1px] bg-white/80" />
        </span>
      </span>
    </div>
  );
}

function DesktopBrowserBar({ username }: { username: string }) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.06] px-3 backdrop-blur-2xl">
      <div className="flex items-center gap-0.5 text-white/40">
        <span className="flex h-7 w-7 items-center justify-center rounded-md" aria-hidden="true">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md" aria-hidden="true">
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 justify-center px-1">
        <div className="flex h-7 w-full max-w-[240px] items-center justify-center truncate rounded-full border border-white/10 bg-white/[0.08] px-3 text-[11px] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          rift.lol/{username}
        </div>
      </div>

      <span className="flex h-7 w-7 items-center justify-center rounded-md text-white/40" aria-hidden="true">
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
    </header>
  );
}

function PreviewContent({ mode }: { mode: PreviewMode }) {
  const profile = useProfileStore((state) => state.profile);
  const [spotifyImageUrl, setSpotifyImageUrl] = useState<string | null>(null);
  const [discordImageUrl, setDiscordImageUrl] = useState<string | null>(null);
  const links = useProfileStore((state) => state.links);
  const awardedBadges = useProfileStore((state) => state.awardedBadges);
  const videos = useProfileStore((state) => state.videos);
  const channels = useProfileStore((state) => state.channels);
  const isDesktop = mode === "desktop";
  const initials = avatarInitials(profile.title || profile.username);

  const orderedLinks = [...links].sort((a, b) => a.order_index - b.order_index);
  const socialLinks = orderedLinks
    .filter((link) => link.is_social)
    .map((link) => ({
      id: link.id,
      label: link.title,
      href: externalHref(link.url),
    }));
  const pillLinks = orderedLinks.filter((link) => !link.is_social);
  const fontClass =
    profile.theme.font === "serif"
      ? "font-serif"
      : profile.theme.font === "mono"
        ? "font-mono"
        : "font-sans";

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${fontClass}`}>
    <DynamicBackground
      theme={profile.theme}
      spotifyImageUrl={spotifyImageUrl}
      discordImageUrl={discordImageUrl}
    >
    <div className="relative min-h-0 flex-1 overflow-hidden bg-transparent">
      <div
        className={`relative w-full h-full overflow-y-auto flex flex-col items-center ${
          isDesktop ? "pt-12" : "pt-4 pb-8"
        }`}
      >
        <div
          className={`relative w-full border border-white/10 bg-white/[0.05] px-3.5 pb-3.5 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_40px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl ${
            isDesktop
              ? "max-w-xs rounded-[28px]"
              : "mx-4 max-w-[calc(100%-2rem)] rounded-[22px]"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white via-accent-ice to-accent-cyan p-[1.5px] shadow-[0_0_24px_-8px_rgba(54,214,255,0.7)]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface-raised text-sm font-bold text-white/90">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-raised bg-accent-cyan shadow-[0_0_8px_var(--accent-cyan)]" />
            </div>

            <p className="mt-2 text-sm font-bold tracking-tight text-white">
              {profile.title}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-[10px] text-white/40">
              <span>@{profile.username}</span>
              {profile.is_premium ? <ProMark /> : null}
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-white/55">
              {profile.bio}
            </p>

            {profile.show_badges &&
            awardedBadges.some((award) => award.is_equipped && award.is_pinned && award.badges) ? (
              <div className="mt-2 w-full">
                <ProfileBadges badges={awardedBadges} placement="showcase" compact />
              </div>
            ) : null}

            {profile.show_discord_status && profile.discord_id ? (
              <div className="mt-2 w-full">
                <DiscordStatus
                  discordId={profile.discord_id}
                  onImageUrl={setDiscordImageUrl}
                />
              </div>
            ) : null}
            <div className="mt-2 w-full empty:hidden">
              <SpotifyStatus
                discordId={profile.discord_id}
                lastfmUsername={profile.show_lastfm ? profile.lastfm_username : null}
                onImageUrl={setSpotifyImageUrl}
              />
            </div>

            <div className="mt-2 scale-90">
              <ViewCounter count={profile.views} />
            </div>
          </div>

          {socialLinks.length > 0 ? (
            <div className="mt-2.5 scale-90">
              <SocialIcons links={socialLinks} />
            </div>
          ) : null}

          <div className="mt-2.5 w-full empty:mt-0 empty:hidden">
            <LiveStatus initialLiveStatus={profile.live_status} profileId={profile.id ?? ""} />
          </div>

          {pillLinks.length > 0 ? (
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {pillLinks.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[10px] font-medium text-white/80"
                >
                  <Radio
                    className="h-3 w-3 shrink-0 text-accent-ice/80"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 text-center">
                    <span className="block truncate">{link.title}</span>
                    {link.subtitle ? (
                      <span className="block truncate text-[8px] font-normal leading-tight text-white/45">
                        {link.subtitle}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {profile.show_badges &&
          awardedBadges.some((award) => award.is_equipped && !award.is_pinned && award.badges) ? (
            <div className="mt-2.5">
              <ProfileBadges badges={awardedBadges} placement="trophy" compact />
            </div>
          ) : null}
        </div>

        {(videos.length > 0 || channels.length > 0) && (
          <div
            className={`mt-4 w-full space-y-3 px-4 pb-4 ${
              isDesktop ? "max-w-sm" : "max-w-[calc(100%-2rem)]"
            }`}
          >
            <p className="text-center text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
              Mini site
            </p>

            {videos.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {videos.map((video) => (
                  <li
                    key={video.id}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2"
                  >
                    <span className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-orange-500/40 to-slate-900">
                      {video.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={video.thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Play className="h-3 w-3 fill-white/70 text-white/70" strokeWidth={0} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-white/85">
                        {video.title}
                      </p>
                      <p className="flex items-center gap-1 text-[9px] text-white/40">
                        {video.views_text ? (
                          <>
                            <Eye className="h-2.5 w-2.5" strokeWidth={1.75} />
                            {video.views_text}
                          </>
                        ) : null}
                        {video.duration ? (
                          <span className="text-white/30">
                            {video.views_text ? " · " : ""}
                            {video.duration}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {channels.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {channels.map((channel) => {
                  const visual = channelVisual(channel.platform);
                  const Icon: LucideIcon = channelIcons[visual.icon];
                  return (
                    <li
                      key={channel.id}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-base/60 ${visual.accent}`}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-medium text-white/85">
                          {channel.platform}
                        </p>
                        <p className="truncate text-[9px] text-white/40">
                          {channel.handle}
                          {channel.followers_text
                            ? ` · ${channel.followers_text}`
                            : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        )}
      </div>

      {!isDesktop && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/50" />
      )}
    </div>
    </DynamicBackground>
    </div>
  );
}

function MorphingDeviceFrame({ mode }: { mode: PreviewMode }) {
  const username = useProfileStore((state) => state.profile.username);
  const isMobile = mode === "mobile";

  return (
    <motion.div
      layout
      transition={springTransition}
      className={`relative flex shrink-0 flex-col shadow-[0_40px_80px_-28px_rgba(0,0,0,0.9)] ${
        isMobile
          ? "aspect-[9/19] w-[300px] overflow-hidden rounded-[2.75rem] border border-strong bg-surface-base shadow-glass"
          : "aspect-video w-[480px] overflow-hidden rounded-2xl border border-strong bg-surface-base shadow-glass"
      }`}
    >
      <div className="relative z-10 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {isMobile ? (
            <motion.div
              key="mobile-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MobileStatusBar />
            </motion.div>
          ) : (
            <motion.div
              key="desktop-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DesktopBrowserBar username={username} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PreviewContent mode={mode} />
    </motion.div>
  );
}

export default function LivePreview() {
  const [mode, setMode] = useState<PreviewMode>("mobile");

  return (
    <aside className="dashboard-scroll relative sticky top-0 hidden h-full w-[520px] min-h-0 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l border-subtle bg-surface-raised/70 backdrop-blur-2xl lg:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(54,214,255,0.12),transparent_70%)]" />

      <div className="relative px-6 pb-3 pt-6">
        <p className="label-mono text-accent-cyan/70">
          Device
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
          Live Preview
        </h2>
        <DeviceToggle mode={mode} onChange={setMode} />
      </div>

      <div className="relative flex min-w-0 flex-1 items-start justify-center overflow-x-hidden px-5 pb-8 pt-2">
        <MorphingDeviceFrame mode={mode} />
      </div>
    </aside>
  );
}
