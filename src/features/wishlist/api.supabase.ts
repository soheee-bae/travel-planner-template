import { createClient } from "@/lib/supabase/client";
import { asRequiredNumber, throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import type {
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  WishlistItem,
} from "@/mocks/fixtures/wishlist";

interface WishlistRow {
  id: string;
  trip_id: string;
  icon: string;
  title: string;
  content: string | null;
  order_index: number | string;
}

function toItem(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    icon: row.icon,
    title: row.title,
    content: row.content ?? undefined,
    orderIndex: asRequiredNumber(row.order_index),
  };
}

export async function fetchWishlist(tripId: string): Promise<WishlistItem[]> {
  const supabase = createClient();
  const result = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index");
  return throwIfError(result).map(toItem);
}

export async function createWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
  const supabase = createClient();
  const result = await supabase
    .from("wishlist_items")
    .insert({
      trip_id: input.tripId,
      icon: input.icon,
      title: input.title,
      content: input.content ?? null,
      order_index: input.orderIndex,
    })
    .select("*")
    .single();
  return toItem(throwIfError(result));
}

export async function updateWishlistItem(
  tripId: string,
  id: string,
  patch: UpdateWishlistItemInput,
): Promise<WishlistItem> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (patch.icon !== undefined) row.icon = patch.icon;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.content !== undefined) row.content = patch.content ?? null;
  if (patch.orderIndex !== undefined) row.order_index = patch.orderIndex;
  const result = await supabase
    .from("wishlist_items")
    .update(row)
    .eq("trip_id", tripId)
    .eq("id", id)
    .select("*")
    .single();
  return toItem(throwIfError(result));
}

export async function deleteWishlistItem(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("trip_id", tripId)
    .eq("id", id);
  throwIfWriteError(error);
}
