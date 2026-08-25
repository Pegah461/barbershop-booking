"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

import { useMotionSafe } from "@/components/motion/MotionProvider"
import { SPRING } from "@/lib/motion"
import { cn } from "@/lib/utils"

export type RailSection = {
  /** The `id` of the section element this band points at. */
  id: string
  /** Human name, used in the band's accessible label and its tooltip. */
  label: string
}

/**
 * The guard rail — the site's signature element.
 *
 * A fade is a graded sequence of clipper-guard steps, dark at the nape and
 * light at the top. The rail renders the page as exactly that: one band per
 * section, stepping from `nape` down to `strip` in document order. The band
 * you are currently reading lights to Barbicide, so scrolling the page is
 * scrolling through a fade.
 *
 * It is also real navigation: each band is a link to its section. The bands
 * carry no visible numbering — the tonal step is the whole signal, and each
 * band's accessible name says which section it goes to.
 */
export function GuardRail({ sections }: { sections: RailSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null)
  const motionSafe = useMotionSafe()

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    // The section crossing the middle of the viewport is the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [sections])

  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === activeId),
  )

  return (
    <>
      {/* ── desktop: the full rail, fixed to the left edge ───────────────── */}
      <nav
        aria-label="Page sections"
        className="fixed left-0 top-0 z-40 hidden h-dvh w-7 flex-col lg:flex"
      >
        <ol className="flex h-full flex-col">
          {sections.map((section, i) => {
            const active = section.id === activeId
            // Interpolate the band's ground across the fade, nape → strip.
            const mix = sections.length > 1 ? (i / (sections.length - 1)) * 100 : 0

            return (
              <li key={section.id} className="relative flex-1">
                <a
                  href={`#${section.id}`}
                  aria-current={active ? "true" : undefined}
                  aria-label={`Section ${i + 1} of ${sections.length}: ${section.label}`}
                  title={section.label}
                  className="group relative flex h-full w-full items-center justify-center focus-visible:outline-offset-[-3px]"
                  style={{
                    background: `color-mix(in oklab, var(--strip) ${mix}%, var(--nape))`,
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="guard-rail-lit"
                      aria-hidden
                      className="absolute inset-0 bg-barbicide"
                      transition={motionSafe ? SPRING : { duration: 0 }}
                    />
                  )}
                  {/* A short tick marks the band on hover/focus, so a pointer
                      user gets feedback without any numbering. */}
                  <span
                    aria-hidden
                    className={cn(
                      "relative h-5 w-px origin-center scale-y-0 transition-transform duration-150 group-hover:scale-y-100 group-focus-visible:scale-y-100",
                      active
                        ? "bg-nape/60"
                        : i > sections.length / 2
                          ? "bg-nape/50"
                          : "bg-strip/50",
                    )}
                  />
                </a>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* ── mobile: progress only.
             Deliberately aria-hidden and non-interactive — 4px bands are not
             a legitimate touch target, and the mobile drawer already provides
             the same navigation properly. ─────────────────────────────────── */}
      <div
        aria-hidden
        className="fixed left-0 right-0 top-[var(--nav-h)] z-40 flex h-1 lg:hidden"
      >
        {sections.map((section, i) => {
          const mix = sections.length > 1 ? (i / (sections.length - 1)) * 100 : 0
          return (
            <div
              key={section.id}
              className="flex-1"
              style={{
                background:
                  i === activeIndex
                    ? "var(--barbicide)"
                    : `color-mix(in oklab, var(--strip) ${mix}%, var(--nape))`,
              }}
            />
          )
        })}
      </div>
    </>
  )
}
