-- 항공 좌석·공항 코드, 숙소 아이콘을 DB에서 읽도록 한다.
alter table transports
  add column if not exists seat1 text,
  add column if not exists seat2 text,
  add column if not exists departure_code text,
  add column if not exists arrival_code text;

alter table accommodations
  add column if not exists icon text;

update transports
set departure_code = case
  when departure_from like '%김포%' then 'GMP'
  when departure_from like '%제주%' then 'CJU'
  when departure_from like '%인천%' then 'ICN'
  else upper(left(departure_from, 3))
end
where departure_code is null;

update transports
set arrival_code = case
  when arrival_to like '%김포%' then 'GMP'
  when arrival_to like '%제주%' then 'CJU'
  when arrival_to like '%인천%' then 'ICN'
  else upper(left(arrival_to, 3))
end
where arrival_code is null;

update accommodations
set icon = '🏨'
where icon is null;
