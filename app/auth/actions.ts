"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplicationOrigin } from "@/lib/auth-origin";

export type FormState = { error?: string; message?: string; email?: string; sent?: boolean };

function value(formData: FormData, name: string) {
  const raw = formData.get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

type AuthErrorDetails = { message?: string; name?: string; status?: number; code?: string };

function authErrorMessage(error: unknown, action: "signup" | "resend") {
  const details = error as AuthErrorDetails;
  const message = typeof details.message === "string" ? details.message.trim() : "";
  const code = typeof details.code === "string" ? details.code : undefined;
  const status = typeof details.status === "number" ? details.status : undefined;

  if (process.env.NODE_ENV !== "production") {
    console.error(`Supabase ${action} failed`, { name: details.name, status, code, message });
  }

  const normalized = `${code ?? ""} ${message}`.toLowerCase();
  if (status === 429 || normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Supabase email rate limit reached. Please wait before trying again.";
  }
  if (normalized.includes("already registered") || normalized.includes("already exists") || normalized.includes("user_already_exists")) {
    return "An account with this email already exists. Please sign in or resend verification.";
  }
  if (message) return message;
  return "Supabase could not complete this request. Please try again.";
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const email = value(formData, "email");
  const password = value(formData, "password");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "We could not sign you in. Check your details and try again." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign-in could not be verified. Please try again." };

  const { data: membership, error: membershipError } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  redirect(!membershipError && !membership ? "/onboarding" : "/dashboard");
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const email = value(formData, "email");
  const password = value(formData, "password");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };

  const supabase = await createClient();
  const emailRedirectTo = await getApplicationOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });
  if (error) return { error: authErrorMessage(error, "signup") };
  if (!data.user) return { error: "Supabase did not create an account. Please try again." };
  if (data.user.identities?.length === 0) return { error: "An account with this email already exists. Please sign in or resend verification." };
  if (!data.session) return { message: "Account created. Verification email sent — check your inbox to confirm your account.", email, sent: true };
  redirect("/onboarding");
}

export async function resendVerification(_: FormState, formData: FormData): Promise<FormState> {
  const email = value(formData, "email");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  const emailRedirectTo = await getApplicationOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });
  if (error) return { error: authErrorMessage(error, "resend") };
  return { message: "Verification email sent. Please check your inbox.", email, sent: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
