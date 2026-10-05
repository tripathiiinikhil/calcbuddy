"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { resendVerification, signIn, signUp, type FormState } from "@/app/auth/actions";
import { useToast } from "@/components/toast-provider";

const initialState: FormState = {};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isLogin = mode === "login";
  const { showToast } = useToast();
  const lastNotice = useRef<string | undefined>(undefined);

  useEffect(() => {
    const notice = state.error ?? state.message;
    if (notice && notice !== lastNotice.current) {
      showToast(notice, state.error ? "error" : "success");
      lastNotice.current = notice;
    }
  }, [showToast, state.error, state.message]);

  if (!isLogin && state.sent && state.email) return <VerificationNotice email={state.email} message={state.message} />;

  return (
    <form action={formAction} className="mt-4 space-y-4" noValidate>
      <div>
        <label htmlFor="auth-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Email address
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="you@business.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Password
          </label>
          {isLogin && (
            <button
              type="button"
              onClick={() => showToast("For password reset, please contact support or request a new signup link.", "info")}
              className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={8}
          className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder={isLogin ? "••••••••" : "At least 8 characters"}
        />
      </div>

      {state.error && (
        <p role="alert" className="feedback rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="ui-button mt-2 h-12 w-full rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
      >
        {pending && <span className="spinner" aria-hidden="true" />}
        {pending ? "Please wait…" : isLogin ? "Sign in to CalcBuddy" : "Create your account"}
      </button>

      <div className="pt-2 text-center text-sm text-slate-600">
        <span>{isLogin ? "New to CalcBuddy?" : "Already have an account?"}</span>{" "}
        <Link
          className="nav-link font-bold text-brand-700 underline underline-offset-2 hover:text-brand-800"
          href={isLogin ? "/signup" : "/login"}
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </div>
    </form>
  );
}

function VerificationNotice({ email, message }: { email: string; message?: string }) {
  return <section className="feedback mt-7 rounded-xl border border-brand-100 bg-brand-50 p-5" aria-live="polite">
    <div className="success-check" aria-hidden="true">✓</div>
    <h2 className="mt-4 text-lg font-bold text-slate-900">Check your email</h2>
    <p className="mt-2 text-sm leading-6 text-slate-700">{message} We sent it to <strong>{email}</strong>.</p>
    <ResendVerificationButton email={email} />
    <Link className="nav-link mt-5 inline-block text-sm font-semibold text-brand-700 underline" href="/login">Back to sign in</Link>
  </section>;
}

function ResendVerificationButton({ email }: { email: string }) {
  const [state, resendAction, pending] = useActionState(resendVerification, initialState);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const { showToast } = useToast();
  const lastSentMessage = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.sent && state.message && state.message !== lastSentMessage.current) {
      lastSentMessage.current = state.message;
      setSecondsRemaining(60);
      showToast(state.message, "success");
    }
    if (state.error) showToast(state.error, "error");
  }, [showToast, state.error, state.message, state.sent]);

  useEffect(() => {
    if (!secondsRemaining) return;
    const timer = window.setInterval(() => setSecondsRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsRemaining]);

  const coolingDown = secondsRemaining > 0;
  return <form action={resendAction} className="mt-5"><input type="hidden" name="email" value={email} /><button disabled={pending || coolingDown} className="ui-button min-h-11 rounded-lg border border-brand-600 bg-white px-4 text-sm font-semibold text-brand-700 disabled:opacity-60">{pending && <span className="spinner" aria-hidden="true" />}{pending ? "Sending…" : coolingDown ? `Resend available in ${secondsRemaining}s` : "Resend verification email"}</button>{state.error && <p role="alert" className="feedback mt-3 text-sm text-red-700">{state.error}</p>}</form>;
}
