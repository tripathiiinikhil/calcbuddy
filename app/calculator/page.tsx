import { AppNav } from "@/components/app-nav";
import { BusinessCalculator } from "@/components/business-calculator";
import { getOptionalBusiness } from "@/lib/optional-business";

export default async function CalculatorPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business?.name} businessType={business?.business_type} logoPath={business?.logo_path} isLoggedIn={isLoggedIn} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <BusinessCalculator />
      </main>
    </div>
  );
}

