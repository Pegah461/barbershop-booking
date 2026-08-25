"use client"

import { MotionConfig, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * The single global reduced-motion authority.
 *
 * `reducedMotion="user"` makes Framer Motion honour the OS setting for every
 * animation in the tree: transform and layout animations are skipped and the
 * element snaps to its final value, while opacity still resolves to 1. That
 * is what keeps content from ever being stranded at `opacity: 0` — no
 * component needs to repeat the check.
 *
 * CSS transitions/animations are covered separately by the
 * `prefers-reduced-motion` block at the bottom of globals.css.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/**
 * True when it is safe to run expressive motion (springs, scroll-linked
 * movement). Components that need to *branch* rather than merely soften —
 * the guard rail's lit band jumps instead of springing — read this.
 *
 * Returns false during SSR and the first client render, so the static output
 * is always the calm one.
 */
export function useMotionSafe(): boolean {
  return useReducedMotion() === false
}
