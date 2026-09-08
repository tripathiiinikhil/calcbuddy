"use client";

import { useActionState, useEffect, useState } from "react";
import { addCustomer, type CreditActionState } from "@/app/credit/actions";
import { useToast } from "@/components/toast-provider";

export function AddCustomerModal({
  onCustomerAdded,
}: {
  onCustomerAdded?: (customerId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState<CreditActionState, FormData>(
    addCustomer,
    {}
  );

  useEffect(() => {
    if (state.success) {
      showToast("Customer added successfully!", "success");
      setOpen(false);
      if (state.customerId && onCustomerAdded) {
        onCustomerAdded(state.customerId);
      }
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, onCustomerAdded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ui-button flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
      >
        <span>+ Add Customer</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-slide-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add New Customer</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Enter customer details for credit tracking (udhaar khaata).
            </p>

            <form action={formAction} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Customer Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Phone Number (Optional)
                </label>
                <input
                  name="phone"
                  type="tel"
                  maxLength={20}
                  placeholder="e.g. 9876543210"
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
                  className="ui-button rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {isPending && <span className="spinner" aria-hidden="true" />}
                  {isPending ? "Adding…" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

