"use client";

import { useActionState } from "react";
import { createBusiness } from "@/app/onboarding/actions";

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createBusiness, {});
  return <form action={action} className="mt-7 space-y-5">
    <label className="block text-sm font-medium">Business name<input name="name" required maxLength={120} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3" placeholder="e.g. Sharma General Store" /></label>
    <label className="block text-sm font-medium">Business type<select name="type" required defaultValue="" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="" disabled>Select a type</option><option value="retail">Retail</option><option value="wholesale">Wholesale</option><option value="petrol_pump">Petrol pump</option><option value="other">Other</option></select></label>
    {state.error && <p role="alert" className="feedback rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <button disabled={pending} className="ui-button h-12 w-full rounded-xl bg-brand-600 font-semibold text-white disabled:opacity-60">{pending && <span className="spinner" aria-hidden="true" />}{pending ? "Saving…" : "Continue"}</button>
  </form>;
}
