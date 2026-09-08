import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "CalcBuddy | Smart cash management",
  description: "Smart cash and business management for every business.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider></body></html>;
}
