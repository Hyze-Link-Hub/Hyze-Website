"use client";

import { useNowPlayingArt } from "@/components/DynamicBackground";
import { hoverLift } from "@/lib/motion";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type NowPlaying = {
  song: string;
  artist: string;
  albumArtUrl: string;
};

type LanyardSpotify = {
  song?: string;
  artist?: string;
  album_art_url?: string;
};

type LastFmNowPlaying = {
  isPlaying?: boolean;
  song?: string;
  artist?: string;
  albumArtUrl?: string;
};

async function fromLanyard(discordId: string): Promise<NowPlaying | null> {
  const response = await fetch(
    `https://api.lanyard.rest/v1/users/${encodeURIComponent(discordId)}`,
  );
  if (!response.ok) return null;

  const body = (await response.json()) as { data?: { spotify?: LanyardSpotify | null } };
  const spotify = body.data?.spotify;
  if (!spotify?.song) return null;

  return {
    song: spotify.song,
    artist: spotify.artist ?? "",
    albumArtUrl: spotify.album_art_url ?? "",
  };
}

async function fromLastFm(username: string): Promise<NowPlaying | null> {
  const response = await fetch(
    `/api/music/now-playing?username=${encodeURIComponent(username)}`,
  );
  if (!response.ok) return null;

  const body = (await response.json()) as LastFmNowPlaying;
  if (!body.isPlaying || !body.song) return null;

  return {
    song: body.song,
    artist: body.artist ?? "",
    albumArtUrl: body.albumArtUrl ?? "",
  };
}

async function resolveNowPlaying(
  discordId: string | null | undefined,
  lastfmUsername: string | null | undefined,
): Promise<NowPlaying | null> {
  if (discordId) {
    try {
      const lanyard = await fromLanyard(discordId);
      if (lanyard) return lanyard;
    } catch {
      // Lanyard is unavailable; fall through to Last.fm.
    }
  }

  const username = lastfmUsername?.trim();
  if (username) {
    try {
      const lastfm = await fromLastFm(username);
      if (lastfm) return lastfm;
    } catch {
      // Last.fm is unavailable.
    }
  }

  return null;
}

export default function SpotifyStatus({
  discordId,
  lastfmUsername,
  onImageUrl,
}: {
  discordId?: string | null;
  lastfmUsername?: string | null;
  onImageUrl?: (url: string | null) => void;
}) {
  const [track, setTrack] = useState<NowPlaying | null>(null);
  const art = useNowPlayingArt();

  useEffect(() => {
    let active = true;

    let requestId = 0;

    async function load() {
      const id = ++requestId;
      const next = await resolveNowPlaying(discordId, lastfmUsername);
      if (active && id === requestId) setTrack(next);
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [discordId, lastfmUsername]);

  const albumArtUrl = track?.albumArtUrl?.trim() || null;

  useEffect(() => {
    onImageUrl?.(albumArtUrl);
    art?.setSpotifyImageUrl(albumArtUrl);
  }, [albumArtUrl, art, onImageUrl]);

  useEffect(() => {
    return () => {
      onImageUrl?.(null);
      art?.setSpotifyImageUrl(null);
    };
  }, [art, onImageUrl]);

  if (!track) return null;

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(29,185,84,0.3),transparent_68%)] blur-md"
        aria-hidden="true"
      />
      <motion.div
        whileHover={hoverLift}
        className="glass-frost group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 transition-colors duration-300 hover:border-[#1DB954]/35"
      >
        {track.albumArtUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumArtUrl}
            alt=""
            className="h-14 w-14 rounded-xl object-cover shadow-[0_8px_16px_-6px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
          />
        ) : null}
        <div className="min-w-0 flex-1 text-left">
          <p className="label-mono animate-pulse text-[#1DB954]">NOW PLAYING</p>
          <p className="truncate font-bold tracking-tight text-white">{track.song}</p>
          <p className="truncate text-sm text-white/50">{track.artist}</p>
        </div>
      </motion.div>
    </div>
  );
}
