"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Brand } from "@/components/brand";
import { BusinessAvatar } from "@/components/business-avatar";
import { initializeBusiness } from "@/app/onboarding/actions";
import { updateBusinessProfile } from "@/app/settings/actions";
import { createClient } from "@/lib/supabase/client";
import { businessLogoUrl } from "@/lib/logo";
import { useToast } from "@/components/toast-provider";

type BusinessTypeOption = {
  id: string;
  dbType: "retail" | "wholesale" | "petrol_pump" | "other";
  icon: string;
  title: string;
};

const businessTypes: BusinessTypeOption[] = [
  {
    id: "retail",
    dbType: "retail",
    icon: "🛍️",
    title: "Retail",
  },
  {
    id: "wholesale",
    dbType: "wholesale",
    icon: "📦",
    title: "Wholesale",
  },
  {
    id: "petrol_pump",
    dbType: "petrol_pump",
    icon: "⛽",
    title: "Petrol Pump",
  },
  {
    id: "service",
    dbType: "other",
    icon: "💼",
    title: "Service Business",
  },
  {
    id: "other",
    dbType: "other",
    icon: "🏢",
    title: "Other",
  },
];

const sampleSuggestions = [
  "Sharma Electronics",
  "Patel Traders",
  "Gupta General Store",
  "Apollo Fuel Station",
];

