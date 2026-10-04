-- Full restaurant site: reservations, reviews, feedback, messages, gallery, blog, extra settings.
-- Safe to run once on a database that already has schema.sql. New projects: schema.sql already includes this.

alter table settings add column if not exists email text not null default '';
alter table settings add column if not exists open_time text not null default '12:00';
alter table settings add column if not exists close_time text not null default '21:00';
alter table settings add column if not exists closed_days text not null default '0';
alter table settings add column if not exists philosophy text not null default 'We cook the way our families do: from scratch, with patience, and with spices balanced by hand. Good food takes time, and we never rush it.';
alter table settings add column if not exists about_image_url text;
alter table settings add column if not exists instagram_url text not null default '';
alter table settings add column if not exists facebook_url text not null default '';
alter table settings add column if not exists google_review_url text not null default '';
alter table settings add column if not exists doordash_url text not null default '';
alter table settings add column if not exists reservations_enabled boolean not null default true;
alter table settings add column if not exists catering_enabled boolean not null default true;
alter table menu_items add column if not exists tags text[] not null default '{}';

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  ref bigint generated always as identity (start with 5001),
  kind text not null default 'table' check (kind in ('table','event')),
  name text not null, phone text not null, email text,
  party_size int not null check (party_size between 1 and 500),
  res_date date not null, res_time time not null,
  event_type text, notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled','completed')),
  user_id uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact' check (kind in ('contact','catering')),
  name text not null, email text, phone text,
  event_date date, guests int, message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null, rating int not null check (rating between 1 and 5),
  body text not null, source text not null default 'website',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  rating int check (rating between 1 and 5),
  name text, email text, message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  media_type text not null default 'image' check (media_type in ('image','video')),
  category text not null default 'food' check (category in ('food','restaurant','events')),
  caption text, sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique,
  excerpt text, body text not null default '', cover_url text,
  published boolean not null default false, published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table reservations enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table feedback enable row level security;
alter table gallery_items enable row level security;
alter table posts enable row level security;

drop policy if exists "own reservations or admin" on reservations;
drop policy if exists "admin update reservations" on reservations;
drop policy if exists "admin all messages" on messages;
drop policy if exists "public read published reviews" on reviews;
drop policy if exists "admin all reviews" on reviews;
drop policy if exists "admin all feedback" on feedback;
drop policy if exists "public read gallery" on gallery_items;
drop policy if exists "admin all gallery" on gallery_items;
drop policy if exists "public read posts" on posts;
drop policy if exists "admin all posts" on posts;

create policy "own reservations or admin" on reservations for select using (user_id = auth.uid() or is_admin());
create policy "admin update reservations" on reservations for update using (is_admin()) with check (is_admin());
create policy "admin all messages" on messages for all using (is_admin()) with check (is_admin());
create policy "public read published reviews" on reviews for select using (published);
create policy "admin all reviews" on reviews for all using (is_admin()) with check (is_admin());
create policy "admin all feedback" on feedback for all using (is_admin()) with check (is_admin());
create policy "public read gallery" on gallery_items for select using (visible);
create policy "admin all gallery" on gallery_items for all using (is_admin()) with check (is_admin());
create policy "public read posts" on posts for select using (published);
create policy "admin all posts" on posts for all using (is_admin()) with check (is_admin());
-- Public form submissions (reservations, messages, feedback) are written by the server only.
