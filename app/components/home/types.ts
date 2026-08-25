export type GalleryPhoto = {
  id: string
  /** Absolute URL (Cloudinary) or a path under /public. */
  url: string
  altText: string | null
}

export type ServiceCard = {
  id: string
  name: string
  priceCents: number
  durationMins: number
}
