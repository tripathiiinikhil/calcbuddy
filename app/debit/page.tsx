import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { DebitExpenseList, type ExpenseItem } from "@/components/debit-expense-list";

export default async function DebitPage() {
  const { supabase, business } = await getAuthenticatedBusiness();

  // Fetch debit transactions
  const { data: expenses } = await supabase
    .from("debit_transactions")
    .select("id, category_name, amount, description, notes, occurred_at")
    .eq("business_id", business.id)
    .order("occurred_at", { ascending: false });

  // Fetch custom categories
  const { data: categoriesData } = await supabase
    .from("expense_categories")
    .select("name")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  const categories = Array.from(
    new Set([
      ...(categoriesData?.map((c) => c.name) || []),
      ...(expenses?.map((e) => e.category_name) || []),
    ])
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <DebitExpenseList
          expenses={(expenses || []) as ExpenseItem[]}
          categories={categories}
        />
      </main>
    </div>
  );
}

