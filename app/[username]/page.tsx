import DynamicBackground from "@/components/DynamicBackground";
import GlassPanel from "@/components/GlassPanel";
import HazyWatermark from "@/components/HazyWatermark";
import RecordView from "@/components/RecordView";
import ScrollSnapShell from "@/components/ScrollSnapShell";
import HubSection from "@/components/sections/HubSection";
import VibeSection from "@/components/sections/VibeSection";
import { channelVisual } from "@/lib/channels";
import { avatarInitials } from "@/lib/avatar";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

const navSections = [
  { id: "vibe", label: "The Vibe" },
  { id: "hub", label: "The Hub" },
];

function externalHref(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", username)
    .maybeSingle();

  const displayName = data?.display_name?.trim() || data?.username || username;
  const description = data?.bio?.trim() || `Check out ${displayName} on Hazy.`;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const ogUrl = `${baseUrl}/api/og?username=${encodeURIComponent(username)}`;

  return {
    title: `${displayName} — Hazy`,
    description,
    openGraph: {
      title: displayName,
      description,
      images: [ogUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: displayName,
      description,
      images: [ogUrl],
    },
  };
}

export default async function ProfilePage({ params }: PageProps<"/[username]">) {
  const { username } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "*, links(*), awarded_badges(*, badges(*)), videos(*), channels(*)",
    )
    .eq("username", username)
    .order("order_index", { ascending: true, referencedTable: "links" })
    .order("order_index", { ascending: true, referencedTable: "awarded_badges" })
    .single();

  if (!data) {
    const missing = !error || error.code === "PGRST116";

    if (!missing) {
      return (
        <main className="relative flex h-full min-h-full items-center justify-center px-6">
          <GlassPanel className="relative w-full max-w-md rounded-[28px] px-8 py-12 text-center shadow-glass">
            <p className="label-mono text-white/60">This profile could not be loaded.</p>
          </GlassPanel>
        </main>
      );
    }

    return (
      <main className="relative flex h-full min-h-full items-center justify-center overflow-hidden px-6">
        <div className="starfield" aria-hidden="true">
          <div className="starfield__glow" />
          <div className="starfield__stars starfield__stars--far" />
          <div className="starfield__stars starfield__stars--near" />
          <div className="starfield__dust" />
        </div>
        <GlassPanel className="relative w-full max-w-md rounded-[28px] px-8 py-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_80px_-30px_rgba(54,214,255,0.5)]">
          <p className="label-mono mb-4 text-accent-cyan/70">Unclaimed</p>
          <p className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-[-0.03em] text-white">
            This profile isn&apos;t claimed yet —{" "}
            <Link
              href="/login"
              className="text-gradient-brand outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-ice/60"
            >
              claim it for yourself
            </Link>
          </p>
        </GlassPanel>
      </main>
    );
  }

  const displayName = data.display_name?.trim() || data.username;
  const links = [...data.links].sort((a, b) => a.order_index - b.order_index);
  const socialLinks = links
    .filter((link) => link.is_social)
    .map((link) => ({
      id: link.id,
      label: link.title,
      href: externalHref(link.url),
    }));
  const pillLinks = links
    .filter((link) => !link.is_social)
    .map((link) => ({
      id: link.id,
      title: link.title,
      href: externalHref(link.url),
      subtitle: link.subtitle?.trim() || null,
    }));

  const uploads = (data.videos ?? []).map((video) => ({
    id: video.id,
    title: video.title,
    views: video.views_text ?? "",
    duration: video.duration ?? "",
    href: externalHref(video.url),
    thumbnailUrl: video.thumbnail_url,
  }));

  const stats = (data.channels ?? []).map((channel) => {
    const visual = channelVisual(channel.platform);
    return {
      id: channel.id,
      platform: channel.platform,
      handle: channel.handle,
      followers: channel.followers_text ?? "",
      href: externalHref(channel.url),
      icon: visual.icon,
      accent: visual.accent,
    };
  });

  const profile = {
    id: data.id,
    username: data.username,
    displayName,
    bio: data.bio ?? "",
    initials: avatarInitials(displayName),
    avatarUrl: data.avatar_url,
    awardedBadges: data.awarded_badges ?? [],
    showBadges: data.show_badges,
    views: data.views ?? 0,
    discordId: data.show_discord_status && data.discord_id ? data.discord_id : null,
    musicDiscordId: data.discord_id,
    lastfmUsername: data.show_lastfm ? data.lastfm_username : null,
    socialLinks,
    links: pillLinks,
    live_status: data.live_status,
  };

  const fontClass =
    data.theme.font === "serif" ? "font-serif" : data.theme.font === "mono" ? "font-mono" : "font-sans";

  const hideWatermark = data.is_premium === true && data.hide_branding === true;

  return (
    <div className={fontClass}>
      <RecordView profileId={data.id} />
      <DynamicBackground
        theme={data.theme}
        spotifyImageUrl={null}
        discordImageUrl={null}
      >
        <ScrollSnapShell sections={navSections} profileId={data.id}>
          <VibeSection profile={profile} />
          <HubSection uploads={uploads} stats={stats} />
        </ScrollSnapShell>
        {!hideWatermark ? <HazyWatermark username={data.username} /> : null}
      </DynamicBackground>
    </div>
  );
}
