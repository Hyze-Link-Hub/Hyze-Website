"use client";

import BadgeIcon from "@/components/BadgeIcon";
import GlassPanel from "@/components/GlassPanel";
import Toggle from "@/components/dashboard/Toggle";
import Tooltip from "@/components/Tooltip";
import type { AwardedBadgeWithBadge, Badge } from "@/lib/badges";
import { hoverLift, listItem, listStagger, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const preferredCategories = ["Activity", "Discord", "Special", "General"];
const freePinLimit = 3;
const proPinLimit = 5;

function unlockText(badge: Badge) {
  const description = badge.description?.trim();
  if (description) return description;
  if (badge.trigger_type === "views" && badge.threshold != null) {
    return `Reach ${badge.threshold.toLocaleString("en-US")} profile views.`;
  }
  if (badge.trigger_type === "discord") return "Earn the matching Discord role.";
  return "Awarded by Hazy.";
}

function lockedGroups(catalog: Badge[], ownedBadgeIds: Set<string>) {
  const groups = new Map<string, Badge[]>();

  for (const badge of catalog) {
    if (ownedBadgeIds.has(badge.id) || badge.is_secret) continue;
    const category = badge.category.trim() || "General";
    const list = groups.get(category) ?? [];
    list.push(badge);
    groups.set(category, list);
  }

  for (const list of groups.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...groups.entries()].sort(([a], [b]) => {
    const ai = preferredCategories.indexOf(a);
    const bi = preferredCategories.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.localeCompare(b);
  });
}

export default function BadgesTab() {
  const profile = useProfileStore((state) => state.profile);
  const awardedBadges = useProfileStore((state) => state.awardedBadges);
  const clearBadgeNew = useProfileStore((state) => state.clearBadgeNew);
  const setBadgeEquipped = useProfileStore((state) => state.setBadgeEquipped);
  const setBadgePinned = useProfileStore((state) => state.setBadgePinned);
  const setShowBadges = useProfileStore((state) => state.setShowBadges);
  const [catalog, setCatalog] = useState<Badge[] | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("badges")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLibraryError("Couldn’t load the badge library.");
          setCatalog([]);
          return;
        }
        setCatalog(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  const owned = awardedBadges
    .filter((award): award is AwardedBadgeWithBadge & { badges: Badge } => award.badges !== null)
    .sort(
      (a, b) =>
        Number(b.is_pinned) - Number(a.is_pinned) ||
        Number(b.is_equipped) - Number(a.is_equipped) ||
        a.badges.name.localeCompare(b.badges.name),
    );
  const pinLimit = profile.is_premium ? proPinLimit : freePinLimit;
  const pinnedCount = owned.filter((award) => award.is_pinned).length;
  const pinLimitReached = pinnedCount >= pinLimit;
  const groups = catalog ? lockedGroups(catalog, new Set(owned.map((award) => award.badge_id))) : [];

  function report(error: unknown, fallback: string) {
    setActionError(error instanceof Error && error.message ? error.message : fallback);
  }

  function toggleShow() {
    setActionError(null);
    setShowBadges(!profile.show_badges).catch((error: unknown) =>
      report(error, "Couldn’t update badge visibility."),
    );
  }

  function toggleEquipped(awardId: string, isEquipped: boolean) {
    setActionError(null);
    setBadgeEquipped(awardId, isEquipped).catch((error: unknown) =>
      report(error, "Couldn’t update that badge. Try again."),
    );
  }

  function togglePinned(awardId: string, isPinned: boolean) {
    if (isPinned && pinnedCount >= pinLimit) {
      if (!profile.is_premium) {
        setActionError(null);
        setUpgradePrompt(true);
      }
      return;
    }

    setUpgradePrompt(false);
    setActionError(null);
    setBadgePinned(awardId, isPinned).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "";
      if (!profile.is_premium && message.toLowerCase().includes("free tier")) {
        setUpgradePrompt(true);
        return;
      }
      report(error, "Couldn’t update that pin. Try again.");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <GlassPanel className="flex items-center justify-between gap-4 rounded-2xl p-4 shadow-glass">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight text-white">Show Badges on Public Profile</p>
          <p className="mt-1 text-xs text-white/40">
            Hides the showcase and trophy case when this is off.
          </p>
        </div>
        <Toggle
          checked={profile.show_badges}
          label="Show Badges on Public Profile"
          onToggle={toggleShow}
        />
      </GlassPanel>

      {actionError ? (
        <p role="alert" className="-mt-4 px-1 text-sm text-rose-300">
          {actionError}
        </p>
      ) : null}

      <section aria-label="Your unlocked badges" className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
            Your badges
          </h2>
          <p className="label-mono text-accent-ice/60">
            {pinnedCount} / {pinLimit} pinned
          </p>
        </div>

        {upgradePrompt && !profile.is_premium ? (
          <GlassPanel className="flex flex-col gap-3 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_28px_-16px_rgba(54,214,255,0.9)] ring-1 ring-accent-cyan/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/75">
              Free accounts can pin {freePinLimit} badges. Pro raises the cap to {proPinLimit}.
            </p>
            <motion.div whileHover={hoverLift} whileTap={tapPress} className="shrink-0">
              <Link
                href="/pricing"
                className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-accent-cyan to-accent-ice px-4 text-xs font-bold tracking-tight text-surface-base shadow-glow-cyan outline-none ring-1 ring-inset ring-white/40 transition focus-visible:ring-2 focus-visible:ring-accent-ice/60"
              >
                Upgrade to Pro
              </Link>
            </motion.div>
          </GlassPanel>
        ) : null}

        {owned.length === 0 ? (
          <GlassPanel className="rounded-2xl border-dashed px-4 py-10 text-center">
            <p className="label-mono text-white/45">
              No badges yet. The locked library below shows how to earn them.
            </p>
          </GlassPanel>
        ) : (
          <motion.ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            variants={listStagger}
            initial="hidden"
            animate="visible"
          >
            {owned.map((award) => {
              const badge = award.badges;
              const pinLocked = pinLimitReached && !award.is_pinned;
              return (
                <motion.li key={award.id} variants={listItem} whileHover={hoverLift}>
                  <GlassPanel
                    className="flex h-full flex-col gap-4 rounded-2xl p-4 transition-colors hover:border-strong"
                    style={{ boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 28px -16px ${badge.color}` }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        clearBadgeNew(award.id).catch(() =>
                          setActionError("Couldn’t mark that badge as seen."),
                        );
                      }}
                      className="flex items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-ice/60"
                    >
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-surface-overlay/70">
                        <BadgeIcon badge={badge} className="h-6 w-6" />
                        {award.is_new ? (
                          <span className="absolute -top-1.5 -right-1.5 animate-pulse rounded-full bg-rose-500 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-white shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                            NEW
                          </span>
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium tracking-tight text-white">
                          {badge.name}
                        </span>
                        <span className="block text-xs leading-relaxed text-white/45">
                          {unlockText(badge)}
                        </span>
                      </span>
                    </button>

                    <div className="mt-auto flex flex-col gap-3 border-t border-subtle pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="label-mono text-white/50">Equip</span>
                        <Toggle
                          checked={award.is_equipped}
                          label={`Equip ${badge.name}`}
                          onToggle={() => toggleEquipped(award.id, !award.is_equipped)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="label-mono text-white/50">Pin to Top</span>
                        {pinLocked && profile.is_premium ? (
                          <Tooltip label="Limit reached">
                            <span className="inline-flex">
                              <Toggle
                                checked={false}
                                disabled
                                label={`Pin ${badge.name}`}
                                onToggle={() => undefined}
                              />
                            </span>
                          </Tooltip>
                        ) : pinLocked ? (
                          <Toggle
                            checked={false}
                            label={`Pin ${badge.name}`}
                            onToggle={() => togglePinned(award.id, true)}
                          />
                        ) : (
                          <Toggle
                            checked={award.is_pinned}
                            label={`Pin ${badge.name}`}
                            onToggle={() => togglePinned(award.id, !award.is_pinned)}
                          />
                        )}
                      </div>
                    </div>
                  </GlassPanel>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </section>

      <section aria-label="Locked badge library" className="flex flex-col gap-6">
        <div className="px-1">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
            Locked
          </h2>
          <p className="mt-1 text-xs text-white/40">Grey badges are still waiting to be earned.</p>
        </div>

        {libraryError ? (
          <p role="alert" className="px-1 text-sm text-rose-300">
            {libraryError}
          </p>
        ) : null}

        {catalog === null ? (
          <p className="label-mono px-1 text-white/40">Loading badges…</p>
        ) : groups.length === 0 ? (
          <GlassPanel className="rounded-2xl border-dashed px-4 py-10 text-center">
            <p className="label-mono text-white/45">Every public badge in the library is already yours.</p>
          </GlassPanel>
        ) : (
          groups.map(([category, badges]) => (
            <div key={category} className="flex flex-col gap-3">
              <h3 className="label-mono flex items-center gap-3 px-1 text-white/40">
                {category}
                <span className="h-px flex-1 bg-white/[0.06]" aria-hidden="true" />
              </h3>
              <motion.ul
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                variants={listStagger}
                initial="hidden"
                animate="visible"
              >
                {badges.map((badge) => (
                  <motion.li key={badge.id} variants={listItem}>
                    <GlassPanel className="flex items-center gap-3 rounded-2xl border-dashed p-4 opacity-40 grayscale transition-opacity hover:opacity-60">
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-subtle bg-surface-overlay/70">
                        <BadgeIcon badge={badge} className="h-6 w-6" />
                        <Lock
                          className="absolute -right-1 -bottom-1 h-3.5 w-3.5 text-white"
                          strokeWidth={2.25}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">
                          {badge.name}
                        </span>
                        <span className="block text-xs leading-relaxed text-white/70">
                          {unlockText(badge)}
                        </span>
                      </span>
                      <span className="sr-only">Locked</span>
                    </GlassPanel>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
