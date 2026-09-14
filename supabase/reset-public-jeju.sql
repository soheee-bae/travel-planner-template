-- 호스트 SQL Editor에 이 파일 전체를 붙여넣는다 (Raw에서 Ctrl+A).
-- 채팅에서 잘라 붙이면 42601이 난다.
--
-- 데이터 없음 전제. trips cascade 삭제 후 제주 1건만 다시 넣는다.
-- 스키마도 현재 앱(장소 7종, 비용 7종, 할거리 5종, 메모 제목 2000자)에 맞춘다.
-- 여행 날짜는 이 시드 기준 2026-10-14 ~ 2026-10-16.
-- (앱 mock fixture는 2026-09-17 ~ 19. 호스트는 이 파일 날짜가 맞다.)

-- ---------------------------------------------------------------------------
-- 1) 앱이 안 쓰는 공유·RPC·집계 뷰
-- ---------------------------------------------------------------------------

drop view if exists trip_totals cascade;
drop view if exists trip_cost_by_category cascade;
drop view if exists trip_cost_by_day cascade;

drop function if exists invite_trip_member(uuid, text);
drop function if exists create_trip_invite(uuid);
drop function if exists accept_trip_invite(text);
drop function if exists list_trip_members(uuid);
drop function if exists remove_trip_member(uuid, uuid);
drop function if exists assign_places_to_day(uuid, uuid[], smallint);
drop function if exists reclaim_places_beyond_day(uuid, smallint);
drop function if exists reorder_places(uuid, jsonb);

drop table if exists trip_invites cascade;
drop table if exists trip_members cascade;

-- ---------------------------------------------------------------------------
-- 2) 로그인 없이 쓰기
-- ---------------------------------------------------------------------------

alter table trips drop constraint if exists trips_owner_id_fkey;
alter table trips alter column owner_id drop not null;

alter table expenses add column if not exists is_blur boolean not null default false;
alter table transports add column if not exists seat1 text;
alter table transports add column if not exists seat2 text;
alter table transports add column if not exists departure_code text;
alter table transports add column if not exists arrival_code text;
alter table accommodations add column if not exists icon text;

create table if not exists time_capsules (
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
create index if not exists time_capsules_trip_id_idx on time_capsules (trip_id, sort_order);

-- ---------------------------------------------------------------------------
-- 3) 기존 행 삭제 후 enum을 앱 라벨만 남긴다
-- ---------------------------------------------------------------------------

delete from trips;

alter table places alter column category type text using category::text;
drop type if exists place_category;
create type place_category as enum ('맛집', '카페', '자연', '관광', '숙소', '교통', '공항', '쇼핑', '기타');
alter table places alter column category type place_category using category::place_category;

alter table expenses alter column category type text using category::text;
drop type if exists expense_category;
create type expense_category as enum (
  '식비', '카페', '교통/주유', '항공', '숙소', '쇼핑/선물', '놀거리/입장권', '기타'
);
alter table expenses alter column category type expense_category using category::expense_category;

alter table wishlist_items drop constraint if exists wishlist_items_title_check;
alter table wishlist_items add constraint wishlist_items_title_check
  check (char_length(title) between 1 and 2000);

-- ---------------------------------------------------------------------------
-- 4) RLS: anon 전체 허용
-- ---------------------------------------------------------------------------

drop policy if exists "owner full access to trips" on trips;
drop policy if exists "members can read shared trips" on trips;
drop policy if exists "members can update shared trips" on trips;
drop policy if exists "public all trips" on trips;
drop policy if exists "owner full access to accommodations" on accommodations;
drop policy if exists "public all accommodations" on accommodations;
drop policy if exists "owner full access to transports" on transports;
drop policy if exists "public all transports" on transports;
drop policy if exists "owner full access to places" on places;
drop policy if exists "public all places" on places;
drop policy if exists "owner full access to expenses" on expenses;
drop policy if exists "public all expenses" on expenses;
drop policy if exists "owner full access to checklist_categories" on checklist_categories;
drop policy if exists "public all checklist_categories" on checklist_categories;
drop policy if exists "owner full access to checklist_items" on checklist_items;
drop policy if exists "public all checklist_items" on checklist_items;
drop policy if exists "owner full access to wishlist_items" on wishlist_items;
drop policy if exists "public all wishlist_items" on wishlist_items;
drop policy if exists "public all time_capsules" on time_capsules;

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
alter table time_capsules enable row level security;
create policy "public all time_capsules" on time_capsules
  for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  trips, accommodations, transports, places, expenses,
  checklist_categories, checklist_items, wishlist_items, time_capsules
  to anon, authenticated;

