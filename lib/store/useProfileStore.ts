"use client";

import type { AwardedBadgeWithBadge } from "@/lib/badges";
import { discordProviderId } from "@/lib/discord";
import type { Database, Json, ProfileTheme } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { create } from "zustand";

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = {
  id: string | null;
  /** profiles.display_name */
  title: string;
  bio: string;
  username: string;
  theme: ProfileTheme;
  avatar_url: string | null;
  views: number;
  discord_id: string | null;
  show_discord_status: boolean;
  lastfm_username: string | null;
  show_lastfm: boolean;
  show_badges: boolean;
  is_premium: boolean;
  live_status: Json | null;
};

export type ProfileLink = Pick<
  Row<"links">,
  "id" | "title" | "url" | "sort_order" | "order_index" | "is_social" | "subtitle"
>;
export type GuestbookEntry = Pick<
  Row<"guestbook">,
  "id" | "sender_name" | "message" | "is_public" | "created_at"
>;
export type ProfileVideo = Pick<
  Row<"videos">,
  "id" | "title" | "url" | "thumbnail_url" | "duration" | "views_text"
>;
export type ProfileChannel = Pick<
  Row<"channels">,
  "id" | "platform" | "handle" | "followers_text" | "url"
>;

type ProfileState = {
  profile: Profile;
  links: ProfileLink[];
  awardedBadges: AwardedBadgeWithBadge[];
  guestbook: GuestbookEntry[];
  videos: ProfileVideo[];
  channels: ProfileChannel[];
  /** Last profile loaded or saved. Local edits do not touch this copy. */
  initialProfile: Profile;
  hasUnsavedChanges: boolean;
  /** Bumped on every local edit; dirty while it differs from savedRevision. */
  revision: number;
  savedRevision: number;
  updateProfile: (partial: Partial<Profile>) => void;
  updateProfileLocally: (updates: Partial<Profile>) => void;
  uploadAvatar: (file: File) => Promise<void>;
  addLink: (link: Pick<ProfileLink, "title" | "url" | "is_social" | "subtitle">) => void;
  updateLink: (
    id: string,
    partial: Partial<Pick<ProfileLink, "title" | "url" | "is_social" | "subtitle">>,
  ) => void;
  removeLink: (id: string) => void;
  moveLink: (fromId: string, toId: string) => void;
  reorderLinks: (links: ProfileLink[]) => void;
  addVideo: (
    video: Pick<ProfileVideo, "title" | "url" | "thumbnail_url" | "duration" | "views_text">,
  ) => void;
  updateVideo: (
    id: string,
    partial: Partial<
      Pick<ProfileVideo, "title" | "url" | "thumbnail_url" | "duration" | "views_text">
    >,
  ) => void;
  removeVideo: (id: string) => void;
  addChannel: (
    channel: Pick<ProfileChannel, "platform" | "handle" | "followers_text" | "url">,
  ) => void;
  updateChannel: (
    id: string,
    partial: Partial<Pick<ProfileChannel, "platform" | "handle" | "followers_text" | "url">>,
  ) => void;
  removeChannel: (id: string) => void;
  setGuestbookVisibility: (id: string, isPublic: boolean) => Promise<void>;
  deleteGuestbookEntry: (id: string) => Promise<void>;
  clearBadgeNew: (awardId: string) => Promise<void>;
  setBadgeEquipped: (awardId: string, isEquipped: boolean) => Promise<void>;
  setBadgePinned: (awardId: string, isPinned: boolean) => Promise<void>;
  setShowBadges: (showBadges: boolean) => Promise<void>;
  reorderAwardedBadges: (orderedAwardIds: string[]) => void;
  loadUserProfile: () => Promise<Profile | null>;
  fetchProfile: () => Promise<Profile | null>;
  saveUserProfile: () => Promise<void>;
  syncFromDiscord: (supabase: SupabaseClient<Database>) => Promise<void>;
};

export const defaultProfileTheme: ProfileTheme = {
  background_type: "color",
  background_value: "#0a0a0a",
  font: "inter",
  live_sync_enabled: false,
  live_sync_priority: "spotify",
};

