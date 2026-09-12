alter table wishlist_items drop constraint if exists wishlist_items_title_check;
alter table wishlist_items add constraint wishlist_items_title_check
  check (char_length(title) between 1 and 2000);
