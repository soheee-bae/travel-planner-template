import { isMockData } from "@/lib/data-source";
import * as supabaseApi from "@/features/wishlist/api.supabase";
import type {
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  WishlistItem,
} from "@/mocks/fixtures/wishlist";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchWishlist(tripId: string): Promise<WishlistItem[]> {
  if (!isMockData()) return supabaseApi.fetchWishlist(tripId);
  const res = await fetch(`/api/trips/${tripId}/wishlist`);
  return parseJsonOrThrow<WishlistItem[]>(res);
}

export async function createWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
  if (!isMockData()) return supabaseApi.createWishlistItem(input);
  const res = await fetch(`/api/trips/${input.tripId}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<WishlistItem>(res);
}

export async function updateWishlistItem(
  tripId: string,
  id: string,
  patch: UpdateWishlistItemInput,
): Promise<WishlistItem> {
  if (!isMockData()) return supabaseApi.updateWishlistItem(tripId, id, patch);
  const res = await fetch(`/api/trips/${tripId}/wishlist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<WishlistItem>(res);
}

export async function deleteWishlistItem(tripId: string, id: string): Promise<void> {
  if (!isMockData()) return supabaseApi.deleteWishlistItem(tripId, id);
  const res = await fetch(`/api/trips/${tripId}/wishlist/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
