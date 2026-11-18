alter table public.songs
  add column if not exists author text not null default '',
  add column if not exists tone text not null default '',
  add column if not exists lyrics_json jsonb not null default '{"text":""}'::jsonb;

drop policy if exists "Enable update for authenticated users only" on public.songs;
create policy "Enable update for authenticated users only"
  on public.songs
  for update
  to authenticated
  using (true)
  with check (true);

comment on column public.songs.lyrics_json is
  'Song lyrics stored as JSON. Initial shape: {"text":"..."}.';
