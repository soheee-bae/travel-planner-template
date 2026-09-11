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
  '소희 & 준형의 제주', 'KR', '제주도',
  '2026-10-14', '2026-10-16', '커플 · 생일 기념', '🍊', 'KRW'
);
