"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBusinessProfile } from "@/app/settings/actions";
import { BusinessAvatar } from "@/components/business-avatar";
import { useToast } from "@/components/toast-provider";

type BusinessProfile = { id: string; name: string; business_type: string; logo_path?: string | null };
const allowedTypes = ["retail", "wholesale", "petrol_pump", "other"];

export function BusinessProfileForm({ business }: { business: BusinessProfile }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(business.name);
  const [type, setType] = useState(business.business_type);

  const save = () =>
    startTransition(async () => {
      try {
        const result = await updateBusinessProfile({
          name,
          businessType: type,
          logoPath: business.logo_path ?? null,
        });
        if (result.error) {
          showToast(result.error, "error");
          return;
        }
        showToast("Business profile saved.", "success");
        router.refresh();
      } catch {
        showToast("Could not save your business profile. Please try again.", "error");
      }
    });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-4">
        <BusinessAvatar name={name || business.name} className="h-16 w-16" textClassName="text-xl" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">{name || business.name}</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {type.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Business name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 font-normal text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Business type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {allowedTypes.map((businessType) => (
              <option key={businessType} value={businessType}>
                {businessType.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={pending || name.trim().length < 2}
        className="ui-button mt-6 min-h-12 rounded-xl bg-brand-500 hover:bg-brand-600 px-5 font-bold text-white shadow-xs transition-all disabled:opacity-60"
      >
        {pending && <span className="spinner" aria-hidden="true" />}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </section>
  );
}
