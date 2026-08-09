import { db } from "@/lib/prisma"
import { AddonManager } from "./AddonManager"

export default async function AddonsPage() {
  const addons = await db.addon.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
  return <AddonManager addons={addons} />
}
