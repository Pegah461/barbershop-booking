import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/prisma"

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Prisma v7 generated client is structurally compatible; cast required for types
  adapter: PrismaAdapter(db as any),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      // role is returned by the Prisma adapter alongside the standard fields
      session.user.role = (user as any).role ?? "CUSTOMER"
      return session
    },
  },
  events: {
    // Fires after the user row exists in the DB — safe to update role
    async signIn({ user }) {
      if (!user.id || !user.email) return
      if (adminEmails().includes(user.email)) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        })
      }
    },
  },
})
