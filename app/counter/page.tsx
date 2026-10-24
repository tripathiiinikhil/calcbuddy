import { AppNav } from "@/components/app-nav";
import { CashCounter } from "@/components/cash-counter";
import { getOptionalBusiness } from "@/lib/optional-business";

export default async function CounterPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-50 sm:h-auto sm:min-h-screen sm:overflow-visible sm:pb-20 lg:pb-12">
      <AppNav businessName={business?.name} businessType={business?.business_type} isLoggedIn={isLoggedIn} counterMobile />
      <main className="mx-auto h-[calc(100dvh-8rem)] max-w-3xl overflow-hidden px-3 py-2 pb-[env(safe-area-inset-bottom)] sm:h-auto sm:overflow-visible sm:px-6 sm:py-6 sm:pb-6">
        <CashCounter isLoggedIn={Boolean(business)} />
      </main>
    </div>
  );
}

