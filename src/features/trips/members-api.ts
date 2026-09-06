import { createClient } from "@/lib/supabase/client";

export async function inviteTripMember(tripId: string, email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("invite_trip_member", {
    p_trip_id: tripId,
    p_email: email,
  });
  if (error) throw new Error(error.message);
}
