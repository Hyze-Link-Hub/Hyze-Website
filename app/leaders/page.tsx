"use client";

import BadgeIcon from "@/components/BadgeIcon";
import { avatarInitials } from "@/lib/avatar";
import type { AwardedBadgeWithBadge, Badge } from "@/lib/badges";
import { hoverLift } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type Leader = {
  id: string;
  username: string;
  avatarUrl: string | null;
  views: number;
  awards: AwardedBadgeWithBadge[];
};

const podiumStyle = {
  1: {
    border: "#FFD700",
    glow: "rgba(255, 215, 0, 0.55)",
    avatar: "h-28 w-28 text-2xl sm:h-36 sm:w-36 sm:text-3xl",
    count: "text-4xl sm:text-5xl",
    name: "text-base sm:text-lg",
  },
  2: {
    border: "#C0C0C0",
    glow: "rgba(192, 192, 192, 0.4)",
    avatar: "h-20 w-20 text-lg sm:h-24 sm:w-24",
    count: "text-2xl sm:text-3xl",
    name: "text-sm sm:text-base",
  },
  3: {
    border: "#CD7F32",
    glow: "rgba(205, 127, 50, 0.5)",
    avatar: "h-20 w-20 text-lg sm:h-24 sm:w-24",
    count: "text-2xl sm:text-3xl",
    name: "text-sm sm:text-base",
  },
} as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 1.8 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

function formatViews(count: number) {
  return new Intl.NumberFormat("en-US").format(count);
}

function byOrder(a: AwardedBadgeWithBadge, b: AwardedBadgeWithBadge) {
  return a.order_index - b.order_index || a.id.localeCompare(b.id);
}

function pinnedAwards(awards: AwardedBadgeWithBadge[]) {
  return awards
    .filter((award) => award.badges && award.is_equipped && award.is_pinned)
    .sort(byOrder);
}

function equippedAwards(awards: AwardedBadgeWithBadge[]) {
  return awards.filter((award) => award.badges && award.is_equipped).sort(byOrder);
}

