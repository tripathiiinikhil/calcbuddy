import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { BusinessProfileForm } from "@/components/business-profile-form";
import { SoundSettingToggle } from "@/components/sound-setting-toggle";
import { PwaInstallRow } from "@/components/pwa-install";
import { signOut } from "@/app/auth/actions";
import { getOptionalBusiness } from "@/lib/optional-business";

export default async function SettingsPage() {
  const { business, isLoggedIn } = await getOptionalBusiness();
  return (
    <div className="min-h-screen bg-slate-50 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
      <AppNav
        businessName={business?.name}
        businessType={business?.business_type}
        isLoggedIn={isLoggedIn}
      />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-5 lg:hidden">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your account and app preferences.</p>
          </header>

          {business ? (
            <BusinessProfileForm business={business} />
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-700">♙</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sign in to CalcBuddy</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-600">Save your business profile, cash counts, and access them on any device.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/login?next=/settings" className="ui-button min-h-11 rounded-xl bg-brand-500 px-3 text-sm font-bold text-white hover:bg-brand-600">Sign in</Link>
                <Link href="/signup" className="ui-button min-h-11 rounded-xl border border-brand-200 bg-white px-3 text-sm font-bold text-brand-700 hover:bg-brand-50">Create account</Link>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">App Preferences</h2>
            <PwaInstallRow />
            <SoundSettingToggle />
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Support</h2>
            <a href="mailto:?subject=CalcBuddy%20Help%20%26%20Support" className="flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-xs transition-colors hover:bg-slate-50">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl text-brand-700">◉</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-900">Help &amp; Support</span>
                <span className="mt-0.5 block truncate text-sm text-slate-600">Get assistance with your account and tools.</span>
              </span>
              <span aria-hidden="true" className="text-2xl leading-none text-slate-400">›</span>
            </a>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">About</h2>
            <details className="group rounded-2xl border border-slate-200 bg-white shadow-xs">
              <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-4 [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl text-brand-700">ⓘ</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">About CalcBuddy</span>
                  <span className="mt-0.5 block truncate text-sm text-slate-600">CalcBuddy helps businesses manage everyday cash counts.</span>
                </span>
                <span aria-hidden="true" className="text-2xl leading-none text-slate-400 transition-transform group-open:rotate-90">›</span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-5 text-slate-600">CalcBuddy helps businesses keep cash counts simple and accurate.</p>
            </details>
          </section>

          {isLoggedIn && (
            <form action={signOut}>
              <button type="submit" className="ui-button flex min-h-16 w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-4 text-left text-red-600 hover:bg-red-50">
                <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-100 text-xl">⇥</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">Logout</span>
                  <span className="mt-0.5 block text-sm font-normal">Sign out from your CalcBuddy account.</span>
                </span>
                <span aria-hidden="true" className="text-2xl leading-none">›</span>
              </button>
            </form>
          )}
        </div>

        <div className="hidden space-y-4 lg:block">
          {business ? (
            <BusinessProfileForm business={business} />
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
              <h1 className="text-base font-bold text-slate-900">Sign in to CalcBuddy</h1>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Sign in or create an account to save your business profile and cash counts.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/login?next=/settings"
                  className="ui-button min-h-11 rounded-xl bg-brand-500 px-3 text-sm font-bold text-white hover:bg-brand-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="ui-button min-h-11 rounded-xl border border-brand-200 bg-white px-3 text-sm font-bold text-brand-700 hover:bg-brand-50"
                >
                  Create account
                </Link>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">App Preferences</h2>
            <PwaInstallRow />
            <SoundSettingToggle />
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <a
              href="mailto:?subject=CalcBuddy%20Help%20%26%20Support"
              className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-5"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900">Help &amp; Support</span>
                <span className="mt-0.5 block truncate text-xs text-slate-600">Get assistance with your CalcBuddy account and tools.</span>
              </span>
              <span aria-hidden="true" className="text-lg leading-none text-slate-400">›</span>
            </a>
            <details className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-5 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">About Us</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-600">CalcBuddy helps businesses manage everyday cash counts.</span>
                </span>
                <span aria-hidden="true" className="text-lg leading-none text-slate-400 transition-transform group-open:rotate-90">›</span>
              </summary>
              <p className="px-4 pb-3 text-xs leading-5 text-slate-600 sm:px-5">
                CalcBuddy helps businesses keep cash counts simple and accurate.
              </p>
            </details>
          </section>

          {isLoggedIn && (
            <form action={signOut}>
              <button
                type="submit"
                className="ui-button flex min-h-12 w-full items-center justify-between rounded-xl border border-red-200 bg-white px-5 font-bold text-red-600 hover:bg-red-50"
              >
                <span>Log out</span>
                <span aria-hidden="true" className="text-lg leading-none">›</span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
