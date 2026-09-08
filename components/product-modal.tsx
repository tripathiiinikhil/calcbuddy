"use client";

import { useActionState, useEffect, useState } from "react";
import { createProduct, updateProduct, type ProductActionState } from "@/app/products/actions";
import { useToast } from "@/components/toast-provider";

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  sku: string | null;
}

export function ProductModal({
  product,
  triggerText,
  triggerClass,
}: {
  product?: ProductItem | null;
  triggerText?: string;
  triggerClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const isEditing = Boolean(product);

  const action = isEditing ? updateProduct : createProduct;
  const [state, formAction, isPending] = useActionState<ProductActionState, FormData>(
    action,
    {}
  );

  useEffect(() => {
    if (state.success) {
      showToast(
        isEditing ? "Product updated successfully!" : "Product added to catalog!",
        "success"
      );
      setOpen(false);
    } else if (state.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, isEditing]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClass ||
          "ui-button flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        }
      >
        <span>{triggerText || "+ Add Product"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-slide-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Save your products to quickly add them to estimates and billing.
            </p>

            <form action={formAction} className="mt-5 space-y-4">
              {isEditing && <input type="hidden" name="id" value={product!.id} />}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Product Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={product?.name || ""}
                  maxLength={200}
                  placeholder="e.g. Basmati Rice (1kg) or Petrol per Ltr"
                  autoFocus
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Selling Price (₹) *
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    name="price"
                    type="number"
                    step="any"
                    min="0"
                    required
                    defaultValue={product ? product.price : ""}
                    placeholder="0.00"
                    className="h-11 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-sm font-bold text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* SKU / Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  SKU / Item Code (Optional)
                </label>
                <input
                  name="sku"
                  type="text"
                  maxLength={50}
                  defaultValue={product?.sku || ""}
                  placeholder="e.g. RICE-01 or Barcode"
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
                  {isPending ? "Saving…" : isEditing ? "Save Changes" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

