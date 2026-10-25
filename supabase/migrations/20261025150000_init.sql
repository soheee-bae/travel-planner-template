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

-- 여행을 넣으면 시크릿 노트 3개가 따라온다. 이미 있는 여행에도 한 번 채운다.
create or replace function public.insert_default_time_capsules(trip_row public.trips)
returns void
language plpgsql
set search_path = public
as $$
declare
  day1 date;
  day2 date;
  day3 date;
begin
  if exists (select 1 from public.time_capsules where trip_id = trip_row.id) then
    return;
  end if;

  day1 := trip_row.start_date;
  day3 := trip_row.end_date;
  day2 := day1 + ((day3 - day1) / 2);

  insert into public.time_capsules (
    trip_id, sort_order, unlock_at, title, summary,
    locked_toast, popup_title, popup_text, img_src, plays_confetti
  ) values
    (
      trip_row.id, 1,
      (day1 + time '15:00') at time zone 'Asia/Seoul',
      '설레는 출발 ✈️', '탑승구 앞에서 열어봐!',
      '이 메시지는 ' || extract(month from day1)::int || '월 ' || extract(day from day1)::int || '일 오후 3시에 열려!',
      '출발 1시간 전!',
      '여행이 시작됐어.<br><br>출발 전에 같이 사진 한 장 남기고 가보자.',
      '/illustrations/firststep.png', false
    ),
    (
      trip_row.id, 2,
      (day2 + time '12:00') at time zone 'Asia/Seoul',
      '둘째 날 점심 🍽️', '맛있는 점심 먹으면서 열어봐!',
      '이 메시지는 ' || extract(month from day2)::int || '월 ' || extract(day from day2)::int || '일 낮 12시에 열려!',
      '든든하게 먹고 놀자',
      '어제 일정 소화하느라 고생했어!<br><br>오늘 밥도 꿀맛이지? 🐷<br><br>다 먹고 오후 일정도<br>신나게 달려보자구!',
      '/illustrations/secondstep.png', false
    ),
    (
      trip_row.id, 3,
      (day3 + time '20:00') at time zone 'Asia/Seoul',
      '아쉬운 귀국길 🌙', '비행기 타기 전 마지막 편지',
      '이 메시지는 ' || extract(month from day3)::int || '월 ' || extract(day from day3)::int || '일 저녁 8시에 열려!',
      '우리의 다음 여행은?',
      '시간 진짜 빠르다.<br><br>다음에 가고 싶은 곳을<br>하나만 정해 보자.',
      '/illustrations/fifthstep.png', false
    );
end;
$$;

create or replace function public.trips_seed_time_capsules()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform public.insert_default_time_capsules(new);
  return new;
end;
$$;

drop trigger if exists trips_seed_time_capsules on public.trips;
create trigger trips_seed_time_capsules
  after insert on public.trips
  for each row execute function public.trips_seed_time_capsules();

-- seed.sql과 같은 샘플. auth.users는 넣지 않는다. 이미 있으면 건너뛴다.
insert into trips (
  id, title, destination_country, destination_city,
  start_date, end_date, companions, cover_emoji, base_currency
) values (
  '00000000-0000-0000-0001-000000000001',
  '여행', 'KR', '여행지',
  '2026-11-06', '2026-11-08', '친구들과', '✈️', 'KRW'
) on conflict (id) do nothing;

insert into accommodations (
  id, trip_id, name, checkin_date, checkout_date,
  checkin_time, checkout_time, address, cost, memo
) values
  (
    '00000000-0000-0000-0002-000000000010',
    '00000000-0000-0000-0001-000000000001',
    '호텔 이름', '2026-11-06', '2026-11-08',
    '15:00', '11:00', '국내 어딘가', 100000, '오션뷰 디럭스'
  ),
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000001',
    '호텔2 이름', '2026-11-06', '2026-11-08',
    '15:00', '11:00', '국내 어딘가', 100000, null
  )
on conflict (id) do nothing;

insert into transports (
  id, trip_id, type, departure_from, arrival_to,
  departure_at, arrival_at, booking_ref, cost,
  memo, seat1, seat2, departure_code, arrival_code
) values
  (
    '00000000-0000-0000-0003-000000000010',
    '00000000-0000-0000-0001-000000000001',
    '비행기', 'SEL', 'SEL',
    '2026-11-06T08:20', '2026-11-06T09:30', 'OO항공', 100000,
    'OO항공 1A111', '10A', '10B', 'SEL', 'SEL'
  ),
  (
    '00000000-0000-0000-0003-000000000011',
    '00000000-0000-0000-0001-000000000001',
    '비행기', 'SEL', 'SEL',
    '2026-11-08T19:10', '2026-11-08T20:20', 'OO항공', 100000,
    'OO항공 1A111', '10A', '10B', 'SEL', 'SEL'
  ),
  (
    '00000000-0000-0000-0003-000000000012',
    '00000000-0000-0000-0001-000000000001',
    '렌터카', 'OO공항', 'OO공항',
    '2026-11-06T10:00', '2026-11-08T17:00', 'OO렌터카', 100000
  )
