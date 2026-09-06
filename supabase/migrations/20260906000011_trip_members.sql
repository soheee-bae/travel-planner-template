-- 공유: owner 외에 초대한 계정도 같은 여행을 읽고 고친다.
-- 기존 is_trip_owner 의미를 "접근 가능한 멤버"로 확장한다.

create table trip_members (
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('editor')),
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create index trip_members_user_id_idx on trip_members (user_id);

alter table trip_members enable row level security;

create or replace function is_trip_owner(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from trips t
    where t.id = p_trip_id and t.owner_id = auth.uid()
  )
  or exists (
    select 1 from trip_members m
    where m.trip_id = p_trip_id and m.user_id = auth.uid()
  );
$$;

create policy "members can read membership" on trip_members
  for select using (is_trip_owner(trip_id));

create policy "owner can insert membership" on trip_members
  for insert with check (
    exists (select 1 from trips t where t.id = trip_id and t.owner_id = auth.uid())
  );

create policy "owner can delete membership" on trip_members
  for delete using (
    exists (select 1 from trips t where t.id = trip_id and t.owner_id = auth.uid())
  );

create or replace function invite_trip_member(p_trip_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if not exists (
    select 1 from trips t where t.id = p_trip_id and t.owner_id = auth.uid()
  ) then
    raise exception 'only the owner can invite';
  end if;

  select u.id into uid
  from auth.users u
  where lower(u.email) = lower(p_email);

  if uid is null then
    raise exception '해당 이메일로 가입한 사용자가 없습니다.';
  end if;

  if uid = auth.uid() then
    raise exception '자기 자신은 초대할 수 없습니다.';
  end if;

  insert into trip_members (trip_id, user_id)
  values (p_trip_id, uid)
  on conflict do nothing;
end;
$$;

grant execute on function invite_trip_member(uuid, text) to authenticated;

create policy "members can read shared trips" on trips
  for select using (is_trip_owner(id));

create policy "members can update shared trips" on trips
  for update using (is_trip_owner(id)) with check (is_trip_owner(id));
