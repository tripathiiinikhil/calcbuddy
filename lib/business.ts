import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentBusiness = {
  id: string;
  name: string;
  business_type: string;
  role: string;
};

export async function getAuthenticatedBusiness() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, role, businesses(id, name, business_type)")
    .eq("user_id", user.id)
    .maybeSingle();

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
}

