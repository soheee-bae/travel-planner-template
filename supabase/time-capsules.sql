-- 호스트 SQL Editor에 붙여넣기. 기존 여행 데이터는 지우지 않는다.
-- 이미 테이블이 있으면 시드만 넣는다.

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
    '이번 제주도 여행의 전속 가이드,<br><b>배소희</b> 인사드립니다! (꾸벅)<br><br><b>VVIP 준형</b> 고객님, 탑승 준비되셨나요? ✈️<br><br>첫 번째 투어 미션:<br>비행기 이륙 전 가이드랑<br>세상에서 제일 신난 표정으로 예쁘게 셀카 1장 찍기! 📸<br><br>자, 그럼 만족도 200% 보장 <b>소희 투어</b>,<br>지금 바로 출발합니다아~ 🍊<br>꽉 잡으십쇼!',
    '/illustrations/firststep.png', false
  ),
  (
    '00000000-0000-0000-0009-000000000002',
    '00000000-0000-0000-0001-000000000001',
    2, '2026-10-15 12:00:00+09',
    '둘째 날 점심 🍽️', '맛있는 점심 먹으면서 열어봐!',
    '이 메시지는 10월 15일 낮 12시에 열려!',
    '든든하게 먹고 놀자',
    '어제 일정 소화하느라 고생했어!<br><br>오늘 밥도 꿀맛이지? 🐷<br><br>다 먹고 오후 일정도<br>신나게 달려보자구!',
    '/illustrations/secondstep.png', false
  ),
  (
    '00000000-0000-0000-0009-000000000003',
    '00000000-0000-0000-0001-000000000001',
    3, '2026-10-15 18:00:00+09',
    '생일 파티 타임 🎂', '케이크에 불 붙이고 열어봐!',
    '이 메시지는 10월 15일 저녁 6시에 열려!',
    '미리 해피 벌스데이!',
    '<b>서프라이즈!</b> 🎉<br><br>소희 가이드가 준비한<br><b>선물 교환권</b>입니다.<br><br>지금 바로 뽀뽀 3번 해주시면<br>실물 <b>버즈 케이스</b>와 <b>손편지</b>로<br>교환해 드립니다 🎁',
    '/illustrations/thridstep.png', true
  ),
  (
    '00000000-0000-0000-0009-000000000004',
    '00000000-0000-0000-0001-000000000001',
    4, '2026-10-16 12:00:00+09',
    '진짜 생일 당일! 🎉', '준형아 생일 축하해!',
    '이 메시지는 10월 16일 낮 12시에 열려!',
    '태어나줘서 고마워',
    '드디어 <b>진짜 생일 당일!</b><br><br>네가 있어서 이번 제주도 여행이<br>훨씬 더 빛나고 행복해.<br><br>오늘 하루도 최고로 만들어줄게 💖',
    '/illustrations/fourthstep.png', false
  ),
  (
    '00000000-0000-0000-0009-000000000005',
    '00000000-0000-0000-0001-000000000001',
    5, '2026-10-16 20:00:00+09',
    '아쉬운 귀국길 🌙', '비행기 타기 전 마지막 편지',
    '이 메시지는 10월 16일 저녁 8시에 열려!',
    '우리의 다음 여행은?',
    '시간 진짜 빠르다 ㅠㅠ<br><br>이번 여행 내내 나 챙겨주고<br>운전하느라 너무 고생 많았어!<br><br>우리 다음엔 어디로 놀러 갈까?<br><br><b>사랑해</b> 🥰',
    '/illustrations/fifthstep.png', false
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
