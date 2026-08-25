import { GuardRail } from "@/components/GuardRail"
import { AboutSection } from "@/components/home/AboutSection"
import { AddressSection } from "@/components/home/AddressSection"
import { CollageHero } from "@/components/home/CollageHero"
import { GallerySection } from "@/components/home/GallerySection"
import { ReviewsSection } from "@/components/home/ReviewsSection"
import { ServicesSection } from "@/components/home/ServicesSection"
import { db } from "@/lib/prisma"

// Services, hours, gallery and reviews are all live data — this page must
// never be frozen at build time.
export const dynamic = "force-dynamic"

/** The rail's bands, in document order. */
const RAIL_SECTIONS = [
  { id: "hero", label: "Top" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "address", label: "Address" },
]

export default async function Home() {
  const [services, settings, hours, photos, reviews] = await Promise.all([
    db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, priceCents: true, durationMins: true },
    }),
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.businessHours.findMany(),
    db.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, url: true, altText: true },
    }),
    db.publicReview.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, rating: true, authorName: true, comment: true, createdAt: true },
    }),
  ])

  return (
    <main id="main" className="flex-1 lg:pl-7">
      <GuardRail sections={RAIL_SECTIONS} />

      <CollageHero photos={photos} hours={hours} />

      <ServicesSection services={services} />

      <AboutSection
        hours={hours}
        cancelCutoffHours={settings?.cancelCutoffHours ?? 24}
        maxBookAheadDays={settings?.maxBookAheadDays ?? 30}
      />

      <GallerySection photos={photos} />

      <ReviewsSection reviews={reviews} />

      <AddressSection hours={hours} shopPhone={settings?.shopPhone ?? ""} />
    </main>
  )
}
