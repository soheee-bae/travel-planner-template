-- 호스트 SQL Editor용. 채팅에서 잘라 붙이면 42601이 난다.
-- 이 파일 전체를 연 다음 Cmd+A → 붙여넣기 → Run.
-- 기존 제주 여행은 지우지 않고 upsert 한다. 타임캡슐 테이블도 만든다.

alter table expenses add column if not exists is_blur boolean not null default false;
alter table transports add column if not exists seat1 text;
alter table transports add column if not exists seat2 text;
alter table transports add column if not exists departure_code text;
alter table transports add column if not exists arrival_code text;
alter table accommodations add column if not exists icon text;

alter type expense_category add value if not exists '카페';
alter type expense_category add value if not exists '교통/주유';
alter type expense_category add value if not exists '쇼핑/선물';
alter type expense_category add value if not exists '놀거리';

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

alter table time_capsules enable row level security;
drop policy if exists "public all time_capsules" on time_capsules;
create policy "public all time_capsules" on time_capsules
  for all using (true) with check (true);
grant select, insert, update, delete on time_capsules to anon, authenticated;

insert into trips (
  id, owner_id, title, destination_country, destination_city,
  start_date, end_date, companions, cover_emoji, base_currency
) values (
  '00000000-0000-0000-0001-000000000001',
  'a230019a-4548-451f-a09f-1d58ebf5a259',
  '소희랑 준형이랑 귤 까먹으러', 'KR', '제주도',
  '2026-10-14', '2026-10-16', '커플 · 생일 기념', '🍊', 'KRW'
)
on conflict (id) do update set
  owner_id = excluded.owner_id,
  title = excluded.title,
  destination_country = excluded.destination_country,
  destination_city = excluded.destination_city,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  companions = excluded.companions,
  cover_emoji = excluded.cover_emoji,
  base_currency = excluded.base_currency;

insert into accommodations (
  id, trip_id, name, checkin_date, checkout_date,
  checkin_time, checkout_time, address, cost, memo, icon
) values (
  '00000000-0000-0000-0002-000000000010',
  '00000000-0000-0000-0001-000000000001',
  '제주 파라다이스 호텔', '2026-10-14', '2026-10-16',
  '15:00', '11:00', '서귀포시', 220000, '오션뷰 디럭스', '🏨'
)
on conflict (id) do update set
  name = excluded.name,
  checkin_date = excluded.checkin_date,
  checkout_date = excluded.checkout_date,
  checkin_time = excluded.checkin_time,
  checkout_time = excluded.checkout_time,
  address = excluded.address,
  cost = excluded.cost,
  memo = excluded.memo,
  icon = excluded.icon;

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
  )
on conflict (id) do update set
  type = excluded.type,
  departure_from = excluded.departure_from,
  arrival_to = excluded.arrival_to,
  departure_at = excluded.departure_at,
  arrival_at = excluded.arrival_at,
  booking_ref = excluded.booking_ref,
  cost = excluded.cost,
  memo = excluded.memo,
  seat1 = excluded.seat1,
  seat2 = excluded.seat2,
  departure_code = excluded.departure_code,
  arrival_code = excluded.arrival_code;

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

insert into expenses (
  id, trip_id, title, category, amount, currency, date,
  day_index, payment_method, paid_by, place_id, is_manual, is_blur
) values
  (
    '00000000-0000-0000-0005-000000000101',
    '00000000-0000-0000-0001-000000000001',
    '제주항공 왕복', '교통/주유', 148000, 'KRW', '2026-10-14',
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
    '성산일출봉 입장', '놀거리', 5000, 'KRW', '2026-10-16',
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
  is_manual = excluded.is_manual,
  is_blur = excluded.is_blur;

insert into checklist_categories (id, trip_id, name, icon, order_index) values
  ('00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000001', '맛집/카페', '☕', 0),
  ('00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000001', '관광', '🌊', 1),
  ('00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000001', '선물/기념품', '🍊', 2),
  ('00000000-0000-0000-0006-000000000104', '00000000-0000-0000-0001-000000000001', '쇼핑', '🛍️', 3),
  ('00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000001', '기타', '🎸', 4)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
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
  )
on conflict (id) do update set
  sort_order = excluded.sort_order,
  unlock_at = excluded.unlock_at,
  title = excluded.title,
  summary = excluded.summary,
  locked_toast = excluded.locked_toast,
  popup_title = excluded.popup_title,
  popup_text = excluded.popup_text,
  img_src = excluded.img_src,
  plays_confetti = excluded.plays_confetti;
