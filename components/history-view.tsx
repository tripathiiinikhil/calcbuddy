"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CashCounterHistoryItem } from "@/components/cash-counter-history-item";

export interface CashHistoryReport {
  id: string;
  total_amount: number;
  coins_amount: number;
  counted_at: string;
  notes: string | null;
  counter_entries: { id: string; denomination: number; quantity: number }[];
}

function localDateStart(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function HistoryView({ records }: { records: CashHistoryReport[] }) {
  // Draft dates in the input fields (changing them alone DOES NOT trigger filter)
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  // Applied filter state (only updated on Search / Apply button click)
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [isSearching, startTransition] = useTransition();

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      setAppliedFrom(draftFrom);
      setAppliedTo(draftTo);
    });
  };

  const handleClearFilter = () => {
    setDraftFrom("");
    setDraftTo("");
    setAppliedFrom("");
    setAppliedTo("");
  };

  const isFiltered = Boolean(appliedFrom || appliedTo);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const occurred = new Date(record.counted_at).getTime();
      if (appliedFrom && occurred < localDateStart(appliedFrom)) return false;
      if (appliedTo && occurred >= localDateStart(appliedTo) + 24 * 60 * 60 * 1000) return false;
      return true;
    });
  }, [records, appliedFrom, appliedTo]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Date Filter: From Date + To Date + Search/Apply button (No Quick Date presets) */}
      <form
        onSubmit={handleApplyFilter}
        className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-xs"
        aria-label="Filter history by date"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="from-date" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              From Date
            </label>
            <input
              id="from-date"
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="to-date" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {isFiltered ? (
              <span>
                Showing <strong>{filteredRecords.length}</strong> of {records.length} records
              </span>
            ) : (
              <span>Total <strong>{records.length}</strong> saved counts</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="ui-button h-10 rounded-xl px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="ui-button h-10 rounded-xl bg-brand-500 hover:bg-brand-600 px-5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-60"
            >
              {isSearching ? "Searching…" : "Search / Apply"}
            </button>
          </div>
        </div>
      </form>

      {/* Results List */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <span className="text-3xl">💵</span>
          <p className="mt-3 text-base font-bold text-slate-800">
            {records.length === 0 ? "No cash counts yet" : "No counts found for selected dates"}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {records.length === 0
              ? "Count your register cash and save your record to build daily history."
              : "Try choosing a different date range or clearing the filter."}
          </p>
          {records.length === 0 && (
            <Link
              href="/counter"
              className="ui-button mt-4 inline-flex rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Start Counting Cash
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((report) => (
            <CashCounterHistoryItem key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

