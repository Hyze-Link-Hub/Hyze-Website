"use client";

import GlassPanel from "@/components/GlassPanel";
import { hoverLift } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import { motion } from "framer-motion";
import { MousePointerClick, PenLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

type DayPoint = {
  day: string;
  views: number;
  fullDate: string;
};

type ViewRow = {
  created_at: string;
  referrer: string | null;
};

type SourceBar = {
  name: string;
  share: number;
  bar: string;
};

const sourceColors: Record<string, string> = {
  Discord: "from-violet-400 to-indigo-300",
  TikTok: "from-fuchsia-400 to-rose-300",
  X: "from-sky-300 to-cyan-300",
  Instagram: "from-rose-400 to-orange-300",
  Direct: "from-teal-300 to-emerald-300",
};

function viewsByDay(rows: { created_at: string }[]): DayPoint[] {
  const today = startOfDay(new Date());
  const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const baseline: DayPoint[] = days.map((date) => ({
    day: format(date, "EEE"),
    views: 0,
    fullDate: format(date, "MMM d"),
  }));
  const indexByKey = new Map(days.map((date, index) => [format(date, "yyyy-MM-dd"), index]));

  for (const row of rows) {
    const index = indexByKey.get(format(startOfDay(new Date(row.created_at)), "yyyy-MM-dd"));
    if (index == null) continue;
    baseline[index].views += 1;
  }

  return baseline;
}

function trafficSources(rows: ViewRow[]): SourceBar[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const name = row.referrer?.trim() || "Direct";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const total = rows.length;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({
      name,
      share: total === 0 ? 0 : Math.round((count / total) * 100),
      bar: sourceColors[name] ?? "from-white/70 to-white/40",
    }));
}

function ViewsTooltip({ active, payload }: TooltipContentProps) {
  if (!active || payload.length === 0) return null;

  const point = payload[0]?.payload as DayPoint | undefined;
  const raw = payload[0]?.value;
  const views = typeof raw === "number" ? raw : Number(raw ?? 0);

  return (
    <div className="rounded-xl border border-accent-cyan/30 bg-surface-overlay/95 px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_24px_-8px_rgba(142,243,255,0.6)] backdrop-blur-2xl">
      <p className="label-mono text-accent-ice/70">{point?.fullDate}</p>
      <p className="mt-1 font-mono text-sm tabular-nums text-white">
        {views.toLocaleString()} {views === 1 ? "view" : "views"}
      </p>
    </div>
  );
}

