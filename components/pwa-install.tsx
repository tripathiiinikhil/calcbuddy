"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextValue {
  isInstalled: boolean;
  isIos: boolean;
  canInstallNative: boolean;
  triggerInstall: () => Promise<void>;
  showIosModal: boolean;
  setShowIosModal: (show: boolean) => void;
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextValue>({
  isInstalled: false,
  isIos: false,
  canInstallNative: false,
  triggerInstall: async () => {},
  showIosModal: false,
  setShowIosModal: () => {},
  showHelpModal: false,
  setShowHelpModal: () => {},
});

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosModal, setShowIosModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => console.warn("PWA Service Worker registration failed:", err));
      });
    }

    // Check if running in standalone mode (already installed)
    const checkIsInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(Boolean(isStandalone));
    };

    checkIsInstalled();
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", checkIsInstalled);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", checkIsInstalled);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("Install prompt error:", err);
      }
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      setShowHelpModal(true);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        isIos,
        canInstallNative: Boolean(deferredPrompt),
        triggerInstall,
        showIosModal,
        setShowIosModal,
        showHelpModal,
        setShowHelpModal,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwaInstall() {
  return useContext(PwaContext);
}

export function PwaInstallRow() {
  const {
    isInstalled,
    isIos,
    canInstallNative,
    triggerInstall,
    showIosModal,
    setShowIosModal,
    showHelpModal,
    setShowHelpModal,
  } = usePwaInstall();

  return (
    <>
      <div className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl text-brand-700"
          >
            {isInstalled ? "✓" : "📱"}
          </span>
          <div className="min-w-0 flex-1">
            <span className="block font-bold text-slate-900">Install CalcBuddy</span>
            <span className="mt-0.5 block truncate text-sm text-slate-600">
              {isInstalled
                ? "CalcBuddy is installed on this device"
                : isIos
                ? "Add to Home Screen on your iPhone/iPad"
                : canInstallNative
                ? "Install app for quick home screen access"
                : "Add to home screen for fast access"}
            </span>
          </div>
        </div>

        <div>
          {isInstalled ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <span>✓</span> Installed
            </span>
          ) : (
            <button
              type="button"
              onClick={triggerInstall}
              className="ui-button min-h-10 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-600 shadow-xs"
            >
              Install
            </button>
          )}
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📱</span> Install on iPhone / iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Install CalcBuddy on your iOS device in Safari without using the App Store:
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white border border-slate-200 text-sm font-bold text-brand-700">
                  1
                </span>
                <div className="text-xs text-slate-700 leading-snug">
                  Tap the <strong className="text-slate-900">Share</strong> button at the bottom of Safari (<span className="font-mono">⎋</span> or square with up arrow).
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white border border-slate-200 text-sm font-bold text-brand-700">
                  2
                </span>
                <div className="text-xs text-slate-700 leading-snug">
                  Scroll down the menu and tap <strong className="text-slate-900">&quot;Add to Home Screen&quot;</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white border border-slate-200 text-sm font-bold text-brand-700">
                  3
                </span>
                <div className="text-xs text-slate-700 leading-snug">
                  Tap <strong className="text-slate-900">&quot;Add&quot;</strong> in the top right corner.
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="w-full rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white hover:bg-brand-600 shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Instructions Modal for other browsers */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📱</span> Install CalcBuddy
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              To install CalcBuddy on your home screen or desktop:
            </p>

            <ul className="mt-3 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>In <strong className="text-slate-900">Chrome/Edge</strong>: click the install icon in the address bar (or menu ⋮ → &quot;Install CalcBuddy&quot;).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>In <strong className="text-slate-900">Safari</strong>: tap Share → &quot;Add to Home Screen&quot;.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">•</span>
                <span>You can also bookmark this URL for quick access anytime.</span>
              </li>
            </ul>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white hover:bg-brand-600 shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
