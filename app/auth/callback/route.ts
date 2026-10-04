import { discordProviderId } from "@/lib/discord";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function defaultUsername(userId: string) {
  return `user_${userId.replace(/-/g, "").slice(0, 12)}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const discordId = discordProviderId(user);
        const { data: existing } = await supabase
          .from("profiles")
          .select("id, discord_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
          const meta = user.user_metadata ?? {};
          const avatarUrl =
            typeof meta.avatar_url === "string"
              ? meta.avatar_url
              : typeof meta.picture === "string"
                ? meta.picture
                : null;
          const displayName =
            typeof meta.full_name === "string"
              ? meta.full_name
              : typeof meta.name === "string"
                ? meta.name
                : null;

          await supabase.from("profiles").insert({
            id: user.id,
            username: defaultUsername(user.id),
            display_name: displayName,
            avatar_url: avatarUrl,
            discord_id: discordId,
          });
        } else if (discordId && !existing.discord_id) {
          await supabase
            .from("profiles")
            .update({ discord_id: discordId })
            .eq("id", user.id)
            .is("discord_id", null);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
