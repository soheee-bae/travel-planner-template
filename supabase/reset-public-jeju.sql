-- 호스트 SQL Editor에 이 파일 전체를 붙여넣는다 (Raw에서 Ctrl+A).
-- 채팅에서 잘라 붙이면 42601이 난다.
-- https://github.com/soheee-bae/travel-planner/blob/feature/travel-planner-basic/supabase/reset-public-jeju.sql
--
-- 하는 일:
-- 1) owner_id의 auth.users FK 제거 (로그인 없이 trips 유지)
-- 2) RLS를 anon 전체 허용으로 교체 (anon 키 있는 사람은 누구나 읽고 씀)
-- 3) trips 전부 삭제 (스크린샷의 '제주도여행' 포함, cascade)
-- 4) 제주 시드 한 건만 다시 넣음. User UID 필요 없음.

alter table trips drop constraint if exists trips_owner_id_fkey;
alter table trips alter column owner_id drop not null;

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

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  trips, accommodations, transports, places, expenses,
  checklist_categories, checklist_items, wishlist_items
  to anon, authenticated;
grant select on trip_totals, trip_cost_by_category, trip_cost_by_day to anon, authenticated;

delete from trips;

insert into trips (
  id, owner_id, title, destination_country, destination_city,
  start_date, end_date, companions, cover_emoji, base_currency
) values (
  '00000000-0000-0000-0001-000000000001',
  null,
  '소희랑 준형이랑 귤 까먹으러', 'KR', '제주도',
  '2026-10-14', '2026-10-16', '커플 · 생일 기념', '🍊', 'KRW'
);
-- 숙소 (홈 카드 고정 시드)
insert into accommodations (
  id, trip_id, name, checkin_date, checkout_date,
  checkin_time, checkout_time, address, cost, memo
) values (
  '00000000-0000-0000-0002-000000000010',
  '00000000-0000-0000-0001-000000000001',
  '제주 파라다이스 호텔', '2026-10-14', '2026-10-16',
  '15:00', '11:00', '서귀포시', 220000, '오션뷰 디럭스'
)
on conflict (id) do update set
  name = excluded.name,
  checkin_date = excluded.checkin_date,
  checkout_date = excluded.checkout_date,
  checkin_time = excluded.checkin_time,
  checkout_time = excluded.checkout_time,
  address = excluded.address,
  cost = excluded.cost,
  memo = excluded.memo;

-- 교통 (항공 왕복 + 렌터카. 홈 UI는 렌터카 행을 숨길 수 있음)
insert into transports (
  id, trip_id, type, departure_from, arrival_to,
  departure_at, arrival_at, booking_ref, cost, memo
) values
  (
    '00000000-0000-0000-0003-000000000010',
    '00000000-0000-0000-0001-000000000001',
    '비행기', '서울 김포', '제주',
    '2026-10-14T08:20', '2026-10-14T09:30', '제주항공', 98000,
    'JEJU AIR · 7C101'
  ),
  (
    '00000000-0000-0000-0003-000000000011',
    '00000000-0000-0000-0001-000000000001',
    '비행기', '제주', '서울 김포',
    '2026-10-16T19:10', '2026-10-16T20:20', '제주항공', 98000,
    'JEJU AIR · 7C102'
  ),
  (
    '00000000-0000-0000-0003-000000000012',
    '00000000-0000-0000-0001-000000000001',
    '렌터카', '제주공항', '제주공항',
    '2026-10-14T10:00', '2026-10-16T17:00', '롯데렌터카', 145000,
    null
  )
on conflict (id) do update set
  type = excluded.type,
  departure_from = excluded.departure_from,
  arrival_to = excluded.arrival_to,
  departure_at = excluded.departure_at,
  arrival_at = excluded.arrival_at,
  booking_ref = excluded.booking_ref,
  cost = excluded.cost,
  memo = excluded.memo;

-- 장소: fixtures 3곳 + 시안 리스트 예시(협재·오설록·성산·카페 드 파리·흑돼지)
-- 위경도는 공개 POI 대략값. 카페 드 파리·흑돼지 거리는 구역이라 좌표를 비움.
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
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  duration_min = excluded.duration_min,
  priority = excluded.priority,
  day_index = excluded.day_index,
  order_index = excluded.order_index,
  tags = excluded.tags;

