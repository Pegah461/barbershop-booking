/**
 * Shop facts that have no home in the database.
 *
 * Deliberately narrow: `shopName`, `shopPhone` and `shopEmail` live in the
 * `Settings` singleton and are edited from the admin panel, and opening hours
 * live in `BusinessHours`. Neither is duplicated here — read those from the
 * DB. Only things the schema has nowhere to put belong in this file.
 *
 * TODO(perry): the address, map link and social URLs below are placeholders.
 * Replace them with the real values before the LocationHours section ships.
 */

export const SHOP = {
  /** Street address, one line per rendered line. */
  address: ["Fades Barbershop", "Honiara Town", "Guadalcanal, Solomon Islands"],

  /** Opens the shop's pin. Used by the "Get directions" link. */
  directionsUrl: "https://maps.google.com/?q=Honiara+Solomon+Islands",

  /** `src` for the embedded map iframe. */
  mapEmbedUrl:
    "https://www.google.com/maps?q=Honiara+Solomon+Islands&output=embed",

  socials: [
    { name: "Facebook", url: "https://facebook.com/" },
    { name: "TikTok", url: "https://tiktok.com/" },
  ],
} as const

/** The shop's currency. Shown explicitly so SBD is never mistaken for USD. */
export const CURRENCY = "SBD" as const
