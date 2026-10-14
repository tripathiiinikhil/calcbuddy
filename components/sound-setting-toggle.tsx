"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, playCalcSound } from "@/lib/calculator-sound";

export function SoundSettingToggle() {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
    const handler = () => {
      setEnabled(isSoundEnabled());
    };
    window.addEventListener("calcbuddy_sound_setting_changed", handler);
    return () => window.removeEventListener("calcbuddy_sound_setting_changed", handler);
  }, []);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      playCalcSound("number");
    }
  };

  return (
    <div className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-xs">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl text-brand-700">
          🔊
        </span>
        <div className="min-w-0 flex-1">
          <span className="block font-bold text-slate-900">Keypad Sound Effects</span>
          <span className="mt-0.5 block text-sm text-slate-600">
            Play subtle ASMR clicks when typing on the calculator
          </span>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#009f75] focus-visible:ring-offset-2 ${
          enabled ? "bg-[#009f75]" : "bg-slate-200"
        }`}
        aria-label="Toggle keypad sounds"
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
