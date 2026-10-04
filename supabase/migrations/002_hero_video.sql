-- Only needed if you already ran the first schema.sql. Run once in the Supabase SQL Editor.
alter table settings add column if not exists hero_title text not null default 'Himalayan flavors, made from scratch.';
alter table settings add column if not exists hero_subtitle text not null default 'Nepali and Indian cooking in San Marcos.';
alter table settings add column if not exists hero_video_url text;

insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict do nothing;
create policy "site media public read" on storage.objects for select using (bucket_id = 'site');
create policy "site media admin write" on storage.objects for all
  using (bucket_id = 'site' and is_admin()) with check (bucket_id = 'site' and is_admin());

update settings set story = replace(story, 'in our truck', 'in our kitchen') where id = 1;