export function OnboardingFlow() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<BusinessTypeOption>(businessTypes[0]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Logo state for Step 3
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Transitions
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean object URL on unmount
  useEffect(() => {
    if (previewUrl?.startsWith("blob:")) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  // Step 4: Short Branded Transition
  useEffect(() => {
    if (step !== 4) return;

    // Accessibility: check reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      router.push("/dashboard");
      return;
    }

    // 1.2 second maximum duration branded transition
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1200);

    return () => clearTimeout(timer);
  }, [step, router]);

  // Step 1 -> Step 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg("Please enter at least 2 characters for your business name.");
      return;
    }
    if (trimmed.length > 120) {
      setErrorMsg("Business name cannot exceed 120 characters.");
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  // Step 2 -> Step 3 (Persist business record)
  const handleStep2Submit = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await initializeBusiness(name, selectedType.dbType);
        if (result.error || !result.businessId) {
          setErrorMsg(result.error || "Could not save your business. Please try again.");
          return;
        }
        setBusinessId(result.businessId);
        setStep(3);
      } catch {
        setErrorMsg("An unexpected network error occurred. Please try again.");
      }
    });
  };

  // Step 3: Logo upload handler
  const handleLogoUpload = async (file?: File) => {
    if (!file || !businessId) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      showToast("Please choose a PNG, JPG, or WebP image up to 2 MB.", "error");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${businessId}/${crypto.randomUUID()}.${extension}`;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadingLogo(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.storage.from("business-logos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        setPreviewUrl(businessLogoUrl(logoPath));
        showToast("Could not upload that logo. Please try again.", "error");
        return;
      }

      // Update business profile with logo
      const updateResult = await updateBusinessProfile({
        name,
        businessType: selectedType.dbType,
        logoPath: path,
      });

      if (updateResult.error) {
        showToast("Uploaded logo but failed to update profile.", "error");
        return;
      }

      setLogoPath(path);
      setPreviewUrl(objectUrl);
      showToast("Business logo uploaded successfully!", "success");
    } catch {
      setPreviewUrl(businessLogoUrl(logoPath));
      showToast("Could not upload that logo. Please try again.", "error");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Complete Onboarding (from Step 3 -> Step 4 Transition)
  const handleFinishOnboarding = () => {
    setStep(4);
  };

  // Step 4 Render: Short Branded Transition
  if (step === 4) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8"
        aria-label="Entering CalcBuddy"
      >
        <div className="flex flex-col items-center text-center animate-fade-slide-in">
          {/* Mascot with celebration animation */}
          <div className="relative mb-6 h-36 w-36 sm:h-44 sm:w-44">
            <div className="animate-float-mascot relative h-full w-full">
              <Image
                src="/brand/mascot-transparent.png"
                alt="CalcBuddy Mascot"
                fill
                sizes="176px"
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 border border-brand-200">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            Workspace Ready
          </span>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome to CalcBuddy
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-600">
            Simple tools for everyday business.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand-600">
            <span className="spinner" aria-hidden="true" />
            <span>Opening {name}…</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-6">
      {/* Top Header with Brand */}
      <div className="w-full max-w-xl text-center">
        <div className="flex justify-center">
          <Brand size="lg" />
        </div>

        {/* Step Progress Bar (SalesSkip-inspired clean numbered step indicator) */}
        <nav aria-label="Onboarding Progress" className="mt-8 mb-6">
          <ol className="flex items-center justify-center gap-3">
            {/* Step 1 Pill */}
            <li className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                  step === 1
                    ? "bg-brand-500 text-white shadow-xs"
                    : step > 1
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-200 text-slate-600"
                }`}
                aria-current={step === 1 ? "step" : undefined}
              >
                {step > 1 ? "✓" : "1"}
              </span>
              <span className={`hidden text-xs font-semibold sm:inline ${step === 1 ? "text-slate-900" : "text-slate-500"}`}>
                Business Name
              </span>
            </li>

            <li aria-hidden="true" className="h-0.5 w-6 sm:w-10 bg-slate-200" />

            {/* Step 2 Pill */}
            <li className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                  step === 2
                    ? "bg-brand-500 text-white shadow-xs"
                    : step > 2
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-200 text-slate-600"
                }`}
                aria-current={step === 2 ? "step" : undefined}
              >
                {step > 2 ? "✓" : "2"}
              </span>
              <span className={`hidden text-xs font-semibold sm:inline ${step === 2 ? "text-slate-900" : "text-slate-500"}`}>
                Business Type
              </span>
            </li>

            <li aria-hidden="true" className="h-0.5 w-6 sm:w-10 bg-slate-200" />

            {/* Step 3 Pill */}
            <li className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                  step === 3
                    ? "bg-brand-500 text-white shadow-xs"
                    : "bg-slate-200 text-slate-600"
                }`}
                aria-current={step === 3 ? "step" : undefined}
              >
                3
              </span>
              <span className={`hidden text-xs font-semibold sm:inline ${step === 3 ? "text-slate-900" : "text-slate-500"}`}>
                Optional Profile
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Focused Onboarding Card */}
      <section className="w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
        {/* Error alert */}
        {errorMsg && (
          <div role="alert" className="feedback mb-6 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: BUSINESS NAME */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200/60">
                Step 1 of 3
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                What should we call your business?
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Set up your CalcBuddy workspace in a few seconds.
              </p>
            </div>

            <div>
              <label htmlFor="business-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Business Name
              </label>
              <input
                id="business-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
                autoFocus
                placeholder="e.g. Sharma Electronics"
                className="mt-2 h-13 w-full rounded-2xl border border-slate-300 px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Suggestions Chips */}
            <div>
              <p className="text-xs font-semibold text-slate-500">Quick examples:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sampleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setName(suggestion)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtle Mascot Companion Note */}
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50/60 p-3.5 border border-brand-100">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src="/brand/mascot-transparent.png"
                  alt="CalcBuddy Mascot Companion"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Your business name will appear on all your customer estimates, invoices, and register reports.
              </p>
            </div>

            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="ui-button h-13 w-full rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-base shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            >
              Continue →
            </button>
          </form>
        )}

        {/* STEP 2: BUSINESS TYPE */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200/60">
                Step 2 of 3
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                What type of business do you run?
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                This helps us tailor CalcBuddy to your everyday work.
              </p>
            </div>

            {/* Selectable Cards Grid */}
            <div
              role="radiogroup"
              aria-label="Select your business type"
              className="grid gap-3 sm:grid-cols-1"
            >
              {businessTypes.map((type) => {
                const isSelected = selectedType.id === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-xs border border-slate-100">
                      {type.icon}
                    </span>
                    <span className={`min-w-0 flex-1 font-bold text-sm ${isSelected ? "text-brand-900" : "text-slate-900"}`}>
                      {type.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        isSelected
                          ? "bg-brand-500 text-white"
                          : "border border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isPending}
                className="ui-button h-12 rounded-2xl border border-slate-200 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                disabled={isPending}
                className="ui-button h-12 flex-1 rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-base shadow-sm transition-all hover:shadow-md disabled:opacity-60"
              >
                {isPending && <span className="spinner" aria-hidden="true" />}
                {isPending ? "Creating workspace…" : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OPTIONAL BUSINESS PROFILE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200/60">
                Step 3 of 3 (Optional)
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Add your business identity
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Upload your store logo now, or finish setup and add it anytime in Settings.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-4">
                <BusinessAvatar
                  name={name}
                  logoUrl={previewUrl}
                  className="h-16 w-16"
                  textClassName="text-lg"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900 truncate">{name}</h2>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-brand-100/70 px-2 py-0.5 text-xs font-medium text-brand-800">
                    {selectedType.icon} {selectedType.title}
                  </span>
                </div>
              </div>

              {/* Logo Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="ui-button min-h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploadingLogo ? "Uploading…" : logoPath ? "Change Logo" : "Upload Store Logo"}
                </button>
                {logoPath && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPath(null);
                      setPreviewUrl(null);
                      showToast("Logo removed.", "info");
                    }}
                    disabled={uploadingLogo}
                    className="ui-button min-h-10 rounded-xl px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="hidden"
                  aria-label="Upload business logo"
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Supported formats: PNG, JPG, or WebP up to 2 MB.
              </p>
            </div>

            {/* Mascot note */}
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50/60 p-3 border border-brand-100">
              <span className="text-lg">✨</span>
              <p className="text-xs text-slate-600">
                You’re all set! CalcBuddy provides fast note counting, estimates, and simple business calculations.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={uploadingLogo}
                className="ui-button h-13 w-full rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-base shadow-sm transition-all hover:shadow-md disabled:opacity-60"
              >
                Complete Setup & Open CalcBuddy →
              </button>
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={uploadingLogo}
                className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

