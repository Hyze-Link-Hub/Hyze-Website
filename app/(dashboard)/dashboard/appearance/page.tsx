import type { Metadata } from "next";
import AppearanceSettings from "@/components/dashboard/AppearanceSettings";

export const metadata: Metadata = {
  title: "Appearance — Hazy",
};

export default function AppearancePage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-subtle pb-6">
        <p className="label-mono text-accent-cyan/70">Studio</p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-gradient-subtle sm:text-4xl">
          Appearance
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
          Identity, type, and the background for your public page.
        </p>
      </header>
      <AppearanceSettings />
    </section>
  );
}
