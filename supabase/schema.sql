-- Profiles are keyed to Supabase Auth users. Public pages read them;
-- only the signed-in owner can change their own row.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  theme jsonb not null default '{"background_type": "color", "background_value": "#0a0a0a", "font": "inter", "live_sync_enabled": false, "live_sync_priority": "spotify"}'::jsonb,
  avatar_url text,
  views integer not null default 0,
  discord_id text,
  show_discord_status boolean not null default true,
  lastfm_username text,
  show_lastfm boolean not null default true,
  show_badges boolean not null default true,
  -- Premium is service-role only. Clients can read it, never write it.
  is_premium boolean not null default false,
  -- Written by the service role during Discord sync; drives discord badges.
  discord_role_ids text[] not null default '{}',
  -- { spotify: { albumArt, title, artist } } or { game: { name } }
  live_status jsonb
);

-- Links belong to a profile. order_index is the public display sequence
-- written by drag-and-drop. sort_order stays in sync with it.
-- is_social=true renders as a circular icon; false as a wide pill button.

create table public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  url text not null,
  sort_order integer not null default 0,
  order_index integer not null default 0,
  is_social boolean not null default false,
  subtitle text,
  clicks integer not null default 0
);

create index links_profile_id_sort_order_idx
  on public.links (profile_id, sort_order);

create index links_profile_id_order_index_idx
  on public.links (profile_id, order_index);

alter table public.profiles enable row level security;
alter table public.links enable row level security;

-- Anyone, including anonymous visitors, can read public profile pages.

create policy "Profiles are publicly readable"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "Links are publicly readable"
  on public.links
  for select
  to anon, authenticated
  using (true);

-- profiles.id is the owner's auth.users id.

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- A link is owned by the profile it points at.

create policy "Users can insert their own links"
  on public.links
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Users can update their own links"
  on public.links
  for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users can delete their own links"
  on public.links
  for delete
  to authenticated
  using (auth.uid() = profile_id);

-- Guestbook messages left on a profile. Only is_public rows show on the public page.

create table public.guestbook (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  sender_name text not null,
  message text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index guestbook_profile_id_created_at_idx
  on public.guestbook (profile_id, created_at desc);

alter table public.guestbook enable row level security;

-- Private (unapproved) messages are visible only to the profile owner.

create policy "Public guestbook entries are readable"
  on public.guestbook
  for select
  to anon, authenticated
  using (is_public or (select auth.uid()) = profile_id);

create policy "Users can insert into their own guestbook"
  on public.guestbook
  for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

create policy "Users can update their own guestbook"
  on public.guestbook
  for update
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

create policy "Users can delete from their own guestbook"
  on public.guestbook
  for delete
  to authenticated
  using ((select auth.uid()) = profile_id);

-- Signatures left by signed-in visitors. Anyone can read them; only the
-- profile owner can pin or delete. Authors can insert only as themselves.

create table public.guestbook_signatures (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  author_username text not null,
  author_avatar text,
  message text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  constraint guestbook_signatures_message_length check (char_length(message) between 1 and 280)
);

create index guestbook_signatures_profile_feed_idx
  on public.guestbook_signatures (profile_id, is_pinned desc, created_at desc);

create index guestbook_signatures_author_id_idx
  on public.guestbook_signatures (author_id);

alter table public.guestbook_signatures enable row level security;

create policy "Guestbook signatures are publicly readable"
  on public.guestbook_signatures
  for select
  to anon, authenticated
  using (true);

create policy "Users can sign a guestbook as themselves"
  on public.guestbook_signatures
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      is_pinned = false
      or profile_id = (select auth.uid())
    )
  );

create policy "Profile owners can update signatures on their page"
  on public.guestbook_signatures
  for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Profile owners can delete signatures on their page"
  on public.guestbook_signatures
  for delete
  to authenticated
  using (profile_id = (select auth.uid()));

-- Avatars live at avatars/<user id>/avatar. The bucket is public, so public
-- URLs resolve without a select policy; the owner-only select exists for upsert.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

create policy "Users can read their own avatar objects"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can replace their own avatar"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own avatar"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Profile backgrounds live at backgrounds/<user id>/<timestamp>-<filename>.

insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', true);

create policy "Backgrounds are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'backgrounds');

create policy "Users can upload their own backgrounds"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own backgrounds"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own backgrounds"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Atomic view increment for public profile visits.

create or replace function public.increment_view_count(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set views = views + 1
  where id = p_id;
$$;

revoke all on function public.increment_view_count(uuid) from public, anon, authenticated;

-- One row per counted visit. visitor_hash is a salted SHA-256 of the IP,
-- never the raw address. Inserts go through the service role only.

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  visitor_hash text not null,
  referrer text not null default 'Direct',
  created_at timestamptz not null default now()
);

create index page_views_profile_visitor_created_idx
  on public.page_views (profile_id, visitor_hash, created_at desc);

create index page_views_profile_created_idx
  on public.page_views (profile_id, created_at desc);

alter table public.page_views enable row level security;

create policy "Owners can read their page views"
  on public.page_views
  for select
  to authenticated
  using ((select auth.uid()) = profile_id);

-- Atomic increment used by the view recorder. Execute is service-role only
-- so anonymous clients cannot farm the counter by calling the RPC directly.

