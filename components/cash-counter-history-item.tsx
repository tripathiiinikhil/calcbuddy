"use client";

import { useState, useTransition } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { deleteCashCount } from "@/app/counter/actions";
import { useToast } from "@/components/toast-provider";

interface Entry {
  id: string;
  denomination: number;
  quantity: number;
}

interface Report {
  id: string;
  total_amount: number;
  coins_amount: number;
  counted_at: string;
  notes: string | null;
  counter_entries: Entry[];
}

export function CashCounterHistoryItem({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const sortedEntries = [...(report.counter_entries || [])].sort(
    (a, b) => b.denomination - a.denomination
  );

  const totalNotesCount = sortedEntries.reduce((sum, e) => sum + e.quantity, 0);

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this cash count record?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCashCount(report.id);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Cash count deleted", "info");
      }
    });
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {formatDateTime(report.counted_at)}
            </span>
            <p className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">
              {formatCurrency(report.total_amount)}
            </p>
            {report.notes && (
              <p className="mt-1 text-xs sm:text-sm text-slate-600 bg-slate-50 rounded px-2 py-1 inline-block border border-slate-100">
                📝 {report.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {expanded ? "Hide Breakdown ▲" : "View Breakdown ▼"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
              title="Delete record"
            >
              {isPending ? "…" : "🗑"}
            </button>
          </div>
        </div>

        {/* Breakdown details */}
        {expanded && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Denomination Breakdown ({totalNotesCount} notes/coins)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs sm:text-sm border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">
                    ₹{entry.denomination} × {entry.quantity}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(entry.denomination * entry.quantity)}
                  </span>
                </div>
              ))}
              {Number(report.coins_amount) > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs sm:text-sm border border-slate-100">
                  <span className="font-semibold text-slate-700">🪙 Extra Coins</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(report.coins_amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

