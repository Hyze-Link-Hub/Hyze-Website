"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift, staggerContainer, staggerItem } from "@/lib/motion";
import { motion } from "framer-motion";
import { Eye, Play } from "lucide-react";

export type UploadItem = {
  id: string;
  title: string;
  views: string;
  duration: string;
  href?: string;
  thumbnailUrl?: string | null;
  accent?: string;
};

type RecentUploadsProps = {
  uploads: UploadItem[];
};

const fallbackAccents = [
  "from-orange-500/50 via-rose-600/40 to-slate-900",
  "from-teal-400/45 via-cyan-700/35 to-slate-900",
  "from-amber-300/40 via-fuchsia-700/30 to-slate-900",
];

export default function RecentUploads({ uploads }: RecentUploadsProps) {
  if (uploads.length === 0) return null;

  return (
    <motion.section className="w-full" variants={staggerContainer}>
      <motion.div className="mb-4 flex items-end justify-between gap-3" variants={staggerItem}>
        <div>
          <p className="label-mono text-white/35">Library</p>
          <h2 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white sm:text-2xl">
            Recent Uploads
          </h2>
        </div>
      </motion.div>

      <motion.ul
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        variants={staggerContainer}
      >
        {uploads.map((upload, index) => {
          const accent = upload.accent ?? fallbackAccents[index % fallbackAccents.length];
          const card = (
            <GlassPanel className="group h-full overflow-hidden rounded-2xl shadow-glass transition-[border-color,box-shadow] duration-300 hover:border-accent-cyan/35 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_-16px_rgba(54,214,255,0.6)]">
              <div
                className={`relative aspect-video overflow-hidden bg-gradient-to-br ${accent}`}
              >
                {upload.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={upload.thumbnailUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-surface-base/50 text-white backdrop-blur-md transition group-hover:scale-110 group-hover:border-accent-ice/60 group-hover:text-accent-ice group-hover:shadow-glow-cyan">
                    <Play
                      className="h-4 w-4 translate-x-px fill-current"
                      strokeWidth={0}
                    />
                  </span>
                </div>
                {upload.duration ? (
                  <span className="absolute bottom-2 right-2 rounded-md border border-subtle bg-surface-base/75 px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-white/85 backdrop-blur-sm">
                    {upload.duration}
                  </span>
                ) : null}
              </div>
              <div className="space-y-1.5 p-3.5">
                <h3 className="line-clamp-2 font-[family-name:var(--font-syne)] text-sm font-semibold leading-snug tracking-tight text-white">
                  {upload.title}
                </h3>
                {upload.views ? (
                  <p className="flex items-center gap-1 font-mono text-xs tabular-nums text-white/40">
                    <Eye className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                    {upload.views} views
                  </p>
                ) : null}
              </div>
            </GlassPanel>
          );

          return (
            <motion.li key={upload.id} variants={staggerItem} whileHover={hoverLift}>
              {upload.href ? (
                <a
                  href={upload.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent-ice/60"
                >
                  {card}
                </a>
              ) : (
                card
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.section>
  );
}
