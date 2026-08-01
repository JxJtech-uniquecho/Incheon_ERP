export const LOGIN_RETURN_TO_COOKIE = "inpharmy-login-return-to";
export const LOGIN_RETURN_TO_COOKIE_MAX_AGE = 10 * 60;

export function sanitizeLoginReturnTo(value: string | null | undefined, fallback = "/dashboard") {
  const rawValue = String(value ?? "");
  if (!rawValue) return fallback;

  try {
    const parsed = new URL(rawValue, "http://localhost");
    if (parsed.origin !== "http://localhost") return fallback;
    const path = `${parsed.pathname}${parsed.search}`;
    if (!path.startsWith("/") || path.startsWith("//")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

