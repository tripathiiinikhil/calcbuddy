import { OnboardingForm } from "@/components/onboarding-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-5 py-8"><section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="font-bold text-brand-700">CalcBuddy</p><h1 className="mt-8 text-2xl font-bold">Tell us about your business</h1><p className="mt-2 text-sm leading-6 text-slate-600">This helps us keep your records clearly organised. You can change it later.</p><OnboardingForm /></section></main>;
}