create view trip_totals with (security_invoker = on) as
select trip_id, sum(amount) as total
from expenses
group by trip_id;

create view trip_cost_by_category with (security_invoker = on) as
select
  trip_id,
  category,
  sum(amount) as total,
  round(
    100.0 * sum(amount) / nullif(sum(sum(amount)) over (partition by trip_id), 0)
  )::int as pct
from expenses
group by trip_id, category;

create view trip_cost_by_day with (security_invoker = on) as
select trip_id, day_index, sum(amount) as total
from expenses
group by trip_id, day_index;

grant select on trip_totals, trip_cost_by_category, trip_cost_by_day to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) 제주 시드 (앱 슬러그 trip_jeju = 아래 UUID)
-- ---------------------------------------------------------------------------

insert into trips (
  id, owner_id, title, destination_country, destination_city,
  start_date, end_date, companions, cover_emoji, base_currency
) values (
  '00000000-0000-0000-0001-000000000001',
  null,
  '소희랑 준형이랑 귤 까먹으러', 'KR', '제주도',
  '2026-10-14', '2026-10-16', '커플 · 생일 기념', '🍊', 'KRW'
);

insert into accommodations (
  id, trip_id, name, checkin_date, checkout_date,
  checkin_time, checkout_time, address, cost, memo, icon
) values (
  '00000000-0000-0000-0002-000000000010',
  '00000000-0000-0000-0001-000000000001',
  '제주 파라다이스 호텔', '2026-10-14', '2026-10-16',
  '15:00', '11:00', '서귀포시', 220000, '오션뷰 디럭스', '🏨'
);

insert into transports (
  id, trip_id, type, departure_from, arrival_to,
  departure_at, arrival_at, booking_ref, cost, memo,
  seat1, seat2, departure_code, arrival_code
) values
  (
    '00000000-0000-0000-0003-000000000010',
    '00000000-0000-0000-0001-000000000001',
    '비행기', '서울 김포', '제주',
    '2026-10-14T08:20', '2026-10-14T09:30', '제주항공', 98000,
    'JEJU AIR · 7C101', null, null, 'GMP', 'CJU'
  ),
  (
    '00000000-0000-0000-0003-000000000011',
    '00000000-0000-0000-0001-000000000001',
    '비행기', '제주', '서울 김포',
    '2026-10-16T19:10', '2026-10-16T20:20', '제주항공', 98000,
    'JEJU AIR · 7C102', null, null, 'CJU', 'GMP'
  ),
  (
    '00000000-0000-0000-0003-000000000012',
    '00000000-0000-0000-0001-000000000001',
    '렌터카', '제주공항', '제주공항',
    '2026-10-14T10:00', '2026-10-16T17:00', '롯데렌터카', 145000,
    null, null, null, null, null
  );

