-- V1: 로그인 없음. anon 키가 있으면 누구나 읽고 쓴다.
-- 커플 전용 개인 프로젝트 전제. 공개 서비스에 쓰면 안 된다.

alter table trips drop constraint if exists trips_owner_id_fkey;
alter table trips alter column owner_id drop not null;

drop policy if exists "owner full access to trips" on trips;
drop policy if exists "members can read shared trips" on trips;
drop policy if exists "members can update shared trips" on trips;
drop policy if exists "owner full access to accommodations" on accommodations;
drop policy if exists "owner full access to transports" on transports;
drop policy if exists "owner full access to places" on places;
drop policy if exists "owner full access to expenses" on expenses;
drop policy if exists "owner full access to checklist_categories" on checklist_categories;
drop policy if exists "owner full access to checklist_items" on checklist_items;
drop policy if exists "owner full access to wishlist_items" on wishlist_items;

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
