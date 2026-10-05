"use client";

import { useEffect, useState } from "react";
import { businessInitials } from "@/lib/logo";

export function BusinessAvatar({ name, logoUrl, className = "h-9 w-9", textClassName = "text-xs" }: { name: string; logoUrl?: string | null; className?: string; textClassName?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [logoUrl]);
  if (logoUrl && !imageFailed) return <img src={logoUrl} alt={`${name} logo`} onError={() => setImageFailed(true)} className={`${className} shrink-0 rounded-full border border-slate-200 object-cover`} />;
  return <span aria-label={`${name} initials`} className={`grid shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 ${className} ${textClassName}`}>{businessInitials(name)}</span>;
}
