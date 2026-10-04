import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Leaderboard — Hazy",
  description: "The most visited profiles on Hazy.tech.",
};

export default function LeadersLayout({ children }: { children: ReactNode }) {
  return children;
}
