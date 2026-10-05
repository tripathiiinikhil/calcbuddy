import { redirect } from "next/navigation";

/** Legacy dashboard URL: the focused home screen is now the primary experience. */
export default function DashboardPage() {
  redirect("/");
}
