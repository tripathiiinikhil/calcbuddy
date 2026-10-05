import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to manage today’s cash and business records."
    >
      {params.error === "verification" && (
        <p role="alert" className="feedback mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          We could not confirm that email link. Please request a new verification email.
        </p>
      )}
      <AuthForm mode="login" />
    </AuthShell>
  );
}
