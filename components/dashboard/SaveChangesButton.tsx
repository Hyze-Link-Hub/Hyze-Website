"use client";

import { hoverLift, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SaveChangesButton() {
  const hasUnsavedChanges = useProfileStore((state) => state.hasUnsavedChanges);
  const saveUserProfile = useProfileStore((state) => state.saveUserProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasUnsavedChanges) return null;

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await saveUserProfile();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-6 right-6 z-50 flex items-center gap-4 rounded-full border border-accent-cyan/30 bg-surface-overlay/90 py-2 pl-5 pr-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_-14px_rgba(54,214,255,0.7)] backdrop-blur-2xl"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-glow-cyan" aria-hidden="true" />
        <span className={error ? "text-rose-200" : "label-mono text-white/75"}>
          {error ? error : "Unsaved changes"}
        </span>
      </span>
      <motion.button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving}
        whileHover={hoverLift}
        whileTap={tapPress}
        className="rounded-full bg-gradient-to-r from-accent-cyan to-accent-ice px-4 py-1.5 text-sm font-bold tracking-tight text-surface-base shadow-glow-cyan outline-none ring-1 ring-inset ring-white/40 transition focus-visible:ring-2 focus-visible:ring-accent-ice/70 disabled:cursor-wait disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save to Live Profile"}
      </motion.button>
    </motion.div>
  );
}
