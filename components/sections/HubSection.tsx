"use client";

import RecentUploads, {
  type UploadItem,
} from "@/components/hub/RecentUploads";
import SocialStatCards, {
  type SocialStat,
} from "@/components/hub/SocialStatCards";
import {
  inViewViewport,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { motion } from "framer-motion";

type HubSectionProps = {
  uploads: UploadItem[];
  stats: SocialStat[];
};

export default function HubSection({ uploads, stats }: HubSectionProps) {
  return (
    <section
      id="hub"
      className="relative flex h-screen w-full snap-center flex-col justify-center px-4 py-10 sm:px-6 sm:py-16"
      aria-label="The Hub"
    >
      <motion.div
        className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={inViewViewport}
        variants={staggerContainer}
      >
        <motion.header
          className="text-center sm:text-left"
          variants={staggerItem}
        >
          <p className="label-mono text-accent-cyan/70">The Hub</p>
          <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-4xl">
            Mini site
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50 sm:text-[0.95rem]">
            Recent drops, channel stats, and the wider orbit — expanded beyond
            the profile card.
          </p>
        </motion.header>

        <RecentUploads uploads={uploads} />
        <SocialStatCards stats={stats} />
      </motion.div>
    </section>
  );
}
