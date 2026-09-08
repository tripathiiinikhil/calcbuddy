"use client";

import { useState, useTransition } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { deleteExpense } from "@/app/debit/actions";
import { RecordExpenseModal } from "@/components/record-expense-modal";
import { useToast } from "@/components/toast-provider";

export interface ExpenseItem {
  id: string;
  category_name: string;
  amount: number;
  description: string;
  notes: string | null;
  occurred_at: string;
}

export function DebitExpenseList({
  expenses,
  categories,
}: {
  expenses: ExpenseItem[];
  categories: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTotal = expenses
    .filter((e) => new Date(e.occurred_at) >= startOfToday)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthTotal = expenses
    .filter((e) => new Date(e.occurred_at) >= startOfMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const filtered = expenses.filter((e) => {
    const matchesCategory =
      selectedCategory === "All" || e.category_name === selectedCategory;
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteExpense(id);
      if (res?.error) {
        showToast(res.error, "error");
      } else {
        showToast("Expense record removed", "info");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debit (Business Expenses)</h1>
          <p className="text-sm text-slate-600">Track all business outgoing costs & spending</p>
        </div>
        <RecordExpenseModal existingCategories={categories} />
      </div>

      {/* Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-600 to-amber-700 p-5 text-white shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-100">
            Today’s Expenses
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            {formatCurrency(todayTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
            This Month’s Total Outgoing
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            {formatCurrency(monthTotal)}
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            All ({expenses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses by description or remark…"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Expenses List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <span className="text-4xl">📉</span>
          <h3 className="mt-3 text-lg font-bold text-slate-800">
            {search || selectedCategory !== "All"
              ? "No matching expense records"
              : "No expenses recorded yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {search || selectedCategory !== "All"
              ? "Try resetting filters or search terms."
              : "Add daily business debits, vendor payments, and operational costs to track your cash flow."}
          </p>
          {!search && selectedCategory === "All" && (
            <div className="mt-5">
              <RecordExpenseModal existingCategories={categories} />
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-amber-50 font-bold text-amber-700 text-sm">
                  ₹
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                      {item.category_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(item.occurred_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {item.description || "Expense"}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-slate-500">📝 {item.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-extrabold text-slate-900">
                  {formatCurrency(item.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="rounded p-1 text-xs text-slate-300 hover:text-red-600 transition-colors"
                  title="Delete expense"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