function singleBadge(value: Badge | Badge[] | null | undefined): Badge | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function LeaderAvatar({
  username,
  avatarUrl,
  className,
  border,
  glow,
}: {
  username: string;
  avatarUrl: string | null;
  className: string;
  border: string;
  glow: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-surface-raised font-mono font-semibold text-accent-ice/90 ${className}`}
      style={{ borderColor: border, boxShadow: `0 0 32px ${glow}` }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        avatarInitials(username)
      )}
    </div>
  );
}

function BadgeRow({
  awards,
  limit,
  centered = false,
}: {
  awards: AwardedBadgeWithBadge[];
  limit: number;
  centered?: boolean;
}) {
  const visible = awards.slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-1.5 ${centered ? "justify-center" : ""}`}>
      {visible.map((award) => {
        const badge = award.badges!;
        return (
          <li
            key={award.id}
            title={badge.name}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-subtle bg-surface-overlay/70"
            style={{ boxShadow: `0 0 12px -4px ${badge.color}` }}
          >
            <BadgeIcon badge={badge} className="h-3.5 w-3.5" />
            <span className="sr-only">{badge.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

function PodiumCard({ leader, rank }: { leader: Leader; rank: 1 | 2 | 3 }) {
  const style = podiumStyle[rank];

  return (
    <motion.div whileHover={hoverLift}>
      <Link
        href={`/${leader.username}`}
        className="glass-frost group relative flex flex-col items-center overflow-hidden rounded-3xl px-3 pb-5 pt-6 text-center outline-none transition-colors hover:border-strong focus-visible:ring-2 focus-visible:ring-accent-ice/60 sm:px-5"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
          style={{ backgroundImage: `radial-gradient(ellipse 70% 100% at 50% 0%, ${style.glow}, transparent 70%)` }}
          aria-hidden="true"
        />
        <span
          className="label-mono relative mb-4 rounded-full border border-subtle bg-surface-base/60 px-2.5 py-0.5"
          style={{ color: style.border }}
        >
          #{rank}
        </span>
        <LeaderAvatar
          username={leader.username}
          avatarUrl={leader.avatarUrl}
          className={`${style.avatar} relative transition duration-300 group-hover:scale-[1.03]`}
          border={style.border}
          glow={style.glow}
        />
        <div className="relative mt-3 min-h-7">
          <BadgeRow awards={pinnedAwards(leader.awards)} limit={4} centered />
        </div>
        <p className={`relative mt-3 max-w-full truncate font-semibold tracking-tight text-white ${style.name}`}>
          @{leader.username}
        </p>
        <p
          className={`relative mt-1 font-mono font-bold tabular-nums tracking-tight ${style.count}`}
          style={{ color: style.border, textShadow: `0 0 24px ${style.glow}` }}
        >
          {formatViews(leader.views)}
        </p>
        <p className="label-mono relative text-white/35">views</p>
      </Link>
    </motion.div>
  );
}

function LeaderboardMessage({ children }: { children: string }) {
  return (
    <div className="glass-frost mx-auto mt-16 max-w-lg rounded-3xl px-8 py-12 text-center">
      <p className="label-mono text-white/55">{children}</p>
    </div>
  );
}

function PodiumSlot({ leader, rank }: { leader: Leader; rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, type: "spring", bounce: 0.5 }}
      >
        <PodiumCard leader={leader} rank={rank} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank === 3 ? 0.4 : 0.8, duration: 0.8 }}
    >
      <PodiumCard leader={leader} rank={rank} />
    </motion.div>
  );
}

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, views")
        .eq("show_badges", true)
        .gt("views", 0)
        .order("views", { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (error || !profiles) {
        setFailed(true);
        return;
      }

      const ids = profiles.map((profile) => profile.id);
      const awardsByProfile = new Map<string, AwardedBadgeWithBadge[]>();

      if (ids.length > 0) {
        const { data: awardRows } = await supabase
          .from("awarded_badges")
          .select("*, badges(*)")
          .in("profile_id", ids)
          .order("order_index", { ascending: true });

        if (cancelled) return;

        for (const row of awardRows ?? []) {
          const award: AwardedBadgeWithBadge = {
            id: row.id,
            profile_id: row.profile_id,
            badge_id: row.badge_id,
            is_new: row.is_new,
            is_equipped: row.is_equipped,
            is_pinned: row.is_pinned,
            order_index: row.order_index,
            badges: singleBadge(row.badges),
          };
          const list = awardsByProfile.get(row.profile_id) ?? [];
          list.push(award);
          awardsByProfile.set(row.profile_id, list);
        }
      }

      setLeaders(
        profiles.map((profile) => ({
          id: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          views: profile.views,
          awards: awardsByProfile.get(profile.id) ?? [],
        })),
      );
    }

    load().catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!leaders || leaders.length === 0) return;

    const timeout = window.setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.3 },
        colors: ["#FFD700", "#36D6FF", "#8EF3FF", "#FFFFFF"],
      });
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [leaders]);

  const rest = leaders?.slice(3) ?? [];

  return (
    <main className="relative min-h-full overflow-hidden bg-surface-base px-4 py-16 text-white sm:px-8 sm:py-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(54,214,255,0.16),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(rgba(142,243,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(142,243,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_20%,black,transparent_75%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-5xl">
        <header className="mx-auto max-w-4xl text-center">
          <p className="label-mono mx-auto inline-flex items-center rounded-full border border-accent-cyan/25 bg-surface-raised/60 px-4 py-1.5 text-accent-ice shadow-glow-cyan backdrop-blur-2xl">
            Top 50 · Most viewed
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-7xl">
            Global <span className="text-gradient-brand">Leaderboard</span>
          </h1>
          <p className="mt-4 text-base text-white/50 sm:text-lg">
            The most visited profiles on Hazy.tech.
          </p>
        </header>

        {failed ? (
          <LeaderboardMessage>The leaderboard could not be loaded.</LeaderboardMessage>
        ) : null}

        {leaders && leaders.length === 0 ? (
          <LeaderboardMessage>No profiles have earned a spot on the board yet.</LeaderboardMessage>
        ) : null}

        {leaders && leaders.length > 0 ? (
          <motion.section
            className="mx-auto mt-16 grid w-full max-w-3xl grid-cols-3 items-end gap-3 sm:gap-8"
            aria-label="Top three"
          >
            {([2, 1, 3] as const).map((rank) => {
              const leader = rank === 1 ? leaders[0] : rank === 2 ? leaders[1] : leaders[2];
              return leader ? (
                <PodiumSlot key={leader.id} leader={leader} rank={rank} />
              ) : (
                <div key={rank} aria-hidden="true" />
              );
            })}
          </motion.section>
        ) : null}

        {rest.length > 0 ? (
          <section className="mt-16" aria-label="Ranks 4 through 50">
            <div className="mb-3 flex items-center justify-between px-4 sm:px-6">
              <span className="label-mono text-white/35">Rank · Profile</span>
              <span className="label-mono text-white/35">Views</span>
            </div>
            <motion.div
              className="glass-frost overflow-hidden rounded-2xl"
              variants={container}
              initial="hidden"
              animate="show"
              role="list"
            >
              {rest.map((leader, index) => {
                const rank = index + 4;
                return (
                  <motion.div
                    key={leader.id}
                    variants={item}
                    role="listitem"
                    className="border-b border-subtle last:border-b-0"
                  >
                    <Link
                      href={`/${leader.username}`}
                      className="group relative flex items-center gap-3 px-4 py-3 outline-none transition-colors hover:bg-surface-overlay/60 focus-visible:bg-surface-overlay/60 sm:gap-4 sm:px-6 sm:py-3.5"
                    >
                      <span
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 scale-y-0 rounded-r-full bg-accent-cyan shadow-glow-cyan transition-transform duration-300 group-hover:scale-y-100"
                        aria-hidden="true"
                      />
                      <span className="w-10 shrink-0 font-mono text-xs font-medium tabular-nums text-white/35 transition-colors group-hover:text-accent-ice">
                        #{String(rank).padStart(2, "0")}
                      </span>
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <LeaderAvatar
                          username={leader.username}
                          avatarUrl={leader.avatarUrl}
                          className="h-9 w-9 text-[11px]"
                          border="rgba(255,255,255,0.16)"
                          glow="transparent"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight text-white">
                          @{leader.username}
                        </span>
                        <span className="hidden shrink-0 sm:block">
                          <BadgeRow awards={equippedAwards(leader.awards)} limit={6} />
                        </span>
                        <span className="shrink-0 sm:hidden">
                          <BadgeRow awards={equippedAwards(leader.awards)} limit={2} />
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-accent-cyan">
                        {formatViews(leader.views)}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
