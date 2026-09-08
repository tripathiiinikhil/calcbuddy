import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  return <AuthShell title="Start with CalcBuddy" subtitle="Create your secure account. You’ll set up your business next."><AuthForm mode="signup" /></AuthShell>;
}
