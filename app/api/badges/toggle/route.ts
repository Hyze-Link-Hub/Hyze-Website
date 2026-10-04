import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const freePinLimit = 3;
const proPinLimit = 5;

type ToggleAction = "equip" | "pin";

function parseBody(body: unknown): { awardedBadgeId: string; action: ToggleAction; value: boolean } | null {
  if (!body || typeof body !== "object") return null;
  const { awardedBadgeId, action, value } = body as {
    awardedBadgeId?: unknown;
    action?: unknown;
    value?: unknown;
  };
  if (typeof awardedBadgeId !== "string" || !uuidPattern.test(awardedBadgeId)) return null;
  if (action !== "equip" && action !== "pin") return null;
  if (typeof value !== "boolean") return null;
  return { awardedBadgeId, action, value };
}

export async function POST(request: Request) {
  const body = parseBody(await request.json().catch(() => null));
  if (!body) {
    return NextResponse.json(
      { error: "Expected { awardedBadgeId, action, value }" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { awardedBadgeId, action, value } = body;

  if (action === "pin" && value) {
    const { data: existing, error: existingError } = await supabase
      .from("awarded_badges")
      .select("is_pinned")
      .eq("id", awardedBadgeId)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    }

    if (!existing.is_pinned) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      const { count, error: countError } = await supabase
        .from("awarded_badges")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("is_pinned", true);

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      const isPremium = profile?.is_premium === true;
      const pinned = count ?? 0;
      if (!isPremium && pinned >= freePinLimit) {
        return NextResponse.json({ error: "Free tier limit reached" }, { status: 403 });
      }
      if (isPremium && pinned >= proPinLimit) {
        return NextResponse.json({ error: "Pro tier limit reached" }, { status: 403 });
      }
    }
  }

  const update =
    action === "pin"
      ? { is_pinned: value }
      : value
        ? { is_equipped: true }
        : { is_equipped: false, is_pinned: false };

  const { data, error } = await supabase
    .from("awarded_badges")
    .update(update)
    .eq("id", awardedBadgeId)
    .eq("profile_id", user.id)
    .select("id, is_equipped, is_pinned")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
