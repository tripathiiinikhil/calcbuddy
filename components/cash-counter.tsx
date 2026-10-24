"use client";
import React, { memo } from "react";

// Memoized row for a denomination entry to avoid re‑rendering the whole list on each quantity change
const DenominationRow = memo(function DenominationRow({
  value,
  label,
  color,
  qty,
  subtotal,
  onDecrement,
  onIncrement,
  onChange,
}: {
  value: number;
  label: string;
  color: string;
  qty: number;
  subtotal: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className="flex min-h-0 flex-1 items-center px-3 py-1 transition-colors hover:bg-slate-50/70 sm:grid sm:grid-cols-12 sm:px-6 sm:py-2"
    >
      {/* Denomination badge */}
      <div className="flex w-[4.15rem] shrink-0 items-center gap-1.5 sm:col-span-3 sm:w-auto">
        <span
          className={`inline-flex h-9 w-[4.15rem] items-center justify-center rounded-xl border px-2 text-sm font-bold sm:h-auto sm:w-auto sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-sm ${color}`}
        >
          {label}
        </span>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">×</span>
      </div>

      {/* Quantity Stepper & Input */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:col-span-5 sm:gap-2">
        <button
          type="button"
          onClick={onDecrement}
          disabled={qty === 0}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 touch-manipulation sm:h-9 sm:w-9 sm:rounded-lg sm:border sm:border-slate-200 sm:bg-white sm:text-base sm:text-slate-600 sm:hover:bg-slate-100"
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
          onChange={onChange}
          placeholder="0"
          className="h-10 w-12 shrink-0 rounded-xl border border-slate-200 text-center font-bold text-base text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:h-10 sm:w-20 sm:rounded-lg sm:border-slate-300 sm:text-sm"
        />
        <button
          type="button"
          onClick={onIncrement}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-700 hover:bg-slate-200 touch-manipulation sm:h-9 sm:w-9 sm:rounded-lg sm:border sm:border-slate-200 sm:bg-white sm:text-base sm:text-slate-600 sm:hover:bg-slate-100"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>

      {/* Line Total */}
      <div className="w-16 shrink-0 text-right sm:col-span-4 sm:w-auto">
        <span
          className={`text-sm font-bold sm:text-base ${subtotal > 0 ? "text-slate-900" : "text-slate-300"}`}
        >
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
});


import { useState, useTransition, useCallback } from "react";
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

export function CashCounter({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
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

  const [isPending, startTransition] = useTransition();

  const reset = () => {
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

  // Stable callbacks for rows to avoid re‑creating functions on each render
  const handleDecrement = useCallback((denom: number) => () => incrementQty(denom, -1), [incrementQty]);
  const handleIncrement = useCallback((denom: number) => () => incrementQty(denom, 1), [incrementQty]);
  const handleChange = useCallback((denom: number) => (e: React.ChangeEvent<HTMLInputElement>) => handleQtyChange(denom, e.target.value), [handleQtyChange]);

  const handleReset = () => {
    if (totalCash > 0 && !window.confirm("Are you sure you want to clear all numbers?")) {
      return;
    }
    reset();
  };

  const totalDenominationAmount = DENOMINATIONS.reduce(
    (acc, { value }) => acc + value * (quantities[value] || 0),
    0
  );
  const totalCash = totalDenominationAmount + (coinsAmount || 0);
  const totalNotesCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (totalCash <= 0) return showToast("Enter at least one note or coin amount.", "error");
    if (!isLoggedIn) {
      const report = { id: crypto.randomUUID(), countedAt: new Date().toISOString(), totalAmount: totalCash, coinsAmount, quantities, notes };
      const stored = JSON.parse(localStorage.getItem("calcbuddy:cash-history") || "[]");
      localStorage.setItem("calcbuddy:cash-history", JSON.stringify([report, ...stored].slice(0, 30)));
      showToast("Cash count saved on this device. Log in to keep it across devices.", "success");
      reset();
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result: CounterFormState = await saveCashCount({}, formData);
      if (result.error) showToast(result.error, "error");
      else { showToast("Cash count saved successfully!", "success"); reset(); }
    });
  };

  const handleShare = async () => {
    if (totalCash <= 0) return showToast("Enter a cash count before sharing.", "error");
    const denominationLines = DENOMINATIONS
      .filter(({ value }) => (quantities[value] || 0) > 0)
      .map(({ value, label }) => `${label} × ${quantities[value]} = ${formatCurrency(value * quantities[value])}`);
    const text = [
      "CALCBUDDY",
      "CASH COUNT RECEIPT",
      "────────────────────",
      `Date & time: ${new Date().toLocaleString("en-IN")}`,
      "",
      "DENOMINATIONS",
      ...denominationLines,
      `Coins = ${formatCurrency(coinsAmount)}`,
      "────────────────────",
      `Total notes: ${totalNotesCount}`,
      `Coin amount: ${formatCurrency(coinsAmount)}`,
      `GRAND TOTAL: ${formatCurrency(totalCash)}`,
    ].join("\n");

    if (!navigator.share) {
      showToast("Sharing is not available on this device.", "error");
      return;
    }

    try {
      await navigator.share({ title: "CalcBuddy Cash Count Receipt", text });
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return;
      showToast("Could not share this cash-count receipt.", "error");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 sm:block sm:h-auto sm:space-y-6">
      <div className="hidden items-center justify-between sm:flex">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Cash Counter</h1>
          <p className="text-xs sm:text-sm text-slate-600">Count register notes &amp; coins quickly</p>
        </div>
      </div>

      {/* Sticky / Highlight Total Banner */}
      <div className="sticky top-[60px] z-20 hidden rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-brand-700 p-5 text-white shadow-lg backdrop-blur-xs sm:block">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div>
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-brand-100">
              Total Cash in Drawer
            </p>
            <p className="mt-0.5 sm:mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
              {formatCurrency(totalCash)}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-brand-200">Notes/Coins</p>
              <p className="text-sm sm:text-lg font-bold">{totalNotesCount} pcs</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-white/20 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg bg-white/20 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Counting Form */}
      <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col gap-2 sm:block sm:space-y-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
          <div className="hidden border-b border-slate-100 bg-slate-50 px-4 py-3 sm:block sm:px-6">
            <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="col-span-4 sm:col-span-3">Denomination</div>
              <div className="col-span-4 sm:col-span-5 text-center">Quantity</div>
              <div className="col-span-4 sm:col-span-4 text-right">Amount</div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col divide-y divide-slate-100 sm:block">
                      {DENOMINATIONS.map(({ value, label, color }) => {
            const qty = quantities[value] || 0;
            const subtotal = value * qty;

            return (
              <DenominationRow
                key={value}
                value={value}
                label={label}
                color={color}
                qty={qty}
                subtotal={subtotal}
                onDecrement={handleDecrement(value)}
                onIncrement={handleIncrement(value)}
                onChange={handleChange(value)}
              />
            );
          })}

            {/* Extra Coins / Loose Change */}
            <div className="flex min-h-0 flex-1 items-center bg-slate-50/50 px-3 py-1 sm:grid sm:grid-cols-12 sm:px-6 sm:py-2.5">
              <div className="flex w-[4.15rem] shrink-0 sm:col-span-3 sm:w-auto">
                <span className="inline-flex h-9 w-[4.15rem] items-center justify-center rounded-xl border border-pink-200 bg-pink-50 px-2 text-sm font-bold text-pink-900 sm:h-auto sm:w-auto sm:gap-1 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:text-sm sm:text-slate-600">
                  Coins
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-center sm:col-span-5">
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
                    className="h-10 w-28 rounded-xl border border-slate-200 pl-6 pr-2 text-right font-bold text-slate-900 sm:w-28 sm:rounded-lg sm:border-slate-300 sm:font-medium"
                  />
                </div>
              </div>
              <div className="w-16 shrink-0 text-right sm:col-span-4 sm:w-auto">
                <span
                  className={`text-sm font-bold sm:text-base ${
                    coinsAmount > 0 ? "text-slate-900" : "text-slate-300"
                  }`}
                >
                  {formatCurrency(coinsAmount)}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-brand-700 p-3 text-white shadow-md sm:hidden">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-brand-100">Total Cash</p>
              <p className="mt-0.5 text-3xl font-extrabold tracking-tight">{formatCurrency(totalCash)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] text-brand-200">Notes/Coins</p>
                <p className="text-sm font-bold">{totalNotesCount} pcs</p>
              </div>
              <button type="button" onClick={handleReset} className="ui-button h-10 rounded-xl bg-white/20 px-2.5 text-xs font-bold text-white hover:bg-white/30">
                Clear
              </button>
              <button type="button" onClick={handleShare} className="ui-button h-10 rounded-xl bg-white/20 px-2.5 text-xs font-bold text-white hover:bg-white/30">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Optional Note / Shift info */}
        <div className="hidden rounded-xl border border-slate-200 bg-white p-4 sm:block">
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
            className="mt-2 h-11 sm:h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-800"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isPending || totalCash === 0}
          className="ui-button min-h-12 w-full rounded-2xl bg-brand-600 px-6 font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 sm:hidden"
        >
          {isPending && <span className="spinner" aria-hidden="true" />}
          {isPending ? "Saving count…" : "Save Count"}
        </button>
        <div className="hidden gap-3 sm:flex">
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
            {isPending ? "Saving count…" : isLoggedIn ? `Save Cash Count (${formatCurrency(totalCash)})` : "Save on this device"}
          </button>
        </div>
      </form>
    </div>
  );
}

