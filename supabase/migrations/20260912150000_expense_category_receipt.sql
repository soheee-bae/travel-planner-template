-- 비용 카테고리를 영수증 모달 7종으로 맞춘다. 기존 enum 값은 남겨 둔다.
alter type expense_category add value if not exists '교통/주유';
alter type expense_category add value if not exists '쇼핑/선물';
alter type expense_category add value if not exists '놀거리';
