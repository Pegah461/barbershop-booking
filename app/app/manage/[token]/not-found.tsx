import Link from "next/link"
import { SearchX } from "lucide-react"

export default function ManageBookingNotFound() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[560px] px-5 py-16 sm:px-7 sm:py-24">
        <span className="flex size-12 items-center justify-center rounded-full bg-nape/[0.07] text-talc-deep">
          <SearchX aria-hidden className="size-6" />
        </span>

        <h1 className="mt-6 text-[clamp(34px,7vw,52px)]">nothing here</h1>

        <p className="mt-4 text-[17px] leading-relaxed text-talc-deep">
          This link doesn&rsquo;t match a booking. Usually that means the booking
          was already cancelled, or the link was cut short when it was copied —
          they&rsquo;re long, and some apps break them across lines.
        </p>

        <p className="mt-4 text-[17px] leading-relaxed text-talc-deep">
          Open the link straight from your confirmation email, or call the shop
          and we&rsquo;ll find you by name.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="rounded-md bg-barbicide px-5 py-3 font-display text-[15px] font-bold lowercase text-nape transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            book a new time
          </Link>
          <Link
            href="/#address"
            className="rounded-md border border-nape/20 px-5 py-3 font-display text-[15px] font-bold lowercase text-nape transition-colors hover:bg-nape/[0.05]"
          >
            find the shop
          </Link>
        </div>
      </div>
    </main>
  )
}
