import Image from "next/image"
import Link from "next/link"

import { Blueprint } from "@/components/ui/blueprint"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/prisma"
import { formatMoney } from "@/lib/utils"

// Services, hours and booking rules are all admin-configurable — the landing
// page quotes them, so it must never be frozen at build time.
export const dynamic = "force-dynamic"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** "Mon–Sat · 9–18" from the open days, collapsing a contiguous run. */
function hoursSummary(hours: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[]) {
  const open = hours.filter((h) => h.isOpen).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  if (!open.length) return { days: "By appointment", times: "" }

  const contiguous = open.every((h, i) => i === 0 || h.dayOfWeek === open[i - 1].dayOfWeek + 1)
  const days = contiguous && open.length > 1
    ? `${DAY_NAMES[open[0].dayOfWeek]}–${DAY_NAMES[open[open.length - 1].dayOfWeek]}`
    : open.map((h) => DAY_NAMES[h.dayOfWeek]).join(", ")

  return { days, times: `${open[0].openTime} – ${open[0].closeTime}` }
}

export default async function Home() {
  const [services, addons, settings, hours] = await Promise.all([
    db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, priceCents: true, durationMins: true },
    }),
    db.addon.findMany({
      where: { isActive: true },
      orderBy: { priceCents: "asc" },
      select: { name: true, priceCents: true, extraDurationMins: true },
    }),
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.businessHours.findMany(),
  ])

  const slotInterval = settings?.slotIntervalMins ?? 15
  const bookAhead = settings?.maxBookAheadDays ?? 30
  const cancelCutoff = settings?.cancelCutoffHours ?? 24
  const leadTime = settings?.minLeadTimeHours ?? 2
  const { days, times } = hoursSummary(hours)

  const closedDays = DAY_NAMES.filter(
    (_, i) => !hours.some((h) => h.dayOfWeek === i && h.isOpen),
  )

  return (
    <main className="flex-1">
      {/* — hero — */}
      <section className="mx-auto grid max-w-[1080px] items-start gap-11 px-7 pt-14 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="font-heading text-[11px] font-semibold uppercase leading-none tracking-[0.2em] text-brand-700">
            Est. one chair · one barber
          </div>
          <h1 className="mt-3.5 mb-2 max-w-[14ch] text-[clamp(38px,6vw,58px)] text-pretty">
            A proper cut, booked in a minute.
          </h1>
          <p className="max-w-[46ch] text-[15px] text-foreground/70">
            Pick a service, add extras, choose a time that&rsquo;s actually free. You&rsquo;ll get a
            confirmation email with a link to reschedule or cancel — no account, no phone tag.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button asChild size="lg" className="blueprint px-5.5">
              <Link href="/book">
                <i className="corner corner-tl" />
                <i className="corner corner-tr" />
                <i className="corner corner-bl" />
                <i className="corner corner-br" />
                Book an appointment
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/manage">Manage a booking</Link>
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-3 border-y border-border">
            <div className="py-3.5">
              <dt className="kicker">Slots every</dt>
              <dd className="font-heading text-2xl font-semibold">{slotInterval} min</dd>
            </div>
            <div className="border-l border-border py-3.5 pl-5">
              <dt className="kicker">Book ahead</dt>
              <dd className="font-heading text-2xl font-semibold">{bookAhead} days</dd>
            </div>
            <div className="border-l border-border py-3.5 pl-5">
              <dt className="kicker">Free cancel</dt>
              <dd className="font-heading text-2xl font-semibold">{cancelCutoff} hrs</dd>
            </div>
          </dl>
        </div>

        <Blueprint className="duotone mt-2 overflow-hidden">
          <Image
            src="/barbershop.jpg"
            alt=""
            width={720}
            height={840}
            priority
            className="h-[420px] w-full object-cover"
          />
        </Blueprint>
      </section>

      {/* — services — */}
      <section className="mx-auto max-w-[1080px] px-7 pt-13">
        <div className="rule-head">
          <span className="font-heading text-xs font-semibold tracking-[0.2em] text-brand-700">01</span>
          <h3 className="m-0">Services</h3>
          <span className="ml-auto text-xs text-foreground/50">Add-ons available at step two</span>
        </div>

        {services.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            No services are listed right now — please check back shortly.
          </p>
        ) : (
          <ul>
            {services.map((service, i) => (
              <li
                key={service.id}
                className="grid grid-cols-[34px_1fr_auto] items-center gap-4 border-b border-foreground/10 py-4 sm:grid-cols-[34px_1fr_90px_90px_130px]"
              >
                <span className="font-mono text-xs font-semibold text-foreground/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-2xl font-semibold">{service.name}</span>
                <span className="hidden text-[13px] text-foreground/60 sm:block">
                  {service.durationMins} min
                </span>
                <span className="font-heading text-[22px] font-semibold">
                  {formatMoney(service.priceCents)}
                </span>
                <Button asChild variant="outline" size="sm" className="hidden justify-self-end sm:inline-flex">
                  <Link href={`/book?service=${service.id}`}>Book this</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* — how it works — */}
      <section className="mx-auto grid max-w-[1080px] gap-5 px-7 pt-12 pb-18 md:grid-cols-3">
        <Blueprint className="flex flex-col gap-2 p-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-brand">Add-ons</div>
          <div className="font-heading text-[17px] font-semibold leading-tight">
            {addons.length
              ? addons.map((a) => a.name).join(", ")
              : "Extras on request"}
          </div>
          <p className="m-0 flex-1 text-[13px] opacity-80">
            {addons.length ? (
              <>
                From +{formatMoney(Math.min(...addons.map((a) => a.priceCents)))} and{" "}
                {Math.min(...addons.map((a) => a.extraDurationMins))} minutes. Stack as many as you
                like — the calendar re-checks availability for the longer appointment.
              </>
            ) : (
              <>Ask in the chair — the calendar always books the full length of your appointment.</>
            )}
          </p>
        </Blueprint>

        <Blueprint className="flex flex-col gap-2 p-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-brand">Hours</div>
          <div className="font-heading text-[17px] font-semibold leading-tight">
            {days}
            {times ? `, ${times}` : ""}
          </div>
          <p className="m-0 flex-1 text-[13px] opacity-80">
            {closedDays.length ? `Closed ${closedDays.join(", ")}. ` : ""}
            Same-day bookings close {leadTime} hour{leadTime === 1 ? "" : "s"} before the slot; the
            calendar hides anything it can&rsquo;t honour.
          </p>
        </Blueprint>

        <Blueprint className="flex flex-col gap-2 p-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-brand">After booking</div>
          <div className="font-heading text-[17px] font-semibold leading-tight">
            One link does everything
          </div>
          <p className="m-0 flex-1 text-[13px] opacity-80">
            Confirmation email carries your reference and a private link to reschedule or cancel up
            to {cancelCutoff} hours ahead.
          </p>
        </Blueprint>
      </section>
    </main>
  )
}
