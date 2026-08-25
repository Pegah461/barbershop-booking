"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { SiteHeader } from "@/components/SiteHeader"

/**
 * Decides which routes get the customer-facing chrome.
 *
 * The admin panel and its sign-in page are out of scope for this pass and
 * have their own layout — wrapping them in a customer nav that advertises
 * "book appointment" would be wrong, so they are excluded here rather than
 * by editing any admin file.
 */
export function SiteChrome({
  children,
  footer,
}: {
  children: ReactNode
  /** Rendered by the server so the footer can query the database. */
  footer: ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/login")

  if (isAdmin) return <>{children}</>

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-barbicide px-4 py-2 font-medium text-nape focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <SiteHeader />
      {children}
      {footer}
    </>
  )
}
