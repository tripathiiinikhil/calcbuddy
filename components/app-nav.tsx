"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Brand } from "@/components/brand";

type AppNavProps = {
  businessName?: string;
  businessType?: string;
  logoPath?: string | null;
  isLoggedIn?: boolean;
  counterMobile?: boolean;
};

const navItems = [
  { href: "/counter", label: "Cash Counter", shortLabel: "Counter", icon: "₹", disabled: false },
  { href: "/calculator", label: "Calculator", shortLabel: "Calculator", icon: "⌗", disabled: true },
  { href: "/estimates", label: "Estimates", shortLabel: "Estimates", icon: "☷", disabled: true },
  { href: "/history", label: "History", shortLabel: "History", icon: "◷", disabled: false },
];

export function AppNav({ businessName, businessType, logoPath, isLoggedIn = false, counterMobile = false }: AppNavProps) {
  const pathname = usePathname();
  const active = (href: string) => href === "/counter" ? pathname === "/" || pathname.startsWith(href) : pathname.startsWith(href);
  const hasMobileUtilityHeader =
    counterMobile || pathname.startsWith("/history") || pathname.startsWith("/settings");

  return (
    <>
      {hasMobileUtilityHeader && (
        <header className="border-b border-slate-100 bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/counter" className="text-2xl font-extrabold tracking-tight text-slate-900" aria-label="CalcBuddy home">
              Calc<span className="text-brand-500">Buddy</span>
            </Link>
            <Link
              href="/history"
              className="ui-button min-h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              <span aria-hidden="true" className="text-lg leading-none">◷</span>
              History
            </Link>
          </div>
        </header>
      )}

      {/* Top Header: Desktop Navigation & Mobile Brand Bar */}
      <header className={`${hasMobileUtilityHeader ? "hidden lg:block" : ""} sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <Brand size="sm" />

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              if (item.disabled) {
                return (
                  <span
                    key={item.href}
                    title={`${item.label} is currently disabled in MVP v1.1`}
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 opacity-60 select-none"
                    aria-disabled="true"
                  >
                    <span>{item.label}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-500">
                      Disabled
                    </span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active(item.href) ? "page" : undefined}
                  className={`nav-link rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active(item.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Account Profile / Auth Links */}
          {isLoggedIn && !businessName ? (
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href="/onboarding"
                className="max-w-36 truncate rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                Set up business
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              href="/login"
              aria-label="Sign in"
            >
              <span className="sr-only">Sign in</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation (Native App Like, Touch Friendly) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] lg:hidden shadow-lg shadow-slate-900/5"
      >
        <div className="grid h-16 grid-cols-5">
          <Link href="/counter" aria-current={active("/counter") ? "page" : undefined} className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${active("/counter") ? "text-brand-600" : "text-slate-500 hover:text-slate-800"}`}>
            <span className="text-xl leading-none">₹</span>
            <span className="text-[11px]">Counter</span>
          </Link>
          <span
            aria-disabled="true"
            title="Calculator is coming soon"
            className="flex cursor-not-allowed flex-col items-center justify-center gap-0.5 text-xs font-semibold text-slate-400"
          >
            <span className="text-xl leading-none">⌗</span>
            <span className="text-[11px]">Calculator</span>
            <span className="rounded bg-slate-100 px-1.5 py-px text-[9px] font-bold leading-3 text-slate-400">Soon</span>
          </span>
          <span
            aria-disabled="true"
            title="Estimates is coming soon"
            className="flex cursor-not-allowed flex-col items-center justify-center gap-0.5 text-xs font-semibold text-slate-400"
          >
            <span className="text-xl leading-none">☷</span>
            <span className="text-[11px]">Estimates</span>
            <span className="rounded bg-slate-100 px-1.5 py-px text-[9px] font-bold leading-3 text-slate-400">Soon</span>
          </span>
          <Link href="/history" aria-current={active("/history") ? "page" : undefined} className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${active("/history") ? "text-brand-600" : "text-slate-500 hover:text-slate-800"}`}>
            <span className="text-xl leading-none">◷</span>
            <span className="text-[11px]">History</span>
          </Link>
          <Link href="/settings" aria-current={pathname.startsWith("/settings") ? "page" : undefined} className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${pathname.startsWith("/settings") ? "text-brand-600" : "text-slate-500 hover:text-slate-800"}`}>
            <span className="text-xl leading-none">⚙</span>
            <span className="text-[11px]">Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
