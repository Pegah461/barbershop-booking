import Image from "next/image"

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { openDaysSummary, type HoursRow } from "@/lib/hours"

/**
 * About the shop.
 *
 * Deliberately about the place and the work, not about a named barber — the
 * schema is single-chair and there is no bio on file yet. Drop the real name
 * and a couple of lines into `intro` below when you have them.
 */
export function AboutSection({
  hours,
  cancelCutoffHours,
  maxBookAheadDays,
}: {
  hours: HoursRow[]
  cancelCutoffHours: number
  maxBookAheadDays: number
}) {
  const openDays = openDaysSummary(hours)

  const facts = [
    { label: "Open", value: openDays },
    { label: "Book up to", value: `${maxBookAheadDays} days ahead` },
    { label: "Free changes", value: `${cancelCutoffHours} hrs before` },
  ]

  return (
    <section id="about" className="scroll-mt-20 bg-card py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1140px] gap-12 px-5 sm:px-7 lg:grid-cols-[1fr_1fr] lg:items-center">
        <Reveal as="figure" className="relative aspect-[4/5] overflow-hidden rounded-xl">
          <Image
            src="/barbershop.jpg"
            alt="Inside the shop, looking towards the chair"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="data-label text-talc-deep">About</p>
            <h2 className="mt-3 max-w-[14ch]">one chair, no fuss</h2>

            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-nape/80">
              <p>
                We&rsquo;re a walk-in shop in Honiara Town. Most days you can
                take a seat and wait your turn — it&rsquo;s rarely long. If
                you&rsquo;d rather not stand around, book a time and the chair
                is held for you.
              </p>
              <p>
                Fades and lining are what we do most: skin fades, taper, low and
                mid, plus beard work and a proper clean shave. Kids are welcome
                and we&rsquo;re used to first haircuts.
              </p>
              <p>
                Cash on the day. Bring a photo if you have one in mind —
                it&rsquo;s easier than describing it.
              </p>
            </div>
          </Reveal>

          <RevealGroup as="dl" className="mt-8 grid grid-cols-3 gap-4">
            {facts.map((fact) => (
              <RevealItem key={fact.label}>
                <dt className="data-label text-talc-deep">{fact.label}</dt>
                <dd className="mt-2 font-display text-[19px] font-bold lowercase leading-tight text-nape">
                  {fact.value}
                </dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
