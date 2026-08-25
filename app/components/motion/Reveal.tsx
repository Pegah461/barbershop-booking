"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { fadeRise, staggerGroup, VIEWPORT } from "@/lib/motion"

/**
 * The tags a reveal may render as. A fixed map rather than `motion.create(as)`
 * on the fly: creating the component during render would produce a new
 * component identity on every render and remount the children underneath it.
 */
const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
  figure: motion.figure,
  dl: motion.dl,
  dd: motion.dd,
} as const

export type RevealTag = keyof typeof TAGS

type RevealProps = {
  children: ReactNode
  className?: string
  /** Render as something other than a div — `section`, `li`, `figure`… */
  as?: RevealTag
  /** Hold the reveal back by this many seconds. Use sparingly. */
  delay?: number
}

/**
 * Section-level scroll reveal: a short rise and fade, fired once when the
 * element comes into view.
 *
 * Reduced motion is handled globally by MotionProvider — under `reducedMotion:
 * "user"` the `y` offset is dropped and only the opacity resolves, so content
 * always ends up visible and in place.
 */
export function Reveal({ children, className, as = "div", delay }: RevealProps) {
  const Component = TAGS[as]

  return (
    <Component
      data-reveal=""
      className={className}
      variants={fadeRise}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Component>
  )
}

/**
 * Staggered group. Wrap a list and give each child a `<RevealItem>` — the
 * children inherit the parent's `visible` state on a delay rather than each
 * watching the viewport separately.
 */
export function RevealGroup({ children, className, as = "div" }: RevealProps) {
  const Component = TAGS[as]

  return (
    <Component
      data-reveal=""
      className={className}
      variants={staggerGroup}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </Component>
  )
}

/** A child of `RevealGroup`. Does not watch the viewport itself. */
export function RevealItem({ children, className, as = "div" }: RevealProps) {
  const Component = TAGS[as]

  return (
    <Component data-reveal="" className={className} variants={fadeRise}>
      {children}
    </Component>
  )
}