on conflict (id) do nothing;

insert into places (
  id, trip_id, name, category, address, lat, lng,
  business_hours, closed_days, estimated_cost, cost_currency,
  duration_min, priority, day_index, order_index, memo, tags
) values
  (
    '00000000-0000-0000-0004-000000000001',
    '00000000-0000-0000-0001-000000000001',
    'OO관광지', '관광', '국내 어딘가', 35.204, 137.058,
    '10:00~17:00', '화요일', 100000, 'WON',
    240, '필수', 2, 1, null, array['지브리', '테마파크']
  ),
  (
    '00000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0001-000000000001',
    'OO맛집', '맛집', '국내 어딘가', 35.1656, 136.9057,
    '11:00~22:00', null, 100000, 'WON',
    90, '가능하면', 1, 1, '대기표 먼저 받기', array['히츠마부시']
  ),
  (
    '00000000-0000-0000-0004-000000000003',
    '00000000-0000-0000-0001-000000000001',
    'OO카페', '카페', '국내 어딘가', 35.1709, 136.9088,
    '07:00~20:00', null, 100000, 'WON',
    45, '가능하면', 2, 0, null, array[]::text[]
  )
on conflict (id) do nothing;

insert into expenses (
  id, trip_id, title, category, amount, currency, date,
  day_index, payment_method, paid_by, place_id, is_manual, is_blur
) values
  (
    '00000000-0000-0000-0005-000000000001',
    '00000000-0000-0000-0001-000000000001',
    'OO맛집', '식비', 100000, 'WON', '2026-11-06',
    1, '카드', '이름1', '00000000-0000-0000-0004-000000000002', false, false
  ),
  (
    '00000000-0000-0000-0005-000000000002',
    '00000000-0000-0000-0001-000000000001',
    'OO카페', '식비', 100000, 'WON', '2026-11-07',
    2, '선불', '이름1', '00000000-0000-0000-0004-000000000003', false, false
  ),
  (
    '00000000-0000-0000-0005-000000000003',
    '00000000-0000-0000-0001-000000000001',
    'OO 입장권', '놀거리/입장권', 100000, 'WON', '2026-11-07',
    2, '카드', '이름1', '00000000-0000-0000-0004-000000000001', false, false
  ),
  (
    '00000000-0000-0000-0005-000000000004',
    '00000000-0000-0000-0001-000000000001',
    '지하철 1일 승차권', '교통/주유', 100000, 'WON', '2026-11-07',
    2, '현금', '이름2', null, false, false
  ),
  (
    '00000000-0000-0000-0005-000000000005',
    '00000000-0000-0000-0001-000000000001',
    'OO 기념품', '쇼핑/선물', 100000, 'WON', '2026-11-06',
    1, '카드', '이름2', null, false, true
  ),
  (
    '00000000-0000-0000-0005-000000000006',
    '00000000-0000-0000-0001-000000000001',
    '항공권', '교통/주유', 100000, 'WON', '2026-11-06',
    null, '카드', '이름2', null, true, false
  )
on conflict (id) do nothing;

insert into checklist_categories (id, trip_id, name, icon, order_index) values
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0001-000000000001', '쇼핑/선물', '🛍️', 0),
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0001-000000000001', '맛집/카페', '🍽️', 1),
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0001-000000000001', '관광', '🏛️', 2),
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0001-000000000001', '기타', '🏷️', 3)
on conflict (id) do nothing;

insert into checklist_items (id, category_id, trip_id, title, is_checked, notes, order_index) values
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0001-000000000001', '가족들 선물 사기!', true, '너무 많이는 사지말기!', 0),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0001-000000000001', '맛있는 점심 먹기!', false, '이건 무조건!! 별 100개!!', 1),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0001-000000000001', '뷰 좋은 카페에서 수다떨면서 힐링하기', false, null, 2)
on conflict (id) do nothing;

insert into wishlist_items (id, trip_id, icon, title, content, order_index) values
  ('00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0001-000000000001', '🍜', '추천 맛집들', E'- 인스타에서 본 그 맛집', 0),
  ('00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0001-000000000001', '📸', '포토스팟', E'- 일몰 시간 확인하기', 1),
  ('00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0001-000000000001', '🛒', '쇼핑 메모', '- 할인 쿠폰 다운받기', 2)
on conflict (id) do nothing;

insert into trip_people (trip_id, display_name, emoji, sort_order) values
  ('00000000-0000-0000-0001-000000000001', '이름1', '', 0),
  ('00000000-0000-0000-0001-000000000001', '이름2', '', 1)
on conflict (trip_id, display_name) do nothing;

select public.insert_default_time_capsules(t) from public.trips t;
