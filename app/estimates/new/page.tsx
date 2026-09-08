import { getAuthenticatedBusiness } from "@/lib/business";
import { AppNav } from "@/components/app-nav";
import { EstimateForm } from "@/components/estimate-form";

export default async function NewEstimatePage() {
  const { supabase, business } = await getAuthenticatedBusiness();

  // Load customers for selection
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  // Load products catalog
  let products: { id: string; name: string; price: number }[] = [];
  try {
    const { data: prodData } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("business_id", business.id)
      .order("name", { ascending: true });
    if (prodData) products = prodData;
  } catch (err) {
    console.warn("Could not load products:", err);
  }

  // Determine next estimate number
  const { count } = await supabase
    .from("estimates")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const nextEstimateNumber = `EST-${String((count || 0) + 1).padStart(3, "0")}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12">
      <AppNav businessName={business.name} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <EstimateForm
          customers={customers || []}
          products={products}
          nextEstimateNumber={nextEstimateNumber}
        />
      </main>
    </div>
  );
}