function normalizeProfileTheme(value: unknown): ProfileTheme {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultProfileTheme };
  }

  const theme = value as Partial<ProfileTheme>;
  const backgroundType = theme.background_type;
  const priority = theme.live_sync_priority;

  return {
    background_type:
      backgroundType === "color" ||
      backgroundType === "media" ||
      backgroundType === "image" ||
      backgroundType === "video" ||
      backgroundType === "live_sync"
        ? backgroundType
        : defaultProfileTheme.background_type,
    background_value:
      typeof theme.background_value === "string"
        ? theme.background_value
        : defaultProfileTheme.background_value,
    font: typeof theme.font === "string" ? theme.font : defaultProfileTheme.font,
    live_sync_enabled:
      typeof theme.live_sync_enabled === "boolean"
        ? theme.live_sync_enabled
        : backgroundType === "live_sync",
    live_sync_priority:
      priority === "spotify" || priority === "discord"
        ? priority
        : defaultProfileTheme.live_sync_priority,
  };
}

function snapshotProfile(profile: Profile): Profile {
  return { ...profile, theme: { ...profile.theme } };
}

const emptyProfile: Profile = {
  id: null,
  title: "",
  bio: "",
  username: "",
  theme: { ...defaultProfileTheme },
  avatar_url: null,
  views: 0,
  discord_id: null,
  show_discord_status: true,
  lastfm_username: null,
  show_lastfm: true,
  show_badges: true,
  is_premium: false,
  live_status: null,
};

function readMetadataString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function discordDisplayName(metadata: Record<string, unknown>) {
  const fullName = readMetadataString(metadata.full_name);
  if (fullName) return fullName;

  const claims = metadata.custom_claims;
  if (!claims || typeof claims !== "object") return null;
  return readMetadataString((claims as { global_name?: unknown }).global_name);
}

function byOrderIndex<T extends { order_index: number }>(a: T, b: T) {
  return a.order_index - b.order_index;
}

function withSortOrder<T extends { sort_order: number; order_index: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, sort_order: index, order_index: index }));
}

function move<T extends { id: string; sort_order: number; order_index: number }>(
  items: T[],
  fromId: string,
  toId: string,
) {
  const from = items.findIndex((item) => item.id === fromId);
  const to = items.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return withSortOrder(next);
}

async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Supabase auth error:", error);
    throw error;
  }
  if (!data.user) throw new Error("Not signed in");
  return { supabase, user: data.user };
}

