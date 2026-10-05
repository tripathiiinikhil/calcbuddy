import { AppNav } from "@/components/app-nav";
import { HistoryView, type CashHistoryReport } from "@/components/history-view";
import { GuestCashHistory } from "@/components/guest-cash-history";
import { getOptionalBusiness } from "@/lib/optional-business";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cash Count History | CalcBuddy",
  description: "View past cash register counts and denomination breakdowns.",
};

export default async function HistoryPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();

  // If not logged in with a business, show device-saved guest cash history
  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
        <AppNav isLoggedIn={isLoggedIn} />
        <main className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
          <GuestCashHistory />
        </main>
      </div>
    );
  }

  const supabase = await createClient();

  // Query only counter_reports (Estimates is disabled in MVP v1.1)
  const { data: reports, error } = await supabase
    .from("counter_reports")
    .select("id, total_amount, coins_amount, counted_at, notes, counter_entries(id, denomination, quantity)")
    .eq("business_id", business.id)
    .order("counted_at", { ascending: false });

  const cashReports: CashHistoryReport[] = (reports as any) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav
        businessName={business.name}
        businessType={business.business_type}
        logoPath={business.logo_path}
        isLoggedIn
      />
      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cash Count History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Past cash register counts, shifts, and denomination breakdowns for {business.name}.
          </p>
        </header>

        {error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load cash history. Please refresh the page to try again.
          </div>
        ) : (
          <HistoryView records={cashReports} />
        )}
      </main>
    </div>
  );
}

