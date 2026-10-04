"use client";

import { useProfileStore } from "@/lib/store/useProfileStore";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useState, type ReactNode } from "react";

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const loadUserProfile = useProfileStore((state) => state.loadUserProfile);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const profile = await loadUserProfile();

      if (!profile || profile.username.startsWith("user_")) {
        router.replace("/onboarding");
        return;
      }

      if (profile.id) {
        posthog.identify(profile.id, {
          username: profile.username,
          is_premium: profile.is_premium,
        });
      }

      if (!cancelled) {
        setStatus("ready");
      }
    }

    load().catch(() => {
      if (!cancelled) setStatus("error");
    });
    return () => {
      cancelled = true;
    };
  }, [router, loadUserProfile]);

  if (status !== "ready") {
    return (
      <div className="label-mono flex h-full min-h-0 items-center justify-center bg-surface-base text-white/45">
        {status === "error" ? "Couldn’t load your studio. Refresh to try again." : "Loading studio…"}
      </div>
    );
  }

  return children;
}
