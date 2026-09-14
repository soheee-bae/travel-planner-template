update expenses
set category = '놀거리/입장권'
where category::text = '놀거리';

update expenses
set category = '항공'
where title = '제주항공 왕복'
  and category::text in ('교통/주유', '교통');
