"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type GuestReport = { id: string; countedAt: string; totalAmount: number; coinsAmount: number; quantities: Record<number, number>; notes?: string };

export function GuestCashHistory() {
  const [reports, setReports] = useState<GuestReport[]>([]);
  useEffect(() => setReports(JSON.parse(localStorage.getItem("calcbuddy:cash-history") || "[]")), []);
  const clear = () => { localStorage.removeItem("calcbuddy:cash-history"); setReports([]); };
  return <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6"><div className="flex items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Cash history</h1><p className="mt-1 text-sm text-slate-600">Saved on this device.</p></div><Link href="/counter" className="ui-button rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white">New count</Link></div>{reports.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold text-slate-800">No saved counts yet</p><p className="mt-1 text-sm text-slate-500">Your device-saved cash counts will appear here.</p></div> : <><div className="mt-6 space-y-3">{reports.map((report) => <details key={report.id} className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{new Date(report.countedAt).toLocaleString("en-IN")}</p><p className="mt-1 text-sm text-slate-500">{report.notes || "Cash count"}</p></div><strong className="text-lg text-brand-700">{formatCurrency(report.totalAmount)}</strong></div></summary><div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">{Object.entries(report.quantities).filter(([, qty]) => Number(qty) > 0).sort(([a], [b]) => Number(b) - Number(a)).map(([denomination, qty]) => <p key={denomination}>₹{denomination} × {qty} = {formatCurrency(Number(denomination) * Number(qty))}</p>)}{report.coinsAmount > 0 && <p>Coins = {formatCurrency(report.coinsAmount)}</p>}</div></details>)}</div><button type="button" onClick={clear} className="mt-4 text-sm font-semibold text-red-600 underline">Clear device history</button></> }</main>;
}
