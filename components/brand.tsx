import Link from "next/link";
import Image from "next/image";

export function Brand({
  href = "/",
  size = "md",
  showMascot = true,
  className = "",
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  showMascot?: boolean;
  className?: string;
}) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-95 ${className}`}
      aria-label="CalcBuddy home"
    >
      {showMascot && (
        <span className="relative flex shrink-0 items-center justify-center rounded-xl bg-brand-50 p-1 border border-brand-200/60 shadow-xs">
          <Image
            src="/brand/mascot-transparent.png"
            alt="CalcBuddy Mascot"
            width={iconSize}
            height={iconSize}
            className="h-auto w-auto object-contain"
            priority
          />
        </span>
      )}
      <span className={`${textSize} font-extrabold text-slate-900`}>
        Calc<span className="text-brand-500">Buddy</span>
      </span>
    </Link>
  );
}
