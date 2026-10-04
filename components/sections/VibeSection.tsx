"use client";

import DiscordStatus from "@/components/DiscordStatus";
import LiveStatus from "@/components/LiveStatus";
import ProfileBadges from "@/components/ProfileBadges";
import SpotifyStatus from "@/components/SpotifyStatus";
import ProfileCard from "@/components/ProfileCard";
import ScrollHint from "@/components/ScrollHint";
import SocialIcons, { type SocialLink } from "@/components/SocialIcons";
import ViewCounter from "@/components/ViewCounter";
import type { AwardedBadgeWithBadge } from "@/lib/badges";
import type { Json } from "@/types/supabase";
import { cinematicReveal, hoverLift, inViewViewport, tapPress } from "@/lib/motion";
import { motion } from "framer-motion";

function recordLinkClick(linkId: string) {
  void fetch("/api/links/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link_id: linkId }),
    keepalive: true,
  });
}

export type VibeProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  initials: string;
  avatarUrl: string | null;
  awardedBadges: AwardedBadgeWithBadge[];
  showBadges: boolean;
  views: number;
  discordId?: string | null;
  musicDiscordId?: string | null;
  lastfmUsername?: string | null;
  socialLinks?: SocialLink[];
  links?: { id: string; title: string; href: string; subtitle?: string | null }[];
  live_status?: Json | null;
};

type VibeSectionProps = {
  profile: VibeProfile;
};

export default function VibeSection({ profile }: VibeSectionProps) {
  return (
    <section
      id="vibe"
      className="relative flex h-screen w-full snap-center flex-col justify-center px-4 py-16 sm:px-6"
      aria-label="The Vibe"
    >
      <motion.div
        className="mx-auto flex w-full max-w-md flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewViewport}
        variants={cinematicReveal}
      >
        <ProfileCard
          username={profile.username}
          displayName={profile.displayName}
          bio={profile.bio}
          initials={profile.initials}
          avatarUrl={profile.avatarUrl}
        >
          {profile.showBadges ? (
            <ProfileBadges badges={profile.awardedBadges} placement="showcase" />
          ) : null}
          {profile.discordId ? <DiscordStatus discordId={profile.discordId} /> : null}
          <SpotifyStatus
            discordId={profile.musicDiscordId}
            lastfmUsername={profile.lastfmUsername}
          />
          <ViewCounter count={profile.views} />
          <SocialIcons links={profile.socialLinks} trackClicks />
          <LiveStatus initialLiveStatus={profile.live_status} profileId={profile.id} />
          {profile.links && profile.links.length > 0 ? (
            <ul className="flex w-full flex-col gap-2">
              {profile.links.map((link) => (
                <li key={link.id}>
                  <motion.a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => recordLinkClick(link.id)}
                    whileHover={hoverLift}
                    whileTap={tapPress}
                    className={`flex flex-col items-center justify-center rounded-full border border-subtle bg-surface-raised/60 px-4 text-sm font-medium tracking-tight text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none backdrop-blur-2xl transition-[border-color,color,box-shadow] hover:border-accent-cyan/40 hover:text-white hover:shadow-glow-cyan focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
                      link.subtitle ? "min-h-11 py-1.5" : "h-11"
                    }`}
                  >
                    <span>{link.title}</span>
                    {link.subtitle ? (
                      <span className="max-w-full truncate text-xs font-normal leading-tight text-white/45">
                        {link.subtitle}
                      </span>
                    ) : null}
                  </motion.a>
                </li>
              ))}
            </ul>
          ) : null}
          {profile.showBadges ? (
            <ProfileBadges badges={profile.awardedBadges} placement="trophy" />
          ) : null}
        </ProfileCard>
      </motion.div>

      <ScrollHint targetId="hub" />
    </section>
  );
}
