import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import {
  CreditCustomerList,
  type CustomerWithBalance,
} from "@/components/credit-customer-list";

export default async function CreditPage() {
  const { supabase, business } = await getAuthenticatedBusiness();

  // Fetch customers with their credit transactions
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("customer_id, transaction_type, amount, occurred_at")
    .eq("business_id", business.id);

  // Compute balance for each customer: credit (+), payment (-)
  const balancesMap: Record<string, { balance: number; lastTransactionAt: string | null }> =
    {};

  if (transactions) {
    for (const tx of transactions) {
      if (!balancesMap[tx.customer_id]) {
        balancesMap[tx.customer_id] = { balance: 0, lastTransactionAt: null };
      }
      const amt = Number(tx.amount);
      if (tx.transaction_type === "credit") {
        balancesMap[tx.customer_id].balance += amt;
      } else if (tx.transaction_type === "payment") {
        balancesMap[tx.customer_id].balance -= amt;
      }

      const prevDate = balancesMap[tx.customer_id].lastTransactionAt;
      if (!prevDate || new Date(tx.occurred_at) > new Date(prevDate)) {
        balancesMap[tx.customer_id].lastTransactionAt = tx.occurred_at;
      }
    }
  }

  const customerList: CustomerWithBalance[] = (customers || []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    balance: balancesMap[c.id]?.balance || 0,
    lastTransactionAt: balancesMap[c.id]?.lastTransactionAt || null,
  }));

  // Sort by balance descending (highest outstanding first)
  customerList.sort((a, b) => b.balance - a.balance);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <CreditCustomerList customers={customerList} />
      </main>
    </div>
  );
}

