"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEstimate, type EstimateLineItemInput } from "@/app/estimates/actions";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/toast-provider";

interface CustomerOption {
  id: string;
  name: string;
  phone: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface ItemRow {
  product_name: string;
  quantity: number | "";
  unit_price: number | "";
}

export function EstimateForm({
  customers = [],
  products = [],
  nextEstimateNumber = "EST-001",
}: {
  customers: CustomerOption[];
  products: ProductOption[];
  nextEstimateNumber: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [estimateNumber, setEstimateNumber] = useState<string>(nextEstimateNumber);
  const [issuedAt, setIssuedAt] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>(
    "Thank you for your business! Estimate valid for 15 days."
  );

  const [items, setItems] = useState<ItemRow[]>([
    { product_name: "", quantity: 1, unit_price: "" },
  ]);

  // Discount
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [discountValue, setDiscountValue] = useState<number | "">("");

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (id === "") {
      setCustomerName("");
    } else {
      const found = customers.find((c) => c.id === id);
      if (found) setCustomerName(found.name);
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setItems((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                product_name: product.name,
                unit_price: product.price,
                quantity: row.quantity === "" ? 1 : row.quantity,
              }
            : row
        )
      );
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemRow,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { product_name: "", quantity: 1, unit_price: "" }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      setItems([{ product_name: "", quantity: 1, unit_price: "" }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = typeof item.quantity === "number" ? item.quantity : 0;
    const price = typeof item.unit_price === "number" ? item.unit_price : 0;
    return sum + qty * price;
  }, 0);

  const discountValNum = typeof discountValue === "number" ? discountValue : 0;
  const discountAmount =
    discountType === "percent"
      ? (subtotal * discountValNum) / 100
      : Math.min(subtotal, discountValNum);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCustomerName = customerName.trim();
    if (!cleanCustomerName) {
      showToast("Please enter or select a customer name.", "error");
      return;
    }

    const validItems: EstimateLineItemInput[] = items
      .filter((it) => it.product_name.trim().length > 0)
      .map((it) => ({
        product_name: it.product_name.trim(),
        quantity: typeof it.quantity === "number" ? it.quantity : 1,
        unit_price: typeof it.unit_price === "number" ? it.unit_price : 0,
      }));

    if (validItems.length === 0) {
      showToast("Please enter at least one product with name and price.", "error");
      return;
    }

    startTransition(async () => {
      const res = await createEstimate({
        customer_id: selectedCustomerId || null,
        customer_name: cleanCustomerName,
        estimate_number: estimateNumber,
        issued_at: new Date(issuedAt).toISOString(),
        discount_amount: discountAmount,
        notes,
        items: validItems,
      });

      if (res.error) {
        showToast(res.error, "error");
      } else if (res.estimateId) {
        showToast("Estimate created successfully!", "success");
        router.push(`/estimates/${res.estimateId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/estimates"
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            ← Back to Estimates
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Create New Estimate</h1>
        </div>
      </div>

      {/* Details Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Estimate & Customer Info
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Customer select / name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Customer *
            </label>
            {customers.length > 0 && (
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700"
              >
                <option value="">-- Choose Existing Customer or Type Below --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (selectedCustomerId) setSelectedCustomerId("");
              }}
              placeholder="Enter customer or company name"
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Estimate Number & Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Estimate No.
              </label>
              <input
                type="text"
                required
                value={estimateNumber}
                onChange={(e) => setEstimateNumber(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Date
              </label>
              <input
                type="date"
                required
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Line Items ({items.length})
          </h2>
          {products.length > 0 && (
            <span className="text-xs text-slate-400">
              💡 Select from catalog or type custom item
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          {items.map((row, index) => {
            const qty = typeof row.quantity === "number" ? row.quantity : 0;
            const price = typeof row.unit_price === "number" ? row.unit_price : 0;
            const rowTotal = Math.round(qty * price * 100) / 100;

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50/50"
              >
                {/* Product Name / Quick pick */}
                <div className="flex-1">
                  {products.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleProductSelect(index, e.target.value);
                      }}
                      defaultValue=""
                      className="mb-1 h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-600"
                    >
                      <option value="" disabled>
                        ⚡ Pick from catalog…
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{p.price}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Product or service description"
                    value={row.product_name}
                    onChange={(e) =>
                      handleItemChange(index, "product_name", e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Qty */}
                <div className="w-full sm:w-24">
                  <span className="block sm:hidden text-[11px] font-semibold text-slate-500">
                    Quantity
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        e.target.value === "" ? "" : parseFloat(e.target.value)
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-center text-sm font-semibold focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Unit Price */}
                <div className="w-full sm:w-28">
                  <span className="block sm:hidden text-[11px] font-semibold text-slate-500">
                    Price (₹)
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Price"
                      value={row.unit_price}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unit_price",
                          e.target.value === "" ? "" : parseFloat(e.target.value)
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-6 pr-2 text-right text-sm font-semibold focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Row Total */}
                <div className="flex sm:w-28 items-center justify-between sm:justify-end gap-2 px-1">
                  <span className="text-xs text-slate-400 sm:hidden">Amount:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(rowTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="rounded p-1 text-xs text-slate-400 hover:text-red-600"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItemRow}
            className="ui-button w-full rounded-xl border border-dashed border-slate-300 bg-white py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 hover:border-brand-300"
          >
            + Add Another Item
          </button>
        </div>
      </div>

      {/* Totals & Discounts Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col items-end gap-3 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between w-full sm:w-72">
            <span className="text-slate-600 font-medium">Subtotal:</span>
            <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between w-full sm:w-72 gap-2">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Discount:</span>
              <button
                type="button"
                onClick={() =>
                  setDiscountType(discountType === "flat" ? "percent" : "flat")
                }
                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                {discountType === "flat" ? "₹ Flat" : "% Pct"}
              </button>
            </div>
            <div className="relative w-28">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">
                {discountType === "flat" ? "₹" : "%"}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={discountValue}
                onChange={(e) =>
                  setDiscountValue(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                className="h-9 w-full rounded-lg border border-slate-300 pl-6 pr-2 text-right text-sm font-semibold"
              />
            </div>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between w-full sm:w-72 text-xs text-emerald-600 font-semibold">
              <span>Discount applied:</span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between w-full sm:w-72 text-base">
            <span className="font-extrabold text-slate-900">Total Amount:</span>
            <span className="text-xl font-extrabold text-brand-700">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Notes / Terms */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase">
            Notes / Terms & Conditions
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700"
          />
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex justify-end gap-3">
        <Link
          href="/estimates"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending || grandTotal <= 0}
          className="ui-button min-h-12 rounded-xl bg-brand-600 px-8 text-sm font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending && <span className="spinner" aria-hidden="true" />}
          {isPending ? "Generating Estimate…" : "Save & View Printable Estimate"}
        </button>
      </div>
    </form>
  );
}

