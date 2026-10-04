import type { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];

export type Badge = Tables["badges"]["Row"];

/** An awarded_badges row joined with its catalog entry via `awarded_badges(*, badges(*))`. */
export type AwardedBadgeWithBadge = Tables["awarded_badges"]["Row"] & {
  badges: Badge | null;
};

const svgNamespace = "http://www.w3.org/2000/svg";

/**
 * Data URI for an untrusted SVG string. Only use it as an image or CSS mask
 * source: browsers never run scripts or load external resources from SVGs
 * loaded that way, which is what makes rendering stored markup safe.
 */
export function svgDataUri(svg: string) {
  const markup = svg.includes("xmlns=")
    ? svg
    : svg.replace(/<svg\b/i, `<svg xmlns="${svgNamespace}"`);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
