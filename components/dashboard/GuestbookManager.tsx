"use client";

import GlassPanel from "@/components/GlassPanel";
import Toggle from "@/components/dashboard/Toggle";
import { avatarInitials } from "@/lib/avatar";
import { hoverLift, listItem, listStagger, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";

const hues = [
  "from-white via-accent-ice to-accent-cyan",
  "from-accent-ice to-accent-cyan",
  "from-accent-cyan via-sky-400 to-accent-ice",
  "from-white/90 via-accent-ice/80 to-sky-400",
];

function hueFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return hues[Math.abs(hash) % hues.length];
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const timeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of timeUnits) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function actionClass(tone: "approve" | "hide" | "delete", active: boolean) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-subtle bg-surface-overlay/60 text-white/45 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ice/60";

  if (tone === "approve") {
    return `${base} hover:border-emerald-300/40 hover:bg-emerald-400/10 hover:text-emerald-300 hover:shadow-[0_0_16px_-4px_rgba(52,211,153,0.9)] ${
      active ? "ring-1 ring-emerald-300/35 text-emerald-300" : ""
    }`;
  }

  if (tone === "hide") {
    return `${base} hover:border-strong hover:text-white ${
      active ? "ring-1 ring-white/25 text-white" : ""
    }`;
  }

  return `${base} hover:border-rose-300/40 hover:bg-rose-400/10 hover:text-rose-300 hover:shadow-[0_0_16px_-4px_rgba(244,63,94,0.9)]`;
}

export default function GuestbookManager() {
  const [enabled, setEnabled] = useState(true);
  const [manualApproval, setManualApproval] = useState(true);
  const messages = useProfileStore((state) => state.guestbook);
  const setGuestbookVisibility = useProfileStore((state) => state.setGuestbookVisibility);
  const deleteGuestbookEntry = useProfileStore((state) => state.deleteGuestbookEntry);
  const [actionError, setActionError] = useState<string | null>(null);

  function setVisibility(id: string, isPublic: boolean) {
    setActionError(null);
    setGuestbookVisibility(id, isPublic).catch(() =>
      setActionError("Couldn’t update that message. Try again."),
    );
  }

  function removeMessage(id: string) {
    setActionError(null);
    deleteGuestbookEntry(id).catch(() =>
      setActionError("Couldn’t delete that message. Try again."),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel className="rounded-[28px] p-4 shadow-glass sm:p-5">
        <p className="label-mono text-accent-cyan/70">Settings</p>
        <h2 className="mt-1 font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Controls
        </h2>
        <p className="mt-1 text-xs text-white/40">
          How the guestbook behaves on your public profile.
        </p>

        <div className="mt-5 divide-y divide-white/[0.08]">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div className="min-w-0">
              <p className="text-sm font-medium tracking-tight text-white">Enable Guestbook</p>
              <p className="mt-1 text-xs text-white/40">
                {enabled
                  ? "Visitors can leave messages on your profile."
                  : "The guestbook is hidden from your public page."}
              </p>
            </div>
            <Toggle
              checked={enabled}
              label="Enable Guestbook"
              onToggle={() => setEnabled((current) => !current)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="min-w-0">
              <p className="text-sm font-medium tracking-tight text-white">Manual Approval</p>
              <p className="mt-1 text-xs text-white/40">
                Messages remain hidden until you approve them.
              </p>
            </div>
            <Toggle
              checked={manualApproval}
              label="Manual Approval"
              onToggle={() => setManualApproval((current) => !current)}
            />
          </div>
        </div>
      </GlassPanel>

      <section aria-label="Guestbook messages" className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
            Messages
          </h2>
          <p className="label-mono text-accent-ice/60">
            {messages.length} {messages.length === 1 ? "signature" : "signatures"}
          </p>
        </div>

        {actionError ? (
          <p role="alert" className="px-1 text-sm text-rose-300">
            {actionError}
          </p>
        ) : null}

        {messages.length === 0 ? (
          <GlassPanel className="rounded-2xl border-dashed px-4 py-10 text-center">
            <p className="label-mono text-white/45">No messages in the feed.</p>
          </GlassPanel>
        ) : (
          <motion.ul
            className="flex flex-col gap-2.5"
            variants={listStagger}
            initial="hidden"
            animate="visible"
          >
            {messages.map((message) => (
              <motion.li key={message.id} variants={listItem} layout>
                <GlassPanel
                  className={`rounded-2xl px-3.5 py-3.5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.7)] transition-[opacity,border-color] hover:border-strong sm:px-4 ${
                    message.is_public ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br p-[1.5px] ${hueFor(message.sender_name)}`}
                      aria-hidden="true"
                    >
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-surface-raised font-mono text-[10px] font-semibold tracking-wide text-accent-ice">
                        {avatarInitials(message.sender_name)}
                      </span>
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-mono text-sm font-medium text-white">@{message.sender_name}</p>
                        <p className="font-mono text-[11px] text-white/35">{timeAgo(message.created_at)}</p>
                        {message.is_public ? null : (
                          <span className="label-mono inline-flex items-center rounded-full border border-subtle bg-surface-overlay/60 px-2 py-0.5 text-white/45">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/70">{message.message}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <motion.button
                        type="button"
                        className={actionClass("approve", message.is_public)}
                        aria-label={`Approve message from @${message.sender_name}`}
                        onClick={() => setVisibility(message.id, true)}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      </motion.button>
                      <motion.button
                        type="button"
                        className={actionClass("hide", !message.is_public)}
                        aria-label={`Hide message from @${message.sender_name}`}
                        onClick={() => setVisibility(message.id, false)}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                      >
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </motion.button>
                      <motion.button
                        type="button"
                        className={actionClass("delete", false)}
                        aria-label={`Delete message from @${message.sender_name}`}
                        onClick={() => removeMessage(message.id)}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </motion.button>
                    </div>
                  </div>
                </GlassPanel>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>
    </div>
  );
}
