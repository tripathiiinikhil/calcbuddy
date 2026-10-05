import { AppNav } from "@/components/app-nav";
import { BusinessProfileForm } from "@/components/business-profile-form";
import { AppearancePicker } from "@/components/appearance-picker";
import { getAuthenticatedBusiness } from "@/lib/business";
import { businessLogoUrl } from "@/lib/logo";

export default async function SettingsPage() {
  const { business } = await getAuthenticatedBusiness();
  return <div className="min-h-screen bg-slate-50 pb-20 md:pb-8"><AppNav businessName={business.name} businessType={business.business_type} logoPath={business.logo_path} isLoggedIn /><main className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6"><BusinessProfileForm business={business} /><AppearancePicker /></main></div>;
}
