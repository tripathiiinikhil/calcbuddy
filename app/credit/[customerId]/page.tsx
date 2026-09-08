import { notFound } from "next/navigation";
import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { CustomerLedger, type CustomerDetails, type TransactionItem } from "@/components/customer-ledger";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const { supabase, business } = await getAuthenticatedBusiness();

  // Fetch customer details
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .single();

  if (!customer) {
    notFound();
  }

  // Fetch transactions for this customer
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("id, transaction_type, amount, notes, occurred_at")
    .eq("customer_id", customerId)
    .eq("business_id", business.id)
    .order("occurred_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <CustomerLedger
          customer={customer as CustomerDetails}
          transactions={(transactions || []) as TransactionItem[]}
        />
      </main>
    </div>
  );
}

