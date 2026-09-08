"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AddCustomerModal } from "@/components/add-customer-modal";

export interface CustomerWithBalance {
  id: string;
  name: string;
  phone: string | null;
  balance: number;
  lastTransactionAt: string | null;
}

export function CreditCustomerList({
  customers,
}: {
  customers: CustomerWithBalance[];
}) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.balance > 0 ? c.balance : 0),
    0
  );
  const totalCustomersWithBalance = customers.filter((c) => c.balance > 0).length;

  return (
    <div className="space-y-6">
      {/* Header & Metric Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Credit (Udhaar)</h1>
          <p className="text-sm text-slate-600">Track money owed by customers & payments</p>
        </div>
        <AddCustomerModal />
      </div>

      {/* Overview Card */}
      <div className="rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-red-100">
              Total Outstanding Balance (Market Udhaar)
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2 text-right backdrop-blur-xs">
            <p className="text-xs text-red-100">Customers with Balance</p>
            <p className="text-lg font-bold">{totalCustomersWithBalance} / {customers.length}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or phone…"
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

      {/* Customers List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <span className="text-4xl">📒</span>
          <h3 className="mt-3 text-lg font-bold text-slate-800">
            {search ? "No matching customers" : "No customers added yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {search
              ? "Try searching with a different name or phone number."
              : "Add your first customer to start tracking credit and repayments."}
          </p>
          {!search && (
            <div className="mt-5">
              <AddCustomerModal />
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filtered.map((customer) => {
            const hasDebt = customer.balance > 0;
            const isSettled = customer.balance === 0;

            return (
              <Link
                key={customer.id}
                href={`/credit/${customer.id}`}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl font-bold text-sm ${
                      hasDebt
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-xs text-slate-500">📞 {customer.phone}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-extrabold ${
                      hasDebt
                        ? "text-red-600"
                        : isSettled
                        ? "text-slate-400"
                        : "text-emerald-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(customer.balance))}
                  </p>
                  <span
                    className={`inline-block text-[11px] font-semibold uppercase tracking-wider ${
                      hasDebt
                        ? "text-red-500"
                        : isSettled
                        ? "text-slate-400"
                        : "text-emerald-500"
                    }`}
                  >
                    {hasDebt ? "You will receive" : isSettled ? "Settled" : "Advance"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

