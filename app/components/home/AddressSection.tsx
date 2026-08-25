import { MapPin, Phone } from "lucide-react"

import { Reveal } from "@/components/motion/Reveal"
import { weekRows, type HoursRow } from "@/lib/hours"
import { SHOP } from "@/lib/shop"

/**
 * Where the shop is: the map, the address, the phone, and the week's hours.
 * Hours come from `BusinessHours` and the phone from `Settings` — only the
 * address and map link live in `lib/shop.ts`.
 */
export function AddressSection({
  hours,
  shopPhone,
}: {
  hours: HoursRow[]
  shopPhone: string
}) {
  const rows = weekRows(hours)
  const todayIndex = new Date().getDay()

  return (
    <section id="address" className="scroll-mt-20 bg-strip py-20 sm:py-24">
      <div className="mx-auto max-w-[1140px] px-5 sm:px-7">
        <Reveal>
          <p className="data-label text-talc-deep">Find us</p>
          <h2 className="mt-3 max-w-[16ch]">honiara town</h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
          <Reveal className="overflow-hidden rounded-xl bg-card">
            <iframe
              src={SHOP.mapEmbedUrl}
              title="Map showing the shop's location in Honiara"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[380px] w-full border-0 lg:h-full lg:min-h-[420px]"
            />
          </Reveal>

          <Reveal className="rounded-xl bg-card p-6">
            <address className="not-italic">
              <span className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-barbicide-ink" />
                <span className="text-[17px] leading-relaxed text-nape">
                  {SHOP.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </span>

              {shopPhone && (
                <span className="mt-4 flex items-center gap-3">
                  <Phone aria-hidden className="size-5 shrink-0 text-barbicide-ink" />
                  <a
                    href={`tel:${shopPhone.replace(/\s+/g, "")}`}
                    className="text-[17px] text-nape underline underline-offset-4 decoration-talc hover:decoration-barbicide-ink"
                  >
                    {shopPhone}
                  </a>
                </span>
              )}
            </address>

            <a
              href={SHOP.directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-block rounded-md bg-barbicide px-5 py-3 font-display text-[15px] font-bold lowercase text-nape transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              get directions
            </a>

            <h3 className="mt-8 text-[17px] text-nape">Opening hours</h3>
            <table className="mt-3 w-full text-[15px]">
              <tbody>
                {rows.map((row, i) => {
                  // `rows` runs Monday-first; map back to the JS day index.
                  const isToday = [1, 2, 3, 4, 5, 6, 0][i] === todayIndex
                  return (
                    <tr key={row.day}>
                      <th
                        scope="row"
                        className={`py-1 text-left font-normal ${isToday ? "text-nape" : "text-talc-deep"}`}
                      >
                        {row.day}
                        {isToday && (
                          <span className="ml-2 rounded bg-barbicide/20 px-1.5 py-0.5 font-mono text-[11px] uppercase text-barbicide-ink">
                            today
                          </span>
                        )}
                      </th>
                      <td
                        className={`py-1 text-right tabular-nums ${isToday ? "text-nape" : "text-talc-deep"}`}
                      >
                        {row.label}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
