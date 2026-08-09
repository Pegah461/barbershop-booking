// IANA identifier for Fiji Time (UTC+12; DST has been suspended since 2010
// but the tzdata rule is applied automatically for any period it's revived).
// Kept in its own module (no server-only imports) so Client Components can
// import it without pulling in the Prisma/pg client.
export const SHOP_TZ = "Pacific/Fiji"
