"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CashCounterHistoryItem } from "@/components/cash-counter-history-item";
import { formatCurrency, formatDateTime } from "@/lib/format";

type CashReport = {
  id: string;
  total_amount: number;
  coins_amount: number;
  counted_at: string;
  notes: string | null;
  counter_entries: { id: string; denomination: number; quantity: number }[];
};

export type HistoryRecord = {
  id: string;
  kind: "cash" | "estimate";
  occurredAt: string;
  description: string;
  subtitle: string;
  amount: number;
  href?: string;
  cashReport?: CashReport;
};

const typeOptions = [
  { value: "all", label: "All" },
  { value: "cash", label: "Cash Counter" },
  { value: "estimate", label: "Estimates" },
] as const;

type TypeFilter = (typeof typeOptions)[number]["value"];
type DatePreset = "all" | "today" | "yesterday" | "last7" | "last30" | "custom";

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateStart(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function kindLabel(kind: HistoryRecord["kind"]) {
  if (kind === "cash") return "Cash Counter";
  if (kind === "estimate") return "Estimate";
  return "Estimate";
}

function kindIcon(kind: HistoryRecord["kind"]) {
  if (kind === "cash") return "💵";
  if (kind === "estimate") return "🧾";
  return "🧾";
}

export function HistoryView({ records }: { records: HistoryRecord[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const setPreset = (preset: Exclude<DatePreset, "custom">) => {
    setDatePreset(preset);
    if (preset === "all") {
      setFromDate("");
      setToDate("");
      return;
    }

    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(end);
    if (preset === "yesterday") start.setDate(start.getDate() - 1);
    if (preset === "last7") start.setDate(start.getDate() - 6);
    if (preset === "last30") start.setDate(start.getDate() - 29);
    if (preset === "today") start.setTime(end.getTime());
    if (preset === "yesterday") end.setDate(end.getDate() - 1);
    setFromDate(localDateValue(start));
    setToDate(localDateValue(end));
  };

  const filteredRecords = useMemo(() => records.filter((record) => {
    if (typeFilter !== "all" && record.kind !== typeFilter) return false;
    const occurred = new Date(record.occurredAt).getTime();
    if (fromDate && occurred < localDateStart(fromDate)) return false;
    if (toDate && occurred >= localDateStart(toDate) + 24 * 60 * 60 * 1000) return false;
    return true;
  }), [records, typeFilter, fromDate, toDate]);

  const cashRecords = filteredRecords.filter((record) => record.kind === "cash" && record.cashReport);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="History type">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={typeFilter === option.value}
            onClick={() => setTypeFilter(option.value)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${typeFilter === option.value ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section aria-label="Filter history by date" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {([
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["last7", "Last 7 days"],
            ["last30", "Last 30 days"],
            ["all", "All time"],
          ] as const).map(([preset, label]) => (
            <button key={preset} type="button" aria-pressed={datePreset === preset} onClick={() => setPreset(preset)} className={`min-h-9 rounded-lg px-3 text-sm font-medium ${datePreset === preset ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">From date
            <input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setDatePreset("custom"); }} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="text-sm font-medium text-slate-700">To date
            <input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setDatePreset("custom"); }} className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
        </div>
      </section>

      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <p className="text-lg font-bold text-slate-900">{records.length === 0 ? "No history yet" : "No records in this range"}</p>
          <p className="mt-1 text-sm text-slate-600">{records.length === 0 ? "Your saved business activity will appear here." : "Try another history type or date range."}</p>
        </div>
      ) : typeFilter === "cash" ? (
        <div className="space-y-3">
          {cashRecords.map((record) => <CashCounterHistoryItem key={record.id} report={record.cashReport!} />)}
        </div>
      ) : (
        <section aria-label="Business history" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[minmax(9rem,1.1fr)_minmax(10rem,1.2fr)_minmax(10rem,1.5fr)_9rem_7rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase text-slate-500 md:grid">
            <span>Type</span><span>Date &amp; time</span><span>Description</span><span className="text-right">Amount</span><span className="text-right">Action</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((record) => (
              <article key={record.id} className="px-4 py-4 md:grid md:grid-cols-[minmax(9rem,1.1fr)_minmax(10rem,1.2fr)_minmax(10rem,1.5fr)_9rem_7rem] md:items-center md:gap-4 md:px-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><span aria-hidden="true">{kindIcon(record.kind)}</span>{kindLabel(record.kind)}</div>
                <time className="mt-1 block text-xs text-slate-500 md:mt-0 md:text-sm">{formatDateTime(record.occurredAt)}</time>
                <div className="mt-2 min-w-0 md:mt-0"><p className="truncate text-sm font-semibold text-slate-900">{record.description}</p><p className="mt-0.5 truncate text-xs text-slate-500">{record.subtitle}</p></div>
                <p className="mt-2 text-base font-bold text-slate-900 md:mt-0 md:text-right">{formatCurrency(record.amount)}</p>
                <div className="mt-3 md:mt-0 md:text-right">
                  {record.href ? <Link href={record.href} className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-700 hover:underline">View details →</Link> : <Link href="/counter/history" className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-700 hover:underline">View count →</Link>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
