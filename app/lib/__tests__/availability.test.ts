/**
 * Unit tests for getAvailableSlots.
 *
 * All times stated in comments use the shop timezone (SBT = Pacific/Solomon
 * Islands = UTC+11).  Mapping for the test date 2026-08-10 (Monday):
 *
 *   Shop open  09:00 SBT = 2026-08-09T22:00:00Z
 *   Shop close 18:00 SBT = 2026-08-10T07:00:00Z
 *
 * Default "now" for most tests: 2026-08-09T00:00:00Z (well before the test
 * date so all lead-time and max-advance constraints pass unless overridden).
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  db: {
    settings:      { findUnique: vi.fn() },
    service:       { findUnique: vi.fn() },
    addon:         { findMany:   vi.fn() },
    businessHours: { findUnique: vi.fn() },
    closure:       { findFirst:  vi.fn(), findMany: vi.fn() },
    booking:       { findMany:   vi.fn() },
  },
}))

import { getAvailableSlots } from "@/lib/availability"
import { db } from "@/lib/prisma"

// ── Shared fixtures ───────────────────────────────────────────────────────────

const TEST_DATE = "2026-08-10" // Monday in SBT

/**
 * A "now" that is well before the test date so all lead-time and max-advance
 * constraints pass unless the individual test overrides _now.
 * 2026-08-09 00:00 UTC = Monday Aug 10 11:00 SBT (the day before the test date)
 */
const DEFAULT_NOW = new Date("2026-08-09T00:00:00.000Z")

/** UTC timestamps for business hours on the test date */
const OPEN_UTC  = new Date("2026-08-09T22:00:00.000Z") // 09:00 SBT
const CLOSE_UTC = new Date("2026-08-10T07:00:00.000Z") // 18:00 SBT

const defaultSettings = {
  id:                "singleton",
  shopName:          "Test Shop",
  shopPhone:         "",
  shopEmail:         "",
  slotIntervalMins:  15,
  bufferMins:        0,
  minLeadTimeHours:  2,
  maxBookAheadDays:  30,
  cancelCutoffHours: 24,
  createdAt:         new Date(),
  updatedAt:         new Date(),
}

const defaultService = {
  id:          "svc1",
  name:        "Adult",
  priceCents:  2000,
  durationMins: 30,
  isActive:    true,
  sortOrder:   0,
  createdAt:   new Date(),
  updatedAt:   new Date(),
}

// Monday (dayOfWeek=1) open 09:00–18:00 SBT, no break
const defaultHours = {
  id:         "bh1",
  dayOfWeek:  1,
  isOpen:     true,
  openTime:   "09:00",
  closeTime:  "18:00",
  breakStart: null,
  breakEnd:   null,
  createdAt:  new Date(),
  updatedAt:  new Date(),
}

// ── Helper ────────────────────────────────────────────────────────────────────

