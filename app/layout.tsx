import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = { title: "CalcBuddy | Simple business tools", description: "Simple tools for everyday business." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeProvider><ToastProvider>{children}</ToastProvider></ThemeProvider></body></html>;
}
