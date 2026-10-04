"use client";

import { useEffect } from "react";

export default function RecordView({ profileId }: { profileId: string }) {
  useEffect(() => {
    void fetch("/api/views/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: profileId }),
      keepalive: true,
    });
  }, [profileId]);

  return null;
}
