import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { prisma } from "./db.js";
import { createHmac } from "node:crypto";

const SESSION_COOKIE = "viotrack_session";
const CSRF_COOKIE = "viotrack_csrf";
const SESSION_TTL_MS = 30 * 60 * 1000;
const MFA_COOKIE = "viotrack_mfa_challenge";
const MFA_TTL_MS = 5 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";
const sameSite: CookieOptions["sameSite"] = isProduction ? "none" : "lax";
// Perform a bcrypt comparison even when the email is unknown so an attacker
// cannot distinguish existing accounts by measuring login response time.
const dummyPasswordHash = bcrypt.hash(randomBytes(32).toString("hex"), 12);

export type SessionUser = {
  id: bigint;
  email: string;
  name: string;
  role: "admin" | "teacher";
  position: string;
  department?: string;
  phone?: string;
  avatar?: string | null;
  adviserSection?: { grade: string; section: string } | null;
};

export type AuthResult = { user: SessionUser; token: string; requiresTwoFactor: boolean };

const defaultFrontendOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "capacitor://localhost",
  "https://localhost",
];

export const isAllowedFrontendOrigin = (origin: string) => {
  const vercelOrigins = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .filter((host): host is string => Boolean(host))
    .map((host) => {
      try {
        return new URL(host.includes("://") ? host : `https://${host}`).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  const allowedOrigins = [
    ...defaultFrontendOrigins,
    ...vercelOrigins,
    ...(process.env.FRONTEND_ORIGINS ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ];
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV === "production") return false;

  try {
    const parsed = new URL(origin);
    return parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  } catch {
    return false;
  }
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const cookieOptions = (maxAge?: number): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite,
  path: "/",
  ...(maxAge === undefined ? {} : { maxAge }),
});

export const setSessionCookie = (
  res: Response,
  token: string,
  rememberMe = false,
) => {
  res.cookie(
    SESSION_COOKIE,
    token,
    cookieOptions(rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined),
  );
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions(0));
};

export const setCsrfCookie = (res: Response, token: string) => {
  res.cookie(CSRF_COOKIE, token, {
    ...cookieOptions(SESSION_TTL_MS),
    httpOnly: false,
  });
};

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get("x-csrf-token");
  const origin = req.get("origin");

  if (
    origin &&
    !isAllowedFrontendOrigin(origin)
  ) {
    res.status(403).json({ error: "Request origin is not allowed." });
    return;
  }

  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length !== headerToken.length ||
    !timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    res.status(403).json({ error: "CSRF token is missing or invalid." });
    return;
  }

  next();
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const tokenHash = hashToken(token);
    const session = await prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      clearSessionCookie(res);
      res.status(401).json({ error: "Session expired. Please sign in again." });
      return;
    }

    const account =
      session.role === "admin"
        ? await prisma.admin.findUnique({ where: { id: session.userId } })
        : await prisma.teacher.findUnique({
            where: { id: session.userId },
            include: { advisers: true },
          });
    if (!account) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Session account no longer exists." });
      return;
    }
    const adviser =
      session.role === "teacher" && account && "advisers" in account
        ? account.advisers[0]
        : null;
    req.user = {
      id: account.id,
      email: account.email,
      name: `${account.fname} ${account.lname}`.trim(),
      role: session.role as SessionUser["role"],
      position: account.position,
      ...(session.role === "teacher"
        ? { department: "department" in account ? String(account.department) : "", phone: account.contact }
        : {}),
      avatar: account.image,
      adviserSection: adviser
        ? { grade: adviser.gradeLevel, section: adviser.classSection }
        : null,
    };
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Administrator access required." });
    return;
  }
  next();
};

export const safeUser = (user: SessionUser) => ({
  id: Number(user.id),
  email: user.email,
  name: user.name,
  role: user.role,
  position: user.position,
  ...(user.department ? { department: user.department } : {}),
  ...(user.phone ? { phone: user.phone } : {}),
  avatar: user.avatar ?? null,
  adviserSection: user.adviserSection ?? null,
});

export const authenticate = async (
  email: string,
  password: string,
): Promise<AuthResult | null> => {
  const normalizedEmail = email.trim().toLowerCase();
  const [admin, teacher] = await Promise.all([
    prisma.admin.findUnique({ where: { email: normalizedEmail } }),
    prisma.teacher.findUnique({
      where: { email: normalizedEmail },
      include: { advisers: true },
    }),
  ]);
  const account = admin ?? teacher;
  const role = admin ? "admin" : teacher ? "teacher" : null;
  const passwordMatches = await bcrypt.compare(
    password,
    account?.password ?? await dummyPasswordHash,
  );
  if (!account || !role || !passwordMatches) {
    return null;
  }

  const adviser =
    role === "teacher" && teacher?.advisers.length
      ? teacher.advisers[0]
      : null;
  const user: SessionUser = {
    id: account.id,
    email: account.email,
    name: `${account.fname} ${account.lname}`.trim(),
    role,
    position: account.position,
    ...(role === "teacher" && teacher
      ? { department: teacher.department, phone: teacher.contact }
      : {}),
    avatar: account.image,
    adviserSection: adviser
      ? { grade: adviser.gradeLevel, section: adviser.classSection }
      : null,
  };

  if (account.twoFactorEnabled && account.twoFactorSecret) {
    return { user, token: "", requiresTwoFactor: true };
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      role,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return { user, token, requiresTwoFactor: false };
};

export const createSessionForUser = async (user: SessionUser) => {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId: user.id, role: user.role, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  return token;
};

export const verifyPassword = (plainText: string, hash: string) =>
  bcrypt.compare(plainText, hash);

export const hashPassword = (plainText: string) =>
  bcrypt.hash(plainText, 12);

export const getSessionCookieName = () => SESSION_COOKIE;

const challengeSecret = () => process.env.TWO_FACTOR_CHALLENGE_SECRET || process.env.SESSION_SECRET || "viotrack-development-challenge-key";
const signChallenge = (payload: string) => createHmac("sha256", challengeSecret()).update(payload).digest("base64url");

export const setMfaChallengeCookie = (res: Response, user: SessionUser, rememberMe: boolean) => {
  const payload = Buffer.from(JSON.stringify({ id: user.id.toString(), role: user.role, rememberMe, exp: Date.now() + MFA_TTL_MS })).toString("base64url");
  res.cookie(MFA_COOKIE, `${payload}.${signChallenge(payload)}`, { ...cookieOptions(MFA_TTL_MS), httpOnly: true });
};

export const readMfaChallenge = (req: Request) => {
  const value = req.cookies?.[MFA_COOKIE];
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || signChallenge(payload) !== signature) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { id: string; role: SessionUser["role"]; rememberMe: boolean; exp: number };
    if (parsed.exp <= Date.now() || !/^\d+$/.test(parsed.id) || !["admin", "teacher"].includes(parsed.role)) return null;
    return parsed;
  } catch { return null; }
};

export const clearMfaChallengeCookie = (res: Response) => res.clearCookie(MFA_COOKIE, cookieOptions(0));
