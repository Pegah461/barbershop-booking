/**
 * Add one photo to the homepage gallery.
 *
 * Usage:
 *   npx tsx scripts/add-gallery-image.ts "<image-url>" ["<alt text>"] [sortOrder]
 *   npm run gallery:add -- "<image-url>" "<alt text>" [sortOrder]
 *
 * `url` is anything next/image is allowed to load — a Cloudinary Secure URL,
 * or a path under /public. `sortOrder` controls display order (ascending);
 * omit it to append after whatever already has the highest value.
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

async function main() {
  const [url, altText, sortOrderArg] = process.argv.slice(2)

  if (!url) {
    console.error("Usage: npx tsx scripts/add-gallery-image.ts \"<image-url>\" [\"<alt text>\"] [sortOrder]")
    process.exit(1)
  }

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

  try {
    let sortOrder: number
    if (sortOrderArg !== undefined) {
      sortOrder = Number(sortOrderArg)
      if (!Number.isFinite(sortOrder)) {
        console.error(`sortOrder must be a number, got "${sortOrderArg}"`)
        process.exit(1)
      }
    } else {
      const last = await db.galleryImage.findFirst({ orderBy: { sortOrder: "desc" } })
      sortOrder = (last?.sortOrder ?? -10) + 10
    }

    const image = await db.galleryImage.create({
      data: { url, altText: altText || null, sortOrder },
    })

    console.log("Added gallery image:")
    console.log(image)
  } finally {
    await db.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
