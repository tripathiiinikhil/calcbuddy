"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedBusiness } from "@/lib/business";

const types = ["retail", "wholesale", "petrol_pump", "other"];

export async function updateBusinessProfile(payload: { name: string; businessType: string; logoPath: string | null }) {
  const name = payload.name.trim();
  if (name.length < 2 || name.length > 120) return { error: "Enter a business name between 2 and 120 characters." };
  if (!types.includes(payload.businessType)) return { error: "Choose a valid business type." };
  const { supabase, business } = await getAuthenticatedBusiness();
  if (payload.logoPath && !payload.logoPath.startsWith(`${business.id}/`)) {
    return { error: "The selected logo does not belong to this business." };
  }
  const { error } = await supabase.from("businesses").update({ name, business_type: payload.businessType, logo_path: payload.logoPath }).eq("id", business.id);
  if (error) return { error: "Could not save your business profile. Please try again." };
  revalidatePath("/"); revalidatePath("/settings"); revalidatePath("/counter"); revalidatePath("/calculator"); revalidatePath("/estimates");
  return { success: true };
}
