"use client";

import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

const MARKETING_SEGMENTS = new Set([
  "",
  "pricing",
  "leaders",
  "login",
  "terms",
  "privacy",
  "copyright",
  "changelog",
]);

function shouldShowFooter(pathname: string | null) {
  if (!pathname) return true;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/onboarding")) return false;
  if (pathname.startsWith("/auth")) return false;

  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  // Public profile routes are single dynamic segments outside marketing pages.
  if (segment && !MARKETING_SEGMENTS.has(segment)) return false;
  return true;
}

export default function SiteFooter() {
  const pathname = usePathname();
  if (!shouldShowFooter(pathname)) return null;
  return <Footer />;
}
