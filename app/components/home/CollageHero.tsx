import Image from "next/image"
import Link from "next/link"

import { RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { openDaysSummary, type HoursRow } from "@/lib/hours"
import { cn } from "@/lib/utils"
import type { GalleryPhoto } from "./types"

/**
 * The fold: four cuts in a collage, the shop's thesis over the top of them.
 *
 * The collage is the first thing a visitor sees because the work is the only
 * argument that matters here — a fade either looks right or it doesn't. Until
 * photos exist the tiles render as tonal blocks stepping through the fade,
 * which reads as a deliberate graphic rather than as broken images.
 */

/** Tile geometry. The first tile is the big one. */
const TILE_CLASSES = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
] as const

/** Tonal placeholders, stepping through the fade. */
const PLACEHOLDER_TONES = ["bg-fade-1", "bg-fade-2", "bg-fade-3", "bg-fade-2"] as const

export function CollageHero({
  photos,
  hours,
}: {
  photos: GalleryPhoto[]
  hours: HoursRow[]
}) {
  const tiles = photos.slice(0, 4)
  const openDays = openDaysSummary(hours)

  return (
    <section id="hero" className="on-dark relative isolate bg-nape text-strip">
      {/* — the collage — */}
      <div className="grid h-[62vh] min-h-[420px] grid-cols-4 grid-rows-2 gap-1 sm:h-[78vh] sm:max-h-[760px]">
        {TILE_CLASSES.map((tileClass, i) => {
          const photo = tiles[i]

          return (
            <div
              key={photo?.id ?? `placeholder-${i}`}
              className={cn(
                "relative overflow-hidden",
                tileClass,
                !photo && PLACEHOLDER_TONES[i],
              )}
            >
              {photo ? (
                <Image
                  src={photo.url}
                  alt={photo.altText ?? ""}
                  fill
                  // The big tile is half the viewport; the rest are quarters.
                  sizes={i === 0 ? "(max-width: 640px) 50vw, 50vw" : "(max-width: 640px) 25vw, 25vw"}
                  priority={i === 0}
                  className="object-cover"
                />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* — the thesis, laid over the collage — */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nape via-nape/70 to-nape/10" />

      <RevealGroup className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-10 sm:px-7 sm:pb-14 lg:pl-14">
        <div className="mx-auto max-w-[1140px]">
          <RevealItem as="p" className="data-label text-barbicide">
            Honiara Town · {openDays}
          </RevealItem>

          <RevealItem>
            <h1 className="mt-4 max-w-[13ch] text-strip">
              walk in.
              <br />
              or skip the wait.
            </h1>
          </RevealItem>

          <RevealItem
            as="p"
            className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-talc"
          >
            Fades, lining and beards. Take a chair when you get here, or book a
            time and it&rsquo;s held for you.
          </RevealItem>

          <RevealItem className="pointer-events-auto mt-7">
            <Link
              href="/book"
              className="inline-block rounded-md bg-barbicide px-6 py-4 font-display text-[17px] font-bold lowercase tracking-[-0.01em] text-nape transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              book appointment
            </Link>
          </RevealItem>
        </div>
      </RevealGroup>
    </section>
  )
}
