"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Brand } from "@/components/brand";
import { initializeBusiness } from "@/app/onboarding/actions";

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
    title: "Other Business",
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<BusinessTypeOption>(businessTypes[0]);

  // Transitions
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Step 2 -> Cash Counter (Persist business record and complete onboarding)
  const handleStep2Submit = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await initializeBusiness(name, selectedType.dbType);
        if (result.error || !result.businessId) {
          setErrorMsg(result.error || "Could not save your business. Please try again.");
          return;
        }
        router.push("/counter");
      } catch {
        setErrorMsg("An unexpected network error occurred. Please try again.");
      }
    });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white sm:bg-slate-50 p-0 sm:px-6">
      {/* Top Header with Brand */}
      <div className="w-full max-w-xl px-5 pt-8 sm:px-0 sm:pt-0 text-center">
        <div className="flex justify-center">
          <Brand size="lg" />
        </div>

        {/* Step Progress Bar (Clean numbered step indicator) */}
        <nav aria-label="Onboarding Progress" className="mt-6 mb-4 sm:mb-6">
          <ol className="flex items-center justify-center gap-3">
            {/* Step 1 */}
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

            {/* Step 2 */}
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

          </ol>
        </nav>
      </div>

      {/* Focused Onboarding Card (Unboxed edge-to-edge on mobile, rounded card on sm+) */}
      <section className="w-full max-w-xl min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-slate-200/80 bg-white p-5 sm:p-8 sm:shadow-xl sm:shadow-slate-200/40">
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
                Step 1 of 2
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
                className="mt-2 h-12 sm:h-13 w-full rounded-2xl border border-slate-300 px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
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
                Your business name will appear on your cash register reports and account profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="ui-button h-12 sm:h-13 w-full rounded-2xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-base shadow-sm transition-all hover:shadow-md disabled:opacity-50"
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
                Step 2 of 2
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                What type of business do you run?
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                This helps us tailor CalcBuddy to your everyday work.
              </p>
            </div>

            {/* Selectable Cards */}
            <div
              role="radiogroup"
              aria-label="Select your business type"
              className="grid gap-2"
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
                    className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-2 text-left transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/70 shadow-xs ring-2 ring-brand-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-xs border border-slate-100">
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

      </section>
    </main>
  );
}

