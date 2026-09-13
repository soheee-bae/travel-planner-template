create table time_capsules (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid not null references trips(id) on delete cascade,
  sort_order      smallint not null check (sort_order between 1 and 20),
  unlock_at       timestamptz not null,
  title           text not null check (char_length(title) between 1 and 80),
  summary         text not null check (char_length(summary) between 1 and 200),
  locked_toast    text not null check (char_length(locked_toast) between 1 and 200),
  popup_title     text not null check (char_length(popup_title) between 1 and 80),
  popup_text      text not null check (char_length(popup_text) between 1 and 2000),
  img_src         text not null check (char_length(img_src) between 1 and 300),
  plays_confetti  boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (trip_id, sort_order)
);

create index time_capsules_trip_id_idx on time_capsules (trip_id, sort_order);

alter table time_capsules enable row level security;

create policy "public all time_capsules" on time_capsules
  for all using (true) with check (true);

grant select, insert, update, delete on time_capsules to anon, authenticated;
