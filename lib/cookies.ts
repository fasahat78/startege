/**
 * Cookie utilities for client-side
 */

export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
) {
  const {
    maxAge = 60 * 60 * 24 * 7, // 7 days default
    path = "/",
    domain,
    secure = process.env.NODE_ENV === "production",
    sameSite = "lax",
  } = options;

  // Calculate expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + maxAge * 1000);

  const cookieString = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    `path=${path}`,
    domain && `domain=${domain}`,
    secure && "secure",
    `sameSite=${sameSite}`,
  ]
    .filter(Boolean)
    .join("; ");

  document.cookie = cookieString;
  console.log("[COOKIE] Set cookie:", name, "expires:", expires.toUTCString());
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

export function deleteCookie(name: string, path = "/") {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

