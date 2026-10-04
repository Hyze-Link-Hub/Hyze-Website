"use client";

import BadgeIcon from "@/components/BadgeIcon";
import type { AwardedBadgeWithBadge } from "@/lib/badges";
import { hoverLift } from "@/lib/motion";
import { motion } from "framer-motion";

type ProfileBadgesProps = {
  badges: AwardedBadgeWithBadge[];
  placement: "showcase" | "trophy";
  compact?: boolean;
};

function byOrder(a: AwardedBadgeWithBadge, b: AwardedBadgeWithBadge) {
  return a.order_index - b.order_index || a.id.localeCompare(b.id);
}

export default function ProfileBadges({ badges, placement, compact = false }: ProfileBadgesProps) {
  const visible = badges
    .filter((award) => {
      if (!award.badges || award.is_equipped !== true) return false;
      return placement === "showcase" ? award.is_pinned === true : award.is_pinned !== true;
    })
    .sort(byOrder);

  if (visible.length === 0) return null;

  const showcase = placement === "showcase";

  return (
    <div className={`flex w-full flex-col items-center ${showcase ? "gap-2" : "gap-2.5"}`}>
      {showcase ? null : (
        <p
          className={`font-mono font-medium uppercase tracking-[0.22em] text-white/35 ${
            compact ? "text-[8px]" : "text-[10px]"
          }`}
        >
          Trophy case
        </p>
      )}
      <ul
        className={
          showcase
            ? "flex flex-wrap items-center justify-center gap-3"
            : `grid w-full justify-center gap-2 ${compact ? "grid-cols-5" : "grid-cols-4 sm:grid-cols-6"}`
        }
        aria-label={showcase ? "Pinned showcase" : "Trophy case"}
      >
        {visible.map((award) => {
          const badge = award.badges!;
          const size = showcase
            ? compact
              ? "h-9 w-9"
              : "h-14 w-14"
            : compact
              ? "h-8 w-8"
              : "h-10 w-10";
          const icon = showcase ? (compact ? "h-5 w-5" : "h-7 w-7") : compact ? "h-4 w-4" : "h-5 w-5";

          return (
            <motion.li
              key={award.id}
              tabIndex={0}
              whileHover={hoverLift}
              className={`group relative flex items-center justify-center justify-self-center rounded-2xl border bg-surface-raised/60 outline-none backdrop-blur-2xl transition-colors hover:border-white/30 focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${size} ${
                showcase ? "border-strong" : "border-subtle"
              }`}
              style={
                showcase
                  ? { boxShadow: `0 0 22px -4px ${badge.color}, inset 0 0 12px -6px ${badge.color}` }
                  : undefined
              }
            >
              <BadgeIcon badge={badge} className={icon} />
              <span className="sr-only">{badge.name}</span>
              <span
                role="tooltip"
                className="label-mono pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-subtle bg-surface-overlay/95 px-2.5 py-1 text-white/85 opacity-0 shadow-glass backdrop-blur-2xl transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {badge.name}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
