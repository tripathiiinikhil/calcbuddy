export function businessInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CB";
}

export function businessLogoUrl(path?: string | null) {
  if (!path || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-logos/${encodedPath}`;
}
