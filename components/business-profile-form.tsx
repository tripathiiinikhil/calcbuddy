"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateBusinessProfile } from "@/app/settings/actions";
import { BusinessAvatar } from "@/components/business-avatar";
import { businessLogoUrl } from "@/lib/logo";
import { useToast } from "@/components/toast-provider";

type BusinessProfile = { id: string; name: string; business_type: string; logo_path?: string | null };
const allowedTypes = ["retail", "wholesale", "petrol_pump", "other"];

export function BusinessProfileForm({ business }: { business: BusinessProfile }) {
  const { showToast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(business.name);
  const [type, setType] = useState(business.business_type);
  const [logoPath, setLogoPath] = useState<string | null>(business.logo_path ?? null);
  const [preview, setPreview] = useState<string | null>(businessLogoUrl(business.logo_path));

  useEffect(() => {
    if (preview?.startsWith("blob:")) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const upload = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      showToast("Choose a PNG, JPG, or WebP image up to 2 MB.", "error");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${business.id}/${crypto.randomUUID()}.${extension}`;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const { error } = await createClient().storage.from("business-logos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        setPreview(businessLogoUrl(logoPath));
        showToast("Could not upload that logo. Please try again.", "error");
        return;
      }

      if (logoPath && logoPath !== business.logo_path) {
        await createClient().storage.from("business-logos").remove([logoPath]);
      }
      setLogoPath(path);
      setPreview(objectUrl);
      showToast("Logo uploaded. Save changes to apply it.", "success");
    } catch {
      setPreview(businessLogoUrl(logoPath));
      showToast("Could not upload that logo. Please try again.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const save = () => startTransition(async () => {
    try {
      const previousPath = business.logo_path ?? null;
      const result = await updateBusinessProfile({ name, businessType: type, logoPath });
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      if (previousPath && previousPath !== logoPath) {
        await createClient().storage.from("business-logos").remove([previousPath]);
      }
      showToast("Business profile saved.", "success");
      router.refresh();
    } catch {
      showToast("Could not save your business profile. Please try again.", "error");
    }
  });

  const removeLogo = async () => {
    if (!logoPath) return;
    if (logoPath !== business.logo_path) {
      const { error } = await createClient().storage.from("business-logos").remove([logoPath]);
      if (error) {
        showToast("Could not remove the uploaded logo. Please try again.", "error");
        return;
      }
    }
    setLogoPath(null);
    setPreview(null);
    showToast("Logo removal will take effect when you save changes.", "info");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900">Business profile</h1>
      <p className="mt-1 text-sm text-slate-600">A small amount of identity, without extra setup.</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <BusinessAvatar name={name || business.name} logoUrl={preview} className="h-20 w-20" textClassName="text-xl" />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || pending} className="ui-button min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60">
            {uploading ? "Uploading…" : logoPath ? "Replace logo" : "Add logo"}
          </button>
          {logoPath && <button type="button" onClick={removeLogo} disabled={uploading || pending} className="ui-button min-h-11 rounded-lg px-4 text-sm font-semibold text-red-600 disabled:opacity-60">Remove logo</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => upload(event.target.files?.[0])} className="hidden" aria-label="Choose business logo" />
      </div>
      <p className="mt-3 text-xs text-slate-500">PNG, JPG, or WebP. Maximum 2 MB.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Business name
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 font-normal" />
        </label>
        <label className="text-sm font-semibold text-slate-700">Business type
          <select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal">
            {allowedTypes.map((businessType) => <option key={businessType} value={businessType}>{businessType.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}</option>)}
          </select>
        </label>
      </div>

      <button type="button" onClick={save} disabled={pending || uploading} className="ui-button mt-6 min-h-12 rounded-xl bg-brand-600 px-5 font-semibold text-white disabled:opacity-60">
        {pending && <span className="spinner" aria-hidden="true" />}{pending ? "Saving…" : "Save changes"}
      </button>
    </section>
  );
}
