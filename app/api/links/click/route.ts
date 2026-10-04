import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { link_id?: unknown } | null;
  const linkId = body?.link_id;

  if (typeof linkId !== "string" || !uuidPattern.test(linkId)) {
    return NextResponse.json({ error: "Expected { link_id }" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Click tracking is not configured" }, { status: 500 });
  }

  const { error } = await admin.rpc("increment_link_clicks", { p_id: linkId });
  if (error) {
    return NextResponse.json({ error: "Could not record click" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
