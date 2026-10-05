"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/app/auth/actions";

const allowedTypes = ["retail", "wholesale", "petrol_pump", "other"];

function readString(formData: FormData, key: string) {
  const candidate = formData.get(key);
  return typeof candidate === "string" ? candidate.trim() : "";
}

export async function initializeBusiness(
  name: string,
  type: string
): Promise<{ success?: boolean; businessId?: string; error?: string }> {
  const cleanName = name.trim();
  const dbType = type === "service" ? "other" : type.trim();

  if (cleanName.length < 2 || cleanName.length > 120) {
    return { error: "Enter a business name between 2 and 120 characters." };
  }
  if (!allowedTypes.includes(dbType)) {
    return { error: "Choose a valid business type." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to set up a business." };
  }

  const { data: existing } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { success: true, businessId: existing.business_id };
  }

  const { data: businessId, error } = await supabase.rpc("create_business_with_owner", {
    p_name: cleanName,
    p_business_type: dbType,
  });

  if (error || !businessId) {
    return { error: error?.message || "We could not save your business. Please try again." };
  }

  return { success: true, businessId: String(businessId) };
}

export async function createBusiness(_: FormState, formData: FormData): Promise<FormState> {
  const name = readString(formData, "name");
  const type = readString(formData, "type");
  const dbType = type === "service" ? "other" : type;
  if (name.length < 2 || name.length > 120) return { error: "Enter a business name between 2 and 120 characters." };
  if (!allowedTypes.includes(dbType)) return { error: "Choose a business type." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: existing } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).maybeSingle();
  if (existing) redirect("/dashboard");

  const { error } = await supabase.rpc("create_business_with_owner", { p_name: name, p_business_type: dbType });
  if (error) return { error: "We could not save your business. Please try again." };
  redirect("/dashboard");
}
