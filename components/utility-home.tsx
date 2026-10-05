import Link from "next/link";

const tools = [
  { href: "/counter", icon: "💰", title: "Count Cash", description: "Count notes and coins with a live total." },
  { href: "/calculator", icon: "🧮", title: "Calculator", description: "Fast arithmetic and GST shortcuts." },
  { href: "/estimates", icon: "🧾", title: "Create Estimate", description: "Build, print, and share an estimate." },
];

export function UtilityHome() {
  return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"><section className="max-w-xl"><p className="text-sm font-semibold text-brand-700">Simple tools for everyday business</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">What do you need to do?</h1><p className="mt-3 text-slate-600">Choose a tool and get straight to work. No setup required.</p></section><section className="mt-8 grid gap-4 sm:grid-cols-3">{tools.map((tool) => <Link key={tool.href} href={tool.href} className="interactive-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">{tool.icon}</span><h2 className="mt-5 font-bold text-slate-900 group-hover:text-brand-700">{tool.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p><span className="mt-5 inline-block text-sm font-semibold text-brand-700">Open tool →</span></Link>)}</section></main>;
}
