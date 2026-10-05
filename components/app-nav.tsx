"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { BusinessAvatar } from "@/components/business-avatar";
import { Brand } from "@/components/brand";
import { businessLogoUrl } from "@/lib/logo";
import { useEffect, useRef, useState } from "react";

type AppNavProps = {
  businessName?: string;
  businessType?: string;
  logoPath?: string | null;
  isLoggedIn?: boolean;
};

const navItems = [
  { href: "/", label: "Home", shortLabel: "Home", icon: "⌂" },
  { href: "/counter", label: "Cash Counter", shortLabel: "Counter", icon: "₹" },
  { href: "/calculator", label: "Calculator", shortLabel: "Calculator", icon: "⌗" },
  { href: "/estimates", label: "Estimates", shortLabel: "Estimates", icon: "☷" },
  { href: "/history", label: "History", shortLabel: "History", icon: "◷" },
];

function formatBusinessType(value?: string) {
  if (!value) return "Business";
  return value.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

export function AppNav({ businessName, businessType, logoPath, isLoggedIn = false }: AppNavProps) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const logoUrl = businessLogoUrl(logoPath);

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-brand-700" aria-label="CalcBuddy home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-base text-white">₹</span>
          <span>CalcBuddy</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={`nav-link rounded-lg px-3 py-2 text-sm font-semibold ${active(item.href) ? "bg-brand-50 text-brand-700" : "text-slate-600"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        {isLoggedIn && businessName ? (
          <div className="relative min-w-0" ref={accountMenuRef}>
            <button type="button" onClick={() => setAccountOpen((open) => !open)} className="ui-button min-h-10 max-w-[min(48vw,15rem)] rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 text-sm font-semibold text-slate-700" aria-expanded={accountOpen} aria-haspopup="menu">
              <BusinessAvatar name={businessName} logoUrl={logoUrl} className="h-8 w-8" textClassName="text-xs" />
              <span className="hidden max-w-40 truncate min-[400px]:block">{businessName}</span>
              <span aria-hidden="true" className="text-xs text-slate-500">▾</span>
            </button>
            {accountOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-2 py-3">
                  <BusinessAvatar name={businessName} logoUrl={logoUrl} className="h-11 w-11" textClassName="text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{businessName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatBusinessType(businessType)}</p>
                  </div>
                </div>
                <Link role="menuitem" href="/settings" onClick={() => setAccountOpen(false)} className="mt-1 block min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Business profile</Link>
                <button type="button" disabled className="block min-h-10 w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-400" title="Multiple business accounts are not enabled yet">Switch account</button>
                <Link role="menuitem" href="/settings#appearance" onClick={() => setAccountOpen(false)} className="block min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Appearance</Link>
                <form action={signOut}>
                  <button type="submit" className="min-h-10 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
                </form>
              </div>
            )}
          </div>
        ) : isLoggedIn ? (
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/onboarding" className="max-w-36 truncate rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">Set up business</Link>
            <form action={signOut}>
              <button type="submit" className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Log out</button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">Sign in</Link>
        )}
      </div>

      <nav aria-label="Mobile navigation" className="grid grid-cols-5 border-t border-slate-100 px-1 py-1 md:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-semibold ${active(item.href) ? "text-brand-700" : "text-slate-600"}`}>
            <span aria-hidden="true" className="text-base leading-5">{item.icon}</span>
            <span className="truncate">{item.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
