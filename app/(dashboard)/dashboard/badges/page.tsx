import type { Metadata } from "next";
import BadgesTab from "@/components/dashboard/BadgesTab";

export const metadata: Metadata = {
  title: "Badges — Hazy",
};

export default function BadgesPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-subtle pb-6">
        <p className="label-mono text-accent-cyan/70">Studio</p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-4xl">
          Badges
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
          Equip the ones you want on your profile, and pin up to three into the showcase. Pro accounts can pin five.
        </p>
      </header>
      <BadgesTab />
    </section>
  );
}
