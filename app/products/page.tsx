import { redirect } from "next/navigation";

/** Product catalog is intentionally outside CalcBuddy v1; estimates accept manual items. */
export default function ProductsPage() {
  redirect("/estimates");
}
