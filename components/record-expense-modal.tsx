"use client";

import { useActionState, useEffect, useState } from "react";
import { recordExpense, type DebitActionState } from "@/app/debit/actions";
import { useToast } from "@/components/toast-provider";

const COMMON_CATEGORIES = [
  "Supplies Purchase",
  "Shop Rent",
  "Salary & Wages",
  "Electricity & Bills",
  "Transport & Fuel",
  "Tea & Refreshments",
  "Repairs & Maintenance",
  "Other",
];

export function RecordExpenseModal({
  existingCategories = [],
}: {
  existingCategories?: string[];
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const [category, setCategory] = useState("Supplies Purchase");
  const [customCategory, setCustomCategory] = useState("");
  const [state, formAction, isPending] = useActionState<DebitActionState, FormData>(
    recordExpense,
    {}
  );

  const allCategories = Array.from(
    new Set([...COMMON_CATEGORIES, ...existingCategories])
  );

  useEffect(() => {
    if (state.success) {
      showToast("Expense recorded successfully!", "success");
      setOpen(false);
      setCustomCategory("");
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast]);

  const selectedCategoryName =
    category === "Custom" ? customCategory.trim() || "Other" : category;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ui-button flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
      >
        <span>+ Add Expense</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-slide-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Record Debit / Expense</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Track business outgoing payments, purchases, and operating costs.
            </p>

            <form action={formAction} className="mt-5 space-y-4">
              <input
                type="hidden"
                name="category_name"
                value={selectedCategoryName}
              />

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Expense Amount (₹) *
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    name="amount"
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="0.00"
                    autoFocus
                    className="h-12 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-lg font-bold text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Custom">+ Custom Category…</option>
                </select>

                {category === "Custom" && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Description / Paid To
                </label>
                <input
                  name="description"
                  type="text"
                  maxLength={300}
                  placeholder="e.g. Paid vendor for milk crates, electricity bill"
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Date
                </label>
                <input
                  name="occurred_at"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Additional Notes (Optional)
                </label>
                <input
                  name="notes"
                  type="text"
                  maxLength={1000}
                  placeholder="e.g. Paid via UPI Ref #98124"
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {state.error && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
                  {state.error}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="ui-button rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {isPending && <span className="spinner" aria-hidden="true" />}
                  {isPending ? "Saving…" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

