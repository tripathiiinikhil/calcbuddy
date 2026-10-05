"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { resendVerification, signIn, signUp, type FormState } from "@/app/auth/actions";
import { useToast } from "@/components/toast-provider";
import { createClient } from "@/lib/supabase/client";

const initialState: FormState = {};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isLogin = mode === "login";
  const { showToast } = useToast();
  const lastNotice = useRef<string | undefined>(undefined);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    const notice = state.error ?? state.message;
    if (notice && notice !== lastNotice.current) {
      showToast(notice, state.error ? "error" : "success");
      lastNotice.current = notice;
    }
  }, [showToast, state.error, state.message]);

  if (!isLogin && state.sent && state.email) return <VerificationNotice email={state.email} message={state.message} />;

  const signInWithGoogle = async () => {
    setGooglePending(true);
    try {
      const redirectTo = new URL("/auth/callback?next=/onboarding", window.location.origin).toString();
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        showToast("Google sign-in could not be started. Please try again.", "error");
        setGooglePending(false);
      }
    } catch {
      showToast("Google sign-in could not be started. Please try again.", "error");
      setGooglePending(false);
    }
  };

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
        disabled={pending || googlePending}
        className="ui-button mt-2 h-12 w-full rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
      >
        {pending && <span className="spinner" aria-hidden="true" />}
        {pending ? "Please wait…" : isLogin ? "Sign in to CalcBuddy" : "Create your account"}
      </button>

      <div className="flex items-center gap-3 pt-1" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending || googlePending}
        className="ui-button h-12 w-full rounded-full bg-[#4285F4] px-4 font-bold text-white shadow-sm transition-all hover:bg-[#357ae8] disabled:opacity-60"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white" aria-hidden="true">
          <GoogleMark />
        </span>
        {googlePending ? "Connecting to Google…" : "Continue with Google"}
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

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.909c1.702-1.567 2.683-3.874 2.683-6.614Z" />
      <path fill="#4285F4" d="M9 18c2.43 0 4.467-.806 5.957-2.181l-2.909-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.037-3.71H.956v2.331A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.71A5.41 5.41 0 0 1 3.681 9c0-.593.102-1.17.282-1.71V4.959H.956A9 9 0 0 0 0 9c0 1.452.348 2.827.956 4.041l3.007-2.331Z" />
      <path fill="#34A853" d="M9 3.58c1.322 0 2.507.454 3.44 1.345l2.581-2.58C13.463.891 11.426 0 9 0A9 9 0 0 0 .956 4.959l3.007 2.331C4.672 5.164 6.656 3.58 9 3.58Z" />
    </svg>
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
