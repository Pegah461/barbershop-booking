import Link from "next/link"
import { CalendarX } from "lucide-react"

export default function ManageBookingNotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-24 text-center">
      <CalendarX className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-bold">We can&apos;t find that booking</h1>
      <p className="text-sm text-muted-foreground">
        This link may be out of date, or the booking has already been cancelled. If you think
        this is a mistake, please contact the shop directly.
      </p>
      <Link href="/" className="inline-block text-sm text-primary hover:underline">
        ← Back to home
      </Link>
    </div>
  )
}
