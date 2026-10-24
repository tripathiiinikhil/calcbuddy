import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { getOptionalBusiness } from "@/lib/optional-business";

export default async function EstimatesPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-12">
      <AppNav businessName={business?.name} businessType={business?.business_type} isLoggedIn={isLoggedIn} />
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-slate-100 text-3xl">
            🔒
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Estimates is Disabled</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            CalcBuddy MVP v1.1 is currently focused on the Cash Count experience. The estimates tool is temporarily inactive.
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
  );
}

