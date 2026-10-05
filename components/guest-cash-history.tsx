"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HistoryView, type CashHistoryReport } from "@/components/history-view";

type GuestReport = {
  id: string;
  countedAt: string;
  totalAmount: number;
  coinsAmount: number;
  quantities: Record<number, number>;
  notes?: string;
};

export function GuestCashHistory() {
  const [reports, setReports] = useState<CashHistoryReport[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored: GuestReport[] = JSON.parse(
        localStorage.getItem("calcbuddy:cash-history") || "[]"
      );
      const mapped: CashHistoryReport[] = stored.map((r) => ({
        id: r.id,
        total_amount: r.totalAmount,
        coins_amount: r.coinsAmount,
        counted_at: r.countedAt,
        notes: r.notes || null,
        counter_entries: Object.entries(r.quantities || {}).map(([denom, qty]) => ({
          id: `${r.id}-${denom}`,
          denomination: Number(denom),
          quantity: Number(qty),
        })),
      }));
      setReports(mapped);
    } catch {
      setReports([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const clear = () => {
    if (!window.confirm("Clear all cash counts saved on this device?")) return;
    localStorage.removeItem("calcbuddy:cash-history");
    setReports([]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Count History</h1>
          <p className="mt-1 text-sm text-slate-600">Saved on this device (guest mode)</p>
        </div>
        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              Clear device history
            </button>
          )}
          <Link
            href="/counter"
            className="ui-button rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-xs"
          >
            + New Count
          </Link>
        </div>
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading device history…</div>
      ) : (
        <HistoryView records={reports} />
      )}
    </div>
  );
}

