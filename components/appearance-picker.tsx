"use client";

import { useTheme, type ThemePreference } from "@/components/theme-provider";

const options: { value: ThemePreference; label: string; detail: string }[] = [
  { value: "light", label: "Light", detail: "Always use light appearance" },
  { value: "dark", label: "Dark", detail: "Always use dark appearance" },
  { value: "system", label: "System", detail: "Match this device" },
];

export function AppearancePicker() {
  const { theme, setTheme } = useTheme();
  return <section id="appearance" className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold text-slate-900">Appearance</h2><p className="mt-1 text-sm text-slate-600">Choose how CalcBuddy looks on this device.</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{options.map((option) => <button key={option.value} type="button" aria-pressed={theme === option.value} onClick={() => setTheme(option.value)} className={`min-h-16 rounded-xl border p-3 text-left transition-colors ${theme === option.value ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}><span className="block text-sm font-bold">{theme === option.value ? "●" : "○"} {option.label}</span><span className="mt-1 block text-xs opacity-75">{option.detail}</span></button>)}</div></section>;
}
