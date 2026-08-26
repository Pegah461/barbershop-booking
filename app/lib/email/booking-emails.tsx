import { formatInTimeZone } from "date-fns-tz"
import { db } from "@/lib/prisma"
import { SHOP_TZ } from "@/lib/timezone"
import { formatMoney } from "@/lib/utils"
import { sendEmail } from "./send"
import BookingConfirmationEmail from "@/emails/booking-confirmation"
import BookingRescheduledEmail from "@/emails/booking-rescheduled"
import BookingCancelledEmail from "@/emails/booking-cancelled"
import AdminNewBookingEmail from "@/emails/admin-new-booking"

const WHEN_FORMAT = "EEEE, MMM d 'at' h:mm a"

function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

function manageUrl(manageToken: string): string {
  return `${appBaseUrl()}/manage/${manageToken}`
}

async function getShopContact() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } })
  return {
    shopName:  settings?.shopName  || "Barbershop",
    shopPhone: settings?.shopPhone || "",
    shopEmail: settings?.shopEmail || "",
  }
}

async function loadBookingWithAddons(bookingId: string) {
  return db.booking.findUniqueOrThrow({
    where:   { id: bookingId },
    include: { addons: true },
  })
}

export async function sendBookingConfirmationEmail(bookingId: string): Promise<void> {
  const [booking, shop] = await Promise.all([loadBookingWithAddons(bookingId), getShopContact()])
  const url = manageUrl(booking.manageToken)

  await sendEmail({
    to:      booking.customerEmail,
    subject: `Booking confirmed — ${booking.reference}`,
    react: (
      <BookingConfirmationEmail
        reference={booking.reference}
        customerName={booking.customerName}
        serviceName={booking.serviceName}
        addonNames={booking.addons.map((a) => a.addonName)}
        whenLabel={formatInTimeZone(booking.startsAt, SHOP_TZ, WHEN_FORMAT)}
        totalLabel={formatMoney(booking.totalCents)}
        manageUrl={url}
        {...shop}
      />
    ),
    logExtra: { "Manage URL": url },
  })
}

export async function sendAdminNewBookingEmail(bookingId: string): Promise<void> {
  const [booking, shop] = await Promise.all([loadBookingWithAddons(bookingId), getShopContact()])
  if (!shop.shopEmail) return // nothing configured to notify

  await sendEmail({
    to:      shop.shopEmail,
    subject: `New booking — ${booking.reference}`,
    react: (
      <AdminNewBookingEmail
        reference={booking.reference}
        serviceName={booking.serviceName}
        addonNames={booking.addons.map((a) => a.addonName)}
        whenLabel={formatInTimeZone(booking.startsAt, SHOP_TZ, WHEN_FORMAT)}
        totalLabel={formatMoney(booking.totalCents)}
        customerName={booking.customerName}
        customerPhone={booking.customerPhone}
        customerEmail={booking.customerEmail}
        customerComments={booking.customerComments}
        adminUrl={`${appBaseUrl()}/admin/appointments/${booking.id}`}
        shopName={shop.shopName}
      />
    ),
  })
}

export async function sendBookingRescheduledEmail(bookingId: string, previousStartsAt: Date): Promise<void> {
  const [booking, shop] = await Promise.all([loadBookingWithAddons(bookingId), getShopContact()])
  const url = manageUrl(booking.manageToken)

  await sendEmail({
    to:      booking.customerEmail,
    subject: `Booking rescheduled — ${booking.reference}`,
    react: (
      <BookingRescheduledEmail
        reference={booking.reference}
        customerName={booking.customerName}
        serviceName={booking.serviceName}
        addonNames={booking.addons.map((a) => a.addonName)}
        previousWhenLabel={formatInTimeZone(previousStartsAt, SHOP_TZ, WHEN_FORMAT)}
        whenLabel={formatInTimeZone(booking.startsAt, SHOP_TZ, WHEN_FORMAT)}
        totalLabel={formatMoney(booking.totalCents)}
        manageUrl={url}
        {...shop}
      />
    ),
    logExtra: { "Manage URL": url },
  })
}

export async function sendBookingCancelledEmail(bookingId: string): Promise<void> {
  const [booking, shop] = await Promise.all([loadBookingWithAddons(bookingId), getShopContact()])

  await sendEmail({
    to:      booking.customerEmail,
    subject: `Booking cancelled — ${booking.reference}`,
    react: (
      <BookingCancelledEmail
        reference={booking.reference}
        serviceName={booking.serviceName}
        whenLabel={formatInTimeZone(booking.startsAt, SHOP_TZ, WHEN_FORMAT)}
        {...shop}
      />
    ),
  })
}
