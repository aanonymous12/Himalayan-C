-- Run this whole file once in Supabase: SQL Editor > New query > Run.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select coalesce((select is_admin from profiles where id = auth.uid()), false) $$;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create table settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Himalayan Nepalese & Indian Cuisine',
  phone text not null default '(512) 748-0104',
  address text not null default E'115 Wonder World Drive\nSan Marcos, TX 78666',
  hours text not null default E'Monday to Saturday: 12:00 PM to 9:00 PM\nSunday: Closed',
  story text not null default '',
  hero_title text not null default 'Himalayan flavors, made from scratch.',
  hero_subtitle text not null default 'Nepali and Indian cooking in San Marcos.',
  hero_video_url text,
  announcement text not null default '',
  tax_rate numeric(5,4) not null default 0.0825,
  accepting_orders boolean not null default true
);
insert into settings (id, story) values (1,
  'Our recipes come from home kitchens in Nepal and India, passed down and cooked the same way we have always cooked them. Everything is made fresh each day in our kitchen: curries simmered slowly, momos folded by hand, naan baked to order in the tandoor. Come say hello on Wonder World Drive.');

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique,
  description text, sort_order int not null default 0,
  visible boolean not null default true
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories on delete cascade,
  name text not null, description text,
  price numeric(8,2),                          -- null when the dish has size/protein options
  options jsonb not null default '[]',         -- [{"label":"Chicken","price":14.99}]
  image_url text,
  vegetarian boolean not null default false,
  featured boolean not null default false,
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001),
  user_id uuid references auth.users on delete set null,   -- null = guest order
  customer_name text not null, phone text not null, email text,
  notes text, pickup_time text not null default 'ASAP',
  status text not null default 'new' check (status in ('new','preparing','ready','completed','cancelled')),
  subtotal numeric(10,2) not null, tax numeric(10,2) not null, total numeric(10,2) not null,
  created_at timestamptz not null default now()
);
create index orders_created_idx on orders (created_at desc);
create index orders_user_idx on orders (user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  menu_item_id uuid references menu_items on delete set null,
  name text not null, option_label text,
  unit_price numeric(8,2) not null, qty int not null check (qty > 0)
);
create index order_items_order_idx on order_items (order_id);

-- Row Level Security
alter table profiles enable row level security;
alter table settings enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "own profile or admin" on profiles for select using (id = auth.uid() or is_admin());
create policy "public read settings" on settings for select using (true);
create policy "admin write settings" on settings for all using (is_admin()) with check (is_admin());
create policy "public read categories" on menu_categories for select using (true);
create policy "admin write categories" on menu_categories for all using (is_admin()) with check (is_admin());
create policy "public read items" on menu_items for select using (true);
create policy "admin write items" on menu_items for all using (is_admin()) with check (is_admin());
create policy "own orders or admin" on orders for select using (user_id = auth.uid() or is_admin());
create policy "admin update orders" on orders for update using (is_admin()) with check (is_admin());
create policy "own order items or admin" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
-- No insert policies on orders: orders are created only by the server (service role), after prices are re-checked.

-- Menu photos
insert into storage.buckets (id, name, public) values ('menu', 'menu', true) on conflict do nothing;
create policy "menu photos public read" on storage.objects for select using (bucket_id = 'menu');
create policy "menu photos admin write" on storage.objects for all
  using (bucket_id = 'menu' and is_admin()) with check (bucket_id = 'menu' and is_admin());

-- Homepage video / media
insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict do nothing;
create policy "site media public read" on storage.objects for select using (bucket_id = 'site');
create policy "site media admin write" on storage.objects for all
  using (bucket_id = 'site' and is_admin()) with check (bucket_id = 'site' and is_admin());


-- ===== Full restaurant site tables =====
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

-- Already ran an older version of this file? Update the story text with:
-- update settings set story = replace(story, 'in our truck', 'in our kitchen') where id = 1;

-- After you sign up on the site, make yourself admin (swap in your email):
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
