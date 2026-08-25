import Link from "next/link"

import { weekRows } from "@/lib/hours"
import { db } from "@/lib/prisma"
import { SHOP } from "@/lib/shop"

/**
 * Server component — reads shop identity from the `Settings` singleton and
 * opening hours from `BusinessHours`, so the admin panel stays the single
 * source of truth for both. Only the address and social links come from
 * `lib/shop.ts`, which is where things the schema has no column for live.
 *
 * There is deliberately no manage-booking link here. That page is reachable
 * only through the private token link in the confirmation email.
 */
export async function SiteFooter() {
  const [settings, hours] = await Promise.all([
    db.settings.findUnique({ where: { id: "singleton" } }),
    db.businessHours.findMany(),
  ])

  const shopName = settings?.shopName || "Fades Barbershop"
  const rows = weekRows(hours)

  return (
    <footer className="on-dark mt-auto bg-nape text-strip lg:pl-7">
      <div className="mx-auto grid max-w-[1140px] gap-10 px-5 py-14 sm:px-7 md:grid-cols-3">
        <div>
          <p className="font-display text-[28px] font-extrabold lowercase leading-none tracking-[-0.025em]">
            fades
            <span className="text-barbicide">.</span>
          </p>
          <address className="mt-4 not-italic text-[15px] leading-relaxed text-talc">
            {SHOP.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>

          <div className="mt-4 flex gap-4">
            {SHOP.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[15px] text-strip underline underline-offset-4 decoration-talc hover:decoration-barbicide"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="data-label text-talc">Opening hours</h2>
          <table className="mt-4 w-full max-w-[260px] text-[15px]">
            <tbody>
              {rows.map((row) => (
                <tr key={row.day}>
                  <th scope="row" className="py-1 text-left font-normal text-talc">
                    {row.day}
                  </th>
                  <td className="py-1 text-right tabular-nums">
                    {row.open ? row.label : <span className="text-talc">Closed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="data-label text-talc">Get in touch</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {settings?.shopPhone ? (
              <li>
                <a
                  href={`tel:${settings.shopPhone.replace(/\s+/g, "")}`}
                  className="underline underline-offset-4 decoration-talc hover:decoration-barbicide"
                >
                  {settings.shopPhone}
                </a>
              </li>
            ) : null}
            {settings?.shopEmail ? (
              <li>
                <a
                  href={`mailto:${settings.shopEmail}`}
                  className="underline underline-offset-4 decoration-talc hover:decoration-barbicide"
                >
                  {settings.shopEmail}
                </a>
              </li>
            ) : null}
            <li>
              <Link
                href="/#address"
                className="underline underline-offset-4 decoration-talc hover:decoration-barbicide"
              >
                Find the shop
              </Link>
            </li>
          </ul>

          <Link
            href="/book"
            className="mt-6 inline-block rounded-md bg-barbicide px-5 py-3 font-display text-[16px] font-bold lowercase text-nape transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            book appointment
          </Link>
        </div>
      </div>

      <div className="border-t border-strip/10">
        <p className="mx-auto max-w-[1140px] px-5 py-5 text-[13px] text-talc sm:px-7">
          © {new Date().getFullYear()} {shopName}. Honiara, Solomon Islands.
        </p>
      </div>
    </footer>
  )
}
