-- 비용 카테고리를 장소와 맞춘다. 기존 enum 값은 남겨 둔다.
alter type expense_category add value if not exists '관광';
alter type expense_category add value if not exists '맛집';
alter type expense_category add value if not exists '카페';