insert into places (
  id, trip_id, name, category, address, lat, lng,
  duration_min, priority, day_index, order_index, tags
) values
  (
    '00000000-0000-0000-0004-000000000101',
    '00000000-0000-0000-0001-000000000001',
    '카멜리아힐', '관광', '서귀포시 안덕면', 33.2896, 126.3701,
    90, '필수', 1, 0, array['포토']
  ),
  (
    '00000000-0000-0000-0004-000000000102',
    '00000000-0000-0000-0001-000000000001',
    '올래국수', '맛집', '제주시 귀아랑길', 33.4974, 126.5126,
    45, '필수', 1, 1, array['국수']
  ),
  (
    '00000000-0000-0000-0004-000000000103',
    '00000000-0000-0000-0001-000000000001',
    '월정리 해변', '관광', '제주시 구좌읍 월정리', 33.5565, 126.7958,
    60, '가능하면', 2, 0, array['바다']
  ),
  (
    '00000000-0000-0000-0004-000000000104',
    '00000000-0000-0000-0001-000000000001',
    '협재 해수욕장', '관광', '제주시 한림읍 협재리', 33.3943, 126.2394,
    90, '필수', 2, 1, array['바다']
  ),
  (
    '00000000-0000-0000-0004-000000000105',
    '00000000-0000-0000-0001-000000000001',
    '오설록 티 뮤지엄', '카페', '서귀포시 안덕면', 33.3059, 126.2895,
    60, '가능하면', 1, 2, array['녹차']
  ),
  (
    '00000000-0000-0000-0004-000000000106',
    '00000000-0000-0000-0001-000000000001',
    '성산일출봉', '관광', '서귀포시 성산읍', 33.4581, 126.9425,
    90, '필수', 3, 0, array['일출']
  ),
  (
    '00000000-0000-0000-0004-000000000107',
    '00000000-0000-0000-0001-000000000001',
    '카페 드 파리', '카페', '서귀포시', null, null,
    45, '가능하면', 2, 2, array[]::text[]
  ),
  (
    '00000000-0000-0000-0004-000000000108',
    '00000000-0000-0000-0001-000000000001',
    '흑돼지 거리', '맛집', '제주시', null, null,
    90, '필수', 1, 3, array['흑돼지']
  );

-- 호텔·렌터는 paid_by 같이 → 정산 선물 합계. 오설록은 카페.
insert into expenses (
  id, trip_id, title, category, amount, currency, date,
  day_index, payment_method, paid_by, place_id, is_manual, is_blur
) values
  (
    '00000000-0000-0000-0005-000000000101',
    '00000000-0000-0000-0001-000000000001',
    '제주항공 왕복', '항공', 148000, 'KRW', '2026-10-14',
    1, '카드', '준형', null, true, false
  ),
  (
    '00000000-0000-0000-0005-000000000102',
    '00000000-0000-0000-0001-000000000001',
    '파라다이스 호텔', '숙소', 220000, 'KRW', '2026-10-14',
    1, '카드', '같이', null, true, false
  ),
  (
    '00000000-0000-0000-0005-000000000103',
    '00000000-0000-0000-0001-000000000001',
    '롯데렌터카', '교통/주유', 95000, 'KRW', '2026-10-14',
    1, '카드', '같이', null, true, false
  ),
  (
    '00000000-0000-0000-0005-000000000104',
    '00000000-0000-0000-0001-000000000001',
    '흑돼지 저녁 2인', '식비', 68000, 'KRW', '2026-10-14',
    1, '카드', '소희', '00000000-0000-0000-0004-000000000108', true, false
  ),
  (
    '00000000-0000-0000-0005-000000000105',
    '00000000-0000-0000-0001-000000000001',
    '성산일출봉 입장', '놀거리/입장권', 5000, 'KRW', '2026-10-16',
    3, '현금', '소희', '00000000-0000-0000-0004-000000000106', true, false
  ),
  (
    '00000000-0000-0000-0005-000000000106',
    '00000000-0000-0000-0001-000000000001',
    '오설록', '카페', 32000, 'KRW', '2026-10-14',
    1, '카드', '소희', '00000000-0000-0000-0004-000000000105', true, false
  ),
  (
    '00000000-0000-0000-0005-000000000107',
    '00000000-0000-0000-0001-000000000001',
    '기념품', '쇼핑/선물', 45000, 'KRW', '2026-10-15',
    2, '카드', '같이', null, true, false
  );