create or replace function public.increment_views(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set views = views + 1
  where id = p_id;
$$;

revoke all on function public.increment_views(uuid) from public, anon, authenticated;
grant execute on function public.increment_views(uuid) to service_role;

-- Atomic click increment for public profile links. Execute is service-role only
-- so visitors cannot set the counter to an arbitrary value.

create or replace function public.increment_link_clicks(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.links
  set clicks = clicks + 1
  where id = p_id;
$$;

revoke all on function public.increment_link_clicks(uuid) from public, anon, authenticated;
grant execute on function public.increment_link_clicks(uuid) to service_role;

-- Global badge catalog. Awards are manual (service role), or automatic from
-- profile views or Discord roles via the triggers below.

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_svg text not null,
  color text not null default '#ffffff',
  trigger_type text not null default 'manual'
    check (trigger_type in ('manual', 'views', 'discord')),
  threshold integer,
  discord_role_id text,
  category text not null default 'General',
  description text,
  is_secret boolean not null default false,
  check (trigger_type <> 'views' or threshold is not null),
  check (trigger_type <> 'discord' or discord_role_id is not null)
);

create table public.awarded_badges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  is_new boolean not null default true,
  is_equipped boolean not null default true,
  is_pinned boolean not null default false,
  order_index integer not null default 0,
  unique (profile_id, badge_id)
);

create index awarded_badges_badge_id_idx on public.awarded_badges (badge_id);

alter table public.badges enable row level security;
alter table public.awarded_badges enable row level security;

-- Secret badges stay out of the catalog unless you own one, or someone has it
-- equipped (so a staff badge can still render on a public profile).
create policy "Badges are publicly readable"
  on public.badges for select to anon, authenticated
  using (
    not is_secret
    or exists (
      select 1
      from public.awarded_badges ab
      where ab.badge_id = badges.id
        and (
          ab.profile_id = (select auth.uid())
          or ab.is_equipped
        )
    )
  );

create policy "Awarded badges are publicly readable"
  on public.awarded_badges for select to anon, authenticated using (true);

create policy "Users can mark their own awarded badges seen"
  on public.awarded_badges for update to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

-- Catalog and awards are written by the service role and triggers only;
-- owners may only flip display flags on their own awards.
revoke insert, update, delete, truncate, trigger, references
  on table public.badges, public.awarded_badges from anon, authenticated;
grant update (is_new, is_equipped, is_pinned, order_index) on public.awarded_badges to authenticated;

-- views and discord_role_ids drive automatic awards, so clients cannot write
-- them. New client-editable profile columns must be added to these grants.
revoke insert, update on table public.profiles from anon, authenticated;
grant insert (id, username, display_name, bio, theme, avatar_url, discord_id,
              show_discord_status, lastfm_username, show_lastfm, show_badges)
  on public.profiles to authenticated;
grant update (id, username, display_name, bio, theme, avatar_url, discord_id,
              show_discord_status, lastfm_username, show_lastfm, show_badges)
  on public.profiles to authenticated;

create or replace function public.check_view_milestones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.awarded_badges (profile_id, badge_id)
  select new.id, b.id
  from public.badges b
  where b.trigger_type = 'views' and b.threshold <= new.views
  on conflict do nothing;
  return null;
end;
$$;

create trigger on_profile_view_update
  after update of views on public.profiles
  for each row execute function public.check_view_milestones();

create or replace function public.sync_discord_role_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.awarded_badges (profile_id, badge_id)
  select new.id, b.id
  from public.badges b
  where b.trigger_type = 'discord' and b.discord_role_id = any(new.discord_role_ids)
  on conflict do nothing;

  delete from public.awarded_badges
  where profile_id = new.id
    and badge_id in (
      select b.id from public.badges b
      where b.trigger_type = 'discord'
        and not (b.discord_role_id = any(new.discord_role_ids))
    );
  return null;
end;
$$;

create trigger on_discord_roles_update
  after update of discord_role_ids on public.profiles
  for each row execute function public.sync_discord_role_badges();

revoke all on function public.check_view_milestones() from public, anon, authenticated;
revoke all on function public.sync_discord_role_badges() from public, anon, authenticated;

-- Mini-site videos shown in The Hub.

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  url text not null,
  thumbnail_url text,
  duration text,
  views_text text
);

create index videos_profile_id_idx on public.videos (profile_id);

alter table public.videos enable row level security;

create policy "Videos are publicly readable"
  on public.videos
  for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own videos"
  on public.videos
  for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

create policy "Users can update their own videos"
  on public.videos
  for update
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

create policy "Users can delete their own videos"
  on public.videos
  for delete
  to authenticated
  using ((select auth.uid()) = profile_id);

-- Mini-site channel stats shown in The Hub.

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null,
  handle text not null,
  followers_text text,
  url text not null
);

create index channels_profile_id_idx on public.channels (profile_id);

alter table public.channels enable row level security;

create policy "Channels are publicly readable"
  on public.channels
  for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own channels"
  on public.channels
  for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

create policy "Users can update their own channels"
  on public.channels
  for update
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

create policy "Users can delete their own channels"
  on public.channels
  for delete
  to authenticated
  using ((select auth.uid()) = profile_id);
