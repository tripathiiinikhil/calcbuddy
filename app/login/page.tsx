import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AuthShell title="Welcome back" subtitle="Sign in to manage today’s cash and business records.">{params.error === "verification" && <p role="alert" className="feedback mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">We could not confirm that email link. Please request a new verification email.</p>}<AuthForm mode="login" /></AuthShell>;
}
