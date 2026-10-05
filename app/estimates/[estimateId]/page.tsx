import { notFound } from "next/navigation";
import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { PrintableEstimate, type EstimateFull } from "@/components/printable-estimate";
import { businessLogoUrl } from "@/lib/logo";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ estimateId: string }>;
}) {
  const { estimateId } = await params;
  const { supabase, business } = await getAuthenticatedBusiness();

  const { data: estimate } = await supabase
    .from("estimates")
    .select("*, estimate_items(*)")
    .eq("id", estimateId)
    .eq("business_id", business.id)
    .single();

  if (!estimate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12 print:bg-white print:p-0">
      <div className="print:hidden">
        <AppNav businessName={business.name} businessType={business.business_type} logoPath={business.logo_path} isLoggedIn />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 print:max-w-none print:p-0">
        <PrintableEstimate
          estimate={estimate as EstimateFull}
          businessName={business.name}
          businessType={business.business_type}
          businessLogoUrl={businessLogoUrl(business.logo_path)}
        />
      </main>
    </div>
  );
}