-- 비용: 시안 칩 비율에 맞춤
-- 교통(항공+렌터) 243000 / 숙소 220000 / 식비 68000+32000 / 관광 5000 / 쇼핑 45000
-- 합계 613000원. 비용 enum에 '카페'가 없어 오설록은 식비로 넣었다.
insert into expenses (
  id, trip_id, title, category, amount, currency, date,
  day_index, payment_method, paid_by, place_id, is_manual
) values
  (
    '00000000-0000-0000-0005-000000000101',
    '00000000-0000-0000-0001-000000000001',
    '제주항공 왕복', '교통/주유', 148000, 'KRW', '2026-10-14',
    1, '카드', '준형', null, true
  ),
  (
    '00000000-0000-0000-0005-000000000102',
    '00000000-0000-0000-0001-000000000001',
    '파라다이스 호텔', '숙소', 220000, 'KRW', '2026-10-14',
    1, '카드', '같이', null, true
  ),
  (
    '00000000-0000-0000-0005-000000000103',
    '00000000-0000-0000-0001-000000000001',
    '롯데렌터카', '교통/주유', 95000, 'KRW', '2026-10-14',
    1, '카드', '같이', null, true
  ),
  (
    '00000000-0000-0000-0005-000000000104',
    '00000000-0000-0000-0001-000000000001',
    '흑돼지 저녁 2인', '식비', 68000, 'KRW', '2026-10-14',
    1, '카드', '소희', '00000000-0000-0000-0004-000000000108', true
  ),
  (
    '00000000-0000-0000-0005-000000000105',
    '00000000-0000-0000-0001-000000000001',
    '성산일출봉 입장', '놀거리', 5000, 'KRW', '2026-10-16',
    3, '현금', '소희', '00000000-0000-0000-0004-000000000106', true
  ),
  (
    '00000000-0000-0000-0005-000000000106',
    '00000000-0000-0000-0001-000000000001',
    '오설록', '식비', 32000, 'KRW', '2026-10-14',
    1, '카드', '소희', '00000000-0000-0000-0004-000000000105', true
  ),
  (
    '00000000-0000-0000-0005-000000000107',
    '00000000-0000-0000-0001-000000000001',
    '기념품', '쇼핑/선물', 45000, 'KRW', '2026-10-15',
    2, '카드', '같이', null, true
  )
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  amount = excluded.amount,
  currency = excluded.currency,
  date = excluded.date,
  day_index = excluded.day_index,
  payment_method = excluded.payment_method,
  paid_by = excluded.paid_by,
  place_id = excluded.place_id,
  is_manual = excluded.is_manual;

insert into checklist_categories (id, trip_id, name, icon, order_index) values
  ('00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '예약 관련', '✈️', 0),
  ('00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '서류/필수', '📄', 1),
  ('00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000001', '디지털', '📱', 2),
  ('00000000-0000-0000-0006-000000000104', '00000000-0000-0000-0001-000000000001', '금융', '💱', 3),
  ('00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '패킹리스트', '🧳', 4)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  order_index = excluded.order_index;

insert into checklist_items (id, category_id, trip_id, title, is_checked, notes, order_index) values
  ('00000000-0000-0000-0007-000000000101', '00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '항공권 예약', true, '공통', 0),
  ('00000000-0000-0000-0007-000000000102', '00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '숙소 예약', true, '소희', 1),
  ('00000000-0000-0000-0007-000000000103', '00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '렌터카 예약', false, '준형', 2),
  ('00000000-0000-0000-0007-000000000104', '00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '투어/액티비티 예약', false, '공통', 3),
  ('00000000-0000-0000-0007-000000000105', '00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '여권 유효기간 확인', false, '소희', 0),
  ('00000000-0000-0000-0007-000000000106', '00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '여행자보험 가입', false, '준형', 1),
  ('00000000-0000-0000-0007-000000000107', '00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '비자 확인', false, '공통', 2),
  ('00000000-0000-0000-0007-000000000108', '00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '국제운전면허증', false, '소희', 3),
  ('00000000-0000-0000-0007-000000000109', '00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000001', '포켓와이파이/유심 예약', false, '준형', 0),
  ('00000000-0000-0000-0007-000000000110', '00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000001', '오프라인 지도 다운로드', false, '공통', 1),
  ('00000000-0000-0000-0007-000000000111', '00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000001', '교통카드 충전', false, '소희', 2),
  ('00000000-0000-0000-0007-000000000112', '00000000-0000-0000-0006-000000000104', '00000000-0000-0000-0001-000000000001', '환전', false, '준형', 0),
  ('00000000-0000-0000-0007-000000000113', '00000000-0000-0000-0006-000000000104', '00000000-0000-0000-0001-000000000001', '해외결제 카드 확인', false, '공통', 1),
  ('00000000-0000-0000-0007-000000000114', '00000000-0000-0000-0006-000000000104', '00000000-0000-0000-0001-000000000001', '트래블월렛', false, '소희', 2),
  ('00000000-0000-0000-0007-000000000115', '00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '여권 + 사본', false, '준형', 0),
  ('00000000-0000-0000-0007-000000000116', '00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '충전기 / 보조배터리', false, '공통', 1),
  ('00000000-0000-0000-0007-000000000117', '00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '여행용 어댑터', false, '소희', 2),
  ('00000000-0000-0000-0007-000000000118', '00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '상비약', false, '준형', 3),
  ('00000000-0000-0000-0007-000000000119', '00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '세면도구', false, '공통', 4)
on conflict (id) do update set
  title = excluded.title,
  is_checked = excluded.is_checked,
  notes = excluded.notes,
  order_index = excluded.order_index;

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
  )
on conflict (id) do update set
  icon = excluded.icon,
  title = excluded.title,
  content = excluded.content,
  order_index = excluded.order_index;
