"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: ToastTone; dismissing?: boolean };
type ToastContextValue = { showToast: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }].slice(-3));
    window.setTimeout(() => {
      setToasts((current) => current.map((toast) => toast.id === id ? { ...toast, dismissing: true } : toast));
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 180);
    }, 4000);
  }, []);

  return <ToastContext.Provider value={{ showToast }}>{children}<div className="toast-region" aria-live="polite" aria-relevant="additions">{toasts.map((toast) => <div className={`toast toast-${toast.tone}${toast.dismissing ? " toast-leaving" : ""}`} key={toast.id} role="status"><span aria-hidden="true">{toast.tone === "success" ? "✓" : toast.tone === "error" ? "!" : "i"}</span><p>{toast.message}</p></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
