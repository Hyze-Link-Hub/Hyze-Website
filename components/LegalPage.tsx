import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-[#0E0D13] text-white">
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-16 sm:pt-24">
        <Link
          href="/"
          className="label-mono text-brand-purple/80 transition hover:text-brand-glow"
        >
          ← Back to Hazy
        </Link>
        <h1 className="mt-8 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {updated}</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-white/65 sm:text-[15px]">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-subtle bg-[#1F1D2B]/70 p-6 shadow-[0_0_0_1px_rgba(157,123,255,0.06)] sm:p-8">
      <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
