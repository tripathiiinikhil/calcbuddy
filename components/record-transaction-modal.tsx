"use client";

import { useActionState, useEffect, useState } from "react";
import { recordCreditTransaction, type CreditActionState } from "@/app/credit/actions";
import { useToast } from "@/components/toast-provider";

export function RecordTransactionModal({
  customerId,
  customerName,
  type,
  label,
  buttonClass,
}: {
  customerId: string;
  customerName: string;
  type: "credit" | "payment";
  label: string;
  buttonClass: string;
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState<CreditActionState, FormData>(
    recordCreditTransaction,
    {}
  );

  const isCredit = type === "credit";

  useEffect(() => {
    if (state.success) {
      showToast(
        isCredit ? "Credit entry recorded!" : "Payment recorded successfully!",
        "success"
      );
      setOpen(false);
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, isCredit]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`ui-button flex-1 min-h-12 rounded-xl font-bold shadow-sm ${buttonClass}`}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-slide-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isCredit ? "Give Credit (Udhaar Diya)" : "Receive Payment (Jama Kiya)"}
                </h2>
                <p className="text-xs text-slate-500">Customer: {customerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="customer_id" value={customerId} />
              <input type="hidden" name="transaction_type" value={type} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Amount (₹) *
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Description / Note (Optional)
                </label>
                <input
                  name="notes"
                  type="text"
                  maxLength={1000}
                  placeholder={
                    isCredit
                      ? "e.g. 5 bags cement, Bill #42"
                      : "e.g. Paid via Google Pay / Cash"
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
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
                  className={`ui-button rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                    isCredit ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isPending && <span className="spinner" aria-hidden="true" />}
                  {isPending
                    ? "Saving…"
                    : isCredit
                    ? "Save Udhaar"
                    : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

