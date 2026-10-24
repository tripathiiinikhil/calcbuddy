import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentBusiness = {
  id: string;
  name: string;
  business_type: string;
  role: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getBusinessMembership(supabase: SupabaseServerClient, userId: string) {
  const result = await supabase
    .from("business_members")
    .select("business_id, role, businesses(id, name, business_type)")
    .eq("user_id", userId)
    .maybeSingle();
  return result;
}

export const getAuthenticatedBusiness = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await getBusinessMembership(supabase, user.id);

  if (!membership || !membership.businesses) {
    redirect("/onboarding");
  }

  const biz = membership.businesses as unknown as {
    id: string;
    name: string;
    business_type: string;
  };

  return {
    supabase,
    user,
    business: {
      id: biz.id,
      name: biz.name,
      business_type: biz.business_type,
      role: membership.role,
    },
  };
});

