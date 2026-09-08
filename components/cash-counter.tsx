"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { saveCashCount, type CounterFormState } from "@/app/counter/actions";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/toast-provider";

const DENOMINATIONS = [
  { value: 500, label: "₹500", color: "border-stone-400 bg-stone-50 text-stone-800" },
  { value: 200, label: "₹200", color: "border-amber-400 bg-amber-50 text-amber-900" },
  { value: 100, label: "₹100", color: "border-indigo-400 bg-indigo-50 text-indigo-900" },
  { value: 50, label: "₹50", color: "border-cyan-400 bg-cyan-50 text-cyan-900" },
  { value: 20, label: "₹20", color: "border-orange-400 bg-orange-50 text-orange-900" },
  { value: 10, label: "₹10", color: "border-yellow-500 bg-yellow-50 text-yellow-900" },
  { value: 5, label: "₹5", color: "border-emerald-400 bg-emerald-50 text-emerald-900" },
  { value: 2, label: "₹2", color: "border-slate-400 bg-slate-50 text-slate-800" },
  { value: 1, label: "₹1", color: "border-slate-400 bg-slate-50 text-slate-800" },
];

export function CashCounter() {
  const { showToast } = useToast();
  const [quantities, setQuantities] = useState<Record<number, number>>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
  });
  const [coinsAmount, setCoinsAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [state, formAction, isPending] = useActionState<CounterFormState, FormData>(
    saveCashCount,
    {}
  );

  useEffect(() => {
    if (state.success) {
      showToast("Cash count saved successfully!", "success");
      // Reset form
      setQuantities({
        500: 0,
        200: 0,
        100: 0,
        50: 0,
        20: 0,
        10: 0,
        5: 0,
        2: 0,
        1: 0,
      });
      setCoinsAmount(0);
      setNotes("");
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast]);

  const handleQtyChange = (denom: number, val: string) => {
    const num = parseInt(val, 10);
    setQuantities((prev) => ({
      ...prev,
      [denom]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const incrementQty = (denom: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [denom]: Math.max(0, (prev[denom] || 0) + delta),
    }));
  };

  const handleReset = () => {
    if (totalCash > 0 && !window.confirm("Are you sure you want to clear all numbers?")) {
      return;
    }
    setQuantities({
      500: 0,
      200: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0,
      5: 0,
      2: 0,
      1: 0,
    });
    setCoinsAmount(0);
    setNotes("");
  };

  const totalDenominationAmount = DENOMINATIONS.reduce(
    (acc, { value }) => acc + value * (quantities[value] || 0),
    0
  );
  const totalCash = totalDenominationAmount + (coinsAmount || 0);
  const totalNotesCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Links */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Counter</h1>
          <p className="text-sm text-slate-600">Count register notes & coins quickly</p>
        </div>
        <Link
          href="/counter/history"
          className="ui-button flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span>📜 History</span>
        </Link>
      </div>

      {/* Sticky / Highlight Total Banner */}
      <div className="sticky top-[60px] z-20 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-brand-700 p-5 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-100">
              Total Cash in Drawer
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {formatCurrency(totalCash)}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-xs text-brand-200">Total Notes/Coins</p>
              <p className="text-lg font-bold">{totalNotesCount} pcs</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Counting Form */}
      <form action={formAction} className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
            <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="col-span-4 sm:col-span-3">Denomination</div>
              <div className="col-span-4 sm:col-span-5 text-center">Quantity</div>
              <div className="col-span-4 sm:col-span-4 text-right">Amount</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {DENOMINATIONS.map(({ value, label, color }) => {
              const qty = quantities[value] || 0;
              const subtotal = value * qty;

              return (
                <div
                  key={value}
                  className="grid grid-cols-12 items-center px-4 py-2.5 sm:px-6 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Denomination badge */}
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-bold sm:text-sm ${color}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      ×
                    </span>
                  </div>

                  {/* Quantity Stepper & Input */}
                  <div className="col-span-4 sm:col-span-5 flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => incrementQty(value, -1)}
                      disabled={qty === 0}
                      className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      aria-label={`Decrease ${label}`}
                    >
                      -
                    </button>
                    <input
                      name={`qty_${value}`}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={qty === 0 ? "" : qty}
                      onChange={(e) => handleQtyChange(value, e.target.value)}
                      placeholder="0"
                      className="h-10 w-16 sm:w-20 rounded-lg border border-slate-300 text-center font-bold text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => incrementQty(value, 1)}
                      className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-600 hover:bg-slate-100"
                      aria-label={`Increase ${label}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="col-span-4 sm:col-span-4 text-right">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        subtotal > 0 ? "text-slate-900" : "text-slate-300"
                      }`}
                    >
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Extra Coins / Loose Change */}
            <div className="grid grid-cols-12 items-center px-4 py-3 sm:px-6 bg-slate-50/50">
              <div className="col-span-4 sm:col-span-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 sm:text-sm">
                  🪙 Extra Coins
                </span>
              </div>
              <div className="col-span-4 sm:col-span-5 flex items-center justify-center">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-slate-400">
                    ₹
                  </span>
                  <input
                    name="coins_amount"
                    type="number"
                    min="0"
                    step="any"
                    value={coinsAmount === 0 ? "" : coinsAmount}
                    onChange={(e) => setCoinsAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-10 w-24 sm:w-28 rounded-lg border border-slate-300 pl-6 pr-2 text-right font-medium text-slate-900"
                  />
                </div>
              </div>
              <div className="col-span-4 sm:col-span-4 text-right">
                <span
                  className={`text-sm sm:text-base font-bold ${
                    coinsAmount > 0 ? "text-slate-900" : "text-slate-300"
                  }`}
                >
                  {formatCurrency(coinsAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Note / Shift info */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Notes / Remark (Optional)
          </label>
          <input
            name="notes"
            type="text"
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Closing cash count by Rahul, evening shift"
            className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-800"
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending || totalCash === 0}
            className="ui-button min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isPending || totalCash === 0}
            className="ui-button flex-1 min-h-12 rounded-xl bg-brand-600 px-6 font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {isPending && <span className="spinner" aria-hidden="true" />}
            {isPending ? "Saving count…" : `Save Cash Count (${formatCurrency(totalCash)})`}
          </button>
        </div>
      </form>
    </div>
  );
}

