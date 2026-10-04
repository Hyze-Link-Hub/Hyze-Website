"use client";

import GlassPanel from "@/components/GlassPanel";
import LivePreview from "@/components/dashboard/LivePreview";
import ProMark from "@/components/dashboard/ProMark";
import SaveChangesButton from "@/components/dashboard/SaveChangesButton";
import { avatarInitials } from "@/lib/avatar";
import { hoverLift, tapPress } from "@/lib/motion";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Award,
  ChartNoAxesCombined,
  Clapperboard,
  ExternalLink,
  Link2,
  Menu,
  NotebookPen,
  Palette,
  Plug,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  X,
  type LucideIcon,
} from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/videos", label: "Videos", icon: Clapperboard },
  { href: "/dashboard/channels", label: "Channels", icon: Radio },
  { href: "/dashboard/badges", label: "Badges", icon: Award },
  { href: "/dashboard/guestbook", label: "Guestbook", icon: NotebookPen },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard", label: "Analytics", icon: ChartNoAxesCombined },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(active: boolean) {
  return active
    ? "border border-accent-cyan/25 bg-surface-overlay/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_28px_-12px_rgba(54,214,255,0.8)]"
    : "border border-transparent text-white/45 hover:border-subtle hover:bg-surface-overlay/50 hover:text-white/85";
}

function ActiveIndicator({ layoutId }: { layoutId: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-cyan shadow-glow-cyan"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      aria-hidden="true"
    />
  );
}

function BrandMark() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-ice shadow-glow-cyan ring-1 ring-inset ring-white/40">
      <span className="h-2.5 w-2.5 rounded-full bg-surface-raised" />
    </span>
  );
}

function ProfileAvatar() {
  const profile = useProfileStore((state) => state.profile);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan to-accent-ice p-[1.5px] shadow-glow-cyan">
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface-raised font-mono text-[11px] font-bold text-accent-ice">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          avatarInitials(profile.title || profile.username)
        )}
      </span>
    </span>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const username = useProfileStore((state) => state.profile.username);
  const isPremium = useProfileStore((state) => state.profile.is_premium);

  return (
    <motion.nav
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-subtle bg-surface-raised/80 backdrop-blur-2xl md:flex"
      aria-label="Dashboard"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(54,214,255,0.12),transparent_70%)]" />

      <div className={`relative pb-2 pt-6 ${isCollapsed ? "px-3" : "px-5"}`}>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`flex items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
            isCollapsed ? "justify-center gap-0" : "gap-3"
          }`}
        >
          <BrandMark />
          <motion.span
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-gradient-brand"
          >
            Hazy
          </motion.span>
        </Link>
        <motion.p
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1, height: isCollapsed ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          className="label-mono mt-5 overflow-hidden text-white/35"
        >
          Studio
        </motion.p>
      </div>

      <div className={`relative mt-2 flex flex-1 flex-col gap-1 ${isCollapsed ? "px-2" : "px-3"}`}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={isCollapsed ? label : undefined}
              onClick={onNavigate}
              className={`relative flex items-center rounded-xl py-2.5 text-sm font-medium tracking-tight outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
                isCollapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${navItemClass(active)}`}
            >
              {active ? <ActiveIndicator layoutId="sidebar-active" /> : null}
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-accent-ice" : "text-white/40"}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <motion.span
                initial={false}
                animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            </Link>
          );
        })}
      </div>

      <div className={`relative mt-auto space-y-3 ${isCollapsed ? "p-2" : "p-3"}`}>
        <motion.div whileHover={hoverLift} whileTap={tapPress}>
          <Link
            href={`/${username}`}
            title={isCollapsed ? "View live page" : undefined}
            className={`flex items-center rounded-xl border border-subtle bg-surface-overlay/60 py-2.5 text-sm text-white/70 outline-none transition hover:border-accent-cyan/35 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            }`}
          >
            <motion.span
              initial={false}
              animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              View live page
            </motion.span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </motion.div>

        <GlassPanel
          className={`flex items-center rounded-2xl py-3 ${
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
          style={{ backgroundColor: "color-mix(in oklab, var(--surface-overlay) 60%, transparent)" }}
        >
          <ProfileAvatar />
          <motion.span
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="min-w-0 overflow-hidden"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate whitespace-nowrap text-sm font-medium tracking-tight text-white">
                {username}
              </span>
              {isPremium ? <ProMark /> : null}
            </span>
            <span className="label-mono block whitespace-nowrap text-white/35">Creator studio</span>
          </motion.span>
        </GlassPanel>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className={`flex w-full items-center rounded-xl border border-transparent py-2.5 text-sm font-medium text-white/40 outline-none transition hover:border-subtle hover:bg-surface-overlay/50 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
          )}
          <motion.span
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            Collapse
          </motion.span>
        </button>
      </div>
    </motion.nav>
  );
}

function MobileSidebarPanel({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const username = useProfileStore((state) => state.profile.username);
  const isPremium = useProfileStore((state) => state.profile.is_premium);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-2 pt-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent-ice/60"
        >
          <BrandMark />
          <span className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-gradient-brand">
            Hazy
          </span>
        </Link>
        <p className="label-mono mt-5 text-white/35">Studio</p>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Dashboard">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-tight outline-none transition focus-visible:ring-2 focus-visible:ring-accent-ice/60 ${navItemClass(active)}`}
            >
              {active ? <ActiveIndicator layoutId="sidebar-active-mobile" /> : null}
              <Icon
                className={`h-[18px] w-[18px] ${active ? "text-accent-ice" : "text-white/40"}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 p-3">
        <Link
          href={`/${username}`}
          className="flex items-center justify-between rounded-xl border border-subtle bg-surface-overlay/60 px-3 py-2.5 text-sm text-white/70 outline-none transition hover:border-accent-cyan/35 hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60"
        >
          View live page
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <GlassPanel
          className="flex items-center gap-3 rounded-2xl px-3 py-3"
          style={{ backgroundColor: "color-mix(in oklab, var(--surface-overlay) 60%, transparent)" }}
        >
          <ProfileAvatar />
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-medium tracking-tight text-white">{username}</span>
              {isPremium ? <ProMark /> : null}
            </span>
            <span className="label-mono block text-white/35">Creator studio</span>
          </span>
        </GlassPanel>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-surface-base text-foreground">
      <Sidebar />

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-surface-base/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMenuPath(null)}
          />
          <aside className="relative flex h-full w-[16.5rem] max-w-[85vw] flex-col border-r border-subtle bg-surface-raised/95 shadow-glass backdrop-blur-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-subtle bg-surface-overlay/70 text-white/70 transition hover:text-white"
              aria-label="Close menu"
              onClick={() => setMenuPath(null)}
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <MobileSidebarPanel onNavigate={() => setMenuPath(null)} />
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_-10%,rgba(54,214,255,0.1),transparent_55%),radial-gradient(ellipse_55%_40%_at_100%_0%,rgba(142,243,255,0.06),transparent_50%)]"
          aria-hidden="true"
        />

        <header className="relative flex items-center gap-3 border-b border-subtle bg-surface-raised/70 px-4 py-3 backdrop-blur-2xl md:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-surface-overlay/60 text-white/80 transition hover:border-accent-cyan/35 hover:text-accent-ice"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setMenuPath(pathname)}
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <span className="font-[family-name:var(--font-syne)] text-base font-bold tracking-tight text-gradient-brand">
            Hazy
          </span>
        </header>

        <main className="dashboard-scroll relative min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
        <SaveChangesButton />
      </div>

      <LivePreview />
    </div>
  );
}
