import { AppNav } from "@/components/app-nav";
import { HistoryView, type HistoryRecord } from "@/components/history-view";
import { getAuthenticatedBusiness } from "@/lib/business";

export default async function HistoryPage() {
  const { supabase, business } = await getAuthenticatedBusiness();
  const [cashResult, estimateResult] = await Promise.all([
    supabase
      .from("counter_reports")
      .select("id, total_amount, coins_amount, counted_at, notes, counter_entries(id, denomination, quantity)")
      .eq("business_id", business.id)
      .order("counted_at", { ascending: false }),
    supabase
      .from("estimates")
      .select("id, estimate_number, customer_name, issued_at, total_amount")
      .eq("business_id", business.id)
      .order("issued_at", { ascending: false }),
  ]);

  const records: HistoryRecord[] = [
    ...(cashResult.data ?? []).map((report) => ({
      id: `cash-${report.id}`,
      kind: "cash" as const,
      occurredAt: report.counted_at,
      description: "Cash Count",
      subtitle: report.notes || "Register count",
      amount: Number(report.total_amount),
      cashReport: report,
    })),
    ...(estimateResult.data ?? []).map((estimate) => ({
      id: `estimate-${estimate.id}`,
      kind: "estimate" as const,
      occurredAt: estimate.issued_at,
      description: `Estimate #${estimate.estimate_number}`,
      subtitle: `${business.name} · Customer: ${estimate.customer_name}`,
      amount: Number(estimate.total_amount),
      href: `/estimates/${estimate.id}`,
    })),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const hasError = Boolean(cashResult.error || estimateResult.error);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <AppNav businessName={business.name} businessType={business.business_type} logoPath={business.logo_path} isLoggedIn />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">History</h1>
          <p className="mt-1 text-sm text-slate-600">View your previous cash counts, estimates and business records.</p>
        </header>
        {hasError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Some history records could not be loaded. Refresh the page to try again.
          </div>
        ) : (
          <HistoryView records={records} />
        )}
      </main>
    </div>
  );
}
