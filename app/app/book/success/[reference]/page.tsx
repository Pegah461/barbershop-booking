import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { Check } from "lucide-react"

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { db } from "@/lib/prisma"
import { weekRows } from "@/lib/hours"
import { SHOP } from "@/lib/shop"
import { SHOP_TZ } from "@/lib/timezone"
import { cn, formatDuration, formatMoney } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Booking confirmed",
  // A booking receipt has no business in search results or link previews.
  robots: { index: false, follow: false },
}

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params
  const [booking, settings, hours] = await Promise.all([
    db.booking.findUnique({
      where: { reference },
      include: { addons: true },
    }),
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.businessHours.findMany(),
  ])
  if (!booking) notFound()

  const cancelCutoff = settings?.cancelCutoffHours ?? 24
  const dayLabel = formatInTimeZone(booking.startsAt, SHOP_TZ, "EEEE, MMM d")
  const timeLabel = formatInTimeZone(booking.startsAt, SHOP_TZ, "h:mm a")
  const todayIndex = new Date().getDay()
  const today = weekRows(hours).find((_, i) => [1, 2, 3, 4, 5, 6, 0][i] === todayIndex)

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[680px] px-5 py-12 sm:px-7 sm:py-16">
        <RevealGroup>
          <RevealItem>
            <span className="flex size-12 items-center justify-center rounded-full bg-barbicide text-nape">
              <Check aria-hidden className="size-6" strokeWidth={3} />
            </span>
          </RevealItem>

          <RevealItem>
            <h1 className="mt-6 text-[clamp(38px,8vw,60px)]">booking confirmed</h1>
          </RevealItem>

          <RevealItem as="p" className="mt-4 text-[17px] leading-relaxed text-talc-deep">
            You&rsquo;re in for <strong className="font-medium text-nape">{dayLabel}</strong> at{" "}
            <strong className="font-medium text-nape">{timeLabel}</strong>. We&rsquo;ve emailed the
            details to {booking.customerEmail}.
          </RevealItem>
        </RevealGroup>

        {/* — the receipt — */}
        <Reveal className="mt-10 overflow-hidden rounded-xl bg-nape text-strip">
          <div className="border-b border-strip/10 px-6 py-5">
            <p className="data-label text-talc">Your reference</p>
            <p className="mt-2 font-mono text-[30px] font-medium leading-none tracking-[0.02em]">
              {booking.reference}
            </p>
          </div>

          <dl className="divide-y divide-strip/10 px-6">
            <ReceiptRow label="Service" value={booking.serviceName} />
            {booking.addons.length > 0 && (
              <ReceiptRow label="Extras" value={booking.addons.map((a) => a.addonName).join(", ")} />
            )}
            <ReceiptRow
              label="When"
              value={formatInTimeZone(booking.startsAt, SHOP_TZ, "EEEE, MMM d 'at' h:mm a")}
            />
            <ReceiptRow label="Takes" value={formatDuration(booking.durationMins)} />
            <ReceiptRow label="Total" value={formatMoney(booking.totalCents)} strong />
            <ReceiptRow label="Name" value={booking.customerName} />
          </dl>

          <p className="px-6 py-5 text-[14px] leading-relaxed text-talc">
            Pay at the shop. Cash on the day.
          </p>
        </Reveal>

        {/* — what happens next — */}
        <Reveal className="mt-8 rounded-xl bg-card p-6">
          <h2 className="text-[20px]">Changing your booking</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-talc-deep">
            The confirmation email carries a private link to reschedule or cancel, up to{" "}
            {cancelCutoff} hours before your appointment. That link is the only way to change the
            booking online, so keep the email. After the cutoff, call the shop
            {settings?.shopPhone ? (
              <>
                {" "}
                on{" "}
                <a
                  href={`tel:${settings.shopPhone.replace(/\s+/g, "")}`}
                  className="text-nape underline underline-offset-4 decoration-talc hover:decoration-barbicide-ink"
                >
                  {settings.shopPhone}
                </a>
              </>
            ) : null}
            .
          </p>

          {today && (
            <p className="mt-4 font-mono text-[13px] tabular-nums text-talc-deep">
              Today: {today.label}
            </p>
          )}
        </Reveal>

        <Reveal className="mt-8 flex flex-wrap gap-3">
          <a
            href={SHOP.directionsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md bg-barbicide px-5 py-3 font-display text-[15px] font-bold lowercase text-nape transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            get directions
          </a>
          <Link
            href="/"
            className="rounded-md border border-nape/20 px-5 py-3 font-display text-[15px] font-bold lowercase text-nape transition-colors hover:bg-nape/[0.05]"
          >
            back to the site
          </Link>
        </Reveal>
      </div>
    </main>
  )
}

function ReceiptRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5">
      <dt className="data-label shrink-0 text-talc">{label}</dt>
      <dd
        className={cn(
          "text-right text-[15px]",
          strong && "font-mono text-[18px] font-medium tabular-nums",
        )}
      >
        {value}
      </dd>
    </div>
  )
}
