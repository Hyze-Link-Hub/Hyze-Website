import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog — Hazy",
  description: "Product updates and release notes for hazy.tech.",
};

const ENTRIES = [
  {
    date: "October 4, 2026",
    title: "Brand refresh & legal foundation",
    items: [
      "Official purple brand palette rolled out across surfaces and accents",
      "Production footer with status badge and site-wide navigation",
      "Terms of Service, Privacy Policy, and Copyright / DMCA pages published",
    ],
  },
] as const;

export default function ChangelogPage() {
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
          Changelog
        </h1>
        <p className="mt-3 text-sm text-white/45">
          Release notes and product updates for hazy.tech.
        </p>

        <div className="mt-10 space-y-6">
          {ENTRIES.map((entry) => (
            <article
              key={entry.date}
              className="rounded-2xl border border-subtle bg-[#1F1D2B]/70 p-6 shadow-[0_0_0_1px_rgba(157,123,255,0.06)] sm:p-8"
            >
              <p className="label-mono text-brand-purple/80">{entry.date}</p>
              <h2 className="mt-3 font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight">
                {entry.title}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/60">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
