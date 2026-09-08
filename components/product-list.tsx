"use client";

import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/format";
import { deleteProduct } from "@/app/products/actions";
import { ProductModal, type ProductItem } from "@/components/product-modal";
import { useToast } from "@/components/toast-provider";

export function ProductList({ products }: { products: ProductItem[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res?.error) {
        showToast(res.error, "error");
      } else {
        showToast("Product deleted from catalog", "info");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-sm text-slate-600">
            Manage your items, rates, and SKU codes ({products.length} items)
          </p>
        </div>
        <ProductModal />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or SKU…"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Products list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <span className="text-4xl">📦</span>
          <h3 className="mt-3 text-lg font-bold text-slate-800">
            {search ? "No products found" : "No products added yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {search
              ? "Try searching with a different product name or SKU."
              : "Add your standard products to speed up creating estimates and invoices."}
          </p>
          {!search && (
            <div className="mt-5">
              <ProductModal />
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">
                  📦
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <span className="mt-0.5 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base sm:text-lg font-extrabold text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                <div className="flex items-center gap-1">
                  <ProductModal
                    product={product}
                    triggerText="Edit"
                    triggerClass="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={isPending}
                    className="rounded-lg border border-red-100 bg-red-50 p-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
                    title="Delete product"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

