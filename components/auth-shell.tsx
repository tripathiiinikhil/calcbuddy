import Image from "next/image";
import { Brand } from "@/components/brand";

export function AuthShell({
  title,
  subtitle,
  children,
  mode = "login",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  mode?: "login" | "signup";
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 lg:grid lg:grid-cols-12">
        {/* Left: Authentication Form Column */}
        <section className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-6 xl:p-12">
          <div>
            <div className="flex items-center justify-between">
              <Brand size="md" />
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200/50">
                {mode === "login" ? "Sign in" : "Register"}
              </span>
            </div>

            {/* Mobile-only compact mascot companion preview */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-50/70 p-3 border border-brand-100 md:hidden">
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src="/brand/mascot-transparent.png"
                  alt="CalcBuddy Mascot"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">Your smart business buddy</p>
                <p className="text-xs text-slate-500 truncate">Cash counting, ledger & everyday utility</p>
              </div>
            </div>

            <header className="mt-8">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {subtitle}
              </p>
            </header>

            <div className="mt-6">
              {children}
            </div>
          </div>

          <footer className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            <p>Protected by Supabase Auth with Row Level Security</p>
          </footer>
        </section>

        {/* Right: Brand Visual Column (Desktop & Tablet) */}
        <aside
          aria-label="CalcBuddy Brand Companion"
          className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-50 via-[#f0f4f1] to-brand-100/70 p-8 lg:col-span-6 lg:flex xl:p-12 border-l border-slate-100"
        >
          {/* Subtle background ambient circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-brand-200/40 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-300/30 blur-2xl"
          />

          {/* Top tagline */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-xs backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              CalcBuddy Companion
            </span>
            <span className="text-xs font-medium text-slate-500">Made for Indian Businesses</span>
          </div>

          {/* Center Mascot & Floating Contextual Business Badges */}
          <div className="relative my-auto flex flex-col items-center justify-center py-6">
            {/* Floating Badge 1 - Cash Counter */}
            <div className="animate-badge-1 absolute -top-2 left-4 z-20 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-200/50 backdrop-blur-xs">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-sm">💵</span>
              <div>
                <p className="font-bold text-slate-800 leading-tight">Cash Counter</p>
                <p className="text-[10px] text-slate-400 leading-none">Instant note tally</p>
              </div>
            </div>

            {/* Floating Badge 2 - Estimates */}
            <div className="animate-badge-2 absolute top-10 right-2 z-20 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md shadow-slate-200/50 backdrop-blur-xs">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-50 text-sm">🧾</span>
              <div>
                <p className="font-bold text-slate-800 leading-tight">Estimates</p>
                <p className="text-[10px] text-slate-400 leading-none">Print & share</p>
              </div>
            </div>

            {/* Mascot Character with subtle idle motion */}
            <div className="relative z-10 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
              <div className="animate-float-mascot relative h-full w-full">
                <Image
                  src="/brand/mascot-transparent.png"
                  alt="Friendly CalcBuddy calculator character"
                  fill
                  sizes="(max-width: 1024px) 256px, 288px"
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Ground shadow beneath mascot */}
            <div
              aria-hidden="true"
              className="mt-2 h-4 w-44 rounded-full bg-slate-300/40 blur-xs"
            />
          </div>

          {/* Bottom inspirational copy & feature pills */}
          <div className="relative z-10 space-y-3 rounded-2xl bg-white/70 p-5 shadow-xs backdrop-blur-xs border border-white/60">
            <h2 className="text-base font-bold text-slate-800">
              Run the numbers. Run your business.
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              Simple, reliable tools for retailers, wholesalers, petrol pumps, and daily cash counters.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 border border-slate-200/70">
                <span className="text-brand-600 font-bold">✓</span> No complex setup
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 border border-slate-200/70">
                <span className="text-brand-600 font-bold">✓</span> Mobile-first
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 border border-slate-200/70">
                <span className="text-brand-600 font-bold">✓</span> 100% Secure
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
