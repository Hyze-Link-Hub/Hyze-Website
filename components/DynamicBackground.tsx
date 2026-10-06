"use client";

import { getDominantColor } from "@/lib/utils/getDominantColor";
import type { ProfileTheme } from "@/types/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NowPlayingArtReporter = {
  setSpotifyImageUrl: (url: string | null) => void;
  setDiscordImageUrl: (url: string | null) => void;
};

const NowPlayingArtContext = createContext<NowPlayingArtReporter | null>(null);

export function useNowPlayingArt() {
  return useContext(NowPlayingArtContext);
}

type DynamicBackgroundProps = {
  theme: ProfileTheme;
  spotifyImageUrl: string | null;
  discordImageUrl: string | null;
  children: ReactNode;
};

export default function DynamicBackground({
  theme,
  spotifyImageUrl,
  discordImageUrl,
  children,
}: DynamicBackgroundProps) {
  const [reportedSpotify, setReportedSpotify] = useState<string | null>(null);
  const [reportedDiscord, setReportedDiscord] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const art = useMemo<NowPlayingArtReporter>(
    () => ({
      setSpotifyImageUrl: setReportedSpotify,
      setDiscordImageUrl: setReportedDiscord,
    }),
    [],
  );

  const spotify = spotifyImageUrl || reportedSpotify;
  const discord = discordImageUrl || reportedDiscord;

  useEffect(() => {
    let cancelled = false;
    const liveSync = theme.background_type === "live_sync" || theme.live_sync_enabled;
    const primary = theme.live_sync_priority === "spotify" ? spotify : discord;
    const fallback = theme.live_sync_priority === "spotify" ? discord : spotify;
    const activeImage = primary || fallback;

    if (!liveSync || !activeImage) {
      setActiveColor(null);
      return;
    }

    void getDominantColor(activeImage).then((color) => {
      if (!cancelled) setActiveColor(color);
    });

    return () => {
      cancelled = true;
    };
  }, [
    discord,
    spotify,
    theme.background_type,
    theme.live_sync_enabled,
    theme.live_sync_priority,
  ]);

  const fallbackColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(theme.background_value)
    ? theme.background_value
    : "#0E0D13";
  const isImage = theme.background_type === "image";
  const isVideo = theme.background_type === "video";

  return (
    <NowPlayingArtContext.Provider value={art}>
      {isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 h-full w-full object-cover -z-20"
        >
          <source src={theme.background_value} />
        </video>
      ) : null}
      {isImage ? (
        <div
          className="fixed inset-0 h-full w-full bg-cover bg-center -z-20"
          style={{ backgroundImage: `url(${theme.background_value})` }}
        />
      ) : null}
      {isImage || isVideo ? (
        <div className="fixed inset-0 bg-surface-base/60 backdrop-blur-[2px] -z-10" />
      ) : (
        <div
          className="fixed inset-0 -z-10 transition-colors duration-1000 ease-in-out"
          style={{
            backgroundImage: activeColor
              ? `radial-gradient(circle at top, ${activeColor} 0%, var(--surface-base) 80%)`
              : `radial-gradient(circle at top, ${fallbackColor} 0%, var(--surface-base) 80%)`,
          }}
        />
      )}
      {children}
    </NowPlayingArtContext.Provider>
  );
}
