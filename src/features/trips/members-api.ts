import { createClient } from "@/lib/supabase/client";
import { isMockData } from "@/lib/data-source";

export interface TripMember {
  userId: string;
  email: string;
  role: "owner" | "editor";
  isOwner: boolean;
}

export async function inviteTripMember(tripId: string, email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("invite_trip_member", {
    p_trip_id: tripId,
    p_email: email,
  });
  if (error) throw new Error(error.message);
}

export async function createTripInviteLink(tripId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_trip_invite", { p_trip_id: tripId });
  if (error) throw new Error(error.message);
  if (typeof data !== "string" || !data) throw new Error("초대 링크를 만들지 못했습니다.");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
  return `${origin.replace(/\/$/, "")}/invite/${data}`;
}

export async function acceptTripInvite(token: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("accept_trip_invite", { p_token: token });
  if (error) throw new Error(error.message);
  if (typeof data !== "string" || !data) throw new Error("초대를 수락하지 못했습니다.");
  return data;
}

export async function listTripMembers(tripId: string): Promise<TripMember[]> {
  if (isMockData()) {
    return [{ userId: "me", email: "나", role: "owner", isOwner: true }];
  }
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_trip_members", { p_trip_id: tripId });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{
    user_id: string;
    email: string | null;
    role: string;
    is_owner: boolean;
  }>;
  return rows.map((row) => ({
    userId: row.user_id,
    email: row.email ?? "멤버",
    role: row.is_owner ? "owner" : "editor",
    isOwner: row.is_owner,
  }));
}

export async function removeTripMember(tripId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("remove_trip_member", {
    p_trip_id: tripId,
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}
