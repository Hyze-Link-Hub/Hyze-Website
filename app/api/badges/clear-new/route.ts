import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { badge_award_id?: unknown } | null;
  const badgeAwardId = body?.badge_award_id;
  if (typeof badgeAwardId !== "string" || !uuidPattern.test(badgeAwardId)) {
    return NextResponse.json({ error: "Invalid badge_award_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("awarded_badges")
    .update({ is_new: false })
    .eq("id", badgeAwardId)
    .eq("profile_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id, is_new: false });
}
