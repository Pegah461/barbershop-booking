import { db } from "@/lib/prisma"
import { ServiceManager } from "./ServiceManager"

export default async function ServicesPage() {
  const services = await db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
  return <ServiceManager services={services} />
}
