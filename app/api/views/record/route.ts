import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { NextResponse, type NextRequest } from "next/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const daySeconds = 60 * 60 * 24;

function viewedCookie(profileId: string) {
  return `hazy_viewed_${profileId}`;
}

function visitorAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "127.0.0.1";
  return forwarded.split(",")[0]?.trim() || "127.0.0.1";
}

function hashVisitor(ip: string) {
  const secret = process.env.IP_SALT || "hazy-fallback-salt";
  return createHash("sha256").update(`${ip}${secret}`).digest("hex");
}

function counted() {
  return NextResponse.json({ ok: true });
}

function failed() {
  return NextResponse.json({ error: "Could not record view" }, { status: 500 });
}

function categorizeReferrer(referer: string | null) {
  const value = (referer ?? "").toLowerCase();
  if (value.includes("discord")) return "Discord";
  if (value.includes("t.co") || value.includes("twitter") || value.includes("x.com")) return "X";
  if (value.includes("tiktok")) return "TikTok";
  if (value.includes("instagram")) return "Instagram";
  return "Direct";
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { profile_id?: unknown } | null;
    const profileId = body?.profile_id;

    if (typeof profileId !== "string" || !uuidPattern.test(profileId)) {
      return NextResponse.json({ error: "Expected { profile_id }" }, { status: 500 });
    }

    if (request.cookies.get(viewedCookie(profileId))) {
      return counted();
    }

    const visitorHash = hashVisitor(visitorAddress(request));
    const since = new Date(Date.now() - daySeconds * 1000).toISOString();
    const supabase = createServiceClient();

    const { data: recent, error: recentError } = await supabase
      .from("page_views")
      .select("id")
      .eq("profile_id", profileId)
      .eq("visitor_hash", visitorHash)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();

    if (recentError) {
      console.error("VIEW TRACKING CRASH:", recentError);
      return failed();
    }
    if (recent) {
      return counted();
    }

    try {
      const { error: insertError } = await supabase.from("page_views").insert({
        profile_id: profileId,
        visitor_hash: visitorHash,
        referrer: categorizeReferrer(request.headers.get("referer")),
      });

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", insertError);
        return failed();
      }

      const { error: incrementError } = await supabase.rpc("increment_views", { p_id: profileId });
      if (incrementError) {
        console.error("VIEW TRACKING CRASH:", incrementError);
        await supabase
          .from("page_views")
          .delete()
          .eq("profile_id", profileId)
          .eq("visitor_hash", visitorHash)
          .gte("created_at", since);
        return failed();
      }
    } catch (error) {
      console.error("VIEW TRACKING CRASH:", error);
      return failed();
    }

    const response = counted();
    response.cookies.set(viewedCookie(profileId), "1", {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: daySeconds,
    });
    return response;
  } catch (error) {
    console.error("VIEW TRACKING CRASH:", error);
    return failed();
  }
}
