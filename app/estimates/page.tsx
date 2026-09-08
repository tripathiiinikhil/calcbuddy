import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { EstimateList, type EstimateSummary } from "@/components/estimate-list";

export default async function EstimatesPage() {
  const { supabase, business } = await getAuthenticatedBusiness();

  const { data: estimates } = await supabase
    .from("estimates")
    .select("id, estimate_number, customer_name, issued_at, total_amount")
    .eq("business_id", business.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <EstimateList estimates={(estimates || []) as EstimateSummary[]} />
      </main>
    </div>
  );
}

