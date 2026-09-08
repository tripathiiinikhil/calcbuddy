"use client";

export default function GlobalError() {
  return <html lang="en"><body><main style={{ maxWidth: 520, margin: "10vh auto", padding: 24, fontFamily: "Arial, sans-serif" }}><h1>CalcBuddy could not load</h1><p>Please refresh the page. If this continues, verify the Supabase configuration in <code>.env.local</code>.</p></main></body></html>;
}
