import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Services ───────────────────────────────────────────────────────────────
  // FJD prices in cents — adjust via the admin panel later
  const serviceCount = await prisma.service.count()
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        { name: "Adult",          priceCents: 2000, durationMins: 30, sortOrder: 0 },
        { name: "Senior Student", priceCents: 1500, durationMins: 30, sortOrder: 1 },
        { name: "Jnr Student",    priceCents: 1200, durationMins: 25, sortOrder: 2 },
        { name: "Kids",           priceCents: 1000, durationMins: 20, sortOrder: 3 },
      ],
    })
    console.log("✓ Services seeded")
  } else {
    console.log("– Services already present, skipping")
  }

  // ── Addons ─────────────────────────────────────────────────────────────────
  const addonCount = await prisma.addon.count()
  if (addonCount === 0) {
    await prisma.addon.createMany({
      data: [
        { name: "Beard Trim",  priceCents: 500, extraDurationMins: 10, sortOrder: 0 },
        { name: "Lining",      priceCents: 300, extraDurationMins:  5, sortOrder: 1 },
        { name: "Clean Shave", priceCents: 800, extraDurationMins: 15, sortOrder: 2 },
      ],
    })
    console.log("✓ Addons seeded")
  } else {
    console.log("– Addons already present, skipping")
  }

  // ── Business hours: Mon–Sat open 09:00–18:00, Sunday closed ───────────────
  // 0 = Sunday, 1 = Monday … 6 = Saturday
  const hoursCount = await prisma.businessHours.count()
  if (hoursCount === 0) {
    await prisma.businessHours.createMany({
      data: [
        { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "18:00" },
        { dayOfWeek: 1, isOpen: true,  openTime: "09:00", closeTime: "18:00" },
        { dayOfWeek: 2, isOpen: true,  openTime: "09:00", closeTime: "18:00" },
        { dayOfWeek: 3, isOpen: true,  openTime: "09:00", closeTime: "18:00" },
        { dayOfWeek: 4, isOpen: true,  openTime: "09:00", closeTime: "18:00" },
        { dayOfWeek: 5, isOpen: true,  openTime: "09:00", closeTime: "18:00" },
        { dayOfWeek: 6, isOpen: true,  openTime: "09:00", closeTime: "18:00" },
      ],
    })
    console.log("✓ Business hours seeded")
  } else {
    console.log("– Business hours already present, skipping")
  }

  // ── Settings singleton ─────────────────────────────────────────────────────
  await prisma.settings.upsert({
    where:  { id: "singleton" },
    update: {},
    create: {
      id:                "singleton",
      shopName:          "Barbershop",
      shopPhone:         "",
      shopEmail:         "",
      slotIntervalMins:  15,
      bufferMins:        0,
      minLeadTimeHours:  2,
      maxBookAheadDays:  30,
      cancelCutoffHours: 24,
    },
  })
  console.log("✓ Settings singleton upserted")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
