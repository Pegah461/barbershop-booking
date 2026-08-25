"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { transition } from "@/lib/motion"
import type { GalleryPhoto } from "./types"

/**
 * The gallery, with a lightbox.
 *
 * Images come from the `GalleryImage` table and may be local (/public) or
 * remote (Cloudinary — see `images.remotePatterns` in next.config.ts). Nothing
 * here assumes a host: give the row a URL and it renders.
 *
 * With no rows the section renders a small honest note rather than a wall of
 * empty frames.
 */
export function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? null : (current + delta + photos.length) % photos.length,
      ),
    [photos.length],
  )

  // Keyboard control for the lightbox: Escape closes, arrows move.
  useEffect(() => {
    if (openIndex === null) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close()
      if (event.key === "ArrowRight") step(1)
      if (event.key === "ArrowLeft") step(-1)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [openIndex, close, step])

  const active = openIndex === null ? null : photos[openIndex]

  return (
    <section id="gallery" className="scroll-mt-20 bg-strip py-20 sm:py-24">
      <div className="mx-auto max-w-[1140px] px-5 sm:px-7">
        <Reveal>
          <p className="data-label text-talc-deep">The work</p>
          <h2 className="mt-3 max-w-[16ch]">recent cuts</h2>
        </Reveal>

        {photos.length === 0 ? (
          <Reveal>
            <div className="mt-10 rounded-lg bg-card p-8">
              <p className="text-talc-deep">
                No photos up yet. Come past the shop, or check Facebook and
                TikTok for recent work.
              </p>
            </div>
          </Reveal>
        ) : (
          <RevealGroup
            as="ul"
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {photos.map((photo, i) => (
              <RevealItem as="li" key={photo.id}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-fade-2"
                >
                  <Image
                    src={photo.url}
                    alt={photo.altText ?? ""}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <span className="sr-only">
                    {photo.altText
                      ? `View larger: ${photo.altText}`
                      : `View photo ${i + 1} of ${photos.length}`}
                  </span>
                </button>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>

      {/* — lightbox — */}
      <AnimatePresence>
        {active && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-nape/95 p-4"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              transition={transition}
              className="relative h-[80vh] w-full max-w-[900px]"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={active.url}
                alt={active.altText ?? ""}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className="rounded-lg object-contain"
              />
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="Close photo viewer"
              className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-md bg-strip/10 text-strip hover:bg-strip/20"
            >
              <X className="size-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    step(-1)
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 flex size-11 items-center justify-center rounded-md bg-strip/10 text-strip hover:bg-strip/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    step(1)
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 flex size-11 items-center justify-center rounded-md bg-strip/10 text-strip hover:bg-strip/20"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
