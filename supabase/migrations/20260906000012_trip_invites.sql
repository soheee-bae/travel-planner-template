create table trip_invites (
  token text primary key,
  trip_id uuid not null references trips(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index trip_invites_trip_id_idx on trip_invites (trip_id);

alter table trip_invites enable row level security;

create policy "owner manages invites" on trip_invites
  for all using (
    exists (select 1 from trips t where t.id = trip_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from trips t where t.id = trip_id and t.owner_id = auth.uid())
  );

create or replace function create_trip_invite(p_trip_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  tok text;
begin
  if not exists (
    select 1 from trips t where t.id = p_trip_id and t.owner_id = auth.uid()
  ) then
    raise exception 'only the owner can create invite links';
  end if;

  tok := encode(gen_random_bytes(16), 'hex');
  insert into trip_invites (token, trip_id, created_by)
  values (tok, p_trip_id, auth.uid());
  return tok;
end;
$$;

create or replace function accept_trip_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv trip_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select * into inv from trip_invites where token = p_token;
  if not found then
    raise exception '유효하지 않은 초대 링크입니다.';
  end if;
  if inv.expires_at < now() then
    raise exception '만료된 초대 링크입니다.';
  end if;
  if exists (select 1 from trips t where t.id = inv.trip_id and t.owner_id = auth.uid()) then
    return inv.trip_id;
  end if;

  insert into trip_members (trip_id, user_id)
  values (inv.trip_id, auth.uid())
  on conflict do nothing;

  return inv.trip_id;
end;
$$;

create or replace function list_trip_members(p_trip_id uuid)
returns table (user_id uuid, email text, role text, is_owner boolean)
language sql
security definer
set search_path = public
as $$
  select t.owner_id, u.email::text, 'owner'::text, true
  from trips t
  join auth.users u on u.id = t.owner_id
  where t.id = p_trip_id and is_trip_owner(p_trip_id)
  union all
  select m.user_id, u.email::text, m.role, false
  from trip_members m
  join auth.users u on u.id = m.user_id
  where m.trip_id = p_trip_id and is_trip_owner(p_trip_id);
$$;

create or replace function remove_trip_member(p_trip_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from trips t where t.id = p_trip_id and t.owner_id = auth.uid()
  ) then
    raise exception 'only the owner can remove members';
  end if;
  delete from trip_members where trip_id = p_trip_id and user_id = p_user_id;
end;
$$;

grant execute on function create_trip_invite(uuid) to authenticated;
grant execute on function accept_trip_invite(text) to authenticated;
grant execute on function list_trip_members(uuid) to authenticated;
grant execute on function remove_trip_member(uuid, uuid) to authenticated;
