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

  return <form action={formAction} className="mt-7 space-y-5" noValidate>
    <label className="block text-sm font-medium">Email address
      <input name="email" type="email" autoComplete="email" required className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3" placeholder="you@business.com" />
    </label>
    <label className="block text-sm font-medium">Password
      <input name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={8} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3" placeholder="At least 8 characters" />
    </label>
    {state.error && <p role="alert" className="feedback rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <button disabled={pending} className="ui-button h-12 w-full rounded-xl bg-brand-600 font-semibold text-white disabled:opacity-60">
      {pending && <span className="spinner" aria-hidden="true" />}{pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
    </button>
    <p className="text-center text-sm text-slate-600">{isLogin ? "New to CalcBuddy?" : "Already have an account?"} <Link className="nav-link font-semibold text-brand-700 underline" href={isLogin ? "/signup" : "/login"}>{isLogin ? "Create an account" : "Sign in"}</Link></p>
  </form>;
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
