"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift, staggerContainer, staggerItem, tapPress } from "@/lib/motion";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Clapperboard,
  Gamepad2,
  Radio,
  type LucideIcon,
} from "lucide-react";
import { channelVisual, type ChannelIcon } from "@/lib/channels";

const iconMap = {
  clapperboard: Clapperboard,
  radio: Radio,
  gamepad: Gamepad2,
} as const;

export type SocialStatIcon = ChannelIcon;

export type SocialStat = {
  id: string;
  platform: string;
  handle: string;
  followers: string;
  href: string;
  icon?: SocialStatIcon;
  accent?: string;
};

type SocialStatCardsProps = {
  stats: SocialStat[];
};

export { channelVisual };

export default function SocialStatCards({ stats }: SocialStatCardsProps) {
  if (stats.length === 0) return null;

  return (
    <motion.section className="w-full" variants={staggerContainer}>
      <motion.div className="mb-4" variants={staggerItem}>
        <p className="label-mono text-white/35">Reach</p>
        <h2 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl">
          Channels
        </h2>
      </motion.div>

      <motion.ul
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        variants={staggerContainer}
      >
        {stats.map((stat) => {
          const visual = channelVisual(stat.platform);
          const icon = stat.icon ?? visual.icon;
          const accent = stat.accent ?? visual.accent;
          const Icon: LucideIcon = iconMap[icon];
          return (
            <motion.li key={stat.id} variants={staggerItem} whileHover={hoverLift}>
              <GlassPanel className="flex h-full flex-col rounded-2xl p-4 shadow-glass transition-colors hover:border-strong sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-surface-overlay/70 ${accent}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-syne)] text-sm font-semibold tracking-tight text-white">
                      {stat.platform}
                    </p>
                    <p className="truncate font-mono text-xs text-white/40">{stat.handle}</p>
                  </div>
                </div>

                <p className="mb-4 flex items-baseline font-mono text-2xl font-bold tabular-nums tracking-tight text-white">
                  {stat.followers || "—"}
                  <span className="label-mono ml-2 text-white/35">followers</span>
                </p>

                <motion.a
                  href={stat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={hoverLift}
                  whileTap={tapPress}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-subtle bg-surface-overlay/60 px-3 py-2.5 text-sm font-medium tracking-tight text-white/80 outline-none transition-colors hover:border-accent-cyan/40 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60"
                >
                  View Channel
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </motion.a>
              </GlassPanel>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.section>
  );
}
