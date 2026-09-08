"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedBusiness } from "@/lib/business";

export type DebitActionState = {
  success?: boolean;
  error?: string;
};

export async function recordExpense(
  _prevState: DebitActionState,
  formData: FormData
): Promise<DebitActionState> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const categoryName = (formData.get("category_name") as string | null)?.trim() || "Other";
    const amountRaw = formData.get("amount");
    const amount = amountRaw ? parseFloat(amountRaw.toString()) : 0;
    const description = (formData.get("description") as string | null)?.trim() || "";
    const notes = (formData.get("notes") as string | null)?.trim() || null;
    const dateRaw = formData.get("occurred_at") as string | null;
    const occurredAt = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();

    if (isNaN(amount) || amount <= 0) {
      return { error: "Please enter a valid expense amount greater than zero." };
    }
    if (categoryName.length < 1 || categoryName.length > 80) {
      return { error: "Category name must be between 1 and 80 characters." };
    }

    // Check if category exists or create it
    const { data: existingCat } = await supabase
      .from("expense_categories")
      .select("id")
      .eq("business_id", business.id)
      .eq("name", categoryName)
      .maybeSingle();

    let categoryId = existingCat?.id;

    if (!categoryId) {
      const { data: newCat } = await supabase
        .from("expense_categories")
        .insert({
          business_id: business.id,
          name: categoryName,
          is_default: false,
        })
        .select("id")
        .maybeSingle();

      categoryId = newCat?.id;
    }

    const { error: insertError } = await supabase.from("debit_transactions").insert({
      business_id: business.id,
      category_id: categoryId || null,
      category_name: categoryName,
      amount,
      description,
      notes,
      occurred_at: occurredAt,
    });

    if (insertError) {
      console.error("Error inserting debit transaction:", insertError);
      return { error: "Could not save expense record. Please try again." };
    }

    revalidatePath("/debit");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("recordExpense exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteExpense(expenseId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const { error } = await supabase
      .from("debit_transactions")
      .delete()
      .eq("id", expenseId)
      .eq("business_id", business.id);

    if (error) {
      return { error: "Failed to delete expense." };
    }

    revalidatePath("/debit");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("deleteExpense exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

