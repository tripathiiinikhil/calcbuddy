"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedBusiness } from "@/lib/business";

export type CreditActionState = {
  success?: boolean;
  error?: string;
  customerId?: string;
};

export async function addCustomer(
  _prevState: CreditActionState,
  formData: FormData
): Promise<CreditActionState> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const name = (formData.get("name") as string | null)?.trim() || "";
    const phone = (formData.get("phone") as string | null)?.trim() || null;

    if (name.length < 1 || name.length > 150) {
      return { error: "Please enter a valid customer name (1-150 characters)." };
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        business_id: business.id,
        name,
        phone,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error adding customer:", error);
      return { error: "Could not add customer. Please try again." };
    }

    revalidatePath("/credit");
    revalidatePath("/estimates");
    return { success: true, customerId: data.id };
  } catch (err) {
    console.error("addCustomer exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function recordCreditTransaction(
  _prevState: CreditActionState,
  formData: FormData
): Promise<CreditActionState> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const customerId = (formData.get("customer_id") as string | null)?.trim() || "";
    const transactionType = (formData.get("transaction_type") as string | null)?.trim() || "";
    const amountRaw = formData.get("amount");
    const amount = amountRaw ? parseFloat(amountRaw.toString()) : 0;
    const notes = (formData.get("notes") as string | null)?.trim() || null;
    const dateRaw = formData.get("occurred_at") as string | null;
    const occurredAt = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();

    if (!customerId) {
      return { error: "Customer is required." };
    }
    if (transactionType !== "credit" && transactionType !== "payment") {
      return { error: "Invalid transaction type." };
    }
    if (isNaN(amount) || amount <= 0) {
      return { error: "Please enter a valid amount greater than zero." };
    }

    const { error } = await supabase.from("credit_transactions").insert({
      business_id: business.id,
      customer_id: customerId,
      transaction_type: transactionType,
      amount,
      notes,
      occurred_at: occurredAt,
    });

    if (error) {
      console.error("Error recording credit transaction:", error);
      return { error: "Could not record transaction. Please try again." };
    }

    revalidatePath("/credit");
    revalidatePath(`/credit/${customerId}`);
    revalidatePath("/dashboard");

    return { success: true, customerId };
  } catch (err) {
    console.error("recordCreditTransaction exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteCreditTransaction(
  transactionId: string,
  customerId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const { error } = await supabase
      .from("credit_transactions")
      .delete()
      .eq("id", transactionId)
      .eq("business_id", business.id);

    if (error) {
      return { error: "Could not delete transaction." };
    }

    revalidatePath("/credit");
    revalidatePath(`/credit/${customerId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("deleteCreditTransaction exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteCustomer(customerId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
      .eq("business_id", business.id);

    if (error) {
      return { error: "Could not delete customer." };
    }

    revalidatePath("/credit");
    revalidatePath("/dashboard");
    redirect("/credit");
  } catch (err) {
    console.error("deleteCustomer exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

