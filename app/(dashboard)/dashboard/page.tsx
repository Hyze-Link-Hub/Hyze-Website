import type { Metadata } from "next";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import SubscriptionStatusCard from "@/components/dashboard/SubscriptionStatusCard";

export const metadata: Metadata = {
  title: "Overview — Hazy",
  description: "Profile views, link clicks, and guestbook activity for your Hazy.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <header className="flex flex-col gap-4 border-b border-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-mono text-accent-cyan/70">Analytics</p>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-4xl">
            Overview
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/50">
            How your profile performed across the last 7 days.
          </p>
        </div>
        <span className="glass-frost label-mono inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-white/65 transition-colors hover:border-accent-cyan/40 hover:text-accent-ice">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-glow-cyan" aria-hidden="true" />
          Last 7 days
        </span>
      </header>

      <SubscriptionStatusCard />
      <AnalyticsTab />
    </div>
  );
}
