"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/admin", label: "Admin" },
]

export function SiteHeader() {
  const path = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex items-center gap-5 px-5 py-3.5 sm:px-7">
        <Link
          href="/"
          className="mr-auto font-heading text-lg font-semibold tracking-[0.05em]"
        >
          BARBERSHOP
        </Link>

        {LINKS.map(({ href, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-sm transition-colors hover:text-brand",
                active ? "text-brand" : "text-foreground",
              )}
            >
              {label}
            </Link>
          )
        })}

        <span className="kicker ml-2 hidden text-[11px] sm:inline">
          Mon–Sat · 9–18
        </span>
      </div>
    </header>
  )
}
