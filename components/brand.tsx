import Link from "next/link";

export function Brand() {
  return <Link href="/" className="inline-flex items-center gap-2 font-bold text-brand-700" aria-label="CalcBuddy home">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg text-white">₹</span>
    <span>CalcBuddy</span>
  </Link>;
}
