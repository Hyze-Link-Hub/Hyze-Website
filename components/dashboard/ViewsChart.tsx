"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

const profileViews = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const wave = Math.sin(index / 2.7) * 1400 + Math.cos(index / 4.8) * 700;
  const trend = index * 92;
  return {
    date: `Sep ${day}`,
    views: Math.round(5100 + trend + wave),
  };
});

function ViewsTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || payload.length === 0) return null;

  const raw = payload[0]?.value;
  const views = typeof raw === "number" ? raw : Number(raw ?? 0);

  return (
    <div className="rounded-xl border border-subtle bg-surface-overlay/95 px-3 py-2 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <p className="text-[11px] tracking-wide text-white/45">{label}</p>
      <p className="mt-0.5 font-[family-name:var(--font-syne)] text-sm font-semibold text-white">
        {views.toLocaleString()} views
      </p>
    </div>
  );
}

export default function ViewsChart() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 720, height: 320 });

  useEffect(() => {
    document.documentElement.dataset.chart = "mounted";
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.floor(entries[0]?.contentRect.width ?? 0);
      const nextHeight = Math.floor(entries[0]?.contentRect.height ?? 0);
      if (nextWidth <= 0 || nextHeight <= 0) return;
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="h-72 w-full sm:h-80"
      role="img"
      aria-label="Area chart of profile views over the last 30 days, trending upward"
    >
      {size.width > 0 && size.height > 0 ? (
        <AreaChart
          width={size.width}
          height={size.height}
          responsive={false}
          data={profileViews}
          margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="viewsStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="55%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.42} />
              <stop offset="48%" stopColor="#3b82f6" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            interval={4}
            tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={40}
            tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            content={ViewsTooltip}
            cursor={{ stroke: "rgba(255,255,255,0.14)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="url(#viewsStroke)"
            strokeWidth={2.5}
            fill="url(#viewsFill)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#f5f3ff",
              stroke: "#c084fc",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      ) : null}
    </div>
  );
}
