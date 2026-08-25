import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { cn, formatDuration, formatMoney } from "@/lib/utils"
import type { ServiceCard } from "./types"

/**
 * Services, straight from the database — never hardcoded, because the admin
 * panel owns the price list.
 *
 * A vertical list of full-width rows: thumbnail, name, duration and price,
 * chevron. The whole row is the link, and tapping one opens the booking flow
 * with that service already chosen, on the add-ons step.
 */

/**
 * Thumbnail placeholders, stepping through the fade.
 *
 * `Service` has no image column, so there is nothing real to show here yet.
 * Per-service photos would need a `Service.imageUrl` field — a schema change,
 * so it is not assumed.
 */
const THUMB_TONES = ["bg-fade-1", "bg-fade-2", "bg-fade-3", "bg-fade-2", "bg-fade-1"] as const

export function ServicesSection({ services }: { services: ServiceCard[] }) {
  return (
    <section id="services" className="scroll-mt-20 bg-strip py-20 sm:py-24">
      <div className="mx-auto max-w-[880px] px-5 sm:px-7">
        <Reveal>
          <p className="data-label text-talc-deep">The price list</p>
          <h2 className="mt-3 max-w-[16ch]">pick your cut</h2>
          <p className="mt-4 max-w-[52ch] text-talc-deep">
            Prices are the same whoever&rsquo;s in the chair. Add a beard trim,
            lining or a shave at the next step.
          </p>
        </Reveal>

        {services.length === 0 ? (
          <Reveal>
            <p className="mt-10 rounded-lg bg-card p-6 text-talc-deep">
              The price list isn&rsquo;t showing right now. Call the shop and
              we&rsquo;ll tell you what you need — the number is at the bottom of
              this page.
            </p>
          </Reveal>
        ) : (
          <RevealGroup as="ul" className="mt-10 space-y-3">
            {services.map((service, i) => (
              <RevealItem as="li" key={service.id}>
                <Link
                  href={`/book?service=${service.id}`}
                  className="group flex items-center gap-4 rounded-xl bg-card p-3 pr-4 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(25,29,30,0.10)] sm:gap-5 sm:p-4 sm:pr-5"
                >
                  {/* Thumbnail slot — tonal until real photos exist. */}
                  <span
                    aria-hidden
                    className={cn(
                      "size-14 shrink-0 rounded-lg sm:size-16",
                      THUMB_TONES[i % THUMB_TONES.length],
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[19px] font-bold lowercase leading-tight tracking-[-0.015em] text-nape sm:text-[21px]">
                      {service.name}
                    </span>
                    <span className="mt-1.5 block font-mono text-[13px] tabular-nums text-talc-deep">
                      {formatDuration(service.durationMins)}
                      <span aria-hidden className="mx-2">
                        ·
                      </span>
                      <span className="font-medium text-nape">
                        {formatMoney(service.priceCents)}
                      </span>
                    </span>
                  </span>

                  <ChevronRight
                    aria-hidden
                    className="size-5 shrink-0 text-talc-deep transition-transform group-hover:translate-x-0.5 group-hover:text-barbicide-ink"
                  />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
