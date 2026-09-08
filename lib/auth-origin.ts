import { headers } from "next/headers";

/** Returns the origin that submitted the auth form, with no environment-specific hardcoding. */
export async function getApplicationOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (!origin) {
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0] ?? "https";
    if (!host) throw new Error("Unable to determine the application origin.");
    return new URL("/", `${protocol}://${host}`).origin;
  }

  const parsedOrigin = new URL(origin);
  if (parsedOrigin.protocol !== "http:" && parsedOrigin.protocol !== "https:") {
    throw new Error("The application origin must use HTTP or HTTPS.");
  }
  return parsedOrigin.origin;
}
