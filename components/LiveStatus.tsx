"use client";

import { hoverLift } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";

type SpotifyLive = {
  albumArt?: string;
  title?: string;
  artist?: string;
};

type GameLive = {
  name?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readSpotify(value: unknown): SpotifyLive | null {
  if (!isRecord(value)) return null;

  const albumArt = readString(value.albumArt);
  const title = readString(value.title) || readString(value.song) || readString(value.name);
  const artist = readString(value.artist);

  if (!albumArt && !title && !artist) return null;
  return { albumArt, title, artist };
}

function readGame(value: unknown): GameLive | null {
  if (!isRecord(value)) return null;
  const name = readString(value.name);
  if (!name) return null;
  return { name };
}

function SpotifyEqualizer() {
  return (
    <span className="live-eq absolute right-3 top-3 flex h-3.5 items-end gap-[3px]" aria-hidden="true">
      <span className="live-eq-bar h-full w-[3px] rounded-full bg-[#1DB954] shadow-[0_0_8px_#1DB954]" />
      <span className="live-eq-bar h-full w-[3px] rounded-full bg-[#1DB954] shadow-[0_0_8px_#1DB954]" />
      <span className="live-eq-bar h-full w-[3px] rounded-full bg-[#1DB954] shadow-[0_0_8px_#1DB954]" />
      <span className="live-eq-bar h-full w-[3px] rounded-full bg-[#1DB954] shadow-[0_0_8px_#1DB954]" />
    </span>
  );
}

export default function LiveStatus({
  initialLiveStatus,
  profileId,
}: {
  initialLiveStatus: any;
  profileId: string;
}) {
  const [liveStatus, setLiveStatus] = useState(initialLiveStatus);

  useEffect(() => {
    if (!profileId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("realtime-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: "id=eq." + profileId,
        },
        (payload) => {
          setLiveStatus(payload.new.live_status);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  if (!isRecord(liveStatus)) return null;

  const spotify = readSpotify(liveStatus.spotify);
  const game = spotify ? null : readGame(liveStatus.game);

  if (spotify) {
    return (
      <motion.div
        whileHover={hoverLift}
        className="relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-subtle bg-surface-raised/60 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_36px_-14px_rgba(29,185,84,0.6)] backdrop-blur-2xl transition-colors hover:border-[#1DB954]/35"
      >
        <div
          className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full bg-[#1DB954]/20 blur-2xl"
          aria-hidden="true"
        />
        {spotify.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spotify.albumArt}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-[0_8px_16px_-6px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-xl bg-surface-overlay shadow-[0_8px_16px_-6px_rgba(0,0,0,0.75)]" />
        )}
        <div className="min-w-0 flex-1 pr-6 text-left">
          <p className="truncate font-bold tracking-tight text-white">{spotify.title}</p>
          <p className="truncate text-sm text-white/50">{spotify.artist}</p>
        </div>
        <SpotifyEqualizer />
      </motion.div>
    );
  }

  if (game) {
    return (
      <motion.div
        whileHover={hoverLift}
        className="relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-subtle bg-surface-raised/60 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_36px_-14px_rgba(54,214,255,0.6)] backdrop-blur-2xl transition-colors hover:border-accent-cyan/35"
      >
        <div
          className="pointer-events-none absolute -left-6 -top-8 h-24 w-24 rounded-full bg-accent-cyan/15 blur-2xl"
          aria-hidden="true"
        />
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 shadow-glow-cyan">
          <Gamepad2
            className="h-7 w-7 text-accent-ice drop-shadow-[0_0_10px_rgba(54,214,255,0.8)]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="label-mono text-accent-ice/70">Playing</p>
          <p className="truncate font-bold tracking-tight text-white">{game.name}</p>
        </div>
      </motion.div>
    );
  }

  return null;
}
