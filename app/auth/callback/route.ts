import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/env";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const destination = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code) return NextResponse.redirect(new URL("/login?error=verification", requestUrl.origin));

  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) { items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=verification", requestUrl.origin));
  return response;
}
