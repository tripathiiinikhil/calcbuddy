import { AppNav } from "@/components/app-nav";
import { ManualEstimate } from "@/components/manual-estimate";
import { getOptionalBusiness } from "@/lib/optional-business";

export default async function EstimatesPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();
  return <div className="min-h-screen bg-slate-50 pb-20 md:pb-8"><AppNav businessName={business?.name} businessType={business?.business_type} logoPath={business?.logo_path} isLoggedIn={isLoggedIn} /><ManualEstimate isLoggedIn={Boolean(business)} businessName={business?.name} /></div>;
}

