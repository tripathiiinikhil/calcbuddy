import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { MobileCalculator } from "@/components/mobile-calculator";
import { getOptionalBusiness } from "@/lib/optional-business";

export default async function CalculatorPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();

  return (
    <div className="h-[100dvh] overflow-hidden bg-white lg:h-auto lg:min-h-screen lg:overflow-visible lg:bg-slate-50 lg:pb-12">
      <AppNav
        businessName={business?.name}
        businessType={business?.business_type}
        logoPath={business?.logo_path}
        isLoggedIn={isLoggedIn}
      />

      {/* Mobile, iPhone/iOS, and Tablet layout */}
      <div className="h-[calc(100dvh-4rem)] lg:hidden">
        <main className="mx-auto flex h-full max-w-md flex-col px-3 pt-1.5 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:max-w-lg sm:px-6 sm:pt-3">
          <MobileCalculator />
        </main>
      </div>

      {/* Preserved Desktop UI */}
      <div className="hidden lg:block">
        <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-slate-100 text-3xl">
              🔒
            </span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Calculator is Disabled</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              CalcBuddy MVP v1.1 is currently focused on the Cash Count experience. The calculator tool is temporarily inactive.
            </p>
            <Link
              href="/counter"
              className="ui-button mt-6 inline-flex rounded-xl bg-brand-500 hover:bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs"
            >
              Go to Cash Counter →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
