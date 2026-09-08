import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-5"><section className="text-center"><p className="font-bold text-brand-700">CalcBuddy</p><h1 className="mt-5 text-2xl font-bold">Page not found</h1><p className="mt-2 text-slate-600">That page doesn’t exist or may have moved.</p><Link href="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">Go home</Link></section></main>;
}
