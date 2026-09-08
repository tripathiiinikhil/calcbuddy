import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { ProductList } from "@/components/product-list";
import type { ProductItem } from "@/components/product-modal";

export default async function ProductsPage() {
  const { supabase, business } = await getAuthenticatedBusiness();

  let products: ProductItem[] = [];
  let tableError = false;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, sku")
      .eq("business_id", business.id)
      .order("name", { ascending: true });

    if (error) {
      console.warn("Could not query products table:", error.message);
      tableError = true;
    } else if (data) {
      products = data as ProductItem[];
    }
  } catch (err) {
    console.error("Products query exception:", err);
    tableError = true;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {tableError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <strong>Notice:</strong> Please apply the latest database migration (
            <code>supabase/migrations/202609030001_expand_features.sql</code>) in your Supabase SQL editor to enable the products table.
          </div>
        )}
        <ProductList products={products} />
      </main>
    </div>
  );
}

