"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/app/auth/actions";

const allowedTypes = ["retail", "wholesale", "petrol_pump", "other"];

function readString(formData: FormData, key: string) {
  const candidate = formData.get(key);
  return typeof candidate === "string" ? candidate.trim() : "";
}

export async function createBusiness(_: FormState, formData: FormData): Promise<FormState> {
  const name = readString(formData, "name");
  const type = readString(formData, "type");
  if (name.length < 2 || name.length > 120) return { error: "Enter a business name between 2 and 120 characters." };
  if (!allowedTypes.includes(type)) return { error: "Choose a business type." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: existing } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).maybeSingle();
  if (existing) redirect("/dashboard");
  // The database function creates the business and its owner membership in one transaction.
  // This prevents a partially-created business if a network request fails between two saves.
  const { error } = await supabase.rpc("create_business_with_owner", { p_name: name, p_business_type: type });
  if (error) return { error: "We could not save your business. Please try again." };
  redirect("/dashboard");
}
