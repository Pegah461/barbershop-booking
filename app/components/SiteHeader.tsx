"use client"

import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { drawerItem, staggerGroup, transition } from "@/lib/motion"
import { cn } from "@/lib/utils"

/** Nav targets are the homepage's section anchors, in document order. */
const LINKS = [
  { hash: "services", label: "Services" },
  { hash: "about", label: "About" },
  { hash: "gallery", label: "Gallery" },
  { hash: "reviews", label: "Reviews" },
  { hash: "address", label: "Address" },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  // One scroll behaviour, done properly: past the fold the bar compresses and
  // lays a translucent iron ground under itself so type stays readable over
  // whatever is behind it.
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 40)
  })

  // Anchors only resolve on the homepage — from anywhere else, route home first.
  const onHome = pathname === "/"
  const href = (hash: string) => (onHome ? `#${hash}` : `/#${hash}`)

  // The bar is only allowed to be transparent where it overlays the dark hero.
  // Every other route has a light ground, so it keeps its own dark bar.
  const solid = scrolled || !onHome

  return (
    <>
      <motion.header
        // Consumed by the guard rail's mobile progress strip so it always sits
        // flush under the bar, whatever height the bar currently is.
        style={{ "--nav-h": scrolled ? "56px" : "72px" } as React.CSSProperties}
        animate={{ height: scrolled ? 56 : 72 }}
        transition={transition}
        className={cn(
          "on-dark fixed inset-x-0 top-0 z-50 flex items-center",
          solid ? "bg-nape/90 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="flex w-full items-center gap-6 px-5 sm:px-7 lg:pl-12">
          <Link
            href="/"
            className="mr-auto font-display text-[19px] font-extrabold lowercase tracking-[-0.02em] text-strip"
          >
            fades
            <span className="text-barbicide">.</span>
          </Link>

          {/* — desktop — */}
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {LINKS.map(({ hash, label }) => (
              <Link
                key={hash}
                href={href(hash)}
                className="text-[15px] text-strip/75 transition-colors hover:text-strip"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* — mobile — */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-strip md:hidden"
              >
                <Menu className="size-6" />
              </button>
            </SheetTrigger>

            {/* SheetContent supplies its own labelled close control. */}
            <SheetContent
              side="right"
              className="on-dark w-[min(20rem,85vw)] border-none bg-nape p-0 text-strip"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Site sections and the link to book an appointment.
              </SheetDescription>

              <motion.nav
                aria-label="Main"
                variants={staggerGroup}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1 px-6 pt-20"
              >
                {LINKS.map(({ hash, label }) => (
                  <motion.div key={hash} variants={drawerItem}>
                    <Link
                      href={href(hash)}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-display text-[28px] font-extrabold lowercase tracking-[-0.02em] text-strip"
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>

      {/* The homepage hero deliberately runs under the transparent bar; every
          other route needs the space back. */}
      {!onHome && <div aria-hidden className="h-[72px] shrink-0" />}
    </>
  )
}
