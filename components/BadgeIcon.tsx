import { svgDataUri, type Badge } from "@/lib/badges";

type BadgeIconProps = {
  badge: Pick<Badge, "icon_svg" | "color">;
  className?: string;
};

/** Tints the stored SVG with the badge color via a CSS mask, so its markup never executes. */
export default function BadgeIcon({ badge, className = "h-5 w-5" }: BadgeIconProps) {
  const mask = `url("${svgDataUri(badge.icon_svg)}")`;

  return (
    <span
      aria-hidden="true"
      className="flex"
      style={{ filter: `drop-shadow(0 0 6px ${badge.color})` }}
    >
      <span
        className={className}
        style={{
          backgroundColor: badge.color,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    </span>
  );
}
