"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedBusiness } from "@/lib/business";

export type ProductActionState = {
  success?: boolean;
  error?: string;
  productId?: string;
};

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const name = (formData.get("name") as string | null)?.trim() || "";
    const priceRaw = formData.get("price");
    const price = priceRaw ? parseFloat(priceRaw.toString()) : 0;
    const sku = (formData.get("sku") as string | null)?.trim() || null;

    if (name.length < 1 || name.length > 200) {
      return { error: "Product name must be between 1 and 200 characters." };
    }
    if (isNaN(price) || price < 0) {
      return { error: "Price must be a valid non-negative number." };
    }
    if (sku && sku.length > 50) {
      return { error: "SKU/Code cannot exceed 50 characters." };
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        business_id: business.id,
        name,
        price,
        sku,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return { error: "Could not create product. Please try again." };
    }

    revalidatePath("/products");
    revalidatePath("/estimates/new");
    return { success: true, productId: data?.id };
  } catch (err) {
    console.error("createProduct exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const id = (formData.get("id") as string | null)?.trim() || "";
    const name = (formData.get("name") as string | null)?.trim() || "";
    const priceRaw = formData.get("price");
    const price = priceRaw ? parseFloat(priceRaw.toString()) : 0;
    const sku = (formData.get("sku") as string | null)?.trim() || null;

    if (!id) return { error: "Product ID is missing." };
    if (name.length < 1 || name.length > 200) {
      return { error: "Product name must be between 1 and 200 characters." };
    }
    if (isNaN(price) || price < 0) {
      return { error: "Price must be a valid non-negative number." };
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        sku,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("business_id", business.id);

    if (error) {
      console.error("Error updating product:", error);
      return { error: "Could not update product." };
    }

    revalidatePath("/products");
    revalidatePath("/estimates/new");
    return { success: true };
  } catch (err) {
    console.error("updateProduct exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteProduct(productId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { supabase, business } = await getAuthenticatedBusiness();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("business_id", business.id);

    if (error) {
      return { error: "Could not delete product." };
    }

    revalidatePath("/products");
    revalidatePath("/estimates/new");
    return { success: true };
  } catch (err) {
    console.error("deleteProduct exception:", err);
    return { error: "An unexpected error occurred." };
  }
}

