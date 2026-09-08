"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { deleteCreditTransaction, deleteCustomer } from "@/app/credit/actions";
import { RecordTransactionModal } from "@/components/record-transaction-modal";
import { useToast } from "@/components/toast-provider";

export interface TransactionItem {
  id: string;
  transaction_type: "credit" | "payment";
  amount: number;
  notes: string | null;
  occurred_at: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export function CustomerLedger({
  customer,
  transactions,
}: {
  customer: CustomerDetails;
  transactions: TransactionItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const totalCredit = transactions
    .filter((t) => t.transaction_type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPayment = transactions
    .filter((t) => t.transaction_type === "payment")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalCredit - totalPayment;
  const hasDebt = balance > 0;
  const isSettled = balance === 0;

  const handleDeleteTransaction = (txId: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction entry?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCreditTransaction(txId, customer.id);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Transaction removed", "info");
      }
    });
  };

  const handleDeleteCustomer = () => {
    if (
      !window.confirm(
        `Are you sure you want to delete customer "${customer.name}" and all their transaction history? This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCustomer(customer.id);
      if (res?.error) {
        showToast(res.error, "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/credit"
          className="text-xs font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
        >
          ← All Customers
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-700"
              >
                📞 {customer.phone}
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={handleDeleteCustomer}
            disabled={isPending}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete Customer
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className={`rounded-2xl border p-5 text-white shadow-md ${
          hasDebt
            ? "border-red-500/40 bg-gradient-to-r from-red-600 to-rose-700"
            : isSettled
            ? "border-slate-300 bg-gradient-to-r from-slate-700 to-slate-800"
            : "border-emerald-500/40 bg-gradient-to-r from-emerald-600 to-teal-700"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">
              {hasDebt
                ? "Customer Owes You (Pending Udhaar)"
                : isSettled
                ? "Account Settled (No Pending Udhaar)"
                : "Advance Paid By Customer"}
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {formatCurrency(Math.abs(balance))}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium sm:text-sm">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-right">
              <p className="text-white/70">Total Udhaar</p>
              <p className="font-bold">{formatCurrency(totalCredit)}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 text-right">
              <p className="text-white/70">Total Paid</p>
              <p className="font-bold">{formatCurrency(totalPayment)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <RecordTransactionModal
          customerId={customer.id}
          customerName={customer.name}
          type="credit"
          label="+ Give Credit (Udhaar)"
          buttonClass="bg-red-600 text-white hover:bg-red-700"
        />
        <RecordTransactionModal
          customerId={customer.id}
          customerName={customer.name}
          type="payment"
          label="✓ Receive Payment (Jama)"
          buttonClass="bg-emerald-600 text-white hover:bg-emerald-700"
        />
      </div>

      {/* Transaction Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Transaction History ({transactions.length})
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm">No transactions recorded yet for this customer.</p>
            <p className="mt-1 text-xs text-slate-400">
              Use the buttons above to give credit or record payments.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isTxCredit = tx.transaction_type === "credit";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                        isTxCredit
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isTxCredit ? "↑" : "↓"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase rounded px-1.5 py-0.5 ${
                            isTxCredit
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isTxCredit ? "Udhaar Diya" : "Jama Kiya"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDateTime(tx.occurred_at)}
                        </span>
                      </div>
                      {tx.notes && (
                        <p className="mt-1 text-xs sm:text-sm text-slate-700">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-base font-extrabold sm:text-lg ${
                        isTxCredit ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isTxCredit ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      disabled={isPending}
                      className="rounded p-1 text-xs text-slate-300 hover:text-red-600 transition-colors"
                      title="Delete entry"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