insert into checklist_categories (id, trip_id, name, icon, order_index) values
  ('00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '맛집/카페', '☕', 0),
  ('00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '관광', '🌊', 1),
  ('00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000001', '쇼핑/선물', '🛍️', 2),
  ('00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '기타', '🎸', 3);

insert into time_capsules (
  id, trip_id, sort_order, unlock_at,
  title, summary, locked_toast, popup_title, popup_text, img_src, plays_confetti
) values
  (
    '00000000-0000-0000-0009-000000000001',
    '00000000-0000-0000-0001-000000000001',
    1, '2026-10-14 15:00:00+09',
    '설레는 출발 ✈️', '탑승구 앞에서 열어봐!',
    '이 메시지는 10월 14일 오후 3시에 열려!',
    '출발 1시간 전!',
    '이번 제주도 여행의 전속 가이드, 배소희 인사드립니다! (꾸벅) VVIP 준형 고객님, 탑승 준비되셨나요? ✈️ 첫 번째 투어 미션: 비행기 이륙 전 가이드랑 세상에서 제일 신난 표정으로 예쁘게 셀카 1장 찍기! 📸 자, 그럼 만족도 200% 보장 ''소희 투어'' 지금 바로 출발합니다아~ 🍊 꽉 잡으십쇼!',
    '/assets/duck-airport.svg', false
  ),
  (
    '00000000-0000-0000-0009-000000000002',
    '00000000-0000-0000-0001-000000000001',
    2, '2026-10-15 12:00:00+09',
    '둘째 날 점심 🍽️', '맛있는 점심 먹으면서 열어봐!',
    '이 메시지는 10월 15일 낮 12시에 열려!',
    '든든하게 먹고 놀자',
    '어제 일정 소화하느라 고생했어! 오늘 밥도 꿀맛이지? 다 먹고 오후 일정도 신나게 달려보자구 🐷',
    '/assets/duck-lunch.svg', false
  ),
  (
    '00000000-0000-0000-0009-000000000003',
    '00000000-0000-0000-0001-000000000001',
    3, '2026-10-15 18:00:00+09',
    '생일 파티 타임 🎂', '케이크에 불 붙이고 열어봐!',
    '이 메시지는 10월 15일 저녁 6시에 열려!',
    '미리 해피 벌스데이!',
    '서프라이즈! 🎉 소희 가이드가 준비한 선물 교환권입니다. 지금 바로 뽀뽀 3번 해주시면 실물 ''버즈 케이스''와 ''손편지''로 교환해 드립니다 🎁',
    '/assets/duck-gift.svg', true
  ),
  (
    '00000000-0000-0000-0009-000000000004',
    '00000000-0000-0000-0001-000000000001',
    4, '2026-10-16 12:00:00+09',
    '진짜 생일 당일! 🎉', '준형아 생일 축하해!',
    '이 메시지는 10월 16일 낮 12시에 열려!',
    '태어나줘서 고마워',
    '드디어 진짜 생일 당일! 네가 있어서 이번 제주도 여행이 훨씬 더 빛나고 행복해. 오늘 하루도 최고로 만들어줄게 💖',
    '/assets/duck-party.svg', false
  ),
  (
    '00000000-0000-0000-0009-000000000005',
    '00000000-0000-0000-0001-000000000001',
    5, '2026-10-16 20:00:00+09',
    '아쉬운 귀국길 🌙', '비행기 타기 전 마지막 편지',
    '이 메시지는 10월 16일 저녁 8시에 열려!',
    '우리의 다음 여행은?',
    '시간 진짜 빠르다 ㅠㅠ 이번 여행 내내 나 챙겨주고 운전하느라 너무 고생 많았어! 우리 다음엔 어디로 놀러 갈까? 사랑해 🥰',
    '/assets/duck-home.svg', false
  );

insert into wishlist_items (id, trip_id, icon, title, content, order_index) values
  (
    '00000000-0000-0000-0008-000000000101',
    '00000000-0000-0000-0001-000000000001',
    '🍖', '먹고 싶은 것',
    E'- 흑돼지\n- 올래국수\n- 해녀 물회', 0
  ),
  (
    '00000000-0000-0000-0008-000000000102',
    '00000000-0000-0000-0001-000000000001',
    '📸', '포토스팟',
    E'- 카멜리아힐\n- 협재 노을', 1
  ),
  (
    '00000000-0000-0000-0008-000000000103',
    '00000000-0000-0000-0001-000000000001',
    '🛒', '쇼핑 메모',
    '- 오설록 티 / 한라봉 초콜릿', 2
  );
