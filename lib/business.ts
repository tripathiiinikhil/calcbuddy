import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentBusiness = {
  id: string;
  name: string;
  business_type: string;
  logo_path?: string | null;
  role: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getBusinessMembership(supabase: SupabaseServerClient, userId: string) {
  const result = await supabase
    .from("business_members")
    .select("business_id, role, businesses(id, name, business_type, logo_path)")
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error?.code !== "42703" || !result.error.message.includes("logo_path")) {
    return result;
  }

  const legacyResult = await supabase
    .from("business_members")
    .select("business_id, role, businesses(id, name, business_type)")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    ...legacyResult,
    data: legacyResult.data
      ? { ...legacyResult.data, businesses: legacyResult.data.businesses ? { ...legacyResult.data.businesses, logo_path: null } : null }
      : null,
  };
}

export async function getAuthenticatedBusiness() {
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
    logo_path?: string | null;
  };

  return {
    supabase,
    user,
    business: {
      id: biz.id,
      name: biz.name,
      business_type: biz.business_type,
      logo_path: biz.logo_path ?? null,
      role: membership.role,
    },
  };
}

