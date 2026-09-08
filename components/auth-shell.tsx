import { Brand } from "@/components/brand";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8 sm:justify-center">
    <Brand />
    <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      {children}
    </section>
  </main>;
}
