import { auth } from "@/lib/auth"

/** Call at the top of every admin Server Action to ensure only admins proceed. */
export async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}
