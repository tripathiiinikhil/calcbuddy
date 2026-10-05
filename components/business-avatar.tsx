import { businessInitials } from "@/lib/logo";

export function BusinessAvatar({
  name,
  className = "h-9 w-9",
  textClassName = "text-xs",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span
      aria-label={`${name} initials`}
      className={`grid shrink-0 place-items-center rounded-full bg-brand-500 font-bold text-white shadow-xs select-none ${className} ${textClassName}`}
    >
      {businessInitials(name)}
    </span>
  );
}
