-- 장소 카테고리에 숙소를 추가한다. 기존 '액티비티' 값은 enum에 남겨 둔다.
alter type place_category add value if not exists '숙소';