/** Resolve a SBT HH:mm on the test date to a UTC ISO string. */
function sbtToUtc(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number)
  const shopOffsetMs = 11 * 60 * 60 * 1000 // UTC+11
  const shopMidnight = new Date("2026-08-09T13:00:00.000Z") // midnight SBT on 2026-08-10
  const utc = new Date(shopMidnight.getTime() + h * 3600_000 + m * 60_000 - shopOffsetMs)
  return utc.toISOString()
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()

  // Default: open shop, no closures, no bookings, 30-min adult service
  vi.mocked(db.settings.findUnique).mockResolvedValue(defaultSettings as any)
  vi.mocked(db.service.findUnique).mockResolvedValue(defaultService as any)
  vi.mocked(db.addon.findMany).mockResolvedValue([] as any)
  vi.mocked(db.businessHours.findUnique).mockResolvedValue(defaultHours as any)
  vi.mocked(db.closure.findFirst).mockResolvedValue(null)
  vi.mocked(db.closure.findMany).mockResolvedValue([] as any)
  vi.mocked(db.booking.findMany).mockResolvedValue([] as any)
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("getAvailableSlots", () => {
  it("returns all valid slots for an open day with no conflicts", async () => {
    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })

    // 09:00–17:30 SBT in 15-min steps with 30-min service → 35 slots
    expect(slots).toHaveLength(35)
    expect(slots[0]).toBe("2026-08-09T22:00:00.000Z")  // 09:00 SBT
    expect(slots[34]).toBe("2026-08-10T06:30:00.000Z") // 17:30 SBT
    // All entries must be valid ISO strings
    expect(slots.every((s) => !isNaN(new Date(s).getTime()))).toBe(true)
  })

  // ── Test 1: Closed day ──────────────────────────────────────────────────────
  it("returns [] when the shop is closed on that weekday", async () => {
    vi.mocked(db.businessHours.findUnique).mockResolvedValue({
      ...defaultHours,
      isOpen: false,
    } as any)

    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })
    expect(slots).toEqual([])
  })

  it("returns [] when businessHours row is missing", async () => {
    vi.mocked(db.businessHours.findUnique).mockResolvedValue(null)
    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })
    expect(slots).toEqual([])
  })

  // ── Test 2: Full-day closure ────────────────────────────────────────────────
  it("returns [] when a full-day closure covers the date", async () => {
    vi.mocked(db.closure.findFirst).mockResolvedValue({
      id:       "cl1",
      isAllDay: true,
      // Spans the whole test day in UTC (midnight-to-midnight SBT)
      startsAt:  new Date("2026-08-09T13:00:00.000Z"),
      endsAt:    new Date("2026-08-10T13:00:00.000Z"),
      reason:    "Public holiday",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })
    expect(slots).toEqual([])
  })

  // ── Test 3: Fully booked day ────────────────────────────────────────────────
  it("returns [] when a single booking covers the entire business day", async () => {
    vi.mocked(db.booking.findMany).mockResolvedValue([
      { startsAt: OPEN_UTC, endsAt: CLOSE_UTC },
    ] as any)

    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })
    expect(slots).toEqual([])
  })

  it("returns [] when back-to-back 30-min bookings fill the day", async () => {
    // 18 bookings × 30 min = 540 min = 09:00–18:00 SBT
    const bookings = Array.from({ length: 18 }, (_, i) => ({
      startsAt: new Date(OPEN_UTC.getTime() + i * 30 * 60_000),
      endsAt:   new Date(OPEN_UTC.getTime() + (i + 1) * 30 * 60_000),
    }))
    vi.mocked(db.booking.findMany).mockResolvedValue(bookings as any)

    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })
    expect(slots).toEqual([])
  })

  // ── Test 4: Partial closure ─────────────────────────────────────────────────
  it("excludes slots that overlap with a partial-day closure", async () => {
    // Partial closure: 10:00–12:00 SBT
    const closureStart = new Date("2026-08-09T23:00:00.000Z") // 10:00 SBT
    const closureEnd   = new Date("2026-08-10T01:00:00.000Z") // 12:00 SBT

    vi.mocked(db.closure.findMany).mockResolvedValue([
      {
        id:        "cl2",
        isAllDay:  false,
        startsAt:  closureStart,
        endsAt:    closureEnd,
        reason:    "Staff training",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any)

    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: DEFAULT_NOW })

    // Slot at 09:30 SBT ends at 10:00 SBT — no overlap (half-open boundary)
    expect(slots).toContain("2026-08-09T22:30:00.000Z") // 09:30 SBT ✓
    // Slot at 09:45 SBT ends at 10:15 SBT — overlaps the closure ✗
    expect(slots).not.toContain("2026-08-09T22:45:00.000Z") // 09:45 SBT ✗
    // Slot at 11:30 SBT ends at 12:00 SBT — [11:30,12:00) ∩ [10:00,12:00) ≠ ∅ ✗
    expect(slots).not.toContain("2026-08-10T00:30:00.000Z") // 11:30 SBT ✗
    // Slot at 12:00 SBT — closure already ended (half-open)
    expect(slots).toContain("2026-08-10T01:00:00.000Z") // 12:00 SBT ✓

    // Available = 3 before + 23 after = 26
    expect(slots).toHaveLength(26)
  })

  // ── Test 5: Addon pushes duration past closing time ─────────────────────────
  it("excludes the last slots when addon duration extends past closing", async () => {
    // 45-min service + 25-min addon = 70 min required
    vi.mocked(db.service.findUnique).mockResolvedValue({
      ...defaultService,
      durationMins: 45,
    } as any)
    vi.mocked(db.addon.findMany).mockResolvedValue([
      {
        id:               "adn1",
        name:             "Clean Shave",
        priceCents:       800,
        extraDurationMins: 25,
        isActive:         true,
        sortOrder:        0,
        createdAt:        new Date(),
        updatedAt:        new Date(),
      },
    ] as any)

    const slots = await getAvailableSlots({
      date:      TEST_DATE,
      serviceId: "svc1",
      addonIds:  ["adn1"],
      _now:      DEFAULT_NOW,
    })

    // 16:45 SBT + 70 min = 17:55 SBT < 18:00 → valid ✓
    expect(slots).toContain("2026-08-10T05:45:00.000Z") // 16:45 SBT
    // 17:00 SBT + 70 min = 18:10 SBT > 18:00 → must be rejected ✗
    expect(slots).not.toContain("2026-08-10T06:00:00.000Z") // 17:00 SBT
    // Confirm nothing at or after 17:00 SBT
    const after17 = slots.filter(
      (s) => new Date(s) >= new Date("2026-08-10T06:00:00.000Z"),
    )
    expect(after17).toHaveLength(0)
  })

  // ── Test 6: Lead-time cutoff ────────────────────────────────────────────────
  it("excludes slots within the minimum lead-time window", async () => {
    // now = 09:30 SBT on the test date  ≡  2026-08-09T22:30:00Z
    // minLeadTimeHours = 2  →  cutoff = 11:30 SBT  ≡  2026-08-10T00:30:00Z
    const now = new Date("2026-08-09T22:30:00.000Z")

    const slots = await getAvailableSlots({ date: TEST_DATE, serviceId: "svc1", _now: now })

    // 11:15 SBT (00:15Z) is before the cutoff — must be absent
    expect(slots).not.toContain("2026-08-10T00:15:00.000Z") // 11:15 SBT
    // 11:30 SBT (00:30Z) exactly equals the cutoff — isBefore is strict, so it passes
    expect(slots).toContain("2026-08-10T00:30:00.000Z")     // 11:30 SBT
    // First slot returned should be 11:30 SBT
    expect(slots[0]).toBe("2026-08-10T00:30:00.000Z")
  })
})
