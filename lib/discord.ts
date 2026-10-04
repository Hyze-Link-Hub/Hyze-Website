import type { User } from "@supabase/supabase-js";

type DiscordIdentity = {
  provider: string;
  provider_id?: string | null;
  identity_data?: {
    provider_id?: unknown;
    sub?: unknown;
  } | null;
};

function readId(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

/** Discord snowflake from the linked identity. Never read user_metadata — that stays on the first provider. */
export function discordProviderId(user: User): string | null {
  const identity = user.identities?.find((item) => item.provider === "discord") as
    | DiscordIdentity
    | undefined;
  if (!identity) return null;

  return (
    readId(identity.provider_id) ??
    readId(identity.identity_data?.provider_id) ??
    readId(identity.identity_data?.sub)
  );
}
