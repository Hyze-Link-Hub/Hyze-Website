import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReorderItem = { id: string; order_index: number };

function parseReorderItems(body: unknown): ReorderItem[] | null {
  if (!Array.isArray(body)) return null;

  const items: ReorderItem[] = [];
  const seen = new Set<string>();

  for (const entry of body) {
    if (!entry || typeof entry !== "object") return null;
    const { id, order_index } = entry as { id?: unknown; order_index?: unknown };
    if (typeof id !== "string" || !uuidPattern.test(id)) return null;
    if (typeof order_index !== "number" || !Number.isInteger(order_index) || order_index < 0) {
      return null;
    }
    if (seen.has(id)) return null;
    seen.add(id);
    items.push({ id, order_index });
  }

  return items;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items = parseReorderItems(body);
  if (!items) {
    return NextResponse.json(
      { error: "Expected an array of { id, order_index }" },
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

  for (const item of items) {
    const { error } = await supabase
      .from("links")
      .update({ order_index: item.order_index, sort_order: item.order_index })
      .eq("id", item.id)
      .eq("profile_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
