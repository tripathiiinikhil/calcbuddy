import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { hasSupabaseConfig } from "@/lib/env";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (!hasSupabaseConfig) {
    if (request.nextUrl.pathname === "/setup") return NextResponse.next();
    return NextResponse.redirect(new URL("/setup", request.url));
  }
  if (request.nextUrl.pathname === "/setup") return NextResponse.redirect(new URL("/", request.url));
  // Supabase returns its verification code to the canonical application origin.
  // Route it internally to the handler that exchanges it for a secure session.
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }
  return updateSession(request);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
