export type ChannelIcon = "clapperboard" | "radio" | "gamepad";

export function channelVisual(platform: string): {
  icon: ChannelIcon;
  accent: string;
} {
  const key = platform.toLowerCase();
  if (key.includes("youtube") || key.includes("yt")) {
    return { icon: "clapperboard", accent: "text-rose-300" };
  }
  if (key.includes("twitch")) {
    return { icon: "radio", accent: "text-violet-300" };
  }
  if (key.includes("discord")) {
    return { icon: "gamepad", accent: "text-teal-300" };
  }
  return { icon: "radio", accent: "text-teal-300" };
}
