import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";

export const SESSION_MAX_AGE_SECONDS = 30 * 60;

export type LoginFailureReason = "invalid" | "pending";

export function getSessionCookieName() {
  return `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production"
  };
}

export class LoginFailure extends Error {
  reason: LoginFailureReason;

  constructor(reason: LoginFailureReason) {
    super(reason);
    this.reason = reason;
  }
}

export async function validateLogin(loginIdValue: unknown, passwordValue: unknown) {
  const loginId = String(loginIdValue ?? "").trim();
  const password = String(passwordValue ?? "");
  if (!loginId || !password) throw new LoginFailure("invalid");

  const user = await prisma.user.findUnique({
    where: { loginId },
    include: { branch: { select: { id: true, name: true } } }
  });

  if (!user?.passwordHash || user.deletedAt) throw new LoginFailure("invalid");
  if (user.accountStatus === "pending") throw new LoginFailure("pending");

  const now = new Date();
  if (user.accountStatus !== "approved" || (user.lockedUntil && user.lockedUntil > now)) {
    throw new LoginFailure("invalid");
  }

  const passwordOk = await compare(password, user.passwordHash);
  if (!passwordOk) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: { increment: 1 } }
    });
    throw new LoginFailure("invalid");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: now,
      lastActivityAt: now
    }
  });

  return user;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 5 * 60
  },
  cookies: {
    sessionToken: {
      name: getSessionCookieName(),
      options: getSessionCookieOptions()
    }
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "ERP Credentials",
      credentials: {
        loginId: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await validateLogin(credentials?.loginId, credentials?.password);
        return { id: user.id, email: user.email, name: user.name, role: user.role, accountStatus: user.accountStatus, loginId: user.loginId };
      }
    }),
    {
      id: "internal-disabled",
      name: "Disabled",
      type: "oauth",
      version: "2.0",
      checks: ["state"],
      authorization: "http://127.0.0.1/oauth-disabled",
      token: "http://127.0.0.1/oauth-disabled",
      userinfo: "http://127.0.0.1/oauth-disabled",
      clientId: "disabled",
      clientSecret: "disabled",
      profile() {
        return { id: "disabled" };
      }
    }
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.accountStatus = user.accountStatus;
        session.user.loginId = user.loginId;
        session.user.branchId = user.branchId;
      }
      return session;
    }
  }
};
