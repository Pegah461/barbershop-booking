/**
 * Every easing curve, duration and variant used on the customer-facing side
 * lives here. Components import from this file rather than inventing timings
 * locally — inconsistent timing is the thing that makes motion feel amateur.
 *
 * Reduced motion is NOT handled here. It is handled once, in
 * `components/motion/reduced-motion.tsx`, so no component repeats the check.
 */
import type { Transition, Variants } from "framer-motion"

// ── Curves ───────────────────────────────────────────────────────────────────

/** Decelerating. The default for anything entering or settling. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
/** Symmetric. For things that move between two known positions. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/** The guard rail's lit band — the one place a spring is warranted. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.7,
}

// ── Durations (seconds) ──────────────────────────────────────────────────────

export const DUR = {
  /** Hover and press feedback. */
  fast: 0.12,
  /** The workhorse: reveals, drawer, step changes. */
  base: 0.32,
  /** Reserved for the hero's opening beat. */
  slow: 0.48,
} as const

/** Delay between children in a staggered group. */
export const STAGGER = 0.06

// ── Shared transitions ───────────────────────────────────────────────────────

export const transition: Transition = { duration: DUR.base, ease: EASE_OUT }
export const transitionFast: Transition = { duration: DUR.fast, ease: EASE_OUT }
export const transitionSlow: Transition = { duration: DUR.slow, ease: EASE_OUT }

// ── Variants ─────────────────────────────────────────────────────────────────

/** Section-level scroll reveal. Short distance, tight duration — subtle. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition },
}

/** Parent of a staggered group. Children use `fadeRise`. */
export const staggerGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
}

/** The hero's opening beat — same shape, longer and further. */
export const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitionSlow },
}

export const heroGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER, delayChildren: 0.08 } },
}

/** Mobile nav drawer contents. */
export const drawerItem: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition },
}

/**
 * Booking wizard step transition. `direction` is +1 moving forward through
 * the flow and -1 moving back. Presentation only — it reads the step number
 * the wizard already owns and never changes it.
 */
export const stepSlide = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0, transition },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -24,
    transition: { duration: DUR.fast, ease: EASE_OUT },
  }),
} satisfies Variants

/** Standard `whileInView` viewport config: fire once, slightly early. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const
