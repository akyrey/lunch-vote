import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ALLOWED_EMAIL_DOMAIN, ADMIN_EMAILS } from "@/lib/config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      authorization: {
        params: {
          hd: ALLOWED_EMAIL_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? "";
      if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user && user) {
        const [dbUser] = await db
          .select({ isAdmin: users.isAdmin })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        session.user.id = user.id;
        session.user.isAdmin = dbUser?.isAdmin ?? false;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        await db
          .update(users)
          .set({ isAdmin: true })
          .where(eq(users.id, user.id!));
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }
}
