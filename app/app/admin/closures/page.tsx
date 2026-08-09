import { db } from "@/lib/prisma"
import { ClosureManager } from "./ClosureManager"

export default async function ClosuresPage() {
  const closures = await db.closure.findMany({
    where:   { endsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  })
  return <ClosureManager closures={closures} />
}
