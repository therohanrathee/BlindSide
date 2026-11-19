import crypto from "crypto";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "bs_admin_session";

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || "blindside_admin_secure_secret_default_key";
}

function getExpectedPassword(): string {
  return process.env.ADMIN_PASSWORD || "Zipline@007";
}

/**
 * Generate a signed session token containing timestamp and HMAC signature.
 */
export function createAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const secret = getSecretKey();
  const password = getExpectedPassword();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}:${password}`)
    .digest("hex");

  return `${timestamp}.${signature}`;
}

/**
 * Verify session token validity and expiration (7 days).
 */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Expire after 7 days
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_AGE_MS || timestamp > Date.now() + 60000) {
    return false;
  }

  const secret = getSecretKey();
  const password = getExpectedPassword();
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${timestampStr}:${password}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

/**
 * Verify request has admin credentials via cookies or Authorization header.
 */
export async function verifyAdminRequest(request?: NextRequest): Promise<boolean> {
  // Check header first (if passed via Bearer token)
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (verifyAdminSessionToken(token)) return true;
    }
  }

  // Check cookie store
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}
