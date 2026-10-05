"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteEstimate } from "@/app/estimates/actions";
import { useToast } from "@/components/toast-provider";
import { BusinessAvatar } from "@/components/business-avatar";

export interface EstimateItemDetail {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  position: number;
}

export interface EstimateFull {
  id: string;
  estimate_number: string;
  customer_name: string;
  customer_id?: string | null;
  issued_at: string;
  total_amount: number;
  subtotal_amount?: number;
  discount_amount?: number;
  notes?: string | null;
  estimate_items: EstimateItemDetail[];
}

export function PrintableEstimate({
  estimate,
  businessName,
  businessType,
  businessLogoUrl,
}: {
  estimate: EstimateFull;
  businessName: string;
  businessType: string;
  businessLogoUrl?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handlePrint = () => {
    const clearPrintMode = () => document.body.classList.remove("printing-estimate");
    document.body.classList.add("printing-estimate");
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.print();
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete estimate ${estimate.estimate_number}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteEstimate(estimate.id);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Estimate deleted", "info");
        router.push("/estimates");
      }
    });
  };

  const items = [...(estimate.estimate_items || [])].sort((a, b) => a.position - b.position);

  const calculatedSubtotal =
    typeof estimate.subtotal_amount === "number" && estimate.subtotal_amount > 0
      ? estimate.subtotal_amount
      : items.reduce((sum, it) => sum + Number(it.line_total), 0);

  const discountAmount = Number(estimate.discount_amount || 0);

  return (
    <div className="estimate-print-page space-y-6">
      {/* Top Actions Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/estimates"
          className="text-xs font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
        >
          ← Back to All Estimates
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="ui-button rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700 inline-flex items-center gap-2"
          >
            <span>🖨 Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Card */}
      <article className="estimate-print-content rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-700">CalcBuddy</p>
            <div className="inline-flex min-w-0 items-center gap-3">
              <BusinessAvatar name={businessName} logoUrl={businessLogoUrl} className="h-12 w-12 rounded-lg" textClassName="text-sm" />
              <span className="break-words text-xl font-extrabold text-slate-900">{businessName}</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 font-medium">
              {businessType.replace("_", " ")} Business
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-lg bg-brand-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-700 border border-brand-200">
              ESTIMATE / QUOTATION
            </span>
            <p className="mt-2 text-base font-bold text-slate-900">
              {estimate.estimate_number}
            </p>
            <p className="text-xs text-slate-500">Date: {formatDate(estimate.issued_at)}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100 print:bg-transparent print:border print:p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estimate For:
          </p>
          <p className="mt-1 text-base font-bold text-slate-900">{estimate.customer_name}</p>
        </div>

        {/* Items Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-center w-24">Qty</th>
                <th className="py-3 px-4 text-right w-32">Rate (₹)</th>
                <th className="py-3 px-4 text-right w-36">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-xs font-medium text-slate-400 text-center">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {item.product_name}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations / Summary */}
        <div className="mt-6 flex flex-col items-end gap-2 text-sm">
          <div className="flex items-center justify-between w-64 text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(calculatedSubtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between w-64 text-emerald-600">
              <span>Discount:</span>
              <span className="font-semibold">- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="border-t-2 border-slate-900 pt-2 mt-1 flex items-center justify-between w-64 text-base font-extrabold text-slate-900">
            <span>Total Payable:</span>
            <span className="text-xl text-brand-700">
              {formatCurrency(estimate.total_amount)}
            </span>
          </div>
        </div>

        {/* Notes / Terms */}
        {estimate.notes && (
          <div className="mt-8 rounded-lg bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600 print:bg-transparent print:border">
            <p className="font-bold text-slate-700 uppercase tracking-wider mb-1">
              Terms & Remarks:
            </p>
            <p>{estimate.notes}</p>
          </div>
        )}

        {/* Signature Box */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p>Thank you for choosing {businessName}!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Generated via CalcBuddy • Business Utility Suite
            </p>
          </div>
          <div className="text-center w-48">
            <div className="border-b border-slate-400 mb-2 h-10"></div>
            <p className="font-semibold text-slate-700 uppercase">Authorized Signatory</p>
          </div>
        </div>
      </article>
    </div>
  );
}

