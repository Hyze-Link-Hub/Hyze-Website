import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const signatureColumns =
  "id, profile_id, author_id, author_username, author_avatar, message, is_pinned, created_at";

function messageLength(message: string) {
  return [...message].length;
}

export async function GET(request: Request) {
  const profileId = new URL(request.url).searchParams.get("profile_id");
  if (!profileId || !uuidPattern.test(profileId)) {
    return NextResponse.json({ error: "Expected profile_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guestbook_signatures")
    .select(signatureColumns)
    .eq("profile_id", profileId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const profileId =
    body && typeof body === "object" && "profile_id" in body ? body.profile_id : null;
  const message = body && typeof body === "object" && "message" in body ? body.message : null;

  if (typeof profileId !== "string" || !uuidPattern.test(profileId)) {
    return NextResponse.json({ error: "Expected profile_id" }, { status: 400 });
  }
  if (typeof message !== "string") {
    return NextResponse.json({ error: "Expected message" }, { status: 400 });
  }

  const trimmed = message.trim();
  const length = messageLength(trimmed);
  if (length < 1 || length > 280) {
    return NextResponse.json(
      { error: "Message must be between 1 and 280 characters" },
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

  const { data: author, error: authorError } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (authorError) {
    return NextResponse.json({ error: authorError.message }, { status: 500 });
  }
  if (!author) {
    return NextResponse.json({ error: "Create a profile before signing" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("guestbook_signatures")
    .insert({
      profile_id: profileId,
      author_id: user.id,
      author_username: author.username,
      author_avatar: author.avatar_url,
      message: trimmed,
    })
    .select(signatureColumns)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const signatureId =
    body && typeof body === "object" && "signature_id" in body ? body.signature_id : null;
  const action = body && typeof body === "object" && "action" in body ? body.action : null;

  if (typeof signatureId !== "string" || !uuidPattern.test(signatureId)) {
    return NextResponse.json({ error: "Expected signature_id" }, { status: 400 });
  }
  if (action !== "pin" && action !== "delete") {
    return NextResponse.json({ error: "Expected action pin or delete" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: signature, error: signatureError } = await supabase
    .from("guestbook_signatures")
    .select("id, profile_id, is_pinned")
    .eq("id", signatureId)
    .maybeSingle();

  if (signatureError) {
    return NextResponse.json({ error: signatureError.message }, { status: 500 });
  }
  if (!signature || signature.profile_id !== user.id) {
    return NextResponse.json({ error: "Signature not found" }, { status: 404 });
  }

  if (action === "delete") {
    const { error } = await supabase
      .from("guestbook_signatures")
      .delete()
      .eq("id", signatureId)
      .eq("profile_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: signatureId, deleted: true });
  }

  const { data, error } = await supabase
    .from("guestbook_signatures")
    .update({ is_pinned: !signature.is_pinned })
    .eq("id", signatureId)
    .eq("profile_id", user.id)
    .select("id, is_pinned")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
