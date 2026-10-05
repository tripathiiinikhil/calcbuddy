import Link from "next/link";
import { getOptionalBusiness } from "@/lib/optional-business";
import { AppNav } from "@/components/app-nav";
import { CashCounterHistoryItem } from "@/components/cash-counter-history-item";
import { GuestCashHistory } from "@/components/guest-cash-history";

export default async function CashCounterHistoryPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();
  if (!business) return <div className="min-h-screen bg-slate-50 pb-20 md:pb-8"><AppNav isLoggedIn={isLoggedIn} /><GuestCashHistory /></div>;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from("counter_reports")
    .select("id, total_amount, coins_amount, counted_at, notes, counter_entries(id, denomination, quantity)")
    .eq("business_id", business.id)
    .order("counted_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} businessType={business.business_type} logoPath={business.logo_path} isLoggedIn />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/counter"
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                ← Back to Counter
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Cash Count History</h1>
            <p className="text-sm text-slate-600">Past cash register counts and breakdowns</p>
          </div>
          <Link
            href="/counter"
            className="ui-button rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            + New Count
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            Could not load cash history. Please refresh the page.
          </div>
        )}

        {!error && reports && reports.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="text-4xl">💵</span>
            <h2 className="mt-3 text-lg font-bold text-slate-800">No cash counts yet</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Save your daily or shift cash counts to see your complete register history and denomination breakdowns here.
            </p>
            <Link
              href="/counter"
              className="ui-button mt-5 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Start Counting Cash
            </Link>
          </div>
        )}

        {!error && reports && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => (
              <CashCounterHistoryItem
                key={report.id}
                report={report as any}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

