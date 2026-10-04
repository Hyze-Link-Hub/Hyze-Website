"use client";

import { useNowPlayingArt } from "@/components/DynamicBackground";
import { hoverLift } from "@/lib/motion";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type DiscordPresence = "online" | "idle" | "dnd";

type LanyardEmoji = {
  id?: string | null;
  name?: string | null;
  animated?: boolean;
};

type LanyardActivity = {
  type?: number;
  name?: string;
  application_id?: string;
  details?: string | null;
  state?: string | null;
  emoji?: LanyardEmoji | null;
  assets?: {
    large_image?: string | null;
  } | null;
};

type LiveStatus = {
  presence: DiscordPresence;
  kicker: string;
  title: string;
  detail: string | null;
  artworkUrl: string | null;
  emoji: LanyardEmoji | null;
};

const dotClass: Record<DiscordPresence, string> = {
  online: "bg-green-400",
  idle: "bg-yellow-400",
  dnd: "bg-red-500",
};

const presenceTitle: Record<DiscordPresence, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
};

function presenceFrom(status: string | undefined): DiscordPresence | null {
  if (status === "online" || status === "idle" || status === "dnd") return status;
  return null;
}

function playingActivity(activities: LanyardActivity[] | undefined) {
  return activities?.find((activity) => activity.type === 0 && activity.name?.trim());
}

function customStatusText(activity: LanyardActivity) {
  const state = activity.state?.trim();
  if (state) return state;
  const details = activity.details?.trim();
  if (details) return details;
  const name = activity.name?.trim();
  if (name && name.toLowerCase() !== "custom status") return name;
  return null;
}

function customActivity(activities: LanyardActivity[] | undefined) {
  return activities?.find((activity) => {
    if (activity.type !== 4) return false;
    return Boolean(customStatusText(activity) || activity.emoji?.id || activity.emoji?.name);
  });
}

function artworkUrl(activity: LanyardActivity): string | null {
  const image = activity.assets?.large_image?.trim();
  if (!image) return null;

  // Discord prefixes externally hosted rich-presence art with "mp:".
  if (image.startsWith("mp:")) {
    return `https://media.discordapp.net/${image.slice(3)}`;
  }
  if (/^https?:\/\//i.test(image)) return image;
  if (!activity.application_id) return null;

  return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
}

function subtitle(activity: LanyardActivity) {
  const text = activity.details?.trim() || activity.state?.trim();
  return text || null;
}

function emojiUrl(emoji: LanyardEmoji) {
  if (!emoji.id) return null;
  const extension = emoji.animated ? "gif" : "png";
  return `https://cdn.discordapp.com/emojis/${emoji.id}.${extension}`;
}

function statusFrom(
  presence: DiscordPresence,
  activities: LanyardActivity[] | undefined,
): LiveStatus {
  const visible = activities?.filter((activity) => activity.type !== 2);
  const playing = playingActivity(visible);
  if (playing?.name) {
    return {
      presence,
      kicker: "Playing",
      title: playing.name,
      detail: subtitle(playing),
      artworkUrl: artworkUrl(playing),
      emoji: null,
    };
  }

  const custom = customActivity(visible);
  if (custom) {
    return {
      presence,
      kicker: "Status",
      title: customStatusText(custom) ?? "",
      detail: null,
      artworkUrl: null,
      emoji: custom.emoji ?? null,
    };
  }

  return {
    presence,
    kicker: "Discord Status",
    title: presenceTitle[presence],
    detail: null,
    artworkUrl: null,
    emoji: null,
  };
}

function DiscordMark() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-subtle bg-surface-overlay/70 text-[#5865F2]">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    </span>
  );
}

function StatusTitle({ status }: { status: LiveStatus }) {
  const customEmoji = status.emoji ? emojiUrl(status.emoji) : null;
  const unicodeEmoji = !status.emoji?.id ? status.emoji?.name?.trim() : null;

  return (
    <p className="flex min-w-0 items-center gap-1.5 truncate text-base font-bold tracking-tight text-white">
      {customEmoji ? (
        // Discord custom emoji — next/image remote patterns are not configured.
        <img src={customEmoji} alt="" className="h-4 w-4 shrink-0 object-contain" />
      ) : unicodeEmoji ? (
        <span aria-hidden="true">{unicodeEmoji}</span>
      ) : null}
      {status.title ? <span className="truncate">{status.title}</span> : null}
    </p>
  );
}

export default function DiscordStatus({
  discordId,
  onImageUrl,
}: {
  discordId: string;
  onImageUrl?: (url: string | null) => void;
}) {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [artworkBroken, setArtworkBroken] = useState(false);
  const art = useNowPlayingArt();

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          `https://api.lanyard.rest/v1/users/${encodeURIComponent(discordId)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setStatus(null);
          return;
        }

        const body = (await response.json()) as {
          success?: boolean;
          data?: {
            discord_status?: string;
            activities?: LanyardActivity[];
          };
        };
        const presence = presenceFrom(body.data?.discord_status);
        if (!body.success || !presence) {
          setStatus(null);
          return;
        }

        setArtworkBroken(false);
        setStatus(statusFrom(presence, body.data?.activities));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus(null);
      }
    }

    void load();
    return () => controller.abort();
  }, [discordId]);

  const artwork = status?.artworkUrl && !artworkBroken ? status.artworkUrl : null;

  useEffect(() => {
    onImageUrl?.(artwork);
    art?.setDiscordImageUrl(artwork);
  }, [art, artwork, onImageUrl]);

  useEffect(() => {
    return () => {
      onImageUrl?.(null);
      art?.setDiscordImageUrl(null);
    };
  }, [art, onImageUrl]);

  if (!status) return null;

  const showArtwork = Boolean(status.artworkUrl) && !artworkBroken;
  const ariaLabel = [
    status.kicker,
    status.emoji?.name,
    status.title,
    status.detail,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      whileHover={hoverLift}
      className="glass-frost group relative flex w-full max-w-sm items-center gap-4 overflow-hidden rounded-2xl p-4 transition-colors duration-300 hover:border-strong"
      role="status"
      aria-label={ariaLabel}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(88,101,242,0.1),transparent_58%)]"
        aria-hidden="true"
      />

      <span className="absolute right-3.5 top-3.5 flex h-2.5 w-2.5" aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotClass[status.presence]}`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotClass[status.presence]}`}
        />
      </span>

      {showArtwork ? (
        // Discord CDN artwork — next/image remote patterns are not configured.
        <img
          src={status.artworkUrl ?? undefined}
          alt=""
          className="relative h-14 w-14 shrink-0 rounded-xl object-cover shadow-md transition duration-300 group-hover:scale-[1.04]"
          onError={() => setArtworkBroken(true)}
        />
      ) : (
        <DiscordMark />
      )}

      <div className="relative flex min-h-12 min-w-0 flex-1 flex-col justify-center pr-4 text-left">
        <p className="label-mono text-[#8C95FF]">{status.kicker}</p>
        <StatusTitle status={status} />
        {status.detail ? (
          <p className="truncate text-sm text-white/50">{status.detail}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
