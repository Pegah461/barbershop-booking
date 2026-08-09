import { Prisma } from "@/generated/prisma/client"

export const SLOT_TAKEN_MESSAGE = "That time slot was just taken. Please pick another."

/** Thrown when an in-transaction overlap re-check finds a conflicting booking. */
export class SlotTakenError extends Error {}

export function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
}

/**
 * The booking_no_overlap EXCLUDE constraint (see migration
 * 20260809080447_add_no_overlap_constraint) isn't modeled in schema.prisma,
 * so Prisma reports its violation via the generic "constraint failed" code
 * rather than a code specific to unique/FK constraints.
 */
export function isSlotConstraintViolation(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2004") return true
  return e instanceof Error && /booking_no_overlap/i.test(e.message)
}
