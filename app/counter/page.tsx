import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { CashCounter } from "@/components/cash-counter";

export default async function CounterPage() {
  const { business } = await getAuthenticatedBusiness();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <CashCounter />
      </main>
    </div>
  );
}