async function postBadgeToggle(awardId: string, action: "equip" | "pin", value: boolean) {
  const response = await fetch("/api/badges/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ awardedBadgeId: awardId, action, value }),
  }).catch(() => null);

  if (!response?.ok) {
    const body = (await response?.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Could not update that badge");
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: emptyProfile,
  initialProfile: snapshotProfile(emptyProfile),
  hasUnsavedChanges: false,
  links: [],
  awardedBadges: [],
  guestbook: [],
  videos: [],
  channels: [],
  revision: 0,
  savedRevision: 0,

  updateProfileLocally: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  updateProfile: (partial) => get().updateProfileLocally(partial),

  uploadAvatar: async (file) => {
    const { supabase, user } = await requireUser();
    const path = `${user.id}/avatar`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // The path is fixed, so bust the CDN cache on every upload.
    get().updateProfile({ avatar_url: `${data.publicUrl}?v=${Date.now()}` });
  },

  addLink: (link) =>
    set((state) => ({
      links: withSortOrder([
        ...state.links,
        {
          id: crypto.randomUUID(),
          sort_order: state.links.length,
          order_index: state.links.length,
          is_social: false,
          subtitle: null,
          ...link,
        },
      ]),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  updateLink: (id, partial) =>
    set((state) => ({
      links: state.links.map((link) => (link.id === id ? { ...link, ...partial } : link)),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  removeLink: (id) =>
    set((state) => ({
      links: withSortOrder(state.links.filter((link) => link.id !== id)),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  moveLink: (fromId, toId) =>
    set((state) => ({
      links: move(state.links, fromId, toId),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  reorderLinks: (links) =>
    set({
      links: links.map((link, index) => ({
        ...link,
        sort_order: index,
        order_index: index,
      })),
    }),

  addVideo: (video) =>
    set((state) => ({
      videos: [...state.videos, { id: crypto.randomUUID(), ...video }],
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  updateVideo: (id, partial) =>
    set((state) => ({
      videos: state.videos.map((video) => (video.id === id ? { ...video, ...partial } : video)),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  removeVideo: (id) =>
    set((state) => ({
      videos: state.videos.filter((video) => video.id !== id),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  addChannel: (channel) =>
    set((state) => ({
      channels: [...state.channels, { id: crypto.randomUUID(), ...channel }],
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  updateChannel: (id, partial) =>
    set((state) => ({
      channels: state.channels.map((channel) =>
        channel.id === id ? { ...channel, ...partial } : channel,
      ),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  removeChannel: (id) =>
    set((state) => ({
      channels: state.channels.filter((channel) => channel.id !== id),
      hasUnsavedChanges: true,
      revision: state.revision + 1,
    })),

  // Guestbook moderation writes through immediately instead of waiting for
  // saveUserProfile, and rolls back the optimistic update on failure.
  setGuestbookVisibility: async (id, isPublic) => {
    const previous = get().guestbook;
    set({
      guestbook: previous.map((entry) =>
        entry.id === id ? { ...entry, is_public: isPublic } : entry,
      ),
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("guestbook")
      .update({ is_public: isPublic })
      .eq("id", id);

    if (error) {
      set({ guestbook: previous });
      throw error;
    }
  },

  deleteGuestbookEntry: async (id) => {
    const previous = get().guestbook;
    set({ guestbook: previous.filter((entry) => entry.id !== id) });

    const supabase = createClient();
    const { error } = await supabase.from("guestbook").delete().eq("id", id);

    if (error) {
      set({ guestbook: previous });
      throw error;
    }
  },

  // Badge flags also write through immediately, outside the Save Changes flow.
  clearBadgeNew: async (awardId) => {
    const target = get().awardedBadges.find((award) => award.id === awardId);
    if (!target?.is_new) return;

    const setIsNew = (isNew: boolean) =>
      set((state) => ({
        awardedBadges: state.awardedBadges.map((award) =>
          award.id === awardId ? { ...award, is_new: isNew } : award,
        ),
      }));

    setIsNew(false);
    const response = await fetch("/api/badges/clear-new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badge_award_id: awardId }),
    }).catch(() => null);

    if (!response?.ok) {
      setIsNew(true);
      throw new Error("Could not clear the NEW tag");
    }
  },

  setBadgeEquipped: async (awardId, isEquipped) => {
    const previous = get().awardedBadges;
    const target = previous.find((award) => award.id === awardId);
    if (!target || target.is_equipped === isEquipped) return;

    set({
      awardedBadges: previous.map((award) =>
        award.id === awardId
          ? {
              ...award,
              is_equipped: isEquipped,
              is_pinned: isEquipped ? award.is_pinned : false,
            }
          : award,
      ),
    });

    try {
      await postBadgeToggle(awardId, "equip", isEquipped);
    } catch (error) {
      set({ awardedBadges: previous });
      throw error;
    }
  },

  setBadgePinned: async (awardId, isPinned) => {
    const previous = get().awardedBadges;
    const target = previous.find((award) => award.id === awardId);
    if (!target || target.is_pinned === isPinned) return;

    if (isPinned && !target.is_pinned) {
      const pinned = previous.filter((award) => award.is_pinned).length;
      const limit = get().profile.is_premium ? 5 : 3;
      if (pinned >= limit) {
        throw new Error(get().profile.is_premium ? "Pro tier limit reached" : "Free tier limit reached");
      }
    }

    set({
      awardedBadges: previous.map((award) =>
        award.id === awardId ? { ...award, is_pinned: isPinned } : award,
      ),
    });

    try {
      await postBadgeToggle(awardId, "pin", isPinned);
    } catch (error) {
      set({ awardedBadges: previous });
      throw error;
    }
  },

  setShowBadges: async (showBadges) => {
    const previous = get().profile.show_badges;
    if (previous === showBadges) return;

    set((state) => ({
      profile: { ...state.profile, show_badges: showBadges },
      initialProfile: { ...state.initialProfile, show_badges: showBadges },
    }));

    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("profiles")
      .update({ show_badges: showBadges })
      .eq("id", user.id);

    if (error) {
      set((state) => ({
        profile: { ...state.profile, show_badges: previous },
        initialProfile: { ...state.initialProfile, show_badges: previous },
      }));
      throw error;
    }
  },

  reorderAwardedBadges: (orderedAwardIds) =>
    set((state) => {
      const rank = new Map(orderedAwardIds.map((id, index) => [id, index]));
      return {
        awardedBadges: state.awardedBadges.map((award) => {
          const orderIndex = rank.get(award.id);
          return orderIndex === undefined ? award : { ...award, order_index: orderIndex };
        }),
      };
    }),

  loadUserProfile: () => get().fetchProfile(),

  fetchProfile: async () => {
    const { supabase, user } = await requireUser();

    const { data: row, error } = await supabase
      .from("profiles")
      .select(
        "*, links(*), awarded_badges(*, badges(*)), guestbook(*), videos(*), channels(*)",
      )
      .eq("id", user.id)
      .order("order_index", { ascending: true, referencedTable: "links" })
      .order("order_index", { ascending: true, referencedTable: "awarded_badges" })
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;

    let discordId = row.discord_id;
    const linkedDiscordId = discordProviderId(user);
    if (!discordId && linkedDiscordId) {
      const { error: discordError } = await supabase
        .from("profiles")
        .update({ discord_id: linkedDiscordId })
        .eq("id", user.id)
        .is("discord_id", null);
      if (!discordError) discordId = linkedDiscordId;
    }

    const profile: Profile = {
      id: row.id,
      title: row.display_name ?? row.username,
      bio: row.bio ?? "",
      username: row.username,
      theme: normalizeProfileTheme(row.theme),
      avatar_url: row.avatar_url,
      views: row.views ?? 0,
      discord_id: discordId,
      show_discord_status: row.show_discord_status,
      lastfm_username: row.lastfm_username,
      show_lastfm: row.show_lastfm,
      show_badges: row.show_badges,
      is_premium: row.is_premium,
      live_status: row.live_status,
    };

    const loadedProfile = snapshotProfile(profile);

    set((state) => ({
      profile: loadedProfile,
      initialProfile: snapshotProfile(loadedProfile),
      hasUnsavedChanges: false,
      links: [...row.links]
        .sort(byOrderIndex)
        .map(({ id, title, url, sort_order, order_index, is_social, subtitle }) => ({
          id,
          title,
          url,
          sort_order,
          order_index,
          is_social: is_social ?? false,
          subtitle: subtitle ?? null,
        })),
      awardedBadges: [...(row.awarded_badges ?? [])].sort(
        (a, b) => a.order_index - b.order_index || a.id.localeCompare(b.id),
      ),
      guestbook: [...row.guestbook]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(({ id, sender_name, message, is_public, created_at }) => ({
          id,
          sender_name,
          message,
          is_public,
          created_at,
        })),
      videos: (row.videos ?? []).map(
        ({ id, title, url, thumbnail_url, duration, views_text }) => ({
          id,
          title,
          url,
          thumbnail_url,
          duration,
          views_text,
        }),
      ),
      channels: (row.channels ?? []).map(
        ({ id, platform, handle, followers_text, url }) => ({
          id,
          platform,
          handle,
          followers_text,
          url,
        }),
      ),
      savedRevision: state.revision,
    }));

    return loadedProfile;
  },

  saveUserProfile: async () => {
    const { profile, links, videos, channels, revision } = get();
    console.log("Attempting save...", { profile, links, videos, channels });

    try {
      const { supabase, user } = await requireUser();

      // RLS compares profile_id to auth.uid(), so the signed-in user's id is
      // the only value that can pass, regardless of what the store holds.
      const profileId = user.id;
      if (profile.id !== profileId) {
        console.warn("Store profile.id does not match the signed-in user", {
          storeProfileId: profile.id,
          authUserId: profileId,
        });
      }

      const linksToSave = links.map((link, index) => ({
        ...link,
        profile_id: profileId,
        sort_order: index,
        order_index: index,
        subtitle: link.is_social ? null : link.subtitle?.trim() || null,
      }));
      const videosToSave = videos.map((video) => ({
        ...video,
        profile_id: profileId,
      }));
      const channelsToSave = channels.map((channel) => ({
        ...channel,
        profile_id: profileId,
      }));

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: profileId,
        username: profile.username,
        display_name: profile.title,
        bio: profile.bio,
        theme: normalizeProfileTheme(profile.theme),
        avatar_url: profile.avatar_url,
        show_discord_status: profile.show_discord_status,
        lastfm_username: profile.lastfm_username?.trim() || null,
        show_lastfm: profile.show_lastfm,
        show_badges: profile.show_badges,
      });
      if (profileError) {
        console.error("Supabase Save Error:", { table: "profiles", error: profileError });
        throw profileError;
      }

      if (linksToSave.length > 0) {
        const { error } = await supabase.from("links").upsert(linksToSave);
        if (error) {
          console.error("Supabase Save Error:", { table: "links", error, payload: linksToSave });
          throw error;
        }
      }

      if (videosToSave.length > 0) {
        const { error } = await supabase.from("videos").upsert(videosToSave);
        if (error) {
          console.error("Supabase Save Error:", { table: "videos", error, payload: videosToSave });
          throw error;
        }
      }

      if (channelsToSave.length > 0) {
        const { error } = await supabase.from("channels").upsert(channelsToSave);
        if (error) {
          console.error("Supabase Save Error:", {
            table: "channels",
            error,
            payload: channelsToSave,
          });
          throw error;
        }
      }

      // Upsert can't express removals, so drop rows that are no longer in the store.
      const linkIds = linksToSave.map((link) => link.id);
      let staleLinks = supabase.from("links").delete().eq("profile_id", profileId);
      if (linkIds.length > 0) staleLinks = staleLinks.not("id", "in", `(${linkIds.join(",")})`);
      const { error: linksDeleteError } = await staleLinks;
      if (linksDeleteError) {
        console.error("Supabase Save Error:", { table: "links (delete)", error: linksDeleteError });
        throw linksDeleteError;
      }

      const videoIds = videosToSave.map((video) => video.id);
      let staleVideos = supabase.from("videos").delete().eq("profile_id", profileId);
      if (videoIds.length > 0) staleVideos = staleVideos.not("id", "in", `(${videoIds.join(",")})`);
      const { error: videosDeleteError } = await staleVideos;
      if (videosDeleteError) {
        console.error("Supabase Save Error:", { table: "videos (delete)", error: videosDeleteError });
        throw videosDeleteError;
      }

      const channelIds = channelsToSave.map((channel) => channel.id);
      let staleChannels = supabase.from("channels").delete().eq("profile_id", profileId);
      if (channelIds.length > 0) {
        staleChannels = staleChannels.not("id", "in", `(${channelIds.join(",")})`);
      }
      const { error: channelsDeleteError } = await staleChannels;
      if (channelsDeleteError) {
        console.error("Supabase Save Error:", {
          table: "channels (delete)",
          error: channelsDeleteError,
        });
        throw channelsDeleteError;
      }

      const savedProfile = snapshotProfile(profile);
      set({
        profile: savedProfile,
        initialProfile: snapshotProfile(savedProfile),
        hasUnsavedChanges: false,
        savedRevision: revision,
      });
      console.log("Save complete", {
        links: linksToSave.length,
        videos: videosToSave.length,
        channels: channelsToSave.length,
      });
    } catch (error) {
      console.error("Supabase Save Error:", error);
      throw error;
    }
  },

  syncFromDiscord: async (supabase) => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("Not signed in");

    const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const avatarUrl = readMetadataString(metadata.avatar_url);
    const displayName = discordDisplayName(metadata);

    const partial: Partial<Profile> = {};
    if (avatarUrl) partial.avatar_url = avatarUrl;
    if (displayName) partial.title = displayName;
    if (!avatarUrl && !displayName) {
      throw new Error("Discord did not return an avatar or name");
    }

    get().updateProfileLocally(partial);
  },
}));

export function useIsProfileDirty() {
  return useProfileStore((state) => state.hasUnsavedChanges);
}
