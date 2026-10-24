"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Brand } from "@/components/brand";

type AppNavProps = {
  businessName?: string;
  businessType?: string;
  isLoggedIn?: boolean;
  counterMobile?: boolean;
};

const navItems = [
  { href: "/counter", label: "Cash Counter", shortLabel: "Counter", icon: "₹", disabled: false },
  { href: "/calculator", label: "Calculator", shortLabel: "Calculator", icon: "⌗", disabled: true },
  { href: "/estimates", label: "Estimates", shortLabel: "Estimates", icon: "☷", disabled: true },
  { href: "/history", label: "History", shortLabel: "History", icon: "◷", disabled: false },
];

export function AppNav({ businessName, businessType, isLoggedIn = false, counterMobile = false }: AppNavProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const activePath = pendingHref ?? pathname;
  const active = (href: string) => href === "/counter" ? activePath === "/" || activePath.startsWith(href) : activePath.startsWith(href);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const hasMobileUtilityHeader =
    counterMobile || pathname.startsWith("/calculator") || pathname.startsWith("/history") || pathname.startsWith("/settings");

  return (
    <>
      {hasMobileUtilityHeader && (
        <header className="border-b border-slate-100 bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/counter" className="text-2xl font-extrabold tracking-tight text-slate-900" aria-label="CalcBuddy home">
              Calc<span className="text-brand-500">Buddy</span>
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
        <div className="grid h-16 grid-cols-5 items-center px-1">
          <Link
            href="/counter"
            onClick={() => setPendingHref("/counter")}
            aria-current={active("/counter") ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              active("/counter") ? "text-[#009f75]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            </svg>
            <span className="text-[11px]">Counter</span>
          </Link>

          <Link
            href="/calculator"
            onClick={() => setPendingHref("/calculator")}
            aria-current={active("/calculator") ? "page" : undefined}
            className="flex items-center justify-center"
          >
            <div
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
                active("/calculator")
                  ? "rounded-2xl bg-[#e6f7f2] text-[#009f75]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="9" x2="20" y2="9"/>
                <line x1="4" y1="15" x2="20" y2="15"/>
                <line x1="10" y1="3" x2="8" y2="21"/>
                <line x1="16" y1="3" x2="14" y2="21"/>
              </svg>
              <span className="text-[11px] font-bold">Calculator</span>
            </div>
          </Link>

          <span
            aria-disabled="true"
            title="Estimates is coming soon"
            className="flex cursor-not-allowed flex-col items-center justify-center gap-0.5 text-xs font-semibold text-slate-400"
          >
            <svg
              className="h-5 w-5 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
            </svg>
            <span className="text-[11px]">Estimates</span>
            <span className="rounded-full bg-[#e0f0fe] px-2 py-0.5 text-[9px] font-bold leading-none text-[#0284c7]">
              Soon
            </span>
          </span>

          <Link
            href="/history"
            onClick={() => setPendingHref("/history")}
            aria-current={active("/history") ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              active("/history") ? "text-[#009f75]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-[11px]">History</span>
          </Link>

          <Link
            href="/settings"
            onClick={() => setPendingHref("/settings")}
            aria-current={active("/settings") ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              active("/settings") ? "text-[#009f75]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span className="text-[11px]">Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
