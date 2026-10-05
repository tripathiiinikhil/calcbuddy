import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getBusinessMembership, type CurrentBusiness } from "@/lib/business";

/** Reads business identity when available without turning public tools into a login wall. */
export const getOptionalBusiness = cache(
  async (): Promise<{ business: CurrentBusiness | null; isLoggedIn: boolean }> => {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const hasAuthCookie = allCookies.some(
      (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
    );

    if (!hasAuthCookie) {
      return { business: null, isLoggedIn: false };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { business: null, isLoggedIn: false };

    const { data: membership } = await getBusinessMembership(supabase, user.id);
    if (!membership?.businesses) return { business: null, isLoggedIn: true };

    const business = membership.businesses as unknown as Omit<CurrentBusiness, "role">;
    return { business: { ...business, role: membership.role }, isLoggedIn: true };
  }
);
