import { NextResponse } from "next/server";

type LastFmImage = {
  "#text"?: string;
};

type LastFmTrack = {
  name?: string;
  artist?: { "#text"?: string };
  image?: LastFmImage[];
  "@attr"?: { nowplaying?: string };
};

const usernamePattern = /^[a-zA-Z0-9_-]{1,15}$/;

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim() ?? "";
  if (!usernamePattern.test(username)) {
    return NextResponse.json({ isPlaying: false }, { status: 400 });
  }

  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ isPlaying: false }, { status: 500 });
  }

  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("user", username);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({ isPlaying: false }, { status: 502 });
  }

  const body = (await response.json()) as {
    recenttracks?: { track?: LastFmTrack | LastFmTrack[] };
  };
  const raw = body.recenttracks?.track;
  const track = Array.isArray(raw) ? raw[0] : raw;

  if (!track || track["@attr"]?.nowplaying !== "true") {
    return NextResponse.json({ isPlaying: false });
  }

  return NextResponse.json({
    isPlaying: true,
    song: track.name ?? "",
    artist: track.artist?.["#text"] ?? "",
    albumArtUrl: track.image?.[3]?.["#text"] ?? "",
  });
}
