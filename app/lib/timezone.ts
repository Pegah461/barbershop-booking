// IANA identifier for Solomon Islands Time (UTC+11, no DST).
// "Pacific/Solomon Islands" is not a valid IANA name — use Pacific/Guadalcanal.
// Kept in its own module (no server-only imports) so Client Components can
// import it without pulling in the Prisma/pg client.
export const SHOP_TZ = "Pacific/Guadalcanal"
