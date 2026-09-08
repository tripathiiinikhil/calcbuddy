"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { useState } from "react";

interface AppNavProps {
  businessName: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/counter", label: "Counter", icon: "💵" },
  { href: "/credit", label: "Credit", icon: "📒" },
  { href: "/debit", label: "Debit", icon: "📉" },
  { href: "/estimates", label: "Estimates", icon: "🧾" },
  { href: "/products", label: "Products", icon: "📦" },
  { href: "/calculator", label: "Calculator", icon: "🔢" },
];

export function AppNav({ businessName }: AppNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-brand-700">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm">
                ₹
              </span>
              <span className="text-base tracking-tight sm:text-lg">CalcBuddy</span>
            </Link>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="hidden max-w-[200px] truncate text-sm font-medium text-slate-700 sm:inline" title={businessName}>
              {businessName}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <span>Menu</span>
              <span className="text-slate-500">▾</span>
            </button>

            <form action={signOut} className="hidden sm:block">
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="mb-2 pb-2 border-b border-slate-100">
              <p className="text-xs text-slate-500">Current Business</p>
              <p className="text-sm font-semibold text-slate-800">{businessName}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg p-2 text-sm font-medium ${
                    isActive(item.href) ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="text-xs font-medium text-brand-700 underline"
              >
                Business settings
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur-sm md:hidden">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            isActive("/dashboard") ? "text-brand-700 font-bold" : "text-slate-500"
          }`}
        >
          <span className="text-lg">📊</span>
          <span>Home</span>
        </Link>
        <Link
          href="/counter"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            isActive("/counter") ? "text-brand-700 font-bold" : "text-slate-500"
          }`}
        >
          <span className="text-lg">💵</span>
          <span>Counter</span>
        </Link>
        <Link
          href="/credit"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            isActive("/credit") ? "text-brand-700 font-bold" : "text-slate-500"
          }`}
        >
          <span className="text-lg">📒</span>
          <span>Credit</span>
        </Link>
        <Link
          href="/debit"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            isActive("/debit") ? "text-brand-700 font-bold" : "text-slate-500"
          }`}
        >
          <span className="text-lg">📉</span>
          <span>Debit</span>
        </Link>
        <Link
          href="/estimates"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
            isActive("/estimates") ? "text-brand-700 font-bold" : "text-slate-500"
          }`}
        >
          <span className="text-lg">🧾</span>
          <span>Estimates</span>
        </Link>
      </nav>
    </>
  );
}