export default function AnalyticsTab() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [linkClicks, setLinkClicks] = useState<number | null>(null);
  const [signatureCount, setSignatureCount] = useState<number | null>(null);
  const [series, setSeries] = useState<DayPoint[]>(() => viewsByDay([]));
  const [sources, setSources] = useState<SourceBar[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) setError("Sign in to see analytics.");
        return;
      }

      const [viewsResult, profileResult, linksResult, signaturesResult] = await Promise.all([
        supabase.from("page_views").select("created_at, referrer").eq("profile_id", user.id),
        supabase.from("profiles").select("views").eq("id", user.id).maybeSingle(),
        supabase.from("links").select("clicks").eq("profile_id", user.id),
        supabase
          .from("guestbook_signatures")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user.id),
      ]);

      if (!active) return;

      if (viewsResult.error || profileResult.error || linksResult.error || signaturesResult.error) {
        setError("Couldn’t load analytics.");
        setSeries(viewsByDay([]));
        setSources([]);
        setTotalViews(0);
        setLinkClicks(0);
        setSignatureCount(0);
        return;
      }

      const views = viewsResult.data ?? [];
      const clicks = (linksResult.data ?? []).reduce((sum, link) => sum + (link.clicks ?? 0), 0);

      setTotalViews(profileResult.data?.views ?? 0);
      setLinkClicks(clicks);
      setSignatureCount(signaturesResult.count ?? 0);
      setSeries(viewsByDay(views));
      setSources(trafficSources(views));
    }

    load().catch(() => {
      if (active) setError("Couldn’t load analytics.");
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const nextWidth = Math.floor(frame.clientWidth);
      const nextHeight = Math.floor(frame.clientHeight);
      if (nextWidth <= 0 || nextHeight <= 0) return;
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const formattedTotal =
    totalViews == null ? "—" : new Intl.NumberFormat("en-US").format(totalViews);
  const formattedClicks =
    linkClicks == null ? "—" : new Intl.NumberFormat("en-US").format(linkClicks);
  const formattedSignatures =
    signatureCount == null ? "—" : new Intl.NumberFormat("en-US").format(signatureCount);
  const peak = Math.max(4, ...series.map((point) => point.views));

  return (
    <div className="flex flex-col gap-3">
      <GlassPanel
        className="relative overflow-hidden rounded-2xl p-5 shadow-[inset_0_1px_0_0_rgba(142,243,255,0.12),0_20px_50px_rgba(0,0,0,0.6),0_0_80px_-40px_rgba(54,214,255,0.8)] sm:p-7"
        style={{ backgroundColor: "var(--surface-raised)" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_60%_100%_at_15%_0%,rgba(54,214,255,0.12),transparent_70%)]"
          aria-hidden="true"
        />
        <p className="label-mono relative text-accent-ice/60">Lifetime</p>
        <p className="relative mt-3 font-mono text-6xl font-bold leading-none tabular-nums tracking-tight text-gradient-brand drop-shadow-[0_0_22px_rgba(142,243,255,0.4)] sm:text-7xl">
          {formattedTotal}
        </p>
        <h2 className="label-mono relative mt-3 text-white/75">Total Views</h2>
        <p className="relative mt-2 text-xs text-white/40">Counted visits, last 7 days</p>

        {error ? <p className="relative mt-4 text-sm text-rose-200/80">{error}</p> : null}

        <motion.div
          className="relative mt-6 rounded-xl border border-subtle bg-surface-base px-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div
            ref={frameRef}
            className="h-72 w-full sm:h-80"
            role="img"
            aria-label="Area chart of profile views over the last 7 days"
          >
            {size.width > 0 && size.height > 0 ? (
              <AreaChart
                width={size.width}
                height={size.height}
                responsive={false}
                data={series}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8EF3FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#060B12" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "rgba(142,243,255,0.55)",
                    fontSize: 11,
                    fontFamily: "var(--font-space), ui-monospace, monospace",
                  }}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, peak]}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  tick={{
                    fill: "rgba(142,243,255,0.45)",
                    fontSize: 11,
                    fontFamily: "var(--font-space), ui-monospace, monospace",
                  }}
                />
                <Tooltip
                  content={ViewsTooltip}
                  cursor={{ stroke: "rgba(54,214,255,0.35)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  baseValue={0}
                  stroke="#36D6FF"
                  strokeWidth={3}
                  fill="url(#colorViews)"
                  style={{ filter: "drop-shadow(0 0 6px #36D6FF)" }}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#8EF3FF",
                    stroke: "#36D6FF",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={2000}
                  animationBegin={400}
                  animationEasing="ease-out"
                />
              </AreaChart>
            ) : null}
          </div>
        </motion.div>
      </GlassPanel>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Key metrics">
        <motion.div whileHover={hoverLift}>
          <GlassPanel
            className="h-full rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.6)] transition-colors hover:border-accent-cyan/30 sm:p-5"
            style={{ backgroundColor: "color-mix(in oklab, var(--surface-raised) 80%, transparent)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label-mono text-white/45">Link Clicks</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-ice">
                <MousePointerClick className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 font-mono text-3xl font-bold tabular-nums tracking-tight text-white">
              {formattedClicks}
            </p>
          </GlassPanel>
        </motion.div>

        <motion.div whileHover={hoverLift}>
          <GlassPanel
            className="h-full rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.6)] transition-colors hover:border-accent-cyan/30 sm:p-5"
            style={{ backgroundColor: "color-mix(in oklab, var(--surface-raised) 80%, transparent)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label-mono text-white/45">Guestbook Signatures</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-ice">
                <PenLine className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 font-mono text-3xl font-bold tabular-nums tracking-tight text-white">
              {formattedSignatures}
            </p>
          </GlassPanel>
        </motion.div>
      </section>

      <GlassPanel
        className="rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.6)] sm:p-5"
        style={{ backgroundColor: "color-mix(in oklab, var(--surface-raised) 80%, transparent)" }}
      >
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Traffic sources
        </h2>
        <p className="mt-1 text-xs text-white/40">Where visitors arrived from</p>

        {sources.length === 0 ? (
          <p className="mt-5 text-sm text-white/40">No visits recorded yet.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {sources.map(({ name, share, bar }) => (
              <li key={name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm text-white/80">{name}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-white">
                    {share}%
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
                  role="meter"
                  aria-label={`${name} share of traffic`}
                  aria-valuenow={share}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${bar} shadow-[0_0_12px_-2px_rgba(255,255,255,0.45)]`}
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}
