"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedBusiness } from "@/lib/business";

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1] as const;

export type CounterFormState = {
  success?: boolean;
  error?: string;
  reportId?: string;
};

export async function saveCashCount(
  _prevState: CounterFormState,
  formData: FormData
): Promise<CounterFormState> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const notes = (formData.get("notes") as string | null)?.trim() || null;
    const coinsRaw = formData.get("coins_amount");
    const coinsAmount = coinsRaw ? Math.max(0, parseFloat(coinsRaw.toString()) || 0) : 0;

    const entries: { denomination: number; quantity: number; amount: number }[] = [];
    let calculatedTotal = coinsAmount;

    for (const denom of DENOMINATIONS) {
      const qtyRaw = formData.get(`qty_${denom}`);
      const qty = qtyRaw ? Math.max(0, parseInt(qtyRaw.toString(), 10) || 0) : 0;
      if (qty > 0) {
        entries.push({
          denomination: denom,
          quantity: qty,
          amount: denom * qty,
        });
        calculatedTotal += denom * qty;
      }
    }

    if (calculatedTotal <= 0 && entries.length === 0 && coinsAmount === 0) {
      return { error: "Please enter quantity for at least one denomination or coins." };
    }

    // Insert counter report
    const { data: report, error: reportError } = await supabase
      .from("counter_reports")
      .insert({
        business_id: business.id,
        coins_amount: coinsAmount,
        total_amount: calculatedTotal,
        notes,
        counted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (reportError || !report) {
      console.error("Error creating counter report:", reportError);
      return { error: "Failed to save cash count report. Please try again." };
    }

    // Insert entries
    if (entries.length > 0) {
      const entriesToInsert = entries.map((entry) => ({
        counter_report_id: report.id,
        denomination: entry.denomination,
        quantity: entry.quantity,
      }));

      const { error: entriesError } = await supabase
        .from("counter_entries")
        .insert(entriesToInsert);

      if (entriesError) {
        console.error("Error creating counter entries:", entriesError);
        // Note: report was created, but entries failed
        return { error: "Saved report, but could not save all denomination breakdowns." };
      }
    }

    revalidatePath("/counter");
    revalidatePath("/counter/history");
    revalidatePath("/dashboard");

    return { success: true, reportId: report.id };
  } catch (err: unknown) {
    console.error("saveCashCount exception:", err);
    return { error: "An unexpected error occurred while saving." };
  }
}

export async function deleteCashCount(reportId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const { error } = await supabase
      .from("counter_reports")
      .delete()
      .eq("id", reportId)
      .eq("business_id", business.id);

    if (error) {
      return { error: "Failed to delete cash report." };
    }

    revalidatePath("/counter");
    revalidatePath("/counter/history");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    console.error("deleteCashCount exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

