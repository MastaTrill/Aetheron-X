import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "aetherx_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const REMEMBER_ME_TTL_SECONDS = 60 * 60 * 24 * 7;

export type UserRole = "admin" | "member";

type SessionPayload = {
  email: string;
  role: UserRole;
  exp: number;
};

export type AuthSession = SessionPayload;

const DEFAULT_EMAIL = "admin@aetherx.local";
const DEFAULT_PASSWORD = "aetherx-dev-password";

export function getConfiguredCredentials() {
  return {
    email: process.env.AETHERX_ADMIN_EMAIL ?? DEFAULT_EMAIL,
    password: process.env.AETHERX_ADMIN_PASSWORD ?? DEFAULT_PASSWORD,
  };
}

function getSessionSecret() {
  return process.env.AETHERX_SESSION_SECRET ?? "change-me-for-production";
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createSessionToken(
  email: string,
  role: UserRole = "member",
  rememberMe = false,
) {
  const ttl = rememberMe ? REMEMBER_ME_TTL_SECONDS : SESSION_TTL_SECONDS;

  const payload: SessionPayload = {
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + ttl,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null): AuthSession | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieConfig(rememberMe = false) {
  const ttl = rememberMe ? REMEMBER_ME_TTL_SECONDS : SESSION_TTL_SECONDS;

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttl,
  };
}

export function hasRole(session: AuthSession | null, role: UserRole) {
  if (!session) {
    return false;
  }

  if (role === "member") {
    return session.role === "member" || session.role === "admin";
  }

  return session.role === "admin";
}
