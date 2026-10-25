-- 빈 Supabase 프로젝트에 한 번 적용하는 스키마.
-- 로그인은 없다. anon 키가 있으면 이 테이블을 읽고 쓴다.

create extension if not exists pgcrypto;

create type place_category as enum (
  '맛집', '카페', '자연', '관광', '숙소', '교통', '공항', '쇼핑', '기타'
);
create type place_priority as enum ('필수', '가능하면', '시간되면');
create type transport_type as enum ('비행기', 'KTX', '버스', '렌터카', '페리');
create type expense_category as enum (
  '식비', '카페', '교통/주유', '항공', '숙소', '쇼핑/선물', '놀거리/입장권', '기타'
);
create type payment_method as enum ('현금', '카드', '선불');

create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table trips (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid,
  title               text not null check (char_length(title) between 1 and 120),
  destination_country text not null,
  destination_city    text not null,
  start_date          date not null,
  end_date            date not null,
  companions          text not null,
  cover_emoji         text not null,
  base_currency       char(3) not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint trips_date_order check (end_date >= start_date)
);

create index trips_owner_id_idx on trips (owner_id);

create trigger trips_touch_updated_at
  before update on trips
  for each row execute function touch_updated_at();

create table accommodations (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references trips(id) on delete cascade,
  name           text not null check (char_length(name) >= 1),
  checkin_date   date not null,
  checkout_date  date not null,
  checkin_time   time,
  checkout_time  time,
  address        text,
  booking_ref    text,
  cost           numeric(12, 2) check (cost >= 0),
  memo           text,
  icon           text,
  created_at     timestamptz not null default now(),
  constraint accommodations_date_order check (checkout_date >= checkin_date)
);

create index accommodations_trip_id_idx on accommodations (trip_id);

create table transports (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid not null references trips(id) on delete cascade,
  type            transport_type not null,
  departure_from  text not null check (char_length(departure_from) >= 1),
  arrival_to      text not null check (char_length(arrival_to) >= 1),
  departure_at    timestamp not null,
  arrival_at      timestamp not null,
  booking_ref     text,
  cost            numeric(12, 2) check (cost >= 0),
  memo            text,
  seat1           text,
  seat2           text,
  departure_code  text,
  arrival_code    text,
  created_at      timestamptz not null default now()
);

create index transports_trip_id_idx on transports (trip_id);

create table places (
  id               uuid primary key default gen_random_uuid(),
  trip_id          uuid not null references trips(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 120),
  category         place_category not null,
  address          text,
  lat              double precision check (lat between -90 and 90),
  lng              double precision check (lng between -180 and 180),
  business_hours   text,
  closed_days      text,
  estimated_cost   numeric(12, 2) check (estimated_cost >= 0),
  cost_currency    char(3),
  duration_min     smallint check (duration_min >= 0),
  priority         place_priority not null default '가능하면',
  day_index        smallint check (day_index > 0),
  order_index      double precision not null default 0,
  memo             text,
  link_url         text,
  photo_url        text,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index places_trip_id_idx on places (trip_id);
create index places_trip_day_idx on places (trip_id, day_index, order_index);
create index places_coords_idx on places (trip_id) where lat is not null and lng is not null;

create trigger places_touch_updated_at
  before update on places
  for each row execute function touch_updated_at();

create table expenses (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references trips(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 120),
  category       expense_category not null,
  amount         numeric(12, 2) not null check (amount >= 0),
  currency       char(3) not null,
  date           date not null,
  day_index      smallint check (day_index > 0),
  payment_method payment_method not null,
  paid_by        text,
  place_id       uuid references places(id) on delete set null,
  memo           text,
  is_manual      boolean not null default true,
  is_blur        boolean not null default false,
  created_at     timestamptz not null default now()
);

create index expenses_trip_id_idx on expenses (trip_id);
create index expenses_trip_day_idx on expenses (trip_id, day_index);
create index expenses_place_id_idx on expenses (place_id) where place_id is not null;

create table checklist_categories (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  icon        text not null,
  order_index double precision not null default 0,
  created_at  timestamptz not null default now()
);

create index checklist_categories_trip_id_idx on checklist_categories (trip_id);

create table checklist_items (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references checklist_categories(id) on delete cascade,
  trip_id     uuid not null references trips(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  is_checked  boolean not null default false,
  notes       text,
  order_index double precision not null default 0,
  created_at  timestamptz not null default now()
);

create index checklist_items_category_id_idx on checklist_items (category_id);
create index checklist_items_trip_id_idx on checklist_items (trip_id);

create table wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  icon        text not null,
  title       text not null check (char_length(title) between 1 and 2000),
  content     text,
  order_index double precision not null default 0,
  created_at  timestamptz not null default now()
);

create index wishlist_items_trip_id_idx on wishlist_items (trip_id);

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

create table trip_people (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references trips(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  emoji        text not null default '',
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now(),
  unique (trip_id, display_name)
);

create index trip_people_trip_id_idx on trip_people (trip_id, sort_order);

alter table trips enable row level security;
alter table accommodations enable row level security;
alter table transports enable row level security;
alter table places enable row level security;
alter table expenses enable row level security;
alter table checklist_categories enable row level security;
alter table checklist_items enable row level security;
alter table wishlist_items enable row level security;
alter table time_capsules enable row level security;
alter table trip_people enable row level security;

create policy "public all trips" on trips
  for all using (true) with check (true);
create policy "public all accommodations" on accommodations
  for all using (true) with check (true);
create policy "public all transports" on transports
  for all using (true) with check (true);
create policy "public all places" on places
  for all using (true) with check (true);
create policy "public all expenses" on expenses
  for all using (true) with check (true);
create policy "public all checklist_categories" on checklist_categories
  for all using (true) with check (true);
create policy "public all checklist_items" on checklist_items
  for all using (true) with check (true);
create policy "public all wishlist_items" on wishlist_items
  for all using (true) with check (true);
create policy "public all time_capsules" on time_capsules
  for all using (true) with check (true);
create policy "public all trip_people" on trip_people
  for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  trips, accommodations, transports, places, expenses,
  checklist_categories, checklist_items, wishlist_items,
  time_capsules, trip_people
  to anon, authenticated;
