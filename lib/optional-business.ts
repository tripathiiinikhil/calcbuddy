import { createClient } from "@/lib/supabase/server";
import { getBusinessMembership, type CurrentBusiness } from "@/lib/business";

/** Reads business identity when available without turning public tools into a login wall. */
export async function getOptionalBusiness(): Promise<{ business: CurrentBusiness | null; isLoggedIn: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { business: null, isLoggedIn: false };
  const { data: membership } = await getBusinessMembership(supabase, user.id);
  if (!membership?.businesses) return { business: null, isLoggedIn: true };
  const business = membership.businesses as unknown as Omit<CurrentBusiness, "role">;
  return { business: { ...business, role: membership.role }, isLoggedIn: true };
}
