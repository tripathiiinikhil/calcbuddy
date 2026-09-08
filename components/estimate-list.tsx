"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

export interface EstimateSummary {
  id: string;
  estimate_number: string;
  customer_name: string;
  issued_at: string;
  total_amount: number;
}

export function EstimateList({ estimates }: { estimates: EstimateSummary[] }) {
  const [search, setSearch] = useState("");

  const filtered = estimates.filter(
    (e) =>
      e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      e.estimate_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = estimates.reduce((sum, e) => sum + Number(e.total_amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estimates & Quotations</h1>
          <p className="text-sm text-slate-600">
            Create professional printable estimates for your customers
          </p>
        </div>
        <Link
          href="/estimates/new"
          className="ui-button flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <span>+ New Estimate</span>
        </Link>
      </div>

      {/* Summary Banner */}
      <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-700 to-slate-800 p-5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-200">
              Total Quotations Value
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2 text-right">
            <p className="text-xs text-indigo-200">Total Estimates</p>
            <p className="text-lg font-bold">{estimates.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or estimate #…"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Estimates List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <span className="text-4xl">🧾</span>
          <h3 className="mt-3 text-lg font-bold text-slate-800">
            {search ? "No matching estimates" : "No estimates created yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {search
              ? "Try searching with a different customer name or estimate number."
              : "Generate printable estimates with automatic line item math and discounts."}
          </p>
          {!search && (
            <div className="mt-5">
              <Link
                href="/estimates/new"
                className="ui-button inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Create First Estimate
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filtered.map((est) => (
            <Link
              key={est.id}
              href={`/estimates/${est.id}`}
              className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-700 text-xs">
                  🧾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                      {est.estimate_number}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(est.issued_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                    {est.customer_name}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base sm:text-lg font-extrabold text-slate-900">
                  {formatCurrency(est.total_amount)}
                </p>
                <span className="text-xs font-semibold text-brand-700">View / Print →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

