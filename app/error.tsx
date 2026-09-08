"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-5"><section className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm"><p className="font-bold text-brand-700">CalcBuddy</p><h1 className="mt-6 text-2xl font-bold">Something went wrong</h1><p className="mt-3 text-sm leading-6 text-slate-600">Please try again. If this keeps happening, check that CalcBuddy has been connected to Supabase.</p><button onClick={reset} className="mt-6 min-h-12 rounded-xl bg-brand-600 px-5 font-semibold text-white">Try again</button></section></main>;
}
