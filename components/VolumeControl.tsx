"use client";

import { hoverLift, tapPress } from "@/lib/motion";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export default function VolumeControl() {
  const [muted, setMuted] = useState(true);

  return (
    <motion.button
      type="button"
      onClick={() => setMuted((prev) => !prev)}
      aria-label={muted ? "Unmute" : "Mute"}
      aria-pressed={!muted}
      whileHover={hoverLift}
      whileTap={tapPress}
      className="glass-frost fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full text-white/70 outline-none transition-colors hover:border-accent-cyan/40 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60 sm:left-6 sm:top-6"
    >
      {muted ? (
        <VolumeX className="h-[18px] w-[18px]" strokeWidth={1.75} />
      ) : (
        <Volume2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
      )}
    </motion.button>
  );
}
