import "server-only";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { isAllowedYasEmail, isConfiguredAdmin, normalizedAllowedDomain } from "@/lib/env";

function googleClientId() {
  return process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";
}

function googleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId(),
      clientSecret: googleClientSecret(),
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          hd: normalizedAllowedDomain()
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = (user.email ?? (profile as { email?: string } | undefined)?.email)?.trim().toLowerCase();
      const emailVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified;

      if (!isAllowedYasEmail(email)) return false;
      if (emailVerified === false) return false;

      const existingUser = email
        ? await prisma.user.findUnique({
            where: { email },
            select: { id: true, isBlocked: true, role: true }
          })
        : null;

      if (existingUser?.isBlocked) return false;

      if (existingUser && isConfiguredAdmin(email) && existingUser.role !== "ADMIN") {
        await prisma.user.update({ where: { id: existingUser.id }, data: { role: "ADMIN" } });
      }

      return true;
    },
    async session({ session, user }) {
      if (!session.user?.email) return session;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, name: true, role: true, isBlocked: true }
      });

      if (!dbUser) return session;

      session.user.id = dbUser.id;
      session.user.email = dbUser.email;
      session.user.name = dbUser.name;
      session.user.role = dbUser.role;
      session.user.isBlocked = dbUser.isBlocked;

      return session;
    }
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const email = user.email.toLowerCase();
      if (isConfiguredAdmin(email)) {
        await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      }
    }
  },
  logger: {
    error(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[next-auth:error]", code, metadata);
      }
    }
  }
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export const authProviderStatus = {
  hasGoogleCredentials: Boolean(googleClientId() && googleClientSecret())
};

export type AuthSession = Awaited<ReturnType<typeof getAuthSession>>;
