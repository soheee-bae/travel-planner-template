-- 비용 항목을 화면에만 숨길 때 쓴다. 합계·정산 계산에는 그대로 포함된다.
alter table expenses
  add column if not exists is_blur boolean not null default false;
