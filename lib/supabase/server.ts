import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(items) {
          try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Middleware refreshes sessions when this runs in a Server Component. */ }
        },
      },
    },
  );
}
