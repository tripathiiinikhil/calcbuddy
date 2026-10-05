import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata = {
  title: "Onboarding | CalcBuddy",
  description: "Set up your CalcBuddy business workspace in a few seconds.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // UX Rule #5: Do NOT replay onboarding experience for returning users
  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
