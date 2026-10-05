"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedBusiness } from "@/lib/business";

export interface EstimateLineItemInput {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateEstimatePayload {
  customer_id?: string | null;
  customer_name: string;
  estimate_number?: string;
  issued_at?: string;
  discount_amount?: number;
  notes?: string | null;
  items: EstimateLineItemInput[];
}

export async function createEstimate(payload: CreateEstimatePayload): Promise<{
  success?: boolean;
  error?: string;
  estimateId?: string;
}> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const customerName = payload.customer_name?.trim() || "Walk-in customer";

    if (!payload.items || payload.items.length === 0) {
      return { error: "Please add at least one line item to the estimate." };
    }

    // Generate or validate estimate number
    let estimateNumber = payload.estimate_number?.trim();
    if (!estimateNumber) {
      const { count } = await supabase
        .from("estimates")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id);

      const nextNum = (count || 0) + 1;
      estimateNumber = `EST-${String(nextNum).padStart(3, "0")}`;
    }

    // Calculate totals
    let subtotal = 0;
    const validatedItems = payload.items.map((item, idx) => {
      const pName = item.product_name?.trim() || "Item";
      const qty = Math.max(0.001, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.unit_price) || 0);
      const lineTotal = Math.round(qty * price * 100) / 100;
      subtotal += lineTotal;
      return {
        product_name: pName,
        quantity: qty,
        unit_price: price,
        line_total: lineTotal,
        position: idx,
      };
    });

    const discount = Math.max(0, Number(payload.discount_amount) || 0);
    const totalAmount = Math.max(0, subtotal - discount);

    // Save estimate record
    const { data: estimate, error: estError } = await supabase
      .from("estimates")
      .insert({
        business_id: business.id,
        estimate_number: estimateNumber,
        customer_name: customerName,
        customer_id: payload.customer_id || null,
        subtotal_amount: subtotal,
        discount_amount: discount,
        total_amount: totalAmount,
        notes: payload.notes?.trim() || null,
        issued_at: payload.issued_at || new Date().toISOString(),
      })
      .select("id")
      .single();

    if (estError || !estimate) {
      console.error("Error creating estimate:", estError);
      // If error is about missing columns from optional migration, retry with base columns
      if (estError.message?.includes("subtotal_amount") || estError.message?.includes("discount_amount")) {
        const { data: fallbackEstimate, error: fallbackError } = await supabase
          .from("estimates")
          .insert({
            business_id: business.id,
            estimate_number: estimateNumber,
            customer_name: customerName,
            total_amount: totalAmount,
            issued_at: payload.issued_at || new Date().toISOString(),
          })
          .select("id")
          .single();

        if (fallbackError || !fallbackEstimate) {
          return { error: "Failed to create estimate. Please try again." };
        }

        const itemsToInsert = validatedItems.map((item) => ({
          ...item,
          estimate_id: fallbackEstimate.id,
        }));
        await supabase.from("estimate_items").insert(itemsToInsert);

        revalidatePath("/estimates");
        revalidatePath("/dashboard");
        return { success: true, estimateId: fallbackEstimate.id };
      }

      return { error: estError.message || "Failed to create estimate." };
    }

    // Insert estimate items
    const itemsToInsert = validatedItems.map((item) => ({
      estimate_id: estimate.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
      position: item.position,
    }));

    const { error: itemsError } = await supabase
      .from("estimate_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error creating estimate items:", itemsError);
    }

    revalidatePath("/estimates");
    revalidatePath("/dashboard");

    return { success: true, estimateId: estimate.id };
  } catch (err) {
    console.error("createEstimate exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteEstimate(estimateId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const { error } = await supabase
      .from("estimates")
      .delete()
      .eq("id", estimateId)
      .eq("business_id", business.id);

    if (error) {
      return { error: "Failed to delete estimate." };
    }

    revalidatePath("/estimates");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("deleteEstimate exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

